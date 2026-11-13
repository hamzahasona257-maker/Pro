export type AppLanguage = 'ar' | 'en';

export type ExerciseType =
  | 'squats'
  | 'push_ups'
  | 'jumping_jacks'
  | 'lunges'
  | 'plank_hold';

export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface ExerciseDefinition {
  type: ExerciseType;
  unitKind: 'reps' | 'sec';
  defaultTarget: number;
  minTarget: number;
  maxTarget: number;
  step: number;
  difficulty: 'light' | 'moderate' | 'hard';
}

export interface AlarmModel {
  id: string;
  hour: number;
  minute: number;
  label: string;
  isEnabled: boolean;
  repeatDays: Weekday[];
  exerciseType: ExerciseType;
  targetReps: number;
  vibrationEnabled: boolean;
  snoozeAllowed: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface WorkoutSession {
  id: string;
  alarmId: string | null;
  exerciseType: ExerciseType;
  targetReps: number;
  completedReps: number;
  durationSeconds: number;
  completedAt: number;
}

export interface DashboardStats {
  totalSessions: number;
  totalReps: number;
  currentStreakDays: number;
  lastSession: WorkoutSession | null;
}

export type AlarmTone = 'classic' | 'chime' | 'radar';

export interface AppSettings {
  language: AppLanguage;
  use24HourFormat: boolean;
  defaultVibration: boolean;
  alarmVolume: number;
  alarmTone: AlarmTone;
  defaultExercise: ExerciseType;
  defaultTargetReps: number;
  poseDelegate: 'gpu' | 'cpu';
  hapticFeedback: boolean;
}

export type AppTab = 'dashboard' | 'alarms' | 'exercises' | 'settings';
