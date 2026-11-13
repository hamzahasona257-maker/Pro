import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:uuid/uuid.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/platform/native_bridge_channel.dart';
import '../../../domain/catalog/exercise_catalog.dart';
import '../../../domain/models/alarm_model.dart';
import '../../../domain/models/workout_session.dart';
import '../../../domain/services/pose_exercise_evaluator.dart';
import '../../../l10n/app_localizations.dart';
import '../../providers/database_providers.dart';
import '../../providers/settings_providers.dart';
import '../../providers/workout_providers.dart';
import '../../widgets/pro_card.dart';
import '../../widgets/pro_primary_button.dart';

class AlarmRingScreen extends ConsumerStatefulWidget {
  const AlarmRingScreen({
    super.key,
    required this.alarm,
  });

  final AlarmModel alarm;

  @override
  ConsumerState<AlarmRingScreen> createState() => _AlarmRingScreenState();
}

class _AlarmRingScreenState extends ConsumerState<AlarmRingScreen> {
  static const _uuid = Uuid();

  late final PoseExerciseEvaluator _evaluator;
  final Stopwatch _stopwatch = Stopwatch();
  StreamSubscription<List<PoseLandmarkPoint>>? _poseSub;
  ExerciseEvaluationState? _evalState;
  bool _cameraReady = false;
  bool _completedSaved = false;

  @override
  void initState() {
    super.initState();
    _evaluator = PoseExerciseEvaluator(
      exerciseType: widget.alarm.exerciseType,
      targetCount: widget.alarm.targetReps,
    );
    _stopwatch.start();
    _startPoseDetection();
  }

  Future<void> _startPoseDetection() async {
    final delegate = ref.read(settingsProvider).poseDelegate;
    final started = await NativeBridgeChannel.startPoseSession(
      delegate: delegate,
    );
    if (!mounted) return;
    setState(() => _cameraReady = started);

    if (started) {
      _poseSub = NativeBridgeChannel.poseLandmarkStream().listen((landmarks) {
        final nextState = _evaluator.evaluate(
          landmarks,
          timestampMs: DateTime.now().millisecondsSinceEpoch,
        );
        if (!mounted) return;
        setState(() => _evalState = nextState);
        if (nextState.isCompleted && !_completedSaved) {
          _completeAndDismiss(nextState.completedCount);
        }
      });
    }
  }

  Future<void> _completeAndDismiss(int completedCount) async {
    _completedSaved = true;
    _stopwatch.stop();
    await _poseSub?.cancel();
    await NativeBridgeChannel.stopPoseSession();
    await NativeBridgeChannel.stopActiveAlarmPlayback(widget.alarm.id);

    final session = WorkoutSession(
      id: _uuid.v4(),
      alarmId: widget.alarm.id,
      exerciseType: widget.alarm.exerciseType,
      targetReps: widget.alarm.targetReps,
      completedReps: completedCount,
      durationSeconds: _stopwatch.elapsed.inSeconds.clamp(1, 3600),
      completedAt: DateTime.now(),
    );
    await ref.read(workoutRepositoryProvider).insertSession(session);
    ref.invalidate(dashboardStatsProvider);
    ref.invalidate(workoutSessionsProvider);
  }

  @override
  void dispose() {
    _poseSub?.cancel();
    NativeBridgeChannel.stopPoseSession();
    super.dispose();
  }

  String _feedbackText(AppLocalizations l10n, PoseFeedbackCode? code) {
    switch (code) {
      case PoseFeedbackCode.bodyOutOfFrame:
        return l10n.cameraFormFeedbackAdjust;
      case PoseFeedbackCode.goodAlignment:
      case PoseFeedbackCode.goLower:
      case PoseFeedbackCode.extendFully:
      case PoseFeedbackCode.raiseArmsWider:
      case PoseFeedbackCode.keepTorsoStraight:
        return l10n.cameraFormFeedbackGood;
      case PoseFeedbackCode.completed:
        return l10n.workoutCompleteTitle;
      case PoseFeedbackCode.ready:
      case null:
        return l10n.cameraAlignBodyPrompt;
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final exercise = ExerciseCatalog.byType(widget.alarm.exerciseType);
    final unit = exercise.localizedUnit(l10n);
    final completed = _evalState?.completedCount ?? 0;
    final isDone = _evalState?.isCompleted ?? false;

    // Prevent back button dismissal until required exercise target is completed
    return PopScope(
      canPop: isDone,
      child: Scaffold(
        backgroundColor: AppColors.navyBackground,
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  isDone ? l10n.workoutCompleteTitle : l10n.cameraScreenTitle,
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  '${widget.alarm.label} · ${exercise.localizedName(l10n)}',
                  style: const TextStyle(
                    color: AppColors.neonLime,
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),
                Expanded(
                  child: ProCard(
                    highlighted: isDone,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          l10n.cameraRepProgress(
                            completed,
                            widget.alarm.targetReps,
                            unit,
                          ),
                          style: Theme.of(context).textTheme.displayLarge,
                        ),
                        const SizedBox(height: AppSpacing.md),
                        Text(
                          _cameraReady
                              ? _feedbackText(l10n, _evalState?.feedback)
                              : l10n.errCameraUnavailable,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),
                if (isDone)
                  ProPrimaryButton(
                    label: l10n.workoutDismissAlarmBtn,
                    icon: Icons.check_circle_rounded,
                    onPressed: () => context.pop(),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
