import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/platform/native_bridge_channel.dart';
import '../../data/database/app_database.dart';
import '../../data/repositories/alarm_repository.dart';
import '../../data/repositories/settings_repository.dart';
import '../../data/repositories/workout_repository.dart';
import '../../data/services/backup_service.dart';

final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError(
    'sharedPreferencesProvider must be overridden in main.dart',
  );
});

final appDatabaseProvider = Provider<AppDatabase>((ref) {
  return AppDatabase.instance;
});

final alarmRepositoryProvider = Provider<AlarmRepository>((ref) {
  return AlarmRepository(ref.watch(appDatabaseProvider));
});

final workoutRepositoryProvider = Provider<WorkoutRepository>((ref) {
  return WorkoutRepository(ref.watch(appDatabaseProvider));
});

final settingsRepositoryProvider = Provider<SettingsRepository>((ref) {
  return SettingsRepository(ref.watch(sharedPreferencesProvider));
});

final backupServiceProvider = Provider<BackupService>((ref) {
  return BackupService(
    appDatabase: ref.watch(appDatabaseProvider),
    alarmRepository: ref.watch(alarmRepositoryProvider),
    workoutRepository: ref.watch(workoutRepositoryProvider),
    settingsRepository: ref.watch(settingsRepositoryProvider),
  );
});

final nativePlatformStatusProvider = FutureProvider<NativePlatformStatus>((
  ref,
) async {
  return NativeBridgeChannel.getPlatformStatus();
});
