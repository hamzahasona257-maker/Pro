import 'dart:math' as math;

import '../enums/exercise_type.dart';

class PoseLandmarkPoint {
  const PoseLandmarkPoint({
    required this.x,
    required this.y,
    required this.z,
    required this.visibility,
  });

  final double x;
  final double y;
  final double z;
  final double visibility;

  factory PoseLandmarkPoint.fromMap(Map<Object?, Object?> map) {
    return PoseLandmarkPoint(
      x: (map['x'] as num?)?.toDouble() ?? 0.0,
      y: (map['y'] as num?)?.toDouble() ?? 0.0,
      z: (map['z'] as num?)?.toDouble() ?? 0.0,
      visibility: (map['visibility'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

enum PoseFeedbackCode {
  ready,
  bodyOutOfFrame,
  goodAlignment,
  goLower,
  extendFully,
  raiseArmsWider,
  keepTorsoStraight,
  completed,
}

class ExerciseEvaluationState {
  const ExerciseEvaluationState({
    required this.completedCount,
    required this.targetCount,
    required this.bodyVisible,
    required this.feedback,
    required this.isCompleted,
    this.primaryAngleDeg,
  });

  final int completedCount;
  final int targetCount;
  final bool bodyVisible;
  final PoseFeedbackCode feedback;
  final bool isCompleted;
  final double? primaryAngleDeg;
}

class PoseExerciseEvaluator {
  PoseExerciseEvaluator({
    required this.exerciseType,
    required this.targetCount,
    this.minVisibility = 0.55,
  });

  final ExerciseType exerciseType;
  final int targetCount;
  final double minVisibility;

  int _completedReps = 0;
  double _plankAccumulatedSec = 0.0;
  int? _lastPlankTimestampMs;
  bool _inBottomPhase = false;
  bool _leftLungeActive = false;
  bool _rightLungeActive = false;
  double? _smoothedAngle;

  static const double _emaAlpha = 0.35;

  ExerciseEvaluationState evaluate(
    List<PoseLandmarkPoint> landmarks, {
    required int timestampMs,
  }) {
    if (landmarks.length < 33) {
      _lastPlankTimestampMs = null;
      return _buildState(
        bodyVisible: false,
        feedback: PoseFeedbackCode.bodyOutOfFrame,
      );
    }

    switch (exerciseType) {
      case ExerciseType.squats:
        return _evaluateSquat(landmarks);
      case ExerciseType.pushUps:
        return _evaluatePushUp(landmarks);
      case ExerciseType.jumpingJacks:
        return _evaluateJumpingJack(landmarks);
      case ExerciseType.lunges:
        return _evaluateLunge(landmarks);
      case ExerciseType.plankHold:
        return _evaluatePlank(landmarks, timestampMs);
    }
  }

  ExerciseEvaluationState _evaluateSquat(List<PoseLandmarkPoint> lm) {
    if (!_areVisible(lm, [23, 24, 25, 26, 27, 28])) {
      return _buildState(
        bodyVisible: false,
        feedback: PoseFeedbackCode.bodyOutOfFrame,
      );
    }

    final leftKnee = calculateAngle(lm[23], lm[25], lm[27]);
    final rightKnee = calculateAngle(lm[24], lm[26], lm[28]);
    final kneeAngle = _smooth((leftKnee + rightKnee) / 2.0);

    var feedback = PoseFeedbackCode.goodAlignment;
    if (kneeAngle < 95.0) {
      _inBottomPhase = true;
      feedback = PoseFeedbackCode.extendFully;
    } else if (_inBottomPhase && kneeAngle > 160.0) {
      _inBottomPhase = false;
      if (_completedReps < targetCount) {
        _completedReps++;
      }
      feedback = PoseFeedbackCode.goodAlignment;
    } else if (!_inBottomPhase && kneeAngle < 145.0) {
      feedback = PoseFeedbackCode.goLower;
    }

    return _buildState(
      bodyVisible: true,
      feedback: feedback,
      primaryAngleDeg: kneeAngle,
    );
  }

  ExerciseEvaluationState _evaluatePushUp(List<PoseLandmarkPoint> lm) {
    if (!_areVisible(lm, [11, 12, 13, 14, 15, 16, 23, 24, 27, 28])) {
      return _buildState(
        bodyVisible: false,
        feedback: PoseFeedbackCode.bodyOutOfFrame,
      );
    }

    final leftTorso = calculateAngle(lm[11], lm[23], lm[27]);
    final rightTorso = calculateAngle(lm[12], lm[24], lm[28]);
    final torsoAngle = (leftTorso + rightTorso) / 2.0;

    if (torsoAngle < 145.0) {
      return _buildState(
        bodyVisible: true,
        feedback: PoseFeedbackCode.keepTorsoStraight,
        primaryAngleDeg: torsoAngle,
      );
    }

    final leftElbow = calculateAngle(lm[11], lm[13], lm[15]);
    final rightElbow = calculateAngle(lm[12], lm[14], lm[16]);
    final elbowAngle = _smooth((leftElbow + rightElbow) / 2.0);

    var feedback = PoseFeedbackCode.goodAlignment;
    if (elbowAngle < 90.0) {
      _inBottomPhase = true;
      feedback = PoseFeedbackCode.extendFully;
    } else if (_inBottomPhase && elbowAngle > 158.0) {
      _inBottomPhase = false;
      if (_completedReps < targetCount) {
        _completedReps++;
      }
      feedback = PoseFeedbackCode.goodAlignment;
    } else if (!_inBottomPhase && elbowAngle < 135.0) {
      feedback = PoseFeedbackCode.goLower;
    }

    return _buildState(
      bodyVisible: true,
      feedback: feedback,
      primaryAngleDeg: elbowAngle,
    );
  }

  ExerciseEvaluationState _evaluateJumpingJack(List<PoseLandmarkPoint> lm) {
    if (!_areVisible(lm, [0, 11, 12, 15, 16, 23, 24, 27, 28])) {
      return _buildState(
        bodyVisible: false,
        feedback: PoseFeedbackCode.bodyOutOfFrame,
      );
    }

    final hipWidth = (lm[23].x - lm[24].x).abs().clamp(0.05, 1.0);
    final ankleSpread = (lm[27].x - lm[28].x).abs();
    final wristsAboveNose = lm[15].y < lm[0].y && lm[16].y < lm[0].y;
    final wristsBelowShoulders = lm[15].y > lm[11].y && lm[16].y > lm[12].y;
    final feetWide = ankleSpread > hipWidth * 1.45;
    final feetClosed = ankleSpread < hipWidth * 1.15;

    var feedback = PoseFeedbackCode.goodAlignment;
    if (wristsAboveNose && feetWide) {
      _inBottomPhase = true;
      feedback = PoseFeedbackCode.goodAlignment;
    } else if (_inBottomPhase && wristsBelowShoulders && feetClosed) {
      _inBottomPhase = false;
      if (_completedReps < targetCount) {
        _completedReps++;
      }
    } else if (!_inBottomPhase) {
      feedback = PoseFeedbackCode.raiseArmsWider;
    }

    return _buildState(
      bodyVisible: true,
      feedback: feedback,
    );
  }

  ExerciseEvaluationState _evaluateLunge(List<PoseLandmarkPoint> lm) {
    if (!_areVisible(lm, [23, 24, 25, 26, 27, 28])) {
      return _buildState(
        bodyVisible: false,
        feedback: PoseFeedbackCode.bodyOutOfFrame,
      );
    }

    final leftKnee = calculateAngle(lm[23], lm[25], lm[27]);
    final rightKnee = calculateAngle(lm[24], lm[26], lm[28]);
    final minKnee = _smooth(math.min(leftKnee, rightKnee));

    var feedback = PoseFeedbackCode.goodAlignment;
    if (leftKnee < 100.0 && rightKnee < 115.0) {
      _leftLungeActive = true;
      feedback = PoseFeedbackCode.extendFully;
    } else if (rightKnee < 100.0 && leftKnee < 115.0) {
      _rightLungeActive = true;
      feedback = PoseFeedbackCode.extendFully;
    } else if ((_leftLungeActive || _rightLungeActive) &&
        leftKnee > 160.0 &&
        rightKnee > 160.0) {
      _leftLungeActive = false;
      _rightLungeActive = false;
      if (_completedReps < targetCount) {
        _completedReps++;
      }
    } else if (minKnee < 140.0) {
      feedback = PoseFeedbackCode.goLower;
    }

    return _buildState(
      bodyVisible: true,
      feedback: feedback,
      primaryAngleDeg: minKnee,
    );
  }

  ExerciseEvaluationState _evaluatePlank(
    List<PoseLandmarkPoint> lm,
    int timestampMs,
  ) {
    if (!_areVisible(lm, [11, 12, 23, 24, 27, 28])) {
      _lastPlankTimestampMs = null;
      return _buildState(
        bodyVisible: false,
        feedback: PoseFeedbackCode.bodyOutOfFrame,
      );
    }

    final leftLine = calculateAngle(lm[11], lm[23], lm[27]);
    final rightLine = calculateAngle(lm[12], lm[24], lm[28]);
    final bodyAngle = _smooth((leftLine + rightLine) / 2.0);
    final midShoulderY = (lm[11].y + lm[12].y) / 2.0;
    final midAnkleY = (lm[27].y + lm[28].y) / 2.0;
    final isHorizontal = (midShoulderY - midAnkleY).abs() < 0.28;
    final validHold = bodyAngle >= 160.0 && bodyAngle <= 200.0 && isHorizontal;

    if (validHold) {
      if (_lastPlankTimestampMs != null && timestampMs > _lastPlankTimestampMs!) {
        final dtSec = ((timestampMs - _lastPlankTimestampMs!) / 1000.0)
            .clamp(0.0, 0.5);
        _plankAccumulatedSec += dtSec;
      }
      _lastPlankTimestampMs = timestampMs;
      return _buildState(
        bodyVisible: true,
        feedback: PoseFeedbackCode.goodAlignment,
        primaryAngleDeg: bodyAngle,
      );
    } else {
      _lastPlankTimestampMs = null;
      return _buildState(
        bodyVisible: true,
        feedback: PoseFeedbackCode.keepTorsoStraight,
        primaryAngleDeg: bodyAngle,
      );
    }
  }

  bool _areVisible(List<PoseLandmarkPoint> lm, List<int> indices) {
    for (final idx in indices) {
      final pt = lm[idx];
      if (pt.visibility < minVisibility ||
          pt.x < 0.0 ||
          pt.x > 1.0 ||
          pt.y < 0.0 ||
          pt.y > 1.0) {
        return false;
      }
    }
    return true;
  }

  double _smooth(double raw) {
    if (_smoothedAngle == null) {
      _smoothedAngle = raw;
      return raw;
    }
    _smoothedAngle = _emaAlpha * raw + (1.0 - _emaAlpha) * _smoothedAngle!;
    return _smoothedAngle!;
  }

  ExerciseEvaluationState _buildState({
    required bool bodyVisible,
    required PoseFeedbackCode feedback,
    double? primaryAngleDeg,
  }) {
    final count = exerciseType == ExerciseType.plankHold
        ? _plankAccumulatedSec.floor().clamp(0, targetCount)
        : _completedReps.clamp(0, targetCount);
    final completed = count >= targetCount;

    return ExerciseEvaluationState(
      completedCount: count,
      targetCount: targetCount,
      bodyVisible: bodyVisible,
      feedback: completed ? PoseFeedbackCode.completed : feedback,
      isCompleted: completed,
      primaryAngleDeg: primaryAngleDeg,
    );
  }

  static double calculateAngle(
    PoseLandmarkPoint a,
    PoseLandmarkPoint b,
    PoseLandmarkPoint c,
  ) {
    final abX = a.x - b.x;
    final abY = a.y - b.y;
    final cbX = c.x - b.x;
    final cbY = c.y - b.y;

    final dot = (abX * cbX) + (abY * cbY);
    final magAb = math.sqrt((abX * abX) + (abY * abY));
    final magCb = math.sqrt((cbX * cbX) + (cbY * cbY));
    if (magAb < 1e-6 || magCb < 1e-6) return 180.0;

    final cosine = (dot / (magAb * magCb)).clamp(-1.0, 1.0);
    return math.acos(cosine) * (180.0 / math.pi);
  }
}
