import 'package:flutter_test/flutter_test.dart';
import 'package:pro_app/domain/enums/exercise_type.dart';
import 'package:pro_app/domain/enums/weekday.dart';
import 'package:pro_app/domain/models/alarm_model.dart';

void main() {
  group('AlarmModel scheduling & serialization', () {
    test('one-shot alarm rolls over to next day when time has passed', () {
      final now = DateTime(2026, 11, 12, 8, 30);
      final alarm = AlarmModel(
        id: 'a1',
        hour: 7,
        minute: 15,
        label: 'Morning',
        isEnabled: true,
        repeatDays: const [],
        exerciseType: ExerciseType.squats,
        targetReps: 15,
        vibrationEnabled: true,
        snoozeAllowed: false,
        createdAt: now,
        updatedAt: now,
      );

      final next = alarm.nextTriggerTime(now);
      expect(next, DateTime(2026, 11, 13, 7, 15));
    });

    test('weekday alarm advances to Monday when triggered Friday afternoon', () {
      // 2026-11-13 is Friday
      final friday = DateTime(2026, 11, 13, 18, 0);
      final alarm = AlarmModel(
        id: 'a2',
        hour: 6,
        minute: 45,
        label: 'Workdays',
        isEnabled: true,
        repeatDays: const [
          Weekday.monday,
          Weekday.tuesday,
          Weekday.wednesday,
          Weekday.thursday,
          Weekday.friday,
        ],
        exerciseType: ExerciseType.pushUps,
        targetReps: 12,
        vibrationEnabled: true,
        snoozeAllowed: true,
        createdAt: friday,
        updatedAt: friday,
      );

      final next = alarm.nextTriggerTime(friday);
      expect(next, DateTime(2026, 11, 16, 6, 45));
      expect(next.weekday, DateTime.monday);
    });

    test('toMap and fromMap roundtrip preserves all configuration fields', () {
      final now = DateTime.fromMillisecondsSinceEpoch(1794500000000);
      final original = AlarmModel(
        id: 'roundtrip-1',
        hour: 22,
        minute: 5,
        label: 'Night Check',
        isEnabled: false,
        repeatDays: const [Weekday.saturday, Weekday.sunday],
        exerciseType: ExerciseType.plankHold,
        targetReps: 45,
        vibrationEnabled: false,
        snoozeAllowed: true,
        createdAt: now,
        updatedAt: now,
      );

      final restored = AlarmModel.fromMap(original.toMap());
      expect(restored.id, original.id);
      expect(restored.hour, original.hour);
      expect(restored.minute, original.minute);
      expect(restored.label, original.label);
      expect(restored.isEnabled, original.isEnabled);
      expect(restored.repeatDays, original.repeatDays);
      expect(restored.exerciseType, original.exerciseType);
      expect(restored.targetReps, original.targetReps);
      expect(restored.vibrationEnabled, original.vibrationEnabled);
      expect(restored.snoozeAllowed, original.snoozeAllowed);
    });
  });
}
