import { useRef, useState } from 'react';
import {
  ChevronRight,
  Download,
  FileText,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react';
import { Translations } from '../i18n/translations';
import { AlarmTone, AppSettings } from '../types/pro';
import {
  ProCard,
  ProConfirmDialog,
  ProSecondaryButton,
  ProSectionHeader,
  ProToggle,
} from '../components/ui';

interface SettingsScreenProps {
  settings: AppSettings;
  t: Translations;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onOpenExercises: () => void;
  onOpenOnboardingGuide: () => void;
  onOpenPrivacyPolicy: () => void;
  onExportBackup: () => void;
  onImportBackup: (rawJson: string) => void;
  onResetAllData: () => void;
}

export function SettingsScreen({
  settings,
  t,
  onUpdateSettings,
  onOpenExercises,
  onOpenOnboardingGuide,
  onOpenPrivacyPolicy,
  onExportBackup,
  onImportBackup,
  onResetAllData,
}: SettingsScreenProps) {
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const defaultExerciseCopy = t.exercises.items[settings.defaultExercise];

  return (
    <div className="max-w-4xl space-y-8">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          {t.settings.title}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#9AA7C2]">
          {t.settings.subtitle}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
          {/* Language Selector */}
          <section className="space-y-3">
            <ProSectionHeader title={t.settings.languageSection} />
            <ProCard className="p-5 space-y-4">
              <div>
                <div className="text-sm font-semibold text-white">
                  {t.settings.languageLabel}
                </div>
                <p className="text-xs text-[#9AA7C2] mt-0.5">
                  {t.settings.languageSub}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#0A0F1E] border border-[#233052]">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ language: 'ar' })}
                  className={`min-h-[44px] rounded-lg text-sm font-bold transition-colors cursor-pointer ${
                    settings.language === 'ar'
                      ? 'bg-[#C8FF00] text-[#0A0F1E]'
                      : 'text-[#9AA7C2] hover:text-white'
                  }`}
                >
                  {t.settings.languageArabic}
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ language: 'en' })}
                  className={`min-h-[44px] rounded-lg text-sm font-bold transition-colors cursor-pointer ${
                    settings.language === 'en'
                      ? 'bg-[#C8FF00] text-[#0A0F1E]'
                      : 'text-[#9AA7C2] hover:text-white'
                  }`}
                >
                  {t.settings.languageEnglish}
                </button>
              </div>
            </ProCard>
          </section>

          {/* Clock & Interface */}
          <section className="space-y-3">
            <ProSectionHeader title={t.settings.clockSection} />
            <ProCard className="px-5 divide-y divide-[#233052]">
              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white">
                    {t.settings.use24HourTitle}
                  </div>
                  <div className="text-xs text-[#9AA7C2]">
                    {t.settings.use24HourSub}
                  </div>
                </div>
                <ProToggle
                  checked={settings.use24HourFormat}
                  onChange={(val) => onUpdateSettings({ use24HourFormat: val })}
                  label={t.a11y.toggle24Hour}
                />
              </div>
              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white">
                    {t.settings.hapticsTitle}
                  </div>
                  <div className="text-xs text-[#9AA7C2]">
                    {t.settings.hapticsSub}
                  </div>
                </div>
                <ProToggle
                  checked={settings.hapticFeedback}
                  onChange={(val) => onUpdateSettings({ hapticFeedback: val })}
                  label={t.a11y.toggleHaptics}
                />
              </div>
            </ProCard>
          </section>

          {/* Alarm & Exercise Defaults */}
          <section className="space-y-3">
            <ProSectionHeader title={t.settings.defaultsSection} />
            <ProCard className="px-5 divide-y divide-[#233052]">
              <button
                type="button"
                onClick={onOpenExercises}
                className="w-full py-4 flex items-center justify-between gap-4 text-start cursor-pointer"
              >
                <div>
                  <div className="text-sm font-semibold text-white">
                    {t.settings.defaultExercise}
                  </div>
                  <div className="text-xs font-semibold text-[#C8FF00] mt-0.5">
                    {defaultExerciseCopy.name}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#9AA7C2] rtl:rotate-180" />
              </button>

              <div className="py-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">
                    {t.settings.defaultTargetReps}
                  </span>
                  <span className="text-sm font-extrabold text-[#C8FF00] tabular-nums">
                    {settings.defaultTargetReps}
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={50}
                  step={5}
                  value={settings.defaultTargetReps}
                  onChange={(e) =>
                    onUpdateSettings({
                      defaultTargetReps: Number(e.target.value),
                    })
                  }
                  className="w-full accent-[#C8FF00] cursor-pointer"
                />
              </div>

              <div className="py-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">
                    {t.settings.alarmVolume}
                  </span>
                  <span className="text-sm font-extrabold text-[#C8FF00] tabular-nums">
                    {Math.round(settings.alarmVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={1}
                  step={0.1}
                  value={settings.alarmVolume}
                  onChange={(e) =>
                    onUpdateSettings({ alarmVolume: Number(e.target.value) })
                  }
                  className="w-full accent-[#C8FF00] cursor-pointer"
                />
              </div>

              <div className="py-4 space-y-2.5">
                <div className="text-sm font-semibold text-white">
                  {t.settings.alarmToneLabel}
                </div>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#0A0F1E] border border-[#233052]">
                  {(
                    [
                      ['classic', t.settings.alarmToneClassic],
                      ['chime', t.settings.alarmToneChime],
                      ['radar', t.settings.alarmToneRadar],
                    ] as [AlarmTone, string][]
                  ).map(([toneKey, label]) => (
                    <button
                      key={toneKey}
                      type="button"
                      onClick={() => onUpdateSettings({ alarmTone: toneKey })}
                      className={`min-h-[44px] rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        settings.alarmTone === toneKey
                          ? 'bg-[#C8FF00] text-[#0A0F1E]'
                          : 'text-[#9AA7C2] hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="py-4 flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-white">
                  {t.settings.vibrateDefault}
                </div>
                <ProToggle
                  checked={settings.defaultVibration}
                  onChange={(val) =>
                    onUpdateSettings({ defaultVibration: val })
                  }
                  label={t.a11y.toggleDefaultVibration}
                />
              </div>
            </ProCard>
          </section>
        </div>

        <div className="space-y-6">
          {/* AI & Native Bridges */}
          <section className="space-y-3">
            <ProSectionHeader title={t.settings.aiSection} />
            <ProCard className="p-5 space-y-4">
              <div>
                <div className="text-sm font-semibold text-white">
                  {t.settings.poseDelegate}
                </div>
                <p className="text-xs text-[#9AA7C2] mt-0.5">
                  {t.settings.poseDelegateSub}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#0A0F1E] border border-[#233052]">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ poseDelegate: 'gpu' })}
                  className={`min-h-[44px] rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    settings.poseDelegate === 'gpu'
                      ? 'bg-[#C8FF00] text-[#0A0F1E]'
                      : 'text-[#9AA7C2] hover:text-white'
                  }`}
                >
                  {t.settings.delegateGpu}
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ poseDelegate: 'cpu' })}
                  className={`min-h-[44px] rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    settings.poseDelegate === 'cpu'
                      ? 'bg-[#C8FF00] text-[#0A0F1E]'
                      : 'text-[#9AA7C2] hover:text-white'
                  }`}
                >
                  {t.settings.delegateCpu}
                </button>
              </div>

              <div className="pt-3 border-t border-[#233052] space-y-2 text-xs">
                <div className="flex justify-between gap-4">
                  <span className="text-[#9AA7C2]">
                    {t.settings.flutterProjectLabel}
                  </span>
                  <span className="font-semibold text-white text-end">
                    {t.settings.flutterProjectValue}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#9AA7C2]">
                    {t.settings.nativeChannelsLabel}
                  </span>
                  <span className="font-semibold text-white text-end">
                    {t.settings.nativeChannelsValue}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#9AA7C2]">
                    {t.settings.visionLabel}
                  </span>
                  <span className="font-semibold text-[#9AA7C2] text-end">
                    {t.settings.visionValue}
                  </span>
                </div>
              </div>
            </ProCard>
          </section>

          {/* Guide & Permissions */}
          <section className="space-y-3">
            <ProSectionHeader title={t.settings.permissionsSection} />
            <div className="space-y-2.5">
              <ProSecondaryButton
                label={t.settings.replayGuideBtn}
                icon={<ShieldCheck className="h-4 w-4 text-[#C8FF00]" />}
                onClick={onOpenOnboardingGuide}
              />
              <ProSecondaryButton
                label={t.settings.privacyBtn}
                icon={<FileText className="h-4 w-4 text-[#C8FF00]" />}
                onClick={onOpenPrivacyPolicy}
              />
            </div>
          </section>

          {/* Local Backup (JSON) */}
          <section className="space-y-3">
            <ProSectionHeader title={t.settings.backupSection} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <ProSecondaryButton
                label={t.settings.exportBackupBtn}
                icon={<Download className="h-4 w-4 text-[#C8FF00]" />}
                onClick={onExportBackup}
              />
              <ProSecondaryButton
                label={t.settings.importBackupBtn}
                icon={<Upload className="h-4 w-4 text-[#C8FF00]" />}
                onClick={() => fileInputRef.current?.click()}
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === 'string') {
                    onImportBackup(reader.result);
                  }
                };
                reader.readAsText(file);
                e.target.value = '';
              }}
            />
          </section>

          {/* Local Storage */}
          <section className="space-y-3">
            <ProSectionHeader title={t.settings.storageSection} />
            <ProSecondaryButton
              label={t.settings.resetButton}
              icon={<Trash2 className="h-4 w-4" />}
              destructive
              onClick={() => setConfirmResetOpen(true)}
            />
          </section>
        </div>
      </div>

      <ProConfirmDialog
        open={confirmResetOpen}
        title={t.settings.resetDialogTitle}
        description={t.settings.resetDialogBody}
        cancelLabel={t.actions.cancel}
        confirmLabel={t.actions.confirmReset}
        onCancel={() => setConfirmResetOpen(false)}
        onConfirm={() => {
          onResetAllData();
          setConfirmResetOpen(false);
        }}
      />
    </div>
  );
}
