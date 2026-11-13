import {
  AlarmClock,
  AlarmPlus,
  ArrowRight,
  CheckCircle2,
  Dumbbell,
  Flame,
  Plus,
  SlidersHorizontal,
  Zap,
} from 'lucide-react';
import { getExerciseByType } from '../data/exerciseCatalog';
import { Translations } from '../i18n/translations';
import { AlarmModel, AppLanguage, AppTab, DashboardStats } from '../types/pro';
import {
  formatCountdown,
  formatCurrentDate,
  formatPeriod,
  formatRepeatSummary,
  formatTime,
  getNextTriggerTime,
} from '../utils/time';
import { ProCard, ProPrimaryButton, ProSectionHeader, ProToggle } from '../components/ui';

interface DashboardScreenProps {
  alarms: AlarmModel[];
  stats: DashboardStats;
  use24Hour: boolean;
  language: AppLanguage;
  t: Translations;
  now: Date;
  onNavigateTab: (tab: AppTab) => void;
  onCreateAlarm: () => void;
  onEditAlarm: (id: string) => void;
  onToggleAlarm: (id: string, enabled: boolean) => void;
  onOpenHistory: () => void;
}

export function DashboardScreen({
  alarms,
  stats,
  use24Hour,
  language,
  t,
  now,
  onNavigateTab,
  onCreateAlarm,
  onEditAlarm,
  onToggleAlarm,
  onOpenHistory,
}: DashboardScreenProps) {
  const enabledAlarms = alarms.filter((a) => a.isEnabled);
  const sortedByNext = [...enabledAlarms].sort(
    (a, b) =>
      getNextTriggerTime(a, now).getTime() - getNextTriggerTime(b, now).getTime(),
  );
  const nextAlarm = sortedByNext[0] ?? null;
  const nextExercise = nextAlarm ? getExerciseByType(nextAlarm.exerciseType) : null;
  const nextExerciseCopy = nextAlarm ? t.exercises.items[nextAlarm.exerciseType] : null;
  const nextTrigger = nextAlarm ? getNextTriggerTime(nextAlarm, now) : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#9AA7C2]">
            <span className="font-[family-name:var(--font-display)] font-extrabold tracking-wide text-[#C8FF00]">
              {t.appName}
            </span>
            <span aria-hidden="true">·</span>
            <span>{t.appTagline}</span>
          </div>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {formatCurrentDate(now, language)}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab('settings')}
          aria-label={t.a11y.openSettings}
          className="lg:hidden min-h-[44px] min-w-[44px] rounded-xl bg-[#11182B] border border-[#233052] flex items-center justify-center text-[#9AA7C2] hover:text-white cursor-pointer"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </header>

      {/* Main Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-8">
          {nextAlarm && nextExercise && nextExerciseCopy && nextTrigger ? (
            <ProCard
              highlighted
              onClick={() => onEditAlarm(nextAlarm.id)}
              className="p-6 sm:p-7"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-[#C8FF00]">
                  <Zap className="h-4 w-4" />
                  <span>{t.dashboard.nextAlarm}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">
                    {formatCountdown(nextTrigger, now, t)}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-[#9AA7C2] rtl:rotate-180" />
              </div>

              <div className="mt-5 flex items-baseline gap-2.5">
                <span className="font-[family-name:var(--font-display)] text-5xl sm:text-6xl font-extrabold tracking-tight text-white tabular-nums">
                  {formatTime(nextAlarm.hour, nextAlarm.minute, use24Hour)}
                </span>
                {!use24Hour && (
                  <span className="font-[family-name:var(--font-display)] text-xl font-bold text-[#C8FF00]">
                    {formatPeriod(nextAlarm.hour, t)}
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#9AA7C2]">
                <span className="font-semibold text-white">{nextAlarm.label}</span>
                <span aria-hidden="true">·</span>
                <span>{formatRepeatSummary(nextAlarm.repeatDays, t)}</span>
              </div>

              <div className="mt-5 pt-4 border-t border-[#233052] flex items-center gap-2.5 text-sm">
                <Dumbbell className="h-4 w-4 text-[#C8FF00] shrink-0" />
                <span className="font-semibold text-white">
                  {t.dashboard.dismissChallenge(
                    nextAlarm.targetReps,
                    nextExercise.unitKind === 'sec'
                      ? t.exercises.unitSec
                      : t.exercises.unitReps,
                    nextExerciseCopy.name,
                  )}
                </span>
              </div>
            </ProCard>
          ) : (
            <ProCard className="p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[#C8FF00]/12 border border-[#C8FF00]/30 flex items-center justify-center text-[#C8FF00] shrink-0">
                  <AlarmPlus className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-white">
                    {t.dashboard.noActiveAlarm}
                  </h2>
                  <p className="mt-1 text-sm text-[#9AA7C2] leading-relaxed">
                    {t.dashboard.noActiveAlarmDesc}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <ProPrimaryButton
                  label={t.dashboard.createSmartAlarm}
                  icon={<Plus className="h-4 w-4 stroke-[2.5]" />}
                  onClick={onCreateAlarm}
                />
              </div>
            </ProCard>
          )}

          {/* Scheduled Alarms Preview */}
          <section className="space-y-3">
            <ProSectionHeader
              title={t.dashboard.scheduledAlarms}
              actionLabel={t.dashboard.viewAll}
              onAction={() => onNavigateTab('alarms')}
            />
            {alarms.length === 0 ? (
              <ProCard onClick={onCreateAlarm} className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-[#172038] border border-[#233052] flex items-center justify-center text-[#63708E] shrink-0">
                      <AlarmClock className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-[#9AA7C2]">
                      {t.dashboard.noAlarmsPreview}
                    </p>
                  </div>
                  <Plus className="h-5 w-5 text-[#C8FF00] shrink-0" />
                </div>
              </ProCard>
            ) : (
              <div className="space-y-3">
                {alarms.slice(0, 3).map((alarm) => {
                  const ex = getExerciseByType(alarm.exerciseType);
                  const exCopy = t.exercises.items[alarm.exerciseType];
                  const unit =
                    ex.unitKind === 'sec'
                      ? t.exercises.unitSec
                      : t.exercises.unitReps;
                  return (
                    <ProCard
                      key={alarm.id}
                      onClick={() => onEditAlarm(alarm.id)}
                      className="p-4 sm:p-5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-1.5">
                            <span
                              className={`font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-extrabold tabular-nums ${
                                alarm.isEnabled ? 'text-white' : 'text-[#63708E]'
                              }`}
                            >
                              {formatTime(alarm.hour, alarm.minute, use24Hour)}
                            </span>
                            {!use24Hour && (
                              <span
                                className={`text-xs font-bold ${
                                  alarm.isEnabled ? 'text-[#C8FF00]' : 'text-[#63708E]'
                                }`}
                              >
                                {formatPeriod(alarm.hour, t)}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs sm:text-sm text-[#9AA7C2] truncate">
                            {alarm.label} · {alarm.targetReps} {unit} {exCopy.name}
                          </p>
                        </div>
                        <ProToggle
                          checked={alarm.isEnabled}
                          onChange={(next) => onToggleAlarm(alarm.id, next)}
                          label={t.a11y.toggleAlarm(alarm.label)}
                        />
                      </div>
                    </ProCard>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-8">
          <section className="space-y-3">
            <ProSectionHeader
              title={t.dashboard.verifiedPerformance}
              actionLabel={t.dashboard.viewHistory}
              onAction={onOpenHistory}
            />
            <div className="grid grid-cols-3 gap-3">
              <ProCard onClick={onOpenHistory} className="p-4">
                <Flame className="h-4 w-4 text-[#C8FF00]" />
                <div className="mt-3 font-[family-name:var(--font-display)] text-2xl font-extrabold text-white tabular-nums">
                  {t.dashboard.statStreakValue(stats.currentStreakDays)}
                </div>
                <div className="text-xs text-[#9AA7C2]">
                  {t.dashboard.statStreak}
                </div>
              </ProCard>
              <ProCard onClick={onOpenHistory} className="p-4">
                <CheckCircle2 className="h-4 w-4 text-[#2EE59D]" />
                <div className="mt-3 font-[family-name:var(--font-display)] text-2xl font-extrabold text-white tabular-nums">
                  {stats.totalSessions}
                </div>
                <div className="text-xs text-[#9AA7C2]">
                  {t.dashboard.statWorkouts}
                </div>
              </ProCard>
              <ProCard onClick={onOpenHistory} className="p-4">
                <Dumbbell className="h-4 w-4 text-[#38BDF8]" />
                <div className="mt-3 font-[family-name:var(--font-display)] text-2xl font-extrabold text-white tabular-nums">
                  {stats.totalReps}
                </div>
                <div className="text-xs text-[#9AA7C2]">
                  {t.dashboard.statTotalReps}
                </div>
              </ProCard>
            </div>
            <p className="text-xs text-[#63708E] leading-relaxed">
              {t.dashboard.verifiedNote}
            </p>
          </section>

          <section className="space-y-3">
            <ProSectionHeader title={t.dashboard.quickActions} />
            <div className="grid grid-cols-2 gap-3">
              <ProCard onClick={onCreateAlarm} className="p-4">
                <div className="h-9 w-9 rounded-xl bg-[#C8FF00]/12 border border-[#C8FF00]/30 flex items-center justify-center text-[#C8FF00] mb-3">
                  <AlarmPlus className="h-4 w-4" />
                </div>
                <div className="text-sm font-bold text-white">
                  {t.dashboard.quickAddAlarm}
                </div>
                <div className="text-xs text-[#9AA7C2] mt-0.5">
                  {t.dashboard.quickAddAlarmSub}
                </div>
              </ProCard>

              <ProCard onClick={() => onNavigateTab('alarms')} className="p-4">
                <div className="h-9 w-9 rounded-xl bg-[#C8FF00]/12 border border-[#C8FF00]/30 flex items-center justify-center text-[#C8FF00] mb-3">
                  <AlarmClock className="h-4 w-4" />
                </div>
                <div className="text-sm font-bold text-white">
                  {t.dashboard.quickAllAlarms}
                </div>
                <div className="text-xs text-[#9AA7C2] mt-0.5">
                  {t.dashboard.quickAllAlarmsSub}
                </div>
              </ProCard>

              <ProCard onClick={() => onNavigateTab('exercises')} className="p-4">
                <div className="h-9 w-9 rounded-xl bg-[#C8FF00]/12 border border-[#C8FF00]/30 flex items-center justify-center text-[#C8FF00] mb-3">
                  <Dumbbell className="h-4 w-4" />
                </div>
                <div className="text-sm font-bold text-white">
                  {t.dashboard.quickExercises}
                </div>
                <div className="text-xs text-[#9AA7C2] mt-0.5">
                  {t.dashboard.quickExercisesSub}
                </div>
              </ProCard>

              <ProCard onClick={() => onNavigateTab('settings')} className="p-4">
                <div className="h-9 w-9 rounded-xl bg-[#C8FF00]/12 border border-[#C8FF00]/30 flex items-center justify-center text-[#C8FF00] mb-3">
                  <SlidersHorizontal className="h-4 w-4" />
                </div>
                <div className="text-sm font-bold text-white">
                  {t.dashboard.quickSettings}
                </div>
                <div className="text-xs text-[#9AA7C2] mt-0.5">
                  {t.dashboard.quickSettingsSub}
                </div>
              </ProCard>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
