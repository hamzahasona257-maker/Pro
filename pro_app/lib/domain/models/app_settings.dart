import '../enums/exercise_type.dart';

class AppSettings {
  const AppSettings({
    this.languageCode = 'ar',
    this.use24HourFormat = false,
    this.defaultVibration = true,
    this.alarmVolume = 0.85,
    this.alarmTone = 'classic',
    this.defaultExercise = ExerciseType.squats,
    this.defaultTargetReps = 15,
    this.poseDelegate = 'gpu',
    this.hapticFeedback = true,
  });

  final String languageCode;
  final bool use24HourFormat;
  final bool defaultVibration;
  final double alarmVolume;
  final String alarmTone;
  final ExerciseType defaultExercise;
  final int defaultTargetReps;
  final String poseDelegate;
  final bool hapticFeedback;

  AppSettings copyWith({
    String? languageCode,
    bool? use24HourFormat,
    bool? defaultVibration,
    double? alarmVolume,
    String? alarmTone,
    ExerciseType? defaultExercise,
    int? defaultTargetReps,
    String? poseDelegate,
    bool? hapticFeedback,
  }) {
    return AppSettings(
      languageCode: languageCode ?? this.languageCode,
      use24HourFormat: use24HourFormat ?? this.use24HourFormat,
      defaultVibration: defaultVibration ?? this.defaultVibration,
      alarmVolume: alarmVolume ?? this.alarmVolume,
      alarmTone: alarmTone ?? this.alarmTone,
      defaultExercise: defaultExercise ?? this.defaultExercise,
      defaultTargetReps: defaultTargetReps ?? this.defaultTargetReps,
      poseDelegate: poseDelegate ?? this.poseDelegate,
      hapticFeedback: hapticFeedback ?? this.hapticFeedback,
    );
  }
}
