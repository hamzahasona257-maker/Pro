import {
  AlarmModel,
  AlarmTone,
  AppSettings,
  DashboardStats,
  ExerciseType,
  Weekday,
  WorkoutSession,
} from '../types/pro';

export const ALARMS_KEY = 'pro_alarms_v1';
export const WORKOUTS_KEY = 'pro_workouts_v1';
export const SETTINGS_KEY = 'pro_settings_v1';
export const SCHEMA_VERSION_KEY = 'pro_schema_version';
export const CURRENT_SCHEMA_VERSION = '3';
export const CURRENT_BACKUP_VERSION = 1;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function resolveStorage(custom?: StorageLike): StorageLike | null {
  if (custom) return custom;
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
    return globalThis.localStorage;
  }
  return null;
}

const VALID_EXERCISES = new Set<ExerciseType>([
  'squats',
  'push_ups',
  'jumping_jacks',
  'lunges',
  'plank_hold',
]);

const VALID_TONES = new Set<AlarmTone>(['classic', 'chime', 'radar']);

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'ar',
  use24HourFormat: false,
  defaultVibration: true,
  alarmVolume: 0.85,
  alarmTone: 'classic',
  defaultExercise: 'squats',
  defaultTargetReps: 15,
  poseDelegate: 'gpu',
  hapticFeedback: true,
};

export interface ProBackupPayload {
  app: 'PRO';
  backupVersion: number;
  schemaVersion: number;
  exportedAt: number;
  checksum: string;
  alarms: AlarmModel[];
  sessions: WorkoutSession[];
  settings: AppSettings;
}

export type BackupFailureReason =
  | 'invalid_json'
  | 'unsupported_version'
  | 'checksum_mismatch'
  | 'invalid_records';

export function computeIntegrityDigest(input: string): string {
  const fnvOffset = 0x811c9dc5;
  const fnvPrime = 0x01000193;
  let h1 = fnvOffset >>> 0;
  let h2 = (fnvOffset ^ 0x55aa33cc) >>> 0;

  const bytes = new TextEncoder().encode(input);
  for (let i = 0; i < bytes.length; i++) {
    h1 ^= bytes[i];
    h1 = Math.imul(h1, fnvPrime) >>> 0;
    h2 ^= bytes[i] ^ (i & 0xff);
    h2 = Math.imul(h2, fnvPrime) >>> 0;
  }
  return (
    h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0')
  );
}

function sortAlarms(alarms: AlarmModel[]): AlarmModel[] {
  return [...alarms].sort(
    (a, b) => a.hour - b.hour || a.minute - b.minute || b.createdAt - a.createdAt,
  );
}

function isValidWeekday(n: unknown): n is Weekday {
  return typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 7;
}

function sanitizeAlarm(raw: unknown): AlarmModel | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (
    typeof r.id !== 'string' ||
    !r.id.trim() ||
    typeof r.hour !== 'number' ||
    !Number.isInteger(r.hour) ||
    r.hour < 0 ||
    r.hour > 23 ||
    typeof r.minute !== 'number' ||
    !Number.isInteger(r.minute) ||
    r.minute < 0 ||
    r.minute > 59 ||
    typeof r.label !== 'string' ||
    typeof r.exerciseType !== 'string' ||
    !VALID_EXERCISES.has(r.exerciseType as ExerciseType) ||
    typeof r.targetReps !== 'number' ||
    r.targetReps < 1
  ) {
    return null;
  }

  const repeatDays = Array.isArray(r.repeatDays)
    ? r.repeatDays.filter(isValidWeekday)
    : [];

  return {
    id: r.id,
    hour: Math.floor(r.hour),
    minute: Math.floor(r.minute),
    label: r.label.slice(0, 64),
    isEnabled: typeof r.isEnabled === 'boolean' ? r.isEnabled : true,
    repeatDays,
    exerciseType: r.exerciseType as ExerciseType,
    targetReps: Math.floor(r.targetReps),
    vibrationEnabled:
      typeof r.vibrationEnabled === 'boolean' ? r.vibrationEnabled : true,
    snoozeAllowed: typeof r.snoozeAllowed === 'boolean' ? r.snoozeAllowed : false,
    createdAt: typeof r.createdAt === 'number' ? r.createdAt : Date.now(),
    updatedAt: typeof r.updatedAt === 'number' ? r.updatedAt : Date.now(),
  };
}

function sanitizeSession(raw: unknown): WorkoutSession | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (
    typeof r.id !== 'string' ||
    !r.id.trim() ||
    (r.alarmId !== null && typeof r.alarmId !== 'string') ||
    typeof r.exerciseType !== 'string' ||
    !VALID_EXERCISES.has(r.exerciseType as ExerciseType) ||
    typeof r.targetReps !== 'number' ||
    r.targetReps < 1 ||
    typeof r.completedReps !== 'number' ||
    r.completedReps < 0 ||
    typeof r.durationSeconds !== 'number' ||
    r.durationSeconds < 1 ||
    typeof r.completedAt !== 'number'
  ) {
    return null;
  }
  return {
    id: r.id,
    alarmId: r.alarmId,
    exerciseType: r.exerciseType as ExerciseType,
    targetReps: Math.floor(r.targetReps),
    completedReps: Math.floor(r.completedReps),
    durationSeconds: Math.max(1, Math.floor(r.durationSeconds)),
    completedAt: r.completedAt,
  };
}

function sanitizeSettings(raw: Partial<AppSettings>): AppSettings {
  const language =
    raw.language === 'en' || raw.language === 'ar' ? raw.language : 'ar';
  const defaultExercise =
    raw.defaultExercise && VALID_EXERCISES.has(raw.defaultExercise)
      ? raw.defaultExercise
      : DEFAULT_SETTINGS.defaultExercise;
  const alarmTone =
    raw.alarmTone && VALID_TONES.has(raw.alarmTone)
      ? raw.alarmTone
      : DEFAULT_SETTINGS.alarmTone;
  const alarmVolume =
    typeof raw.alarmVolume === 'number'
      ? Math.min(Math.max(raw.alarmVolume, 0.1), 1)
      : DEFAULT_SETTINGS.alarmVolume;
  const defaultTargetReps =
    typeof raw.defaultTargetReps === 'number'
      ? Math.min(Math.max(Math.round(raw.defaultTargetReps), 5), 180)
      : DEFAULT_SETTINGS.defaultTargetReps;

  return {
    ...DEFAULT_SETTINGS,
    ...raw,
    language,
    alarmTone,
    alarmVolume,
    defaultExercise,
    defaultTargetReps,
  };
}

export function ensureStorageMigrated(storage?: StorageLike): string {
  const store = resolveStorage(storage);
  if (!store) return CURRENT_SCHEMA_VERSION;

  const existingVersion = store.getItem(SCHEMA_VERSION_KEY);
  if (existingVersion === CURRENT_SCHEMA_VERSION) {
    return CURRENT_SCHEMA_VERSION;
  }

  // Safe non-destructive migration (v1/v2 -> v3): preserve existing alarms, workouts, and settings
  const rawAlarms = store.getItem(ALARMS_KEY);
  if (rawAlarms) {
    try {
      const parsed = JSON.parse(rawAlarms);
      if (Array.isArray(parsed)) {
        const sanitized = parsed
          .map(sanitizeAlarm)
          .filter((a): a is AlarmModel => a !== null);
        store.setItem(ALARMS_KEY, JSON.stringify(sanitized));
      }
    } catch {
      // Preserve untouched if unreadable
    }
  }

  const rawSettings = store.getItem(SETTINGS_KEY);
  if (rawSettings) {
    try {
      const parsed = JSON.parse(rawSettings) as Partial<AppSettings>;
      store.setItem(SETTINGS_KEY, JSON.stringify(sanitizeSettings(parsed)));
    } catch {
      // Preserve untouched if unreadable
    }
  }

  store.setItem(SCHEMA_VERSION_KEY, CURRENT_SCHEMA_VERSION);
  return CURRENT_SCHEMA_VERSION;
}

export function loadAlarms(storage?: StorageLike): AlarmModel[] {
  const store = resolveStorage(storage);
  if (!store) return [];
  ensureStorageMigrated(store);
  try {
    const raw = store.getItem(ALARMS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const clean = parsed
      .map(sanitizeAlarm)
      .filter((a): a is AlarmModel => a !== null);
    return sortAlarms(clean);
  } catch {
    return [];
  }
}

export function saveAlarms(alarms: AlarmModel[], storage?: StorageLike): void {
  const store = resolveStorage(storage);
  if (!store) return;
  ensureStorageMigrated(store);
  store.setItem(ALARMS_KEY, JSON.stringify(alarms));
}

export function loadWorkoutSessions(storage?: StorageLike): WorkoutSession[] {
  const store = resolveStorage(storage);
  if (!store) return [];
  ensureStorageMigrated(store);
  try {
    const raw = store.getItem(WORKOUTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(sanitizeSession)
      .filter((s): s is WorkoutSession => s !== null)
      .sort((a, b) => b.completedAt - a.completedAt);
  } catch {
    return [];
  }
}

export function saveWorkoutSession(
  session: WorkoutSession,
  storage?: StorageLike,
): WorkoutSession[] {
  const existing = loadWorkoutSessions(storage);
  const next = [session, ...existing.filter((s) => s.id !== session.id)].sort(
    (a, b) => b.completedAt - a.completedAt,
  );
  const store = resolveStorage(storage);
  if (store) {
    store.setItem(WORKOUTS_KEY, JSON.stringify(next));
  }
  return next;
}

export function deleteWorkoutSession(
  id: string,
  storage?: StorageLike,
): WorkoutSession[] {
  const existing = loadWorkoutSessions(storage);
  const next = existing.filter((s) => s.id !== id);
  const store = resolveStorage(storage);
  if (store) {
    store.setItem(WORKOUTS_KEY, JSON.stringify(next));
  }
  return next;
}

export function clearWorkoutHistory(storage?: StorageLike): void {
  const store = resolveStorage(storage);
  if (!store) return;
  // Strictly clears ONLY workout sessions while leaving alarms & settings intact
  store.removeItem(WORKOUTS_KEY);
}

export function loadSettings(storage?: StorageLike): AppSettings {
  const store = resolveStorage(storage);
  if (!store) return DEFAULT_SETTINGS;
  ensureStorageMigrated(store);
  try {
    const raw = store.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return sanitizeSettings(parsed);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(
  settings: AppSettings,
  storage?: StorageLike,
): void {
  const store = resolveStorage(storage);
  if (!store) return;
  ensureStorageMigrated(store);
  store.setItem(SETTINGS_KEY, JSON.stringify(sanitizeSettings(settings)));
}

export function clearAllLocalStorage(storage?: StorageLike): void {
  const store = resolveStorage(storage);
  if (!store) return;
  store.removeItem(ALARMS_KEY);
  store.removeItem(WORKOUTS_KEY);
  store.removeItem(SETTINGS_KEY);
}

export function exportBackupPayload(storage?: StorageLike): ProBackupPayload {
  const alarms = loadAlarms(storage);
  const sessions = loadWorkoutSessions(storage);
  const settings = loadSettings(storage);
  const dataCanonical = JSON.stringify({ alarms, sessions, settings });

  return {
    app: 'PRO',
    backupVersion: CURRENT_BACKUP_VERSION,
    schemaVersion: Number(CURRENT_SCHEMA_VERSION),
    exportedAt: Date.now(),
    checksum: computeIntegrityDigest(dataCanonical),
    alarms,
    sessions,
    settings,
  };
}

export function parseAndValidateBackup(
  rawJson: string,
): { ok: true; payload: ProBackupPayload } | { ok: false; reason: BackupFailureReason } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { ok: false, reason: 'invalid_json' };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, reason: 'invalid_json' };
  }

  const obj = parsed as Record<string, unknown>;
  if (
    obj.app !== 'PRO' ||
    typeof obj.backupVersion !== 'number' ||
    obj.backupVersion < 1 ||
    obj.backupVersion > CURRENT_BACKUP_VERSION
  ) {
    return { ok: false, reason: 'unsupported_version' };
  }

  if (
    typeof obj.checksum !== 'string' ||
    !Array.isArray(obj.alarms) ||
    !Array.isArray(obj.sessions) ||
    !obj.settings ||
    typeof obj.settings !== 'object'
  ) {
    return { ok: false, reason: 'invalid_records' };
  }

  const rawDataCanonical = JSON.stringify({
    alarms: obj.alarms,
    sessions: obj.sessions,
    settings: obj.settings,
  });
  if (obj.checksum !== computeIntegrityDigest(rawDataCanonical)) {
    return { ok: false, reason: 'checksum_mismatch' };
  }

  const alarms = obj.alarms
    .map(sanitizeAlarm)
    .filter((a): a is AlarmModel => a !== null);
  const sessions = obj.sessions
    .map(sanitizeSession)
    .filter((s): s is WorkoutSession => s !== null);

  if (
    alarms.length !== obj.alarms.length ||
    sessions.length !== obj.sessions.length
  ) {
    return { ok: false, reason: 'invalid_records' };
  }

  const settings = sanitizeSettings(obj.settings as Partial<AppSettings>);

  return {
    ok: true,
    payload: {
      app: 'PRO',
      backupVersion: obj.backupVersion,
      schemaVersion: Number(CURRENT_SCHEMA_VERSION),
      exportedAt: typeof obj.exportedAt === 'number' ? obj.exportedAt : Date.now(),
      checksum: obj.checksum,
      alarms: sortAlarms(alarms),
      sessions: [...sessions].sort((a, b) => b.completedAt - a.completedAt),
      settings,
    },
  };
}

export function applyValidatedBackup(
  payload: ProBackupPayload,
  storage?: StorageLike,
): void {
  const store = resolveStorage(storage);
  if (!store) return;
  ensureStorageMigrated(store);
  store.setItem(ALARMS_KEY, JSON.stringify(sortAlarms(payload.alarms)));
  store.setItem(
    WORKOUTS_KEY,
    JSON.stringify(
      [...payload.sessions].sort((a, b) => b.completedAt - a.completedAt),
    ),
  );
  store.setItem(SETTINGS_KEY, JSON.stringify(payload.settings));
}

export function importBackupPayload(
  rawJson: string,
  storage?: StorageLike,
):
  | { ok: true; payload: ProBackupPayload }
  | { ok: false; reason: BackupFailureReason } {
  const validation = parseAndValidateBackup(rawJson);
  if (!validation.ok) return validation;
  applyValidatedBackup(validation.payload, storage);
  return validation;
}

export function computeDashboardStats(
  sessions: WorkoutSession[],
  now: Date,
): DashboardStats {
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      totalReps: 0,
      currentStreakDays: 0,
      lastSession: null,
    };
  }

  let totalReps = 0;
  const completedDayKeys = new Set<string>();

  for (const session of sessions) {
    totalReps += session.completedReps;
    const d = new Date(session.completedAt);
    completedDayKeys.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const cursor = new Date(today);
  if (!completedDayKeys.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (
    completedDayKeys.has(
      `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`,
    )
  ) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    totalSessions: sessions.length,
    totalReps,
    currentStreakDays: streak,
    lastSession: sessions[0],
  };
}
