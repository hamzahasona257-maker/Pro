import { useEffect, useRef, useState } from 'react';
import {
  HistoryModal,
  OnboardingGuideModal,
  PrivacyPolicyModal,
} from './components/Modals';
import { NavigationShell } from './components/NavigationShell';
import { ProConfirmDialog } from './components/ui';
import { getExerciseByType } from './data/exerciseCatalog';
import {
  applyValidatedBackup,
  clearAllLocalStorage,
  clearWorkoutHistory,
  computeDashboardStats,
  DEFAULT_SETTINGS,
  deleteWorkoutSession,
  exportBackupPayload,
  loadAlarms,
  loadSettings,
  loadWorkoutSessions,
  parseAndValidateBackup,
  ProBackupPayload,
  saveAlarms,
  saveSettings,
  saveWorkoutSession,
} from './data/storage';
import { getTranslations } from './i18n/translations';
import { AddAlarmScreen, AlarmDraft } from './screens/AddAlarmScreen';
import { AlarmChallengeScreen } from './screens/AlarmChallengeScreen';
import { AlarmsScreen } from './screens/AlarmsScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { ExerciseSelectionScreen } from './screens/ExerciseSelectionScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import {
  AlarmModel,
  AppSettings,
  AppTab,
  Weekday,
  WorkoutSession,
} from './types/pro';

type ViewState =
  | { mode: 'tab'; tab: AppTab }
  | { mode: 'alarmForm'; draft: AlarmDraft }
  | { mode: 'exercisePicker'; draft: AlarmDraft };

interface ActiveChallengeState {
  alarm: AlarmModel;
  isPreviewTest: boolean;
  snoozeUsed: boolean;
}

export default function App() {
  const [alarms, setAlarms] = useState<AlarmModel[]>(() => loadAlarms());
  const [sessions, setSessions] = useState<WorkoutSession[]>(() =>
    loadWorkoutSessions(),
  );
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [view, setView] = useState<ViewState>({ mode: 'tab', tab: 'dashboard' });
  const [now, setNow] = useState<Date>(() => new Date());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [pendingBackup, setPendingBackup] = useState<ProBackupPayload | null>(
    null,
  );
  const [activeChallenge, setActiveChallenge] =
    useState<ActiveChallengeState | null>(null);

  const lastTriggeredMinuteKeyRef = useRef<string>('');
  const snoozedTargetsRef = useRef<Map<string, number>>(new Map());

  const t = getTranslations(settings.language);

  // Sync HTML lang, dir (RTL for Arabic, LTR for English), and document title immediately
  useEffect(() => {
    const html = document.documentElement;
    html.lang = settings.language;
    html.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    document.title = t.documentTitle;
  }, [settings.language, t.documentTitle]);

  // Real-time 1-second clock & active alarm schedule watcher
  useEffect(() => {
    const tick = () => {
      const current = new Date();
      setNow(current);

      if (activeChallenge) return;

      const minuteKey = `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}-${current.getHours()}-${current.getMinutes()}`;
      if (lastTriggeredMinuteKeyRef.current === minuteKey) return;

      // Check one-time snoozes first
      for (const alarm of alarms) {
        if (!alarm.isEnabled) continue;
        const snoozedUntil = snoozedTargetsRef.current.get(alarm.id);
        if (snoozedUntil && current.getTime() >= snoozedUntil) {
          snoozedTargetsRef.current.delete(alarm.id);
          lastTriggeredMinuteKeyRef.current = minuteKey;
          setActiveChallenge({ alarm, isPreviewTest: false, snoozeUsed: true });
          return;
        }
      }

      // Check regular scheduled alarms at matching hour/minute/weekday
      const jsDay = current.getDay();
      const isoWeekday = (jsDay === 0 ? 7 : jsDay) as Weekday;
      const matching = alarms.find((alarm) => {
        if (!alarm.isEnabled) return false;
        if (
          alarm.hour !== current.getHours() ||
          alarm.minute !== current.getMinutes()
        ) {
          return false;
        }
        return (
          alarm.repeatDays.length === 0 ||
          alarm.repeatDays.includes(isoWeekday)
        );
      });

      if (matching) {
        lastTriggeredMinuteKeyRef.current = minuteKey;
        setActiveChallenge({
          alarm: matching,
          isPreviewTest: false,
          snoozeUsed: false,
        });
      }
    };

    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [alarms, activeChallenge]);

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = window.setTimeout(() => setToastMessage(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const showToast = (msg: string) => setToastMessage(msg);

  const openCreateAlarm = () => {
    const def = getExerciseByType(settings.defaultExercise);
    const clampedTarget = Math.min(
      Math.max(settings.defaultTargetReps, def.minTarget),
      def.maxTarget,
    );
    setView({
      mode: 'alarmForm',
      draft: {
        hour: 7,
        minute: 0,
        label: '',
        repeatDays: [],
        exerciseType: settings.defaultExercise,
        targetReps: clampedTarget,
        vibrationEnabled: settings.defaultVibration,
        snoozeAllowed: false,
        isEnabled: true,
      },
    });
  };

  const openEditAlarm = (id: string) => {
    const existing = alarms.find((a) => a.id === id);
    if (!existing) return;
    setView({
      mode: 'alarmForm',
      draft: {
        id: existing.id,
        hour: existing.hour,
        minute: existing.minute,
        label: existing.label,
        repeatDays: [...existing.repeatDays],
        exerciseType: existing.exerciseType,
        targetReps: existing.targetReps,
        vibrationEnabled: existing.vibrationEnabled,
        snoozeAllowed: existing.snoozeAllowed,
        isEnabled: existing.isEnabled,
      },
    });
  };

  const handleSaveDraft = (draft: AlarmDraft) => {
    const timestamp = Date.now();
    const cleanLabel = (draft.label.trim() || t.alarmForm.defaultLabel).slice(
      0,
      48,
    );
    const sortedDays = [...draft.repeatDays].sort((a, b) => a - b);
    let updated: AlarmModel[];

    if (draft.id) {
      updated = alarms.map((item) =>
        item.id === draft.id
          ? {
              ...item,
              hour: draft.hour,
              minute: draft.minute,
              label: cleanLabel,
              repeatDays: sortedDays,
              exerciseType: draft.exerciseType,
              targetReps: draft.targetReps,
              vibrationEnabled: draft.vibrationEnabled,
              snoozeAllowed: draft.snoozeAllowed,
              isEnabled: draft.isEnabled,
              updatedAt: timestamp,
            }
          : item,
      );
      showToast(t.alarmForm.updatedToast(cleanLabel));
    } else {
      const newAlarm: AlarmModel = {
        id: crypto.randomUUID(),
        hour: draft.hour,
        minute: draft.minute,
        label: cleanLabel,
        isEnabled: draft.isEnabled,
        repeatDays: sortedDays,
        exerciseType: draft.exerciseType,
        targetReps: draft.targetReps,
        vibrationEnabled: draft.vibrationEnabled,
        snoozeAllowed: draft.snoozeAllowed,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      updated = [...alarms, newAlarm];
      showToast(t.alarmForm.savedToast(cleanLabel));
    }

    updated.sort(
      (a, b) => a.hour - b.hour || a.minute - b.minute || b.createdAt - a.createdAt,
    );
    setAlarms(updated);
    saveAlarms(updated);
    setView({ mode: 'tab', tab: 'alarms' });
  };

  const handleToggleAlarm = (id: string, enabled: boolean) => {
    const timestamp = Date.now();
    const updated = alarms.map((item) =>
      item.id === id
        ? { ...item, isEnabled: enabled, updatedAt: timestamp }
        : item,
    );
    setAlarms(updated);
    saveAlarms(updated);
  };

  const handleDeleteAlarm = (id: string) => {
    const target = alarms.find((a) => a.id === id);
    const updated = alarms.filter((item) => item.id !== id);
    setAlarms(updated);
    saveAlarms(updated);
    if (target) {
      showToast(t.alarms.deletedToast(target.label));
    }
  };

  const handleUpdateSettings = (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  };

  const handleExportBackup = () => {
    const payload = exportBackupPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `pro-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast(t.settings.backupExportedToast);
  };

  const handleImportBackup = (rawJson: string) => {
    const res = parseAndValidateBackup(rawJson);
    if (!res.ok) {
      showToast(t.settings.backupInvalidError);
      return;
    }
    setPendingBackup(res.payload);
  };

  const handleConfirmRestoreBackup = () => {
    if (!pendingBackup) return;
    applyValidatedBackup(pendingBackup);
    setAlarms(pendingBackup.alarms);
    setSessions(pendingBackup.sessions);
    setSettings(pendingBackup.settings);
    const restoredLang = getTranslations(pendingBackup.settings.language);
    showToast(
      restoredLang.settings.backupImportedToast(
        pendingBackup.alarms.length,
        pendingBackup.sessions.length,
      ),
    );
    setPendingBackup(null);
  };

  const handleDeleteSession = (id: string) => {
    const next = deleteWorkoutSession(id);
    setSessions(next);
    showToast(t.history.deletedToast);
  };

  const handleClearHistory = () => {
    clearWorkoutHistory();
    setSessions([]);
    showToast(t.history.clearedToast);
  };

  const handleResetAllData = () => {
    clearAllLocalStorage();
    setAlarms([]);
    setSessions([]);
    setSettings(DEFAULT_SETTINGS);
    showToast(getTranslations(DEFAULT_SETTINGS.language).settings.resetToast);
  };

  const stats = computeDashboardStats(sessions, now);
  const currentTab: AppTab = view.mode === 'tab' ? view.tab : 'alarms';

  return (
    <>
      <NavigationShell
        activeTab={currentTab}
        t={t}
        onSelectTab={(tab) => setView({ mode: 'tab', tab })}
        onCreateAlarm={openCreateAlarm}
      >
        {view.mode === 'tab' && view.tab === 'dashboard' && (
          <DashboardScreen
            alarms={alarms}
            stats={stats}
            use24Hour={settings.use24HourFormat}
            language={settings.language}
            t={t}
            now={now}
            onNavigateTab={(tab) => setView({ mode: 'tab', tab })}
            onCreateAlarm={openCreateAlarm}
            onEditAlarm={openEditAlarm}
            onToggleAlarm={handleToggleAlarm}
            onOpenHistory={() => setHistoryOpen(true)}
          />
        )}

        {view.mode === 'tab' && view.tab === 'alarms' && (
          <AlarmsScreen
            alarms={alarms}
            use24Hour={settings.use24HourFormat}
            t={t}
            onCreateAlarm={openCreateAlarm}
            onEditAlarm={openEditAlarm}
            onToggleAlarm={handleToggleAlarm}
            onDeleteAlarm={handleDeleteAlarm}
            onTestChallenge={(alarm) =>
              setActiveChallenge({
                alarm,
                isPreviewTest: true,
                snoozeUsed: false,
              })
            }
          />
        )}

        {view.mode === 'tab' && view.tab === 'exercises' && (
          <ExerciseSelectionScreen
            isPickerMode={false}
            initialSelection={settings.defaultExercise}
            defaultExercise={settings.defaultExercise}
            t={t}
            onConfirmSelection={(exercise) => {
              handleUpdateSettings({ defaultExercise: exercise });
              showToast(
                t.exercises.defaultUpdatedToast(t.exercises.items[exercise].name),
              );
            }}
          />
        )}

        {view.mode === 'tab' && view.tab === 'settings' && (
          <SettingsScreen
            settings={settings}
            t={t}
            onUpdateSettings={handleUpdateSettings}
            onOpenExercises={() => setView({ mode: 'tab', tab: 'exercises' })}
            onOpenOnboardingGuide={() => setOnboardingOpen(true)}
            onOpenPrivacyPolicy={() => setPrivacyOpen(true)}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            onResetAllData={handleResetAllData}
          />
        )}

        {view.mode === 'alarmForm' && (
          <AddAlarmScreen
            draft={view.draft}
            use24HourFormat={settings.use24HourFormat}
            t={t}
            onUpdateDraft={(patch) =>
              setView({
                mode: 'alarmForm',
                draft: { ...view.draft, ...patch },
              })
            }
            onChangeExerciseRequest={() =>
              setView({
                mode: 'exercisePicker',
                draft: view.draft,
              })
            }
            onBack={() => setView({ mode: 'tab', tab: 'alarms' })}
            onSave={() => handleSaveDraft(view.draft)}
          />
        )}

        {view.mode === 'exercisePicker' && (
          <ExerciseSelectionScreen
            isPickerMode
            initialSelection={view.draft.exerciseType}
            defaultExercise={settings.defaultExercise}
            t={t}
            onBack={() =>
              setView({
                mode: 'alarmForm',
                draft: view.draft,
              })
            }
            onConfirmSelection={(picked) => {
              const def = getExerciseByType(picked);
              setView({
                mode: 'alarmForm',
                draft: {
                  ...view.draft,
                  exerciseType: picked,
                  targetReps: def.defaultTarget,
                },
              });
            }}
          />
        )}
      </NavigationShell>

      {activeChallenge && (
        <AlarmChallengeScreen
          alarm={activeChallenge.alarm}
          alarmVolume={settings.alarmVolume}
          alarmTone={settings.alarmTone}
          use24HourFormat={settings.use24HourFormat}
          isPreviewTest={activeChallenge.isPreviewTest}
          snoozeAlreadyUsed={activeChallenge.snoozeUsed}
          t={t}
          onSnoozeOnce={(alarm) => {
            snoozedTargetsRef.current.set(
              alarm.id,
              Date.now() + 5 * 60 * 1000,
            );
            setActiveChallenge(null);
            showToast(t.alarmChallenge.snoozeToast);
          }}
          onDismissCompleted={(session) => {
            const nextSessions = saveWorkoutSession(session);
            setSessions(nextSessions);
            if (activeChallenge.alarm.repeatDays.length === 0) {
              handleToggleAlarm(activeChallenge.alarm.id, false);
            }
            setActiveChallenge(null);
            showToast(t.history.completeTitle);
          }}
          onExitPreviewTest={() => setActiveChallenge(null)}
        />
      )}

      <HistoryModal
        open={historyOpen}
        t={t}
        sessions={sessions}
        onClose={() => setHistoryOpen(false)}
        onDeleteSession={handleDeleteSession}
        onClearHistory={handleClearHistory}
      />

      <ProConfirmDialog
        open={pendingBackup !== null}
        title={t.settings.backupConfirmTitle}
        description={
          pendingBackup
            ? t.settings.backupConfirmBody(
                pendingBackup.alarms.length,
                pendingBackup.sessions.length,
              )
            : ''
        }
        cancelLabel={t.actions.cancel}
        confirmLabel={t.settings.importBackupBtn}
        onCancel={() => setPendingBackup(null)}
        onConfirm={handleConfirmRestoreBackup}
      />

      <OnboardingGuideModal
        open={onboardingOpen}
        t={t}
        settings={settings}
        onClose={() => setOnboardingOpen(false)}
      />

      <PrivacyPolicyModal
        open={privacyOpen}
        t={t}
        onClose={() => setPrivacyOpen(false)}
      />

      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-20 lg:bottom-6 end-4 lg:end-6 z-50 rounded-xl bg-[#172038] border border-[#C8FF00]/60 px-4 py-3 text-sm font-semibold text-white shadow-xl"
        >
          {toastMessage}
        </div>
      )}
    </>
  );
}
