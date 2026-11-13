import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Dumbbell, Eye } from 'lucide-react';
import { EXERCISE_CATALOG } from '../data/exerciseCatalog';
import { Translations } from '../i18n/translations';
import { ExerciseType } from '../types/pro';
import { ProCard, ProPrimaryButton } from '../components/ui';

interface ExerciseSelectionScreenProps {
  isPickerMode: boolean;
  initialSelection: ExerciseType;
  defaultExercise: ExerciseType;
  t: Translations;
  onConfirmSelection: (exercise: ExerciseType) => void;
  onBack?: () => void;
}

export function ExerciseSelectionScreen({
  isPickerMode,
  initialSelection,
  defaultExercise,
  t,
  onConfirmSelection,
  onBack,
}: ExerciseSelectionScreenProps) {
  const [selected, setSelected] = useState<ExerciseType>(initialSelection);
  const selectedCopy = t.exercises.items[selected];

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        {isPickerMode && onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label={t.a11y.back}
            className="min-h-[44px] min-w-[44px] rounded-xl bg-[#11182B] border border-[#233052] flex items-center justify-center text-white hover:border-[#C8FF00]/60 cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
          </button>
        )}
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {isPickerMode ? t.exercises.chooseChallenge : t.exercises.title}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#9AA7C2]">
            {t.exercises.subtitle}
          </p>
        </div>
      </header>

      <ProCard className="p-4 bg-[#172038]">
        <div className="flex items-start gap-3">
          <Eye className="h-5 w-5 text-[#C8FF00] shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-[#9AA7C2] leading-relaxed">
            {t.exercises.offlineNotice}
          </p>
        </div>
      </ProCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EXERCISE_CATALOG.map((item) => {
          const isSelected = item.type === selected;
          const isDefault = !isPickerMode && item.type === defaultExercise;
          const copy = t.exercises.items[item.type];
          const unit =
            item.unitKind === 'sec'
              ? t.exercises.unitSec
              : t.exercises.unitReps;

          return (
            <ProCard
              key={item.type}
              highlighted={isSelected}
              onClick={() => setSelected(item.type)}
              className="p-5 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`h-11 w-11 rounded-xl border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[#C8FF00]/14 border-[#C8FF00]/40 text-[#C8FF00]'
                          : 'bg-[#172038] border-[#233052] text-[#9AA7C2]'
                      }`}
                    >
                      <Dumbbell className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-white">
                          {copy.name}
                        </h2>
                        {isDefault && (
                          <span className="text-[11px] font-bold text-[#C8FF00]">
                            {t.exercises.defaultLabel}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#9AA7C2]">{copy.subtitle}</p>
                    </div>
                  </div>

                  <span
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'border-[#C8FF00] bg-[#C8FF00]'
                        : 'border-[#63708E]'
                    }`}
                  >
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-[#0A0F1E]" />
                    )}
                  </span>
                </div>

                <p className="mt-3.5 text-sm text-[#9AA7C2] leading-relaxed">
                  {copy.description}
                </p>

                <div className="mt-3.5 text-xs text-[#9AA7C2]">
                  <span className="font-semibold text-[#C8FF00]">
                    {t.exercises.defaultTargetLabel(item.defaultTarget, unit)}
                  </span>
                  <span className="mx-1.5" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-[#38BDF8] font-semibold">
                    {t.exercises.difficulty[item.difficulty]}
                  </span>
                  <span className="mx-1.5" aria-hidden="true">
                    ·
                  </span>
                  <span>{copy.muscles}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#233052] space-y-2 text-xs">
                <div className="text-[#9AA7C2]">
                  <span className="font-semibold text-white">
                    {t.exercises.landmarksLabel}:{' '}
                  </span>
                  <span className="font-[family-name:var(--font-mono)] text-[11px]">
                    {copy.landmarks}
                  </span>
                </div>
                <div className="text-[#63708E]">
                  <span className="font-semibold text-[#9AA7C2]">
                    {t.exercises.metricLabel}:{' '}
                  </span>
                  {copy.metric}
                </div>
                <div className="pt-1">
                  <div className="font-semibold text-white mb-1">
                    {t.exercises.instructionsTitle}:
                  </div>
                  <ol className="space-y-0.5 text-[#9AA7C2] list-decimal list-inside">
                    {copy.instructions.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </ProCard>
          );
        })}
      </div>

      <div className="pt-2 max-w-md">
        <ProPrimaryButton
          label={
            isPickerMode
              ? t.exercises.useExerciseBtn(selectedCopy.name)
              : t.exercises.setDefaultBtn
          }
          icon={<CheckCircle2 className="h-4 w-4" />}
          onClick={() => onConfirmSelection(selected)}
        />
      </div>
    </div>
  );
}
