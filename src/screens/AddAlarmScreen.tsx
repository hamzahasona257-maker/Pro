import { ArrowLeft, Check, ChevronRight, Clock, Dumbbell, Tag } from 'lucide-react';
import { getExerciseByType } from '../data/exerciseCatalog';
import { Translations } from '../i18n/translations';
import { ExerciseType, Weekday } from '../types/pro';
import {
  formatPeriod,
  formatRepeatSummary,
  formatTime,
  WEEKDAY_IDS,
} from '../utils/time';
import {
  ProCard,
  ProPrimaryButton,
  ProSectionHeader,
  ProToggle,
} from '../components/ui';

export interface AlarmDraft {
  id?: string;
  hour: number;
  minute: number;
  label: string;
  repeatDays: Weekday[];
  exerciseType: ExerciseType;
  targetReps: number;
  vibrationEnabled: boolean;
  snoozeAllowed: boolean;
  isEnabled: boolean;
}

interface AddAlarmScreenProps {
  draft: AlarmDraft;
  use24HourFormat: boolean;
  t: Translations;
  onUpdateDraft: (patch: Partial<AlarmDraft>) => void;
  onChangeExerciseRequest: () => void;
  onBack: () => void;
  onSave: () => void;
}

export function AddAlarmScreen({
  draft,
  use24HourFormat,
  t,
  onUpdateDraft,
  onChangeExerciseRequest,
  onBack,
  onSave,
}: AddAlarmScreenProps) {
  const exercise = getExerciseByType(draft.exerciseType);
  const exerciseCopy = t.exercises.items[draft.exerciseType];
  const unit =
    exercise.unitKind === 'sec' ? t.exercises.unitSec : t.exercises.unitReps;
  const timeInputValue = `${String(draft.hour).padStart(2, '0')}:${String(draft.minute).padStart(2, '0')}`;
  const labelTooLong = draft.label.trim().length > 48;
  const targetOutOfRange =
    draft.targetReps < exercise.minTarget ||
    draft.targetReps > exercise.maxTarget;

  const toggleDay = (day: Weekday) => {
    const nextDays = draft.repeatDays.includes(day)
      ? draft.repeatDays.filter((d) => d !== day)
      : [...draft.repeatDays, day];
    onUpdateDraft({ repeatDays: nextDays });
  };

  const handleWeekdaysAction = () => {
    if (draft.repeatDays.length === 0) {
      onUpdateDraft({ repeatDays: [1, 2, 3, 4, 5] });
    } else {
      onUpdateDraft({ repeatDays: [] });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label={t.a11y.back}
          className="min-h-[44px] min-w-[44px] rounded-xl bg-[#11182B] border border-[#233052] flex items-center justify-center text-white hover:border-[#C8FF00]/60 cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
        </button>
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight text-white">
            {draft.id ? t.alarmForm.editTitle : t.alarmForm.newTitle}
          </h1>
          <p className="text-xs text-[#9AA7C2]">{t.alarmForm.subtitle}</p>
        </div>
      </header>

      {/* Time Picker Card */}
      <ProCard highlighted className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-[#C8FF00]">
              {t.alarmForm.alarmTime}
            </div>
            <div className="mt-2 flex items-baseline gap-2.5">
              <span className="font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-tight text-white tabular-nums">
                {formatTime(draft.hour, draft.minute, use24HourFormat)}
              </span>
              {!use24HourFormat && (
                <span className="font-[family-name:var(--font-display)] text-xl font-bold text-[#C8FF00]">
                  {formatPeriod(draft.hour, t)}
                </span>
              )}
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-xl bg-[#0A0F1E] border border-[#233052] px-4 py-3 cursor-pointer">
            <Clock className="h-4 w-4 text-[#C8FF00]" />
            <span className="text-xs font-semibold text-[#9AA7C2]">
              {t.alarmForm.adjust}
            </span>
            <input
              type="time"
              value={timeInputValue}
              onChange={(e) => {
                const [hStr, mStr] = e.target.value.split(':');
                const h = Number(hStr);
                const m = Number(mStr);
                if (!Number.isNaN(h) && !Number.isNaN(m)) {
                  onUpdateDraft({ hour: h, minute: m });
                }
              }}
              className="bg-transparent text-white font-[family-name:var(--font-mono)] text-sm font-bold focus:outline-none [color-scheme:dark]"
            />
          </label>
        </div>
      </ProCard>

      {/* Label */}
      <section className="space-y-2.5">
        <ProSectionHeader title={t.alarmForm.labelTitle} />
        <div className="relative">
          <Tag className="h-4 w-4 text-[#9AA7C2] absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            maxLength={56}
            value={draft.label}
            onChange={(e) => onUpdateDraft({ label: e.target.value })}
            placeholder={t.alarmForm.labelPlaceholder}
            aria-invalid={labelTooLong}
            className={`w-full min-h-[48px] rounded-2xl bg-[#172038] border ps-11 pe-4 text-sm text-white placeholder:text-[#63708E] focus:outline-none ${
              labelTooLong
                ? 'border-[#FF4D6D]'
                : 'border-[#233052] focus:border-[#C8FF00]'
            }`}
          />
        </div>
        {labelTooLong && (
          <p className="text-xs text-[#FF4D6D] font-semibold">
            {t.alarmForm.labelMaxLengthError}
          </p>
        )}
      </section>

      {/* Repeat Schedule */}
      <section className="space-y-2.5">
        <ProSectionHeader
          title={t.alarmForm.repeatTitle}
          actionLabel={
            draft.repeatDays.length === 0
              ? t.alarmForm.actionWeekdays
              : t.alarmForm.actionClear
          }
          onAction={handleWeekdaysAction}
        />
        <ProCard className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-1.5 sm:gap-3">
            {WEEKDAY_IDS.map((dayId) => {
              const selected = draft.repeatDays.includes(dayId);
              return (
                <button
                  key={dayId}
                  type="button"
                  onClick={() => toggleDay(dayId)}
                  aria-pressed={selected}
                  aria-label={t.time.daysShort[dayId]}
                  className={`h-11 w-11 rounded-full text-xs font-extrabold transition-colors cursor-pointer ${
                    selected
                      ? 'bg-[#C8FF00] text-[#0A0F1E]'
                      : 'bg-[#172038] border border-[#233052] text-[#9AA7C2] hover:text-white'
                  }`}
                >
                  {t.time.daysLetter[dayId]}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-[#9AA7C2]">
            {formatRepeatSummary(draft.repeatDays, t)}
          </p>
        </ProCard>
      </section>

      {/* Dismissal Exercise */}
      <section className="space-y-3">
        <ProSectionHeader title={t.alarmForm.exerciseTitle} />
        <ProCard onClick={onChangeExerciseRequest} className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="h-11 w-11 rounded-xl bg-[#C8FF00]/12 border border-[#C8FF00]/30 flex items-center justify-center text-[#C8FF00] shrink-0">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-base font-bold text-white truncate">
                  {exerciseCopy.name}
                </div>
                <div className="text-xs text-[#9AA7C2] truncate">
                  {exerciseCopy.subtitle}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#C8FF00] shrink-0">
              <span>{t.alarmForm.changeExercise}</span>
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </div>
          </div>
        </ProCard>

        <ProCard className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">
              {t.alarmForm.requiredTarget}
            </span>
            <span className="font-[family-name:var(--font-display)] text-lg font-extrabold text-[#C8FF00] tabular-nums">
              {draft.targetReps} {unit}
            </span>
          </div>
          <input
            type="range"
            min={exercise.minTarget}
            max={exercise.maxTarget}
            step={exercise.step}
            value={draft.targetReps}
            onChange={(e) =>
              onUpdateDraft({ targetReps: Number(e.target.value) })
            }
            className="w-full accent-[#C8FF00] cursor-pointer"
          />
          <div className="flex justify-between text-xs text-[#63708E] tabular-nums">
            <span>
              {exercise.minTarget} {unit}
            </span>
            <span>
              {exercise.maxTarget} {unit}
            </span>
          </div>
        </ProCard>
      </section>

      {/* Alarm Behavior */}
      <section className="space-y-2.5">
        <ProSectionHeader title={t.alarmForm.behaviorTitle} />
        <ProCard className="px-5 divide-y divide-[#233052]">
          <div className="py-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-white">
                {t.alarmForm.vibrationTitle}
              </div>
              <div className="text-xs text-[#9AA7C2]">
                {t.alarmForm.vibrationSub}
              </div>
            </div>
            <ProToggle
              checked={draft.vibrationEnabled}
              onChange={(val) => onUpdateDraft({ vibrationEnabled: val })}
              label={t.a11y.toggleVibration}
            />
          </div>
          <div className="py-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-white">
                {t.alarmForm.snoozeTitle}
              </div>
              <div className="text-xs text-[#9AA7C2]">
                {t.alarmForm.snoozeSub}
              </div>
            </div>
            <ProToggle
              checked={draft.snoozeAllowed}
              onChange={(val) => onUpdateDraft({ snoozeAllowed: val })}
              label={t.a11y.toggleSnooze}
            />
          </div>
        </ProCard>
      </section>

      <div className="pt-2">
        <ProPrimaryButton
          label={draft.id ? t.alarmForm.updateButton : t.alarmForm.saveButton}
          icon={<Check className="h-4 w-4 stroke-[2.5]" />}
          disabled={labelTooLong || targetOutOfRange}
          onClick={() => {
            if (!labelTooLong && !targetOutOfRange) {
              onSave();
            }
          }}
        />
      </div>
    </div>
  );
}
