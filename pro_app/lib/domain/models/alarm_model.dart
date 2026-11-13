import '../enums/exercise_type.dart';
import '../enums/weekday.dart';

class AlarmModel {
  const AlarmModel({
    required this.id,
    required this.hour,
    required this.minute,
    required this.label,
    required this.isEnabled,
    required this.repeatDays,
    required this.exerciseType,
    required this.targetReps,
    required this.vibrationEnabled,
    required this.snoozeAllowed,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final int hour;
  final int minute;
  final String label;
  final bool isEnabled;
  final List<Weekday> repeatDays;
  final ExerciseType exerciseType;
  final int targetReps;
  final bool vibrationEnabled;
  final bool snoozeAllowed;
  final DateTime createdAt;
  final DateTime updatedAt;

  AlarmModel copyWith({
    String? id,
    int? hour,
    int? minute,
    String? label,
    bool? isEnabled,
    List<Weekday>? repeatDays,
    ExerciseType? exerciseType,
    int? targetReps,
    bool? vibrationEnabled,
    bool? snoozeAllowed,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return AlarmModel(
      id: id ?? this.id,
      hour: hour ?? this.hour,
      minute: minute ?? this.minute,
      label: label ?? this.label,
      isEnabled: isEnabled ?? this.isEnabled,
      repeatDays: repeatDays ?? this.repeatDays,
      exerciseType: exerciseType ?? this.exerciseType,
      targetReps: targetReps ?? this.targetReps,
      vibrationEnabled: vibrationEnabled ?? this.vibrationEnabled,
      snoozeAllowed: snoozeAllowed ?? this.snoozeAllowed,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  DateTime nextTriggerTime(DateTime now) {
    final todayCandidate = DateTime(now.year, now.month, now.day, hour, minute);

    if (repeatDays.isEmpty) {
      if (todayCandidate.isAfter(now)) {
        return todayCandidate;
      }
      return todayCandidate.add(const Duration(days: 1));
    }

    final allowedWeekdays = repeatDays.map((d) => d.isoIndex).toSet();
    for (var offset = 0; offset < 7; offset++) {
      final candidate = todayCandidate.add(Duration(days: offset));
      if (allowedWeekdays.contains(candidate.weekday) &&
          candidate.isAfter(now)) {
        return candidate;
      }
    }
    return todayCandidate.add(const Duration(days: 7));
  }

  Map<String, Object?> toMap() {
    final sortedDays = [...repeatDays]
      ..sort((a, b) => a.isoIndex.compareTo(b.isoIndex));
    return {
      'id': id,
      'hour': hour,
      'minute': minute,
      'label': label,
      'is_enabled': isEnabled ? 1 : 0,
      'repeat_days': sortedDays.map((d) => d.isoIndex).join(','),
      'exercise_type': exerciseType.storageKey,
      'target_reps': targetReps,
      'vibration_enabled': vibrationEnabled ? 1 : 0,
      'snooze_allowed': snoozeAllowed ? 1 : 0,
      'created_at': createdAt.millisecondsSinceEpoch,
      'updated_at': updatedAt.millisecondsSinceEpoch,
    };
  }

  factory AlarmModel.fromMap(Map<String, Object?> map) {
    final rawDays = (map['repeat_days'] as String?) ?? '';
    final parsedDays = rawDays.trim().isEmpty
        ? <Weekday>[]
        : rawDays
            .split(',')
            .where((token) => token.trim().isNotEmpty)
            .map((token) => Weekday.fromIsoIndex(int.parse(token)))
            .toList();

    return AlarmModel(
      id: map['id']! as String,
      hour: map['hour']! as int,
      minute: map['minute']! as int,
      label: (map['label'] as String?) ?? '',
      isEnabled: (map['is_enabled'] as int? ?? 1) == 1,
      repeatDays: parsedDays,
      exerciseType: ExerciseType.fromStorageKey(
        map['exercise_type'] as String?,
      ),
      targetReps: (map['target_reps'] as int?) ?? 15,
      vibrationEnabled: (map['vibration_enabled'] as int? ?? 1) == 1,
      snoozeAllowed: (map['snooze_allowed'] as int? ?? 0) == 1,
      createdAt: DateTime.fromMillisecondsSinceEpoch(
        map['created_at']! as int,
      ),
      updatedAt: DateTime.fromMillisecondsSinceEpoch(
        map['updated_at']! as int,
      ),
    );
  }
}
