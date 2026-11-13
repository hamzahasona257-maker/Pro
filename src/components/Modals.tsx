import { useState } from 'react';
import {
  Bell,
  Camera,
  CheckCircle2,
  Clock,
  History,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { getExerciseByType } from '../data/exerciseCatalog';
import { Translations } from '../i18n/translations';
import { AppSettings, WorkoutSession } from '../types/pro';
import { ProCard, ProConfirmDialog } from './ui';

interface HistoryModalProps {
  open: boolean;
  t: Translations;
  sessions: WorkoutSession[];
  onClose: () => void;
  onDeleteSession: (id: string) => void;
  onClearHistory: () => void;
}

export function HistoryModal({
  open,
  t,
  sessions,
  onClose,
  onDeleteSession,
  onClearHistory,
}: HistoryModalProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-2xl bg-[#11182B] border border-[#233052] p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto text-start">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <History className="h-5 w-5 text-[#C8FF00]" />
            <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-white">
              {t.history.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.actions.close}
            className="min-h-[44px] min-w-[44px] rounded-xl bg-[#172038] border border-[#233052] flex items-center justify-center text-[#9AA7C2] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {sessions.length === 0 ? (
          <ProCard className="p-6 text-center space-y-3 bg-[#0A0F1E]">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-[#C8FF00]/12 border border-[#C8FF00]/30 flex items-center justify-center text-[#C8FF00]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="text-base font-bold text-white">
              {t.history.emptyTitle}
            </div>
            <p className="text-xs text-[#9AA7C2] leading-relaxed">
              {t.history.emptyDesc}
            </p>
          </ProCard>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-bold text-[#9AA7C2]">
                {t.history.sessionsLabel}: {sessions.length}
              </div>
              <button
                type="button"
                onClick={() => setConfirmClearOpen(true)}
                className="min-h-[36px] px-3 rounded-xl border border-[#FF4D6D]/45 text-xs font-bold text-[#FF4D6D] hover:bg-[#FF4D6D]/10 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t.history.clearAllButton}</span>
              </button>
            </div>
            {sessions.map((s) => {
              const def = getExerciseByType(s.exerciseType);
              const copy = t.exercises.items[s.exerciseType];
              const unit =
                def.unitKind === 'sec'
                  ? t.exercises.unitSec
                  : t.exercises.unitReps;
              return (
                <ProCard key={s.id} className="p-4 bg-[#0A0F1E]">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate">
                        {copy.name}
                      </div>
                      <div className="text-[11px] text-[#9AA7C2] tabular-nums mt-0.5">
                        {new Date(s.completedAt).toLocaleString()} · {s.durationSeconds}
                        s
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-[#C8FF00] tabular-nums">
                        {s.completedReps} / {s.targetReps} {unit}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(s.id)}
                        aria-label={t.a11y.deleteSession}
                        className="min-h-[40px] min-w-[40px] rounded-xl bg-[#172038] border border-[#233052] flex items-center justify-center text-[#9AA7C2] hover:text-[#FF4D6D] hover:border-[#FF4D6D]/50 cursor-pointer"
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
      </div>

      <ProConfirmDialog
        open={pendingDeleteId !== null}
        title={t.history.deleteTitle}
        description={t.history.deleteBody}
        cancelLabel={t.actions.cancel}
        confirmLabel={t.actions.delete}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) {
            onDeleteSession(pendingDeleteId);
          }
          setPendingDeleteId(null);
        }}
      />

      <ProConfirmDialog
        open={confirmClearOpen}
        title={t.history.clearDialogTitle}
        description={t.history.clearDialogBody}
        cancelLabel={t.actions.cancel}
        confirmLabel={t.actions.delete}
        onCancel={() => setConfirmClearOpen(false)}
        onConfirm={() => {
          onClearHistory();
          setConfirmClearOpen(false);
        }}
      />
    </div>
  );
}

interface OnboardingGuideModalProps {
  open: boolean;
  t: Translations;
  settings: AppSettings;
  onClose: () => void;
}

export function OnboardingGuideModal({
  open,
  t,
  settings,
  onClose,
}: OnboardingGuideModalProps) {
  if (!open) return null;

  const defaultEx = getExerciseByType(settings.defaultExercise);
  const defaultExCopy = t.exercises.items[settings.defaultExercise];
  const unit =
    defaultEx.unitKind === 'sec' ? t.exercises.unitSec : t.exercises.unitReps;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-xl rounded-2xl bg-[#11182B] border border-[#233052] p-6 shadow-2xl space-y-5 max-h-[88vh] overflow-y-auto text-start">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-[#C8FF00]" />
            <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-white">
              {t.onboardingTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.actions.close}
            className="min-h-[44px] min-w-[44px] rounded-xl bg-[#172038] border border-[#233052] flex items-center justify-center text-[#9AA7C2] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          {t.onboardingSlides.map((slide, idx) => (
            <ProCard key={idx} className="p-4 bg-[#0A0F1E]">
              <div className="text-sm font-bold text-white">
                {idx + 1}. {slide.title}
              </div>
              <p className="mt-1 text-xs text-[#9AA7C2] leading-relaxed">
                {slide.body}
              </p>
            </ProCard>
          ))}
        </div>

        <div className="space-y-2.5 pt-2 border-t border-[#233052]">
          <div className="flex items-start gap-3 text-xs">
            <Camera className="h-4 w-4 text-[#C8FF00] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white">
                {t.permissions.cameraTitle}
              </div>
              <div className="text-[#9AA7C2]">
                {t.permissions.cameraRationale}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 text-xs">
            <Clock className="h-4 w-4 text-[#C8FF00] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white">
                {t.permissions.exactAlarmTitle}
              </div>
              <div className="text-[#9AA7C2]">
                {t.permissions.exactAlarmRationale}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 text-xs">
            <Bell className="h-4 w-4 text-[#C8FF00] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white">
                {t.permissions.notifTitle}
              </div>
              <div className="text-[#9AA7C2]">
                {t.permissions.notifRationale}
              </div>
            </div>
          </div>
        </div>

        <ProCard className="p-4 bg-[#172038]">
          <div className="text-xs font-bold text-[#C8FF00]">
            {t.permissions.notifPreviewTitle}
          </div>
          <div className="mt-1 text-xs text-white">
            {t.permissions.notifPreviewBody(
              settings.defaultTargetReps,
              unit,
              defaultExCopy.name,
            )}
          </div>
        </ProCard>
      </div>
    </div>
  );
}

interface PrivacyPolicyModalProps {
  open: boolean;
  t: Translations;
  onClose: () => void;
}

export function PrivacyPolicyModal({
  open,
  t,
  onClose,
}: PrivacyPolicyModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-xl rounded-2xl bg-[#11182B] border border-[#233052] p-6 shadow-2xl space-y-5 max-h-[88vh] overflow-y-auto text-start">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-[#C8FF00]" />
            <div>
              <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-white">
                {t.privacy.title}
              </h3>
              <div className="text-[11px] text-[#9AA7C2]">
                {t.privacy.updated}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.actions.close}
            className="min-h-[44px] min-w-[44px] rounded-xl bg-[#172038] border border-[#233052] flex items-center justify-center text-[#9AA7C2] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          {t.privacy.sections.map((section, idx) => (
            <ProCard key={idx} className="p-4 bg-[#0A0F1E]">
              <div className="text-sm font-bold text-white">
                {section.heading}
              </div>
              <p className="mt-1 text-xs text-[#9AA7C2] leading-relaxed">
                {section.body}
              </p>
            </ProCard>
          ))}
        </div>
      </div>
    </div>
  );
}

