import { ExerciseDefinition, ExerciseType } from '../types/pro';

export const EXERCISE_CATALOG: ExerciseDefinition[] = [
  {
    type: 'squats',
    unitKind: 'reps',
    defaultTarget: 15,
    minTarget: 5,
    maxTarget: 50,
    step: 5,
    difficulty: 'moderate',
  },
  {
    type: 'push_ups',
    unitKind: 'reps',
    defaultTarget: 10,
    minTarget: 5,
    maxTarget: 40,
    step: 5,
    difficulty: 'hard',
  },
  {
    type: 'jumping_jacks',
    unitKind: 'reps',
    defaultTarget: 20,
    minTarget: 10,
    maxTarget: 60,
    step: 5,
    difficulty: 'light',
  },
  {
    type: 'lunges',
    unitKind: 'reps',
    defaultTarget: 12,
    minTarget: 6,
    maxTarget: 40,
    step: 2,
    difficulty: 'moderate',
  },
  {
    type: 'plank_hold',
    unitKind: 'sec',
    defaultTarget: 30,
    minTarget: 15,
    maxTarget: 90,
    step: 5,
    difficulty: 'moderate',
  },
];

export function getExerciseByType(type: ExerciseType): ExerciseDefinition {
  return (
    EXERCISE_CATALOG.find((item) => item.type === type) ?? EXERCISE_CATALOG[0]
  );
}
