enum ExerciseType {
  squats('squats'),
  pushUps('push_ups'),
  jumpingJacks('jumping_jacks'),
  lunges('lunges'),
  plankHold('plank_hold');

  const ExerciseType(this.storageKey);

  final String storageKey;

  static ExerciseType fromStorageKey(String? key) {
    return ExerciseType.values.firstWhere(
      (value) => value.storageKey == key,
      orElse: () => ExerciseType.squats,
    );
  }
}
