import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:pro_app/data/repositories/alarm_repository.dart';
import 'package:pro_app/data/repositories/workout_repository.dart';
import 'package:pro_app/data/services/backup_service.dart';
import 'package:pro_app/domain/enums/exercise_type.dart';
import 'package:pro_app/domain/enums/weekday.dart';
import 'package:pro_app/domain/models/alarm_model.dart';
import 'package:pro_app/domain/models/app_settings.dart';
import 'package:pro_app/domain/models/workout_session.dart';

void main() {
  group('BackupService & Storage Validation', () {
    final now = DateTime.fromMillisecondsSinceEpoch(1794500000000);
    final sampleAlarm = AlarmModel(
      id: 'alarm-1',
      hour: 6,
      minute: 45,
      label: 'Morning Squats',
      isEnabled: true,
      repeatDays: const [Weekday.monday, Weekday.wednesday, Weekday.friday],
      exerciseType: ExerciseType.squats,
      targetReps: 20,
      vibrationEnabled: true,
      snoozeAllowed: false,
      createdAt: now,
      updatedAt: now,
    );
    final sampleSession = WorkoutSession(
      id: 'session-1',
      alarmId: 'alarm-1',
      exerciseType: ExerciseType.squats,
      targetReps: 20,
      completedReps: 20,
      durationSeconds: 42,
      completedAt: now,
    );
    const sampleSettings = AppSettings(
      languageCode: 'en',
      use24HourFormat: true,
      defaultVibration: false,
      alarmVolume: 0.9,
      alarmTone: 'radar',
      defaultExercise: ExerciseType.plankHold,
      defaultTargetReps: 45,
      poseDelegate: 'cpu',
      hapticFeedback: true,
    );

    test('serializes with backupVersion & checksum and roundtrips cleanly', () {
      final jsonText = BackupService.serializeBackup(
        alarms: [sampleAlarm],
        sessions: [sampleSession],
        settings: sampleSettings,
        exportedAtMs: now.millisecondsSinceEpoch,
      );

      final parsed = BackupService.parseAndValidate(jsonText);
      expect(parsed.backupVersion, BackupService.currentBackupVersion);
      expect(parsed.alarms.length, 1);
      expect(parsed.alarms.first.id, 'alarm-1');
      expect(parsed.alarms.first.targetReps, 20);
      expect(parsed.sessions.length, 1);
      expect(parsed.sessions.first.durationSeconds, 42);
      expect(parsed.settings.languageCode, 'en');
      expect(parsed.settings.alarmTone, 'radar');
      expect(parsed.settings.use24HourFormat, isTrue);
    });

    test('rejects tampered backup checksum without accepting data', () {
      final jsonText = BackupService.serializeBackup(
        alarms: [sampleAlarm],
        sessions: [sampleSession],
        settings: sampleSettings,
      );
      final map = jsonDecode(jsonText) as Map<String, dynamic>;
      final data = map['data'] as Map<String, dynamic>;
      final alarms = data['alarms'] as List<dynamic>;
      (alarms.first as Map<String, dynamic>)['target_reps'] = 99;

      expect(
        () => BackupService.parseAndValidate(jsonEncode(map)),
        throwsA(
          isA<BackupValidationException>().having(
            (e) => e.reason,
            'reason',
            BackupFailureReason.checksumMismatch,
          ),
        ),
      );
    });

    test('rejects corrupted JSON and unsupported backup versions', () {
      expect(
        () => BackupService.parseAndValidate('{corrupt-json'),
        throwsA(
          isA<BackupValidationException>().having(
            (e) => e.reason,
            'reason',
            BackupFailureReason.invalidJson,
          ),
        ),
      );

      final invalidVersion = jsonEncode({
        'app': 'PRO',
        'backupVersion': 99,
        'checksum': '0000000000000000',
        'data': {'alarms': [], 'workoutSessions': [], 'settings': {}},
      });
      expect(
        () => BackupService.parseAndValidate(invalidVersion),
        throwsA(
          isA<BackupValidationException>().having(
            (e) => e.reason,
            'reason',
            BackupFailureReason.unsupportedVersion,
          ),
        ),
      );
    });

    test('AlarmRepository and WorkoutRepository reject invalid bounds', () {
      expect(
        () => AlarmRepository.validateAlarm(sampleAlarm.copyWith(hour: 25)),
        throwsRangeError,
      );
      expect(
        () => WorkoutRepository.validateSession(
          WorkoutSession(
            id: 'bad',
            alarmId: null,
            exerciseType: ExerciseType.squats,
            targetReps: 10,
            completedReps: -1,
            durationSeconds: 10,
            completedAt: now,
          ),
        ),
        throwsArgumentError,
      );
    });
  });
}
