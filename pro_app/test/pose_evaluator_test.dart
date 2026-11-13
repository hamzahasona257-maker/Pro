import 'package:flutter_test/flutter_test.dart';
import 'package:pro_app/domain/enums/exercise_type.dart';
import 'package:pro_app/domain/services/pose_exercise_evaluator.dart';

List<PoseLandmarkPoint> _blankLandmarks({double visibility = 0.95}) {
  return List.generate(
    33,
    (_) => PoseLandmarkPoint(x: 0.5, y: 0.5, z: 0.0, visibility: visibility),
  );
}

void main() {
  group('PoseExerciseEvaluator', () {
    test('counts full squats and rejects shallow half-squats', () {
      final evaluator = PoseExerciseEvaluator(
        exerciseType: ExerciseType.squats,
        targetCount: 2,
      );

      final standing = _blankLandmarks();
      standing[23] = const PoseLandmarkPoint(x: 0.45, y: 0.50, z: 0, visibility: 0.95);
      standing[24] = const PoseLandmarkPoint(x: 0.55, y: 0.50, z: 0, visibility: 0.95);
      standing[25] = const PoseLandmarkPoint(x: 0.45, y: 0.70, z: 0, visibility: 0.95);
      standing[26] = const PoseLandmarkPoint(x: 0.55, y: 0.70, z: 0, visibility: 0.95);
      standing[27] = const PoseLandmarkPoint(x: 0.45, y: 0.90, z: 0, visibility: 0.95);
      standing[28] = const PoseLandmarkPoint(x: 0.55, y: 0.90, z: 0, visibility: 0.95);

      final shallow = List<PoseLandmarkPoint>.from(standing);
      shallow[25] = const PoseLandmarkPoint(x: 0.52, y: 0.70, z: 0, visibility: 0.95);
      shallow[26] = const PoseLandmarkPoint(x: 0.62, y: 0.70, z: 0, visibility: 0.95);

      final deep = List<PoseLandmarkPoint>.from(standing);
      deep[23] = const PoseLandmarkPoint(x: 0.30, y: 0.72, z: 0, visibility: 0.95);
      deep[24] = const PoseLandmarkPoint(x: 0.40, y: 0.72, z: 0, visibility: 0.95);
      deep[25] = const PoseLandmarkPoint(x: 0.60, y: 0.72, z: 0, visibility: 0.95);
      deep[26] = const PoseLandmarkPoint(x: 0.70, y: 0.72, z: 0, visibility: 0.95);
      deep[27] = const PoseLandmarkPoint(x: 0.45, y: 0.92, z: 0, visibility: 0.95);
      deep[28] = const PoseLandmarkPoint(x: 0.55, y: 0.92, z: 0, visibility: 0.95);

      // Shallow cycle should not increment
      for (var i = 0; i < 6; i++) {
        evaluator.evaluate(shallow, timestampMs: i * 100);
      }
      final afterShallow = evaluator.evaluate(standing, timestampMs: 700);
      expect(afterShallow.completedCount, 0);

      // Full depth -> full stand cycle should count 1
      for (var i = 0; i < 8; i++) {
        evaluator.evaluate(deep, timestampMs: 1000 + i * 100);
      }
      late ExerciseEvaluationState afterStand;
      for (var i = 0; i < 8; i++) {
        afterStand = evaluator.evaluate(standing, timestampMs: 2000 + i * 100);
      }
      expect(afterStand.completedCount, 1);
      expect(afterStand.isCompleted, isFalse);
    });

    test('rejects low-visibility / out-of-frame landmarks', () {
      final evaluator = PoseExerciseEvaluator(
        exerciseType: ExerciseType.pushUps,
        targetCount: 5,
      );
      final hidden = _blankLandmarks(visibility: 0.2);
      final state = evaluator.evaluate(hidden, timestampMs: 100);
      expect(state.bodyVisible, isFalse);
      expect(state.feedback, PoseFeedbackCode.bodyOutOfFrame);
      expect(state.completedCount, 0);
    });

    test('accumulates plank seconds only during valid horizontal alignment', () {
      final evaluator = PoseExerciseEvaluator(
        exerciseType: ExerciseType.plankHold,
        targetCount: 2,
      );

      final validPlank = _blankLandmarks();
      validPlank[11] = const PoseLandmarkPoint(x: 0.2, y: 0.6, z: 0, visibility: 0.95);
      validPlank[12] = const PoseLandmarkPoint(x: 0.2, y: 0.6, z: 0, visibility: 0.95);
      validPlank[23] = const PoseLandmarkPoint(x: 0.5, y: 0.6, z: 0, visibility: 0.95);
      validPlank[24] = const PoseLandmarkPoint(x: 0.5, y: 0.6, z: 0, visibility: 0.95);
      validPlank[27] = const PoseLandmarkPoint(x: 0.8, y: 0.6, z: 0, visibility: 0.95);
      validPlank[28] = const PoseLandmarkPoint(x: 0.8, y: 0.6, z: 0, visibility: 0.95);

      final sagging = List<PoseLandmarkPoint>.from(validPlank);
      sagging[23] = const PoseLandmarkPoint(x: 0.5, y: 0.88, z: 0, visibility: 0.95);
      sagging[24] = const PoseLandmarkPoint(x: 0.5, y: 0.88, z: 0, visibility: 0.95);

      for (var t = 0; t <= 1200; t += 200) {
        evaluator.evaluate(validPlank, timestampMs: t);
      }
      final midState = evaluator.evaluate(sagging, timestampMs: 1400);
      expect(midState.completedCount, 1);

      // Should not advance while sagging
      for (var t = 1600; t <= 3000; t += 200) {
        evaluator.evaluate(sagging, timestampMs: t);
      }
      final stillOne = evaluator.evaluate(sagging, timestampMs: 3200);
      expect(stillOne.completedCount, 1);
      expect(stillOne.isCompleted, isFalse);
    });
  });
}
