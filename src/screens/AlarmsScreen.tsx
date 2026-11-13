import { useState } from 'react';
import { AlarmPlus, Play, Plus, Trash2 } from 'lucide-react';
import { getExerciseByType } from '../data/exerciseCatalog';
import { Translations } from '../i18n/translations';
import { AlarmModel } from '../types/pro';
import { formatPeriod, formatRepeatSummary, formatTime } from '../utils/time';
import {
  ProCard,
  ProConfirmDialog,
  ProEmptyState,
  ProPrimaryButton,
  ProToggle,
} from '../components/ui';

interface AlarmsScreenProps {
  alarms: AlarmModel[];
  use24Hour: boolean;
  t: Translations;
  onCreateAlarm: () => void;
  onEditAlarm: (id: string) => void;
  onToggleAlarm: (id: string, enabled: boolean) => void;
  onDeleteAlarm: (id: string) => void;
  onTestChallenge: (alarm: AlarmModel) => void;
}

export function AlarmsScreen({
  alarms,
  use24Hour,
  t,
  onCreateAlarm,
  onEditAlarm,
  onToggleAlarm,
  onDeleteAlarm,
  onTestChallenge,
}: AlarmsScreenProps) {
  const [pendingDelete, setPendingDelete] = useState<AlarmModel | null>(null);
  const activeCount = alarms.filter((a) => a.isEnabled).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {t.alarms.title}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#9AA7C2] tabular-nums">
            {t.alarms.activeSummary(activeCount, alarms.length)}
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <ProPrimaryButton
            label={t.alarms.addAlarm}
            icon={<Plus className="h-4 w-4 stroke-[2.5]" />}
            onClick={onCreateAlarm}
            className="sm:w-auto"
          />
        </div>
      </header>

      {alarms.length === 0 ? (
        <div className="pt-4">
          <ProEmptyState
            icon={<AlarmPlus className="h-7 w-7" />}
            title={t.alarms.emptyTitle}
            description={t.alarms.emptyDesc}
            actionLabel={t.alarms.createFirst}
            onAction={onCreateAlarm}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alarms.map((alarm) => {
            const exercise = getExerciseByType(alarm.exerciseType);
            const exerciseCopy = t.exercises.items[alarm.exerciseType];
            const unit =
              exercise.unitKind === 'sec'
                ? t.exercises.unitSec
                : t.exercises.unitReps;
            const repeatLabel = formatRepeatSummary(alarm.repeatDays, t);

            return (
              <ProCard
                key={alarm.id}
                highlighted={alarm.isEnabled}
                onClick={() => onEditAlarm(alarm.id)}
                className="p-5 flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span
                        className={`font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight tabular-nums ${
                          alarm.isEnabled ? 'text-white' : 'text-[#63708E]'
                        }`}
                      >
                        {formatTime(alarm.hour, alarm.minute, use24Hour)}
                      </span>
                      {!use24Hour && (
                        <span
                          className={`text-sm font-bold ${
                            alarm.isEnabled ? 'text-[#C8FF00]' : 'text-[#63708E]'
                          }`}
                        >
                          {formatPeriod(alarm.hour, t)}
                        </span>
                      )}
                    </div>
                    <div
                      className={`mt-1 text-sm font-semibold ${
                        alarm.isEnabled ? 'text-white' : 'text-[#9AA7C2]'
                      }`}
                    >
                      {alarm.label}
                    </div>
                  </div>
                  <ProToggle
                    checked={alarm.isEnabled}
                    onChange={(next) => onToggleAlarm(alarm.id, next)}
                    label={t.a11y.toggleAlarm(alarm.label)}
                  />
                </div>

                <div className="pt-3 border-t border-[#233052] flex items-center justify-between gap-3">
                  <div className="text-xs text-[#9AA7C2] leading-relaxed">
                    <span className="font-semibold text-[#C8FF00]">
                      {alarm.targetReps} {unit} {exerciseCopy.name}
                    </span>
                    <span className="mx-1.5" aria-hidden="true">
                      ·
                    </span>
                    <span>{repeatLabel}</span>
                    {alarm.vibrationEnabled && (
                      <>
                        <span className="mx-1.5" aria-hidden="true">
                          ·
                        </span>
                        <span>{t.alarms.vibrateTag}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0 -me-2">
                    <button
                      type="button"
                      aria-label={t.a11y.testChallenge(alarm.label)}
                      title={t.alarms.testChallenge}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTestChallenge(alarm);
                      }}
                      className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-[#C8FF00] hover:bg-[#C8FF00]/12 transition-colors cursor-pointer"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={t.a11y.deleteAlarm(alarm.label)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDelete(alarm);
                      }}
                      className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-[#63708E] hover:text-[#FF4D6D] hover:bg-[#FF4D6D]/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </ProCard>
            );
          })}
        </div>
      )}

      <ProConfirmDialog
        open={pendingDelete !== null}
        title={t.alarms.deleteTitle}
        description={
          pendingDelete ? t.alarms.deleteBody(pendingDelete.label) : ''
        }
        cancelLabel={t.actions.cancel}
        confirmLabel={t.actions.delete}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            onDeleteAlarm(pendingDelete.id);
            setPendingDelete(null);
          }
        }}
      />
    </div>
  );
}
