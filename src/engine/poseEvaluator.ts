import { ExerciseType } from '../types/pro';

export interface PoseLandmarkPoint {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export type PoseFeedbackCode =
  | 'ready'
  | 'body_out_of_frame'
  | 'good_alignment'
  | 'go_lower'
  | 'extend_fully'
  | 'raise_arms_wider'
  | 'keep_torso_straight'
  | 'completed';

export interface ExerciseEvaluationState {
  completedCount: number;
  targetCount: number;
  bodyVisible: boolean;
  feedback: PoseFeedbackCode;
  isCompleted: boolean;
  primaryAngleDeg?: number;
}

export class ExercisePoseEvaluator {
  readonly exerciseType: ExerciseType;
  readonly targetCount: number;
  readonly minVisibility: number;

  private completedReps = 0;
  private plankAccumulatedSec = 0;
  private lastPlankTimestampMs: number | null = null;
  private inBottomPhase = false;
  private leftLungeActive = false;
  private rightLungeActive = false;
  private smoothedAngle: number | null = null;

  private static readonly EMA_ALPHA = 0.35;

  constructor(
    exerciseType: ExerciseType,
    targetCount: number,
    minVisibility = 0.55,
  ) {
    this.exerciseType = exerciseType;
    this.targetCount = Math.max(1, targetCount);
    this.minVisibility = minVisibility;
  }

  evaluate(
    landmarks: PoseLandmarkPoint[],
    timestampMs: number,
  ): ExerciseEvaluationState {
    if (landmarks.length < 33) {
      this.lastPlankTimestampMs = null;
      return this.buildState(false, 'body_out_of_frame');
    }

    switch (this.exerciseType) {
      case 'squats':
        return this.evaluateSquat(landmarks);
      case 'push_ups':
        return this.evaluatePushUp(landmarks);
      case 'jumping_jacks':
        return this.evaluateJumpingJack(landmarks);
      case 'lunges':
        return this.evaluateLunge(landmarks);
      case 'plank_hold':
        return this.evaluatePlank(landmarks, timestampMs);
    }
  }

  private evaluateSquat(lm: PoseLandmarkPoint[]): ExerciseEvaluationState {
    if (!this.areVisible(lm, [23, 24, 25, 26, 27, 28])) {
      return this.buildState(false, 'body_out_of_frame');
    }

    const leftKnee = ExercisePoseEvaluator.calculateAngle(lm[23], lm[25], lm[27]);
    const rightKnee = ExercisePoseEvaluator.calculateAngle(lm[24], lm[26], lm[28]);
    const kneeAngle = this.smooth((leftKnee + rightKnee) / 2);

    let feedback: PoseFeedbackCode = 'good_alignment';
    if (kneeAngle < 95) {
      this.inBottomPhase = true;
      feedback = 'extend_fully';
    } else if (this.inBottomPhase && kneeAngle > 160) {
      this.inBottomPhase = false;
      if (this.completedReps < this.targetCount) {
        this.completedReps += 1;
      }
      feedback = 'good_alignment';
    } else if (!this.inBottomPhase && kneeAngle < 145) {
      feedback = 'go_lower';
    }

    return this.buildState(true, feedback, kneeAngle);
  }

  private evaluatePushUp(lm: PoseLandmarkPoint[]): ExerciseEvaluationState {
    if (!this.areVisible(lm, [11, 12, 13, 14, 15, 16, 23, 24, 27, 28])) {
      return this.buildState(false, 'body_out_of_frame');
    }

    const leftTorso = ExercisePoseEvaluator.calculateAngle(lm[11], lm[23], lm[27]);
    const rightTorso = ExercisePoseEvaluator.calculateAngle(lm[12], lm[24], lm[28]);
    const torsoAngle = (leftTorso + rightTorso) / 2;

    if (torsoAngle < 145) {
      return this.buildState(true, 'keep_torso_straight', torsoAngle);
    }

    const leftElbow = ExercisePoseEvaluator.calculateAngle(lm[11], lm[13], lm[15]);
    const rightElbow = ExercisePoseEvaluator.calculateAngle(lm[12], lm[14], lm[16]);
    const elbowAngle = this.smooth((leftElbow + rightElbow) / 2);

    let feedback: PoseFeedbackCode = 'good_alignment';
    if (elbowAngle < 90) {
      this.inBottomPhase = true;
      feedback = 'extend_fully';
    } else if (this.inBottomPhase && elbowAngle > 158) {
      this.inBottomPhase = false;
      if (this.completedReps < this.targetCount) {
        this.completedReps += 1;
      }
      feedback = 'good_alignment';
    } else if (!this.inBottomPhase && elbowAngle < 135) {
      feedback = 'go_lower';
    }

    return this.buildState(true, feedback, elbowAngle);
  }

  private evaluateJumpingJack(lm: PoseLandmarkPoint[]): ExerciseEvaluationState {
    if (!this.areVisible(lm, [0, 11, 12, 15, 16, 23, 24, 27, 28])) {
      return this.buildState(false, 'body_out_of_frame');
    }

    const hipWidth = Math.min(Math.max(Math.abs(lm[23].x - lm[24].x), 0.05), 1.0);
    const ankleSpread = Math.abs(lm[27].x - lm[28].x);
    const wristsAboveNose = lm[15].y < lm[0].y && lm[16].y < lm[0].y;
    const wristsBelowShoulders = lm[15].y > lm[11].y && lm[16].y > lm[12].y;
    const feetWide = ankleSpread > hipWidth * 1.45;
    const feetClosed = ankleSpread < hipWidth * 1.15;

    let feedback: PoseFeedbackCode = 'good_alignment';
    if (wristsAboveNose && feetWide) {
      this.inBottomPhase = true;
      feedback = 'good_alignment';
    } else if (this.inBottomPhase && wristsBelowShoulders && feetClosed) {
      this.inBottomPhase = false;
      if (this.completedReps < this.targetCount) {
        this.completedReps += 1;
      }
    } else if (!this.inBottomPhase) {
      feedback = 'raise_arms_wider';
    }

    return this.buildState(true, feedback);
  }

  private evaluateLunge(lm: PoseLandmarkPoint[]): ExerciseEvaluationState {
    if (!this.areVisible(lm, [23, 24, 25, 26, 27, 28])) {
      return this.buildState(false, 'body_out_of_frame');
    }

    const leftKnee = ExercisePoseEvaluator.calculateAngle(lm[23], lm[25], lm[27]);
    const rightKnee = ExercisePoseEvaluator.calculateAngle(lm[24], lm[26], lm[28]);
    const minKnee = this.smooth(Math.min(leftKnee, rightKnee));

    let feedback: PoseFeedbackCode = 'good_alignment';
    if (leftKnee < 100 && rightKnee < 115) {
      this.leftLungeActive = true;
      feedback = 'extend_fully';
    } else if (rightKnee < 100 && leftKnee < 115) {
      this.rightLungeActive = true;
      feedback = 'extend_fully';
    } else if (
      (this.leftLungeActive || this.rightLungeActive) &&
      leftKnee > 160 &&
      rightKnee > 160
    ) {
      this.leftLungeActive = false;
      this.rightLungeActive = false;
      if (this.completedReps < this.targetCount) {
        this.completedReps += 1;
      }
    } else if (minKnee < 140) {
      feedback = 'go_lower';
    }

    return this.buildState(true, feedback, minKnee);
  }

  private evaluatePlank(
    lm: PoseLandmarkPoint[],
    timestampMs: number,
  ): ExerciseEvaluationState {
    if (!this.areVisible(lm, [11, 12, 23, 24, 27, 28])) {
      this.lastPlankTimestampMs = null;
      return this.buildState(false, 'body_out_of_frame');
    }

    const leftLine = ExercisePoseEvaluator.calculateAngle(lm[11], lm[23], lm[27]);
    const rightLine = ExercisePoseEvaluator.calculateAngle(lm[12], lm[24], lm[28]);
    const bodyAngle = this.smooth((leftLine + rightLine) / 2);
    const midShoulderY = (lm[11].y + lm[12].y) / 2;
    const midAnkleY = (lm[27].y + lm[28].y) / 2;
    const isHorizontal = Math.abs(midShoulderY - midAnkleY) < 0.28;
    const validHold = bodyAngle >= 160 && bodyAngle <= 200 && isHorizontal;

    if (validHold) {
      if (this.lastPlankTimestampMs !== null && timestampMs > this.lastPlankTimestampMs) {
        const dtSec = Math.min(
          Math.max((timestampMs - this.lastPlankTimestampMs) / 1000, 0),
          0.5,
        );
        this.plankAccumulatedSec += dtSec;
      }
      this.lastPlankTimestampMs = timestampMs;
      return this.buildState(true, 'good_alignment', bodyAngle);
    } else {
      this.lastPlankTimestampMs = null;
      return this.buildState(true, 'keep_torso_straight', bodyAngle);
    }
  }

  private areVisible(lm: PoseLandmarkPoint[], indices: number[]): boolean {
    for (const idx of indices) {
      const pt = lm[idx];
      if (
        !pt ||
        pt.visibility < this.minVisibility ||
        pt.x < 0 ||
        pt.x > 1 ||
        pt.y < 0 ||
        pt.y > 1
      ) {
        return false;
      }
    }
    return true;
  }

  private smooth(raw: number): number {
    if (this.smoothedAngle === null) {
      this.smoothedAngle = raw;
      return raw;
    }
    this.smoothedAngle =
      ExercisePoseEvaluator.EMA_ALPHA * raw +
      (1 - ExercisePoseEvaluator.EMA_ALPHA) * this.smoothedAngle;
    return this.smoothedAngle;
  }

  private buildState(
    bodyVisible: boolean,
    feedback: PoseFeedbackCode,
    primaryAngleDeg?: number,
  ): ExerciseEvaluationState {
    const rawCount =
      this.exerciseType === 'plank_hold'
        ? Math.floor(this.plankAccumulatedSec)
        : this.completedReps;
    const completedCount = Math.min(Math.max(rawCount, 0), this.targetCount);
    const isCompleted = completedCount >= this.targetCount;
    return {
      completedCount,
      targetCount: this.targetCount,
      bodyVisible,
      feedback: isCompleted ? 'completed' : feedback,
      isCompleted,
      primaryAngleDeg,
    };
  }

  static calculateAngle(
    a: PoseLandmarkPoint,
    b: PoseLandmarkPoint,
    c: PoseLandmarkPoint,
  ): number {
    const abX = a.x - b.x;
    const abY = a.y - b.y;
    const cbX = c.x - b.x;
    const cbY = c.y - b.y;

    const dot = abX * cbX + abY * cbY;
    const magAb = Math.hypot(abX, abY);
    const magCb = Math.hypot(cbX, cbY);
    if (magAb < 1e-6 || magCb < 1e-6) return 180;

    const cosine = Math.min(Math.max(dot / (magAb * magCb), -1), 1);
    return Math.acos(cosine) * (180 / Math.PI);
  }
}
