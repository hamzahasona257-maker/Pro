import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/platform/native_bridge_channel.dart';
import '../../domain/enums/exercise_type.dart';
import '../../domain/models/app_settings.dart';
import 'alarm_providers.dart';
import 'database_providers.dart';
import 'workout_providers.dart';

class SettingsNotifier extends Notifier<AppSettings> {
  @override
  AppSettings build() {
    return ref.read(settingsRepositoryProvider).load();
  }

  Future<void> setLanguageCode(String code) async {
    if (code != 'ar' && code != 'en') return;
    final updated = state.copyWith(languageCode: code);
    state = updated;
    await ref.read(settingsRepositoryProvider).save(updated);
  }

  Future<void> setUse24HourFormat(bool value) async {
    final updated = state.copyWith(use24HourFormat: value);
    state = updated;
    await ref.read(settingsRepositoryProvider).save(updated);
  }

  Future<void> setDefaultVibration(bool value) async {
    final updated = state.copyWith(defaultVibration: value);
    state = updated;
    await ref.read(settingsRepositoryProvider).save(updated);
  }

  Future<void> setAlarmVolume(double value) async {
    final updated = state.copyWith(alarmVolume: value.clamp(0.1, 1.0));
    state = updated;
    await ref.read(settingsRepositoryProvider).save(updated);
  }

  Future<void> setAlarmTone(String tone) async {
    if (tone != 'classic' && tone != 'chime' && tone != 'radar') return;
    final updated = state.copyWith(alarmTone: tone);
    state = updated;
    await ref.read(settingsRepositoryProvider).save(updated);
  }

  Future<void> setDefaultExercise(ExerciseType exercise) async {
    final updated = state.copyWith(defaultExercise: exercise);
    state = updated;
    await ref.read(settingsRepositoryProvider).save(updated);
  }

  Future<void> setDefaultTargetReps(int reps) async {
    final updated = state.copyWith(defaultTargetReps: reps);
    state = updated;
    await ref.read(settingsRepositoryProvider).save(updated);
  }

  Future<void> setPoseDelegate(String delegate) async {
    final updated = state.copyWith(poseDelegate: delegate);
    state = updated;
    await ref.read(settingsRepositoryProvider).save(updated);
  }

  Future<void> setHapticFeedback(bool value) async {
    final updated = state.copyWith(hapticFeedback: value);
    state = updated;
    await ref.read(settingsRepositoryProvider).save(updated);
  }

  Future<void> replaceAllSettings(AppSettings restored) async {
    state = restored;
    await ref.read(settingsRepositoryProvider).save(restored);
  }

  Future<void> clearAllLocalData() async {
    final previousAlarms =
        await ref.read(alarmRepositoryProvider).getAllAlarms();
    for (final alarm in previousAlarms) {
      await NativeBridgeChannel.cancelAlarmContract(alarm.id);
    }
    await ref.read(appDatabaseProvider).clearAllData();
    await ref.read(settingsRepositoryProvider).reset();
    state = const AppSettings();
    ref.invalidate(alarmsProvider);
    ref.invalidate(workoutSessionsProvider);
    ref.invalidate(dashboardStatsProvider);
  }
}

final settingsProvider = NotifierProvider<SettingsNotifier, AppSettings>(
  SettingsNotifier.new,
);
