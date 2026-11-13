import 'dart:convert';

import 'package:sqflite/sqflite.dart';

import '../../domain/enums/exercise_type.dart';
import '../../domain/enums/weekday.dart';
import '../../domain/models/alarm_model.dart';
import '../../domain/models/app_settings.dart';
import '../../domain/models/workout_session.dart';
import '../database/app_database.dart';
import '../repositories/alarm_repository.dart';
import '../repositories/settings_repository.dart';
import '../repositories/workout_repository.dart';

enum BackupFailureReason {
  invalidJson,
  unsupportedVersion,
  checksumMismatch,
  invalidRecord,
}

class BackupValidationException implements Exception {
  const BackupValidationException(this.reason, this.message);

  final BackupFailureReason reason;
  final String message;

  @override
  String toString() => 'BackupValidationException($reason): $message';
}

class ParsedBackupBundle {
  const ParsedBackupBundle({
    required this.backupVersion,
    required this.exportedAtMs,
    required this.alarms,
    required this.sessions,
    required this.settings,
  });

  final int backupVersion;
  final int exportedAtMs;
  final List<AlarmModel> alarms;
  final List<WorkoutSession> sessions;
  final AppSettings settings;
}

class BackupService {
  BackupService({
    required AppDatabase appDatabase,
    required AlarmRepository alarmRepository,
    required WorkoutRepository workoutRepository,
    required SettingsRepository settingsRepository,
  })  : _appDatabase = appDatabase,
        _alarmRepository = alarmRepository,
        _workoutRepository = workoutRepository,
        _settingsRepository = settingsRepository;

  final AppDatabase _appDatabase;
  final AlarmRepository _alarmRepository;
  final WorkoutRepository _workoutRepository;
  final SettingsRepository _settingsRepository;

  static const int currentBackupVersion = 1;
  static const String appIdentifier = 'PRO';
  static const Set<String> _validExerciseKeys = {
    'squats',
    'push_ups',
    'jumping_jacks',
    'lunges',
    'plank_hold',
  };

  Future<String> exportBackupJson() async {
    final alarms = await _alarmRepository.getAllAlarms();
    final sessions = await _workoutRepository.getAllSessions();
    final settings = _settingsRepository.load();

    return serializeBackup(
      alarms: alarms,
      sessions: sessions,
      settings: settings,
      exportedAtMs: DateTime.now().millisecondsSinceEpoch,
    );
  }

  static String serializeBackup({
    required List<AlarmModel> alarms,
    required List<WorkoutSession> sessions,
    required AppSettings settings,
    int? exportedAtMs,
  }) {
    final dataSection = <String, Object?>{
      'alarms': alarms.map((a) => a.toMap()).toList(growable: false),
      'workoutSessions': sessions.map((s) => s.toMap()).toList(growable: false),
      'settings': _settingsToMap(settings),
    };

    final canonicalData = jsonEncode(dataSection);
    final checksum = computeIntegrityDigest(canonicalData);

    final envelope = <String, Object?>{
      'app': appIdentifier,
      'backupVersion': currentBackupVersion,
      'exportedAt': exportedAtMs ?? DateTime.now().millisecondsSinceEpoch,
      'checksum': checksum,
      'data': dataSection,
    };
    return const JsonEncoder.withIndent('  ').convert(envelope);
  }

  static ParsedBackupBundle parseAndValidate(String rawJson) {
    final Object? decoded;
    try {
      decoded = jsonDecode(rawJson);
    } on FormatException catch (e) {
      throw BackupValidationException(
        BackupFailureReason.invalidJson,
        e.message,
      );
    }

    if (decoded is! Map<String, dynamic>) {
      throw const BackupValidationException(
        BackupFailureReason.invalidJson,
        'Backup root must be a JSON object.',
      );
    }

    if (decoded['app'] != appIdentifier) {
      throw const BackupValidationException(
        BackupFailureReason.unsupportedVersion,
        'Backup file does not belong to PRO.',
      );
    }

    final version = decoded['backupVersion'];
    if (version is! int || version < 1 || version > currentBackupVersion) {
      throw const BackupValidationException(
        BackupFailureReason.unsupportedVersion,
        'Unsupported backup version.',
      );
    }

    final checksum = decoded['checksum'];
    final rawData = decoded['data'];
    if (checksum is! String || rawData is! Map<String, dynamic>) {
      throw const BackupValidationException(
        BackupFailureReason.checksumMismatch,
        'Missing integrity checksum or data section.',
      );
    }

    final expectedDigest = computeIntegrityDigest(jsonEncode(rawData));
    if (checksum != expectedDigest) {
      throw const BackupValidationException(
        BackupFailureReason.checksumMismatch,
        'Backup checksum verification failed.',
      );
    }

    final rawAlarms = rawData['alarms'];
    final rawSessions = rawData['workoutSessions'];
    final rawSettings = rawData['settings'];

    if (rawAlarms is! List ||
        rawSessions is! List ||
        rawSettings is! Map<String, dynamic>) {
      throw const BackupValidationException(
        BackupFailureReason.invalidRecord,
        'Backup payload arrays or settings are malformed.',
      );
    }

    final alarms = <AlarmModel>[];
    for (final item in rawAlarms) {
      alarms.add(_parseValidatedAlarm(item));
    }

    final sessions = <WorkoutSession>[];
    for (final item in rawSessions) {
      sessions.add(_parseValidatedSession(item));
    }

    final settings = _parseValidatedSettings(rawSettings);
    final exportedAt = decoded['exportedAt'] is int
        ? decoded['exportedAt'] as int
        : DateTime.now().millisecondsSinceEpoch;

    return ParsedBackupBundle(
      backupVersion: version,
      exportedAtMs: exportedAt,
      alarms: alarms,
      sessions: sessions,
      settings: settings,
    );
  }

  /// Atomically replaces SQLite alarms + workout history and updates settings
  /// only after validation succeeds.
  Future<void> restoreValidatedBundle(ParsedBackupBundle bundle) async {
    final db = await _appDatabase.database;
    await db.transaction((txn) async {
      await txn.delete(AppDatabase.alarmsTable);
      await txn.delete(AppDatabase.workoutSessionsTable);

      for (final alarm in bundle.alarms) {
        AlarmRepository.validateAlarm(alarm);
        await txn.insert(
          AppDatabase.alarmsTable,
          alarm.toMap(),
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      }

      for (final session in bundle.sessions) {
        WorkoutRepository.validateSession(session);
        await txn.insert(
          AppDatabase.workoutSessionsTable,
          session.toMap(),
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      }
    });

    await _settingsRepository.save(bundle.settings);
  }

  static Map<String, Object?> _settingsToMap(AppSettings s) {
    return {
      'languageCode': s.languageCode,
      'use24HourFormat': s.use24HourFormat,
      'defaultVibration': s.defaultVibration,
      'alarmVolume': s.alarmVolume,
      'alarmTone': s.alarmTone,
      'defaultExercise': s.defaultExercise.storageKey,
      'defaultTargetReps': s.defaultTargetReps,
      'poseDelegate': s.poseDelegate,
      'hapticFeedback': s.hapticFeedback,
    };
  }

  static AlarmModel _parseValidatedAlarm(Object? raw) {
    if (raw is! Map<String, dynamic>) {
      throw const BackupValidationException(
        BackupFailureReason.invalidRecord,
        'Alarm entry is not an object.',
      );
    }

    final id = raw['id'];
    final hour = raw['hour'];
    final minute = raw['minute'];
    final label = raw['label'];
    final exerciseKey = raw['exercise_type'];
    final targetReps = raw['target_reps'];
    final createdAt = raw['created_at'];
    final updatedAt = raw['updated_at'];

    if (id is! String ||
        id.trim().isEmpty ||
        hour is! int ||
        hour < 0 ||
        hour > 23 ||
        minute is! int ||
        minute < 0 ||
        minute > 59 ||
        label is! String ||
        exerciseKey is! String ||
        !_validExerciseKeys.contains(exerciseKey) ||
        targetReps is! int ||
        targetReps < 1 ||
        createdAt is! int ||
        updatedAt is! int) {
      throw const BackupValidationException(
        BackupFailureReason.invalidRecord,
        'Alarm record contains invalid or out-of-range fields.',
      );
    }

    final rawDays = (raw['repeat_days'] as String?) ?? '';
    final parsedDays = <Weekday>[];
    if (rawDays.trim().isNotEmpty) {
      for (final token in rawDays.split(',')) {
        final trimmed = token.trim();
        if (trimmed.isEmpty) continue;
        final idx = int.tryParse(trimmed);
        if (idx == null || idx < 1 || idx > 7) {
          throw const BackupValidationException(
            BackupFailureReason.invalidRecord,
            'Alarm repeat_days contains invalid weekday index.',
          );
        }
        parsedDays.add(Weekday.fromIsoIndex(idx));
      }
    }

    return AlarmModel(
      id: id,
      hour: hour,
      minute: minute,
      label: label,
      isEnabled: (raw['is_enabled'] as int? ?? 1) == 1,
      repeatDays: parsedDays,
      exerciseType: ExerciseType.fromStorageKey(exerciseKey),
      targetReps: targetReps,
      vibrationEnabled: (raw['vibration_enabled'] as int? ?? 1) == 1,
      snoozeAllowed: (raw['snooze_allowed'] as int? ?? 0) == 1,
      createdAt: DateTime.fromMillisecondsSinceEpoch(createdAt),
      updatedAt: DateTime.fromMillisecondsSinceEpoch(updatedAt),
    );
  }

  static WorkoutSession _parseValidatedSession(Object? raw) {
    if (raw is! Map<String, dynamic>) {
      throw const BackupValidationException(
        BackupFailureReason.invalidRecord,
        'Workout session entry is not an object.',
      );
    }

    final id = raw['id'];
    final alarmId = raw['alarm_id'];
    final exerciseKey = raw['exercise_type'];
    final targetReps = raw['target_reps'];
    final completedReps = raw['completed_reps'];
    final durationSeconds = raw['duration_seconds'];
    final completedAt = raw['completed_at'];

    if (id is! String ||
        id.trim().isEmpty ||
        (alarmId != null && alarmId is! String) ||
        exerciseKey is! String ||
        !_validExerciseKeys.contains(exerciseKey) ||
        targetReps is! int ||
        targetReps < 1 ||
        completedReps is! int ||
        completedReps < 0 ||
        durationSeconds is! int ||
        durationSeconds < 1 ||
        completedAt is! int) {
      throw const BackupValidationException(
        BackupFailureReason.invalidRecord,
        'Workout session record contains invalid fields.',
      );
    }

    return WorkoutSession(
      id: id,
      alarmId: alarmId as String?,
      exerciseType: ExerciseType.fromStorageKey(exerciseKey),
      targetReps: targetReps,
      completedReps: completedReps,
      durationSeconds: durationSeconds,
      completedAt: DateTime.fromMillisecondsSinceEpoch(completedAt),
    );
  }

  static AppSettings _parseValidatedSettings(Map<String, dynamic> raw) {
    final lang = raw['languageCode'];
    final languageCode = (lang == 'en' || lang == 'ar') ? lang as String : 'ar';
    final tone = raw['alarmTone'];
    final alarmTone =
        (tone is String && SettingsRepository.validTones.contains(tone))
            ? tone
            : 'classic';
    final exKey = raw['defaultExercise'];
    final defaultExercise =
        (exKey is String && _validExerciseKeys.contains(exKey))
            ? ExerciseType.fromStorageKey(exKey)
            : ExerciseType.squats;
    final volume = (raw['alarmVolume'] as num?)?.toDouble() ?? 0.85;
    final defaultTargetReps = (raw['defaultTargetReps'] as int?) ?? 15;
    final delegate = raw['poseDelegate'] == 'cpu' ? 'cpu' : 'gpu';

    return AppSettings(
      languageCode: languageCode,
      use24HourFormat: raw['use24HourFormat'] as bool? ?? false,
      defaultVibration: raw['defaultVibration'] as bool? ?? true,
      alarmVolume: volume.clamp(0.1, 1.0),
      alarmTone: alarmTone,
      defaultExercise: defaultExercise,
      defaultTargetReps: defaultTargetReps.clamp(5, 180),
      poseDelegate: delegate,
      hapticFeedback: raw['hapticFeedback'] as bool? ?? true,
    );
  }

  /// Deterministic dual 32-bit FNV-1a digest (16 hex chars) safe on both VM & Web JS.
  static String computeIntegrityDigest(String input) {
    const int fnvOffset = 0x811c9dc5;
    const int fnvPrime = 0x01000193;
    var h1 = fnvOffset;
    var h2 = 0x811c9dc5 ^ 0x55aa33cc;

    final bytes = utf8.encode(input);
    for (var i = 0; i < bytes.length; i++) {
      h1 ^= bytes[i];
      h1 = (h1 * fnvPrime) & 0xFFFFFFFF;
      h2 ^= bytes[i] ^ (i & 0xFF);
      h2 = (h2 * fnvPrime) & 0xFFFFFFFF;
    }
    return h1.toRadixString(16).padLeft(8, '0') +
        h2.toRadixString(16).padLeft(8, '0');
  }
}
