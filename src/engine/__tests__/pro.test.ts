import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
  clearAllLocalStorage,
  clearWorkoutHistory,
  computeDashboardStats,
  CURRENT_BACKUP_VERSION,
  CURRENT_SCHEMA_VERSION,
  deleteWorkoutSession,
  ensureStorageMigrated,
  exportBackupPayload,
  importBackupPayload,
  loadAlarms,
  loadSettings,
  loadWorkoutSessions,
  parseAndValidateBackup,
  saveAlarms,
  saveSettings,
  saveWorkoutSession,
  SCHEMA_VERSION_KEY,
  StorageLike,
} from '../../data/storage';
import { AR_TRANSLATIONS, EN_TRANSLATIONS } from '../../i18n/translations';
import { AlarmModel } from '../../types/pro';
import { formatRepeatSummary, getNextTriggerTime } from '../../utils/time';
import { ExercisePoseEvaluator, PoseLandmarkPoint } from '../poseEvaluator';

function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, val) => {
      map.set(key, val);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}

function makeBlankLandmarks(visibility = 0.95): PoseLandmarkPoint[] {
  return Array.from({ length: 33 }, () => ({
    x: 0.5,
    y: 0.5,
    z: 0,
    visibility,
  }));
}

function collectObjectKeys(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') return [];
  if (Array.isArray(obj)) {
    return [`${prefix}[]`];
  }
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const nextPrefix = prefix ? `${prefix}.${k}` : k;
    keys.push(nextPrefix);
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...collectObjectKeys(v, nextPrefix));
    }
  }
  return keys.sort();
}

test('ExercisePoseEvaluator: Squats counts full depth and rejects shallow reps', () => {
  const evaluator = new ExercisePoseEvaluator('squats', 2);

  const standing = makeBlankLandmarks();
  standing[23] = { x: 0.45, y: 0.5, z: 0, visibility: 0.95 };
  standing[24] = { x: 0.55, y: 0.5, z: 0, visibility: 0.95 };
  standing[25] = { x: 0.45, y: 0.7, z: 0, visibility: 0.95 };
  standing[26] = { x: 0.55, y: 0.7, z: 0, visibility: 0.95 };
  standing[27] = { x: 0.45, y: 0.9, z: 0, visibility: 0.95 };
  standing[28] = { x: 0.55, y: 0.9, z: 0, visibility: 0.95 };

  const shallow = standing.map((p) => ({ ...p }));
  shallow[25] = { x: 0.52, y: 0.7, z: 0, visibility: 0.95 };
  shallow[26] = { x: 0.62, y: 0.7, z: 0, visibility: 0.95 };

  const deep = standing.map((p) => ({ ...p }));
  deep[23] = { x: 0.3, y: 0.72, z: 0, visibility: 0.95 };
  deep[24] = { x: 0.4, y: 0.72, z: 0, visibility: 0.95 };
  deep[25] = { x: 0.6, y: 0.72, z: 0, visibility: 0.95 };
  deep[26] = { x: 0.7, y: 0.72, z: 0, visibility: 0.95 };
  deep[27] = { x: 0.45, y: 0.92, z: 0, visibility: 0.95 };
  deep[28] = { x: 0.55, y: 0.92, z: 0, visibility: 0.95 };

  // Shallow squat cycle -> 0 reps
  for (let i = 0; i < 6; i++) {
    evaluator.evaluate(shallow, i * 100);
  }
  const afterShallow = evaluator.evaluate(standing, 700);
  assert.equal(afterShallow.completedCount, 0);

  // Full squat cycle -> 1 rep (no duplicate count while standing)
  for (let i = 0; i < 8; i++) {
    evaluator.evaluate(deep, 1000 + i * 100);
  }
  let state = evaluator.evaluate(standing, 2000);
  for (let i = 1; i < 8; i++) {
    state = evaluator.evaluate(standing, 2000 + i * 100);
  }
  assert.equal(state.completedCount, 1);
  assert.equal(state.isCompleted, false);
});

test('ExercisePoseEvaluator: Push-Ups rejects torso sag and low visibility', () => {
  const evaluator = new ExercisePoseEvaluator('push_ups', 2);

  // Low visibility
  const dark = makeBlankLandmarks(0.2);
  const darkState = evaluator.evaluate(dark, 100);
  assert.equal(darkState.bodyVisible, false);
  assert.equal(darkState.feedback, 'body_out_of_frame');

  // Bent/sagging torso rejects rep
  const sagging = makeBlankLandmarks();
  sagging[11] = { x: 0.2, y: 0.4, z: 0, visibility: 0.95 };
  sagging[12] = { x: 0.2, y: 0.4, z: 0, visibility: 0.95 };
  sagging[13] = { x: 0.25, y: 0.65, z: 0, visibility: 0.95 };
  sagging[14] = { x: 0.25, y: 0.65, z: 0, visibility: 0.95 };
  sagging[15] = { x: 0.2, y: 0.85, z: 0, visibility: 0.95 };
  sagging[16] = { x: 0.2, y: 0.85, z: 0, visibility: 0.95 };
  sagging[23] = { x: 0.5, y: 0.85, z: 0, visibility: 0.95 };
  sagging[24] = { x: 0.5, y: 0.85, z: 0, visibility: 0.95 };
  sagging[27] = { x: 0.8, y: 0.45, z: 0, visibility: 0.95 };
  sagging[28] = { x: 0.8, y: 0.45, z: 0, visibility: 0.95 };

  const sagState = evaluator.evaluate(sagging, 200);
  assert.equal(sagState.feedback, 'keep_torso_straight');
  assert.equal(sagState.completedCount, 0);

  // Clean straight-torso push-up cycle -> 1 rep
  const up = sagging.map((p) => ({ ...p }));
  up[11] = { x: 0.2, y: 0.55, z: 0, visibility: 0.95 };
  up[12] = { x: 0.2, y: 0.55, z: 0, visibility: 0.95 };
  up[13] = { x: 0.2, y: 0.72, z: 0, visibility: 0.95 };
  up[14] = { x: 0.2, y: 0.72, z: 0, visibility: 0.95 };
  up[15] = { x: 0.2, y: 0.9, z: 0, visibility: 0.95 };
  up[16] = { x: 0.2, y: 0.9, z: 0, visibility: 0.95 };
  up[23] = { x: 0.5, y: 0.55, z: 0, visibility: 0.95 };
  up[24] = { x: 0.5, y: 0.55, z: 0, visibility: 0.95 };
  up[27] = { x: 0.8, y: 0.55, z: 0, visibility: 0.95 };
  up[28] = { x: 0.8, y: 0.55, z: 0, visibility: 0.95 };

  const shallowDown = up.map((p) => ({ ...p }));
  shallowDown[13] = { x: 0.1, y: 0.72, z: 0, visibility: 0.95 };
  shallowDown[14] = { x: 0.1, y: 0.72, z: 0, visibility: 0.95 };
  for (let i = 0; i < 6; i++) evaluator.evaluate(shallowDown, 300 + i * 50);
  assert.equal(evaluator.evaluate(up, 650).completedCount, 0);

  // Real < 90 deg push-up bottom (shoulders drop to elbow height) -> 1 rep
  const down = up.map((p) => ({ ...p }));
  down[11] = { x: 0.2, y: 0.72, z: 0, visibility: 0.95 };
  down[12] = { x: 0.2, y: 0.72, z: 0, visibility: 0.95 };
  down[13] = { x: 0.1, y: 0.72, z: 0, visibility: 0.95 };
  down[14] = { x: 0.1, y: 0.72, z: 0, visibility: 0.95 };

  for (let i = 0; i < 8; i++) evaluator.evaluate(down, 800 + i * 100);
  let afterPushUp = evaluator.evaluate(up, 1700);
  for (let i = 1; i < 8; i++) {
    afterPushUp = evaluator.evaluate(up, 1700 + i * 100);
  }
  assert.equal(afterPushUp.completedCount, 1);
});

test('ExercisePoseEvaluator: Jumping Jacks & Lunges hysteresis and Plank Hold timing', () => {
  // Jumping Jacks
  const jacks = new ExercisePoseEvaluator('jumping_jacks', 2);
  const closed = makeBlankLandmarks();
  closed[0] = { x: 0.5, y: 0.2, z: 0, visibility: 0.95 };
  closed[11] = { x: 0.42, y: 0.35, z: 0, visibility: 0.95 };
  closed[12] = { x: 0.58, y: 0.35, z: 0, visibility: 0.95 };
  closed[15] = { x: 0.38, y: 0.55, z: 0, visibility: 0.95 };
  closed[16] = { x: 0.62, y: 0.55, z: 0, visibility: 0.95 };
  closed[23] = { x: 0.45, y: 0.6, z: 0, visibility: 0.95 };
  closed[24] = { x: 0.55, y: 0.6, z: 0, visibility: 0.95 };
  closed[27] = { x: 0.47, y: 0.9, z: 0, visibility: 0.95 };
  closed[28] = { x: 0.53, y: 0.9, z: 0, visibility: 0.95 };

  const armsOnly = closed.map((p) => ({ ...p }));
  armsOnly[15] = { x: 0.4, y: 0.1, z: 0, visibility: 0.95 };
  armsOnly[16] = { x: 0.6, y: 0.1, z: 0, visibility: 0.95 };
  jacks.evaluate(armsOnly, 100);
  assert.equal(jacks.evaluate(closed, 200).completedCount, 0);

  const open = armsOnly.map((p) => ({ ...p }));
  open[27] = { x: 0.3, y: 0.9, z: 0, visibility: 0.95 };
  open[28] = { x: 0.7, y: 0.9, z: 0, visibility: 0.95 };
  jacks.evaluate(open, 300);
  assert.equal(jacks.evaluate(closed, 400).completedCount, 1);

  // Lunges
  const lunges = new ExercisePoseEvaluator('lunges', 1);
  const upright = makeBlankLandmarks();
  upright[23] = { x: 0.45, y: 0.5, z: 0, visibility: 0.95 };
  upright[24] = { x: 0.55, y: 0.5, z: 0, visibility: 0.95 };
  upright[25] = { x: 0.45, y: 0.7, z: 0, visibility: 0.95 };
  upright[26] = { x: 0.55, y: 0.7, z: 0, visibility: 0.95 };
  upright[27] = { x: 0.45, y: 0.9, z: 0, visibility: 0.95 };
  upright[28] = { x: 0.55, y: 0.9, z: 0, visibility: 0.95 };

  const lungeDown = upright.map((p) => ({ ...p }));
  lungeDown[23] = { x: 0.3, y: 0.72, z: 0, visibility: 0.95 };
  lungeDown[24] = { x: 0.4, y: 0.72, z: 0, visibility: 0.95 };
  lungeDown[25] = { x: 0.6, y: 0.72, z: 0, visibility: 0.95 };
  lungeDown[26] = { x: 0.7, y: 0.72, z: 0, visibility: 0.95 };
  lunges.evaluate(lungeDown, 100);
  const lungeDone = lunges.evaluate(upright, 200);
  assert.equal(lungeDone.completedCount, 1);
  assert.equal(lungeDone.isCompleted, true);

  // Plank Hold
  const plank = new ExercisePoseEvaluator('plank_hold', 2);
  const validPlank = makeBlankLandmarks();
  validPlank[11] = { x: 0.2, y: 0.6, z: 0, visibility: 0.95 };
  validPlank[12] = { x: 0.2, y: 0.6, z: 0, visibility: 0.95 };
  validPlank[23] = { x: 0.5, y: 0.6, z: 0, visibility: 0.95 };
  validPlank[24] = { x: 0.5, y: 0.6, z: 0, visibility: 0.95 };
  validPlank[27] = { x: 0.8, y: 0.6, z: 0, visibility: 0.95 };
  validPlank[28] = { x: 0.8, y: 0.6, z: 0, visibility: 0.95 };

  for (let t = 0; t <= 2200; t += 200) {
    plank.evaluate(validPlank, t);
  }
  const plankDone = plank.evaluate(validPlank, 2400);
  assert.equal(plankDone.completedCount, 2);
  assert.equal(plankDone.isCompleted, true);
});

test('Alarm scheduling & repeat formatting across rollovers', () => {
  const now = new Date(2026, 10, 12, 8, 30, 0); // Thu Nov 12 2026 08:30
  const oneShot: AlarmModel = {
    id: 'one-shot',
    hour: 7,
    minute: 15,
    label: 'Morning',
    isEnabled: true,
    repeatDays: [],
    exerciseType: 'squats',
    targetReps: 15,
    vibrationEnabled: true,
    snoozeAllowed: false,
    createdAt: 1000,
    updatedAt: 1000,
  };

  const nextOneShot = getNextTriggerTime(oneShot, now);
  assert.equal(nextOneShot.getFullYear(), 2026);
  assert.equal(nextOneShot.getMonth(), 10);
  assert.equal(nextOneShot.getDate(), 13);
  assert.equal(nextOneShot.getHours(), 7);

  const weekdaySummary = formatRepeatSummary([1, 2, 3, 4, 5], EN_TRANSLATIONS);
  assert.equal(weekdaySummary, EN_TRANSLATIONS.time.weekdays);
  const arabicWeekend = formatRepeatSummary([6, 7], AR_TRANSLATIONS);
  assert.equal(arabicWeekend, AR_TRANSLATIONS.time.weekends);
});

test('Storage persistence, edits, history clear, backup integrity & v1->v3 migration', () => {
  const store = createMemoryStorage();
  const alarmOne: AlarmModel = {
    id: 'alarm-1',
    hour: 6,
    minute: 30,
    label: 'Wake',
    isEnabled: true,
    repeatDays: [1, 3, 5],
    exerciseType: 'push_ups',
    targetReps: 10,
    vibrationEnabled: true,
    snoozeAllowed: false,
    createdAt: 1000,
    updatedAt: 1000,
  };
  const alarmTwo: AlarmModel = {
    ...alarmOne,
    id: 'alarm-2',
    hour: 8,
    minute: 15,
    label: 'Morning Squats',
    exerciseType: 'squats',
    targetReps: 20,
    createdAt: 2000,
    updatedAt: 2000,
  };

  // Scenario 10: Upgrade from schema v1 -> v3 without losing pre-existing data
  store.setItem(SCHEMA_VERSION_KEY, '1');
  store.setItem('pro_alarms_v1', JSON.stringify([alarmOne]));
  store.setItem('pro_settings_v1', JSON.stringify({ language: 'en', alarmVolume: 0.75 }));
  assert.equal(ensureStorageMigrated(store), CURRENT_SCHEMA_VERSION);
  assert.equal(store.getItem(SCHEMA_VERSION_KEY), CURRENT_SCHEMA_VERSION);
  assert.equal(loadAlarms(store).length, 1);
  assert.equal(loadSettings(store).language, 'en');
  assert.equal(loadSettings(store).alarmTone, 'classic');

  // Scenarios 1 & 2: Create alarms, edit alarm, reload after simulated app restart
  saveAlarms([alarmOne, alarmTwo], store);
  assert.equal(loadAlarms(store).length, 2);
  const editedTwo: AlarmModel = { ...alarmTwo, label: 'Updated Squats', targetReps: 25 };
  saveAlarms([alarmOne, editedTwo], store);
  const reloadedAlarms = loadAlarms(store);
  assert.equal(reloadedAlarms.find((a) => a.id === 'alarm-2')?.label, 'Updated Squats');
  assert.equal(reloadedAlarms.find((a) => a.id === 'alarm-2')?.targetReps, 25);

  // Scenario 3: Delete single alarm leaving others intact
  saveAlarms([editedTwo], store);
  assert.deepEqual(
    loadAlarms(store).map((a) => a.id),
    ['alarm-2'],
  );

  // Scenarios 4 & 5: Save workout sessions, verify persistence & stats, delete one record, clear history safely
  const now = new Date(2026, 10, 12, 9, 0, 0);
  saveWorkoutSession(
    {
      id: 'sess-1',
      alarmId: 'alarm-2',
      exerciseType: 'squats',
      targetReps: 25,
      completedReps: 25,
      durationSeconds: 40,
      completedAt: now.getTime(),
    },
    store,
  );
  saveWorkoutSession(
    {
      id: 'sess-2',
      alarmId: 'alarm-2',
      exerciseType: 'push_ups',
      targetReps: 10,
      completedReps: 10,
      durationSeconds: 28,
      completedAt: now.getTime() - 86400 * 1000,
    },
    store,
  );
  assert.equal(loadWorkoutSessions(store).length, 2);
  const stats = computeDashboardStats(loadWorkoutSessions(store), now);
  assert.equal(stats.totalSessions, 2);
  assert.equal(stats.totalReps, 35);
  assert.equal(stats.currentStreakDays, 2);

  // Scenario 6: Immediate language & alarmTone settings persistence
  saveSettings(
    { ...loadSettings(store), language: 'ar', alarmTone: 'radar', use24HourFormat: true },
    store,
  );
  const restoredSettings = loadSettings(store);
  assert.equal(restoredSettings.language, 'ar');
  assert.equal(restoredSettings.alarmTone, 'radar');
  assert.equal(restoredSettings.use24HourFormat, true);

  // Scenario 7: Export backup (with version & checksum) before deleting sessions
  const exported = exportBackupPayload(store);
  assert.equal(exported.backupVersion, CURRENT_BACKUP_VERSION);
  assert.equal(typeof exported.checksum, 'string');
  const backupJson = JSON.stringify(exported);

  // Delete single workout record
  deleteWorkoutSession('sess-2', store);
  assert.deepEqual(
    loadWorkoutSessions(store).map((s) => s.id),
    ['sess-1'],
  );

  // Clear all workout history MUST preserve alarms & settings
  clearWorkoutHistory(store);
  assert.equal(loadWorkoutSessions(store).length, 0);
  assert.equal(loadAlarms(store).length, 1);
  assert.equal(loadSettings(store).alarmTone, 'radar');

  // Scenario 9: Reject corrupted JSON, checksum-tampered JSON, and unsupported backupVersion without altering existing data
  assert.deepEqual(importBackupPayload('{not-valid-json', store), {
    ok: false,
    reason: 'invalid_json',
  });
  const tampered = JSON.parse(backupJson) as Record<string, unknown>;
  (tampered.alarms as Array<Record<string, unknown>>)[0].targetReps = 999;
  assert.deepEqual(parseAndValidateBackup(JSON.stringify(tampered)), {
    ok: false,
    reason: 'checksum_mismatch',
  });
  const futureVersion = { ...JSON.parse(backupJson), backupVersion: 99 };
  assert.deepEqual(parseAndValidateBackup(JSON.stringify(futureVersion)), {
    ok: false,
    reason: 'unsupported_version',
  });
  // Existing alarm and settings remained untouched after failed imports
  assert.equal(loadAlarms(store).length, 1);
  assert.equal(loadAlarms(store)[0].targetReps, 25);

  // Scenario 8: Wipe storage cleanly, then restore everything from valid backup
  clearAllLocalStorage(store);
  assert.equal(loadAlarms(store).length, 0);
  assert.equal(loadWorkoutSessions(store).length, 0);
  const validRes = importBackupPayload(backupJson, store);
  assert.equal(validRes.ok, true);
  assert.equal(loadAlarms(store).length, 1);
  assert.equal(loadWorkoutSessions(store).length, 2);
  assert.equal(loadSettings(store).alarmTone, 'radar');
  assert.equal(loadSettings(store).language, 'ar');
});

test('Bilingual Arabic/English parity in web translations and Flutter ARB files', () => {
  // 1. Web TypeScript translations key parity
  const arTsKeys = collectObjectKeys(AR_TRANSLATIONS);
  const enTsKeys = collectObjectKeys(EN_TRANSLATIONS);
  assert.deepEqual(arTsKeys, enTsKeys);

  // 2. Flutter ARB key parity
  const enArb = JSON.parse(
    fs.readFileSync(
      path.resolve(process.cwd(), 'pro_app/lib/l10n/app_en.arb'),
      'utf8',
    ),
  ) as Record<string, unknown>;
  const arArb = JSON.parse(
    fs.readFileSync(
      path.resolve(process.cwd(), 'pro_app/lib/l10n/app_ar.arb'),
      'utf8',
    ),
  ) as Record<string, unknown>;

  const enArbKeys = Object.keys(enArb)
    .filter((k) => !k.startsWith('@'))
    .sort();
  const arArbKeys = Object.keys(arArb)
    .filter((k) => !k.startsWith('@'))
    .sort();

  assert.deepEqual(arArbKeys, enArbKeys);
  assert.ok(enArbKeys.length >= 200);
});
