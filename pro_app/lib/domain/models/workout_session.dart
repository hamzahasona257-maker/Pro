import '../enums/exercise_type.dart';

class WorkoutSession {
  const WorkoutSession({
    required this.id,
    required this.alarmId,
    required this.exerciseType,
    required this.targetReps,
    required this.completedReps,
    required this.durationSeconds,
    required this.completedAt,
  });

  final String id;
  final String? alarmId;
  final ExerciseType exerciseType;
  final int targetReps;
  final int completedReps;
  final int durationSeconds;
  final DateTime completedAt;

  Map<String, Object?> toMap() {
    return {
      'id': id,
      'alarm_id': alarmId,
      'exercise_type': exerciseType.storageKey,
      'target_reps': targetReps,
      'completed_reps': completedReps,
      'duration_seconds': durationSeconds,
      'completed_at': completedAt.millisecondsSinceEpoch,
    };
  }

  factory WorkoutSession.fromMap(Map<String, Object?> map) {
    return WorkoutSession(
      id: map['id']! as String,
      alarmId: map['alarm_id'] as String?,
      exerciseType: ExerciseType.fromStorageKey(
        map['exercise_type'] as String?,
      ),
      targetReps: map['target_reps']! as int,
      completedReps: map['completed_reps']! as int,
      durationSeconds: map['duration_seconds']! as int,
      completedAt: DateTime.fromMillisecondsSinceEpoch(
        map['completed_at']! as int,
      ),
    );
  }
}
