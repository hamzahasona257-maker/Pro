import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  Lock,
  Volume2,
} from 'lucide-react';
import { getExerciseByType } from '../data/exerciseCatalog';
import { ExercisePoseEvaluator } from '../engine/poseEvaluator';
import { Translations } from '../i18n/translations';
import { AlarmModel, AlarmTone, WorkoutSession } from '../types/pro';
import { formatPeriod, formatTime } from '../utils/time';
import { ProCard, ProPrimaryButton, ProSecondaryButton } from '../components/ui';

interface AlarmChallengeScreenProps {
  alarm: AlarmModel;
  alarmVolume: number;
  alarmTone?: AlarmTone;
  use24HourFormat: boolean;
  isPreviewTest: boolean;
  snoozeAlreadyUsed: boolean;
  t: Translations;
  onSnoozeOnce: (alarm: AlarmModel) => void;
  onDismissCompleted: (session: WorkoutSession) => void;
  onExitPreviewTest?: () => void;
}

export function AlarmChallengeScreen({
  alarm,
  alarmVolume,
  alarmTone = 'classic',
  use24HourFormat,
  isPreviewTest,
  snoozeAlreadyUsed,
  t,
  onSnoozeOnce,
  onDismissCompleted,
  onExitPreviewTest,
}: AlarmChallengeScreenProps) {
  const exercise = getExerciseByType(alarm.exerciseType);
  const exerciseCopy = t.exercises.items[alarm.exerciseType];
  const unit =
    exercise.unitKind === 'sec' ? t.exercises.unitSec : t.exercises.unitReps;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioIntervalRef = useRef<number | null>(null);
  const evaluatorRef = useRef<ExercisePoseEvaluator>(
    new ExercisePoseEvaluator(alarm.exerciseType, alarm.targetReps),
  );
  const startedAtRef = useRef<number>(Date.now());

  const [audioRunning, setAudioRunning] = useState(false);
  const [cameraState, setCameraState] = useState<
    'starting' | 'active' | 'denied'
  >('starting');
  const [evalCount] = useState(0);
  const completed = evalCount >= alarm.targetReps;

  // Block Escape key dismissal while challenge is active
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !completed && !isPreviewTest) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [completed, isPreviewTest]);

  // Start Web Audio alarm oscillator tone respecting alarmVolume
  const startAlarmTone = async () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      if (ctx.state !== 'running') return;

      const playPulse = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') {
          return;
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        if (alarmTone === 'chime') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, ctx.currentTime);
          osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.18);
        } else if (alarmTone === 'radar') {
          osc.type = 'square';
          osc.frequency.setValueAtTime(1174.66, ctx.currentTime);
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.18);
        } else {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.18);
        }
        gain.gain.setValueAtTime(
          Math.min(Math.max(alarmVolume, 0.1), 1) * 0.35,
          ctx.currentTime,
        );
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.46);
      };

      if (audioIntervalRef.current !== null) {
        window.clearInterval(audioIntervalRef.current);
      }
      playPulse();
      audioIntervalRef.current = window.setInterval(playPulse, 1100);
      setAudioRunning(true);
    } catch {
      setAudioRunning(false);
    }
  };

  useEffect(() => {
    void startAlarmTone();
    return () => {
      if (audioIntervalRef.current !== null) {
        window.clearInterval(audioIntervalRef.current);
      }
      if (audioCtxRef.current) {
        void audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Attach real browser camera stream via MediaDevices API (zero synthetic video/AI)
  useEffect(() => {
    let cancelled = false;
    async function initCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (!cancelled) setCameraState('denied');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraState('active');
      } catch {
        if (!cancelled) setCameraState('denied');
      }
    }
    void initCamera();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const stopMediaAndAudio = () => {
    if (audioIntervalRef.current !== null) {
      window.clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      void audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleFinishSession = () => {
    if (!completed) return;
    stopMediaAndAudio();
    const durationSec = Math.max(
      1,
      Math.round((Date.now() - startedAtRef.current) / 1000),
    );
    onDismissCompleted({
      id: crypto.randomUUID(),
      alarmId: alarm.id,
      exerciseType: alarm.exerciseType,
      targetReps: evaluatorRef.current.targetCount,
      completedReps: evalCount,
      durationSeconds: durationSec,
      completedAt: Date.now(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0A0F1E] text-white overflow-y-auto p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#233052] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#C8FF00]">
              <Lock className="h-3.5 w-3.5" />
              <span>{t.alarmChallenge.ringingTitle}</span>
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-extrabold tracking-tight">
              {alarm.label} · {formatTime(alarm.hour, alarm.minute, use24HourFormat)}
              {!use24HourFormat && ` ${formatPeriod(alarm.hour, t)}`}
            </h1>
            <p className="text-xs text-[#9AA7C2]">{t.alarmChallenge.lockedHint}</p>
          </div>

          <div className="flex items-center gap-2">
            {audioRunning ? (
              <div className="flex items-center gap-1.5 rounded-xl bg-[#172038] border border-[#C8FF00]/40 px-3 py-2 text-xs font-bold text-[#C8FF00]">
                <Volume2 className="h-4 w-4" />
                <span>{t.alarmChallenge.audioActive}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => void startAlarmTone()}
                className="min-h-[44px] rounded-xl bg-[#172038] border border-[#C8FF00]/60 px-4 text-xs font-bold text-[#C8FF00] cursor-pointer"
              >
                {t.alarmChallenge.enableAudioBtn}
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
          {/* Live Local Camera Feed */}
          <ProCard className="p-4 flex flex-col justify-between gap-3 bg-[#11182B]">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-white">
                <Camera className="h-4 w-4 text-[#C8FF00]" />
                {exerciseCopy.name}
              </span>
              <span className="text-[#9AA7C2]">
                {cameraState === 'active'
                  ? t.alarmChallenge.cameraLiveBadge
                  : cameraState === 'starting'
                    ? t.alarmChallenge.cameraStarting
                    : t.errors.cameraUnavailable}
              </span>
            </div>

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#0A0F1E] border border-[#233052] flex items-center justify-center">
              {cameraState === 'denied' ? (
                <div className="p-5 text-center space-y-2">
                  <AlertTriangle className="h-8 w-8 text-[#FFB020] mx-auto" />
                  <p className="text-xs text-[#9AA7C2] leading-relaxed">
                    {t.alarmChallenge.cameraPermissionDenied}
                  </p>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover scale-x-[-1]"
                />
              )}
            </div>

            <div className="text-xs text-[#9AA7C2]">{exerciseCopy.landmarks}</div>
          </ProCard>

          {/* Exercise Verification Progress */}
          <ProCard highlighted={completed} className="p-6 flex flex-col justify-between gap-5">
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#C8FF00]">
                {t.exercises.metricLabel}
              </div>
              <div className="text-sm font-semibold text-white">
                {exerciseCopy.metric}
              </div>
            </div>

            <div className="py-4 text-center space-y-2 border-y border-[#233052]">
              <div className="font-[family-name:var(--font-display)] text-6xl font-extrabold text-white tabular-nums">
                {evalCount}
                <span className="text-2xl text-[#63708E]">
                  {' '}
                  / {alarm.targetReps}
                </span>
              </div>
              <div className="text-sm font-bold text-[#C8FF00]">{unit}</div>
            </div>

            <p className="text-xs text-[#9AA7C2] leading-relaxed">
              {t.alarmChallenge.nativeAiNote}
            </p>
          </ProCard>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {completed && (
            <ProPrimaryButton
              label={t.alarmChallenge.finishBtn}
              icon={<CheckCircle2 className="h-4 w-4" />}
              onClick={handleFinishSession}
            />
          )}

          {alarm.snoozeAllowed && !snoozeAlreadyUsed && !completed && (
            <ProSecondaryButton
              label={t.alarmChallenge.snoozeBtn}
              icon={<Clock className="h-4 w-4 text-[#FFB020]" />}
              onClick={() => {
                stopMediaAndAudio();
                onSnoozeOnce(alarm);
              }}
            />
          )}

          {alarm.snoozeAllowed && snoozeAlreadyUsed && !completed && (
            <div className="text-xs text-[#9AA7C2] flex items-center gap-1.5 px-2">
              <Clock className="h-4 w-4 text-[#63708E]" />
              <span>{t.alarmChallenge.snoozeUsedBadge}</span>
            </div>
          )}

          {isPreviewTest && onExitPreviewTest && (
            <ProSecondaryButton
              label={t.actions.close}
              onClick={() => {
                stopMediaAndAudio();
                onExitPreviewTest();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
