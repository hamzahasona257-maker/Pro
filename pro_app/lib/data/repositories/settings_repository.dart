import 'package:shared_preferences/shared_preferences.dart';

import '../../domain/enums/exercise_type.dart';
import '../../domain/models/app_settings.dart';

class SettingsRepository {
  SettingsRepository(this._prefs);

  final SharedPreferences _prefs;

  static const String _keyLanguageCode = 'settings_language_code';
  static const String _keyUse24Hour = 'settings_use_24h';
  static const String _keyDefaultVibration = 'settings_default_vibration';
  static const String _keyAlarmVolume = 'settings_alarm_volume';
  static const String _keyAlarmTone = 'settings_alarm_tone';
  static const String _keyDefaultExercise = 'settings_default_exercise';
  static const String _keyDefaultTargetReps = 'settings_default_target_reps';
  static const String _keyPoseDelegate = 'settings_pose_delegate';
  static const String _keyHapticFeedback = 'settings_haptic_feedback';

  static const Set<String> validTones = {'classic', 'chime', 'radar'};

  AppSettings load() {
    final storedLang = _prefs.getString(_keyLanguageCode);
    final languageCode = (storedLang == 'en' || storedLang == 'ar')
        ? storedLang!
        : 'ar';
    final storedTone = _prefs.getString(_keyAlarmTone);
    final alarmTone = (storedTone != null && validTones.contains(storedTone))
        ? storedTone
        : 'classic';

    return AppSettings(
      languageCode: languageCode,
      use24HourFormat: _prefs.getBool(_keyUse24Hour) ?? false,
      defaultVibration: _prefs.getBool(_keyDefaultVibration) ?? true,
      alarmVolume: (_prefs.getDouble(_keyAlarmVolume) ?? 0.85).clamp(0.1, 1.0),
      alarmTone: alarmTone,
      defaultExercise: ExerciseType.fromStorageKey(
        _prefs.getString(_keyDefaultExercise),
      ),
      defaultTargetReps: (_prefs.getInt(_keyDefaultTargetReps) ?? 15).clamp(5, 180),
      poseDelegate: _prefs.getString(_keyPoseDelegate) ?? 'gpu',
      hapticFeedback: _prefs.getBool(_keyHapticFeedback) ?? true,
    );
  }

  Future<void> save(AppSettings settings) async {
    await _prefs.setString(_keyLanguageCode, settings.languageCode);
    await _prefs.setBool(_keyUse24Hour, settings.use24HourFormat);
    await _prefs.setBool(_keyDefaultVibration, settings.defaultVibration);
    await _prefs.setDouble(_keyAlarmVolume, settings.alarmVolume.clamp(0.1, 1.0));
    await _prefs.setString(
      _keyAlarmTone,
      validTones.contains(settings.alarmTone) ? settings.alarmTone : 'classic',
    );
    await _prefs.setString(
      _keyDefaultExercise,
      settings.defaultExercise.storageKey,
    );
    await _prefs.setInt(_keyDefaultTargetReps, settings.defaultTargetReps);
    await _prefs.setString(_keyPoseDelegate, settings.poseDelegate);
    await _prefs.setBool(_keyHapticFeedback, settings.hapticFeedback);
  }

  Future<void> reset() async {
    await Future.wait([
      _prefs.remove(_keyLanguageCode),
      _prefs.remove(_keyUse24Hour),
      _prefs.remove(_keyDefaultVibration),
      _prefs.remove(_keyAlarmVolume),
      _prefs.remove(_keyAlarmTone),
      _prefs.remove(_keyDefaultExercise),
      _prefs.remove(_keyDefaultTargetReps),
      _prefs.remove(_keyPoseDelegate),
      _prefs.remove(_keyHapticFeedback),
    ]);
  }
}
