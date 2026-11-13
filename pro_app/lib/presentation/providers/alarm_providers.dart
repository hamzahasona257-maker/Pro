import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';

import '../../core/platform/native_bridge_channel.dart';
import '../../domain/enums/exercise_type.dart';
import '../../domain/enums/weekday.dart';
import '../../domain/models/alarm_model.dart';
import 'database_providers.dart';
import 'settings_providers.dart';

class AlarmsNotifier extends AsyncNotifier<List<AlarmModel>> {
  static const _uuid = Uuid();

  @override
  Future<List<AlarmModel>> build() async {
    return ref.read(alarmRepositoryProvider).getAllAlarms();
  }

  Future<void> saveAlarm({
    String? existingId,
    required int hour,
    required int minute,
    required String label,
    required String fallbackLabel,
    required List<Weekday> repeatDays,
    required ExerciseType exerciseType,
    required int targetReps,
    required bool vibrationEnabled,
    required bool snoozeAllowed,
    required String notificationTitle,
    required String notificationBody,
    required String localeCode,
    bool isEnabled = true,
  }) async {
    final repo = ref.read(alarmRepositoryProvider);
    final settings = ref.read(settingsProvider);
    final now = DateTime.now();

    AlarmModel? existing;
    if (existingId != null) {
      existing = await repo.getAlarmById(existingId);
    }

    final alarm = AlarmModel(
      id: existingId ?? _uuid.v4(),
      hour: hour,
      minute: minute,
      label: label.trim().isEmpty ? fallbackLabel : label.trim(),
      isEnabled: isEnabled,
      repeatDays: repeatDays,
      exerciseType: exerciseType,
      targetReps: targetReps,
      vibrationEnabled: vibrationEnabled,
      snoozeAllowed: snoozeAllowed,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    );

    await repo.upsertAlarm(alarm);

    final repeatCsv = alarm.repeatDays.map((d) => d.isoIndex).join(',');
    await NativeBridgeChannel.syncAlarmContract(
      alarmId: alarm.id,
      hour: alarm.hour,
      minute: alarm.minute,
      enabled: alarm.isEnabled,
      repeatDaysCsv: repeatCsv,
      notificationTitle: notificationTitle,
      notificationBody: notificationBody,
      localeCode: localeCode,
      volume: settings.alarmVolume,
      vibrate: alarm.vibrationEnabled,
    );

    ref.invalidateSelf();
    await future;
  }

  Future<void> toggleAlarm({
    required String id,
    required bool isEnabled,
    required String notificationTitle,
    required String notificationBody,
    required String localeCode,
  }) async {
    final repo = ref.read(alarmRepositoryProvider);
    final settings = ref.read(settingsProvider);
    await repo.setAlarmEnabled(id: id, isEnabled: isEnabled);

    final updated = await repo.getAlarmById(id);
    if (updated != null) {
      final repeatCsv = updated.repeatDays.map((d) => d.isoIndex).join(',');
      await NativeBridgeChannel.syncAlarmContract(
        alarmId: updated.id,
        hour: updated.hour,
        minute: updated.minute,
        enabled: updated.isEnabled,
        repeatDaysCsv: repeatCsv,
        notificationTitle: notificationTitle,
        notificationBody: notificationBody,
        localeCode: localeCode,
        volume: settings.alarmVolume,
        vibrate: updated.vibrationEnabled,
      );
    }

    ref.invalidateSelf();
    await future;
  }

  Future<void> deleteAlarm(String id) async {
    final repo = ref.read(alarmRepositoryProvider);
    await repo.deleteAlarm(id);
    await NativeBridgeChannel.cancelAlarmContract(id);
    ref.invalidateSelf();
    await future;
  }

  Future<void> refresh() async {
    ref.invalidateSelf();
    await future;
  }
}

final alarmsProvider = AsyncNotifierProvider<AlarmsNotifier, List<AlarmModel>>(
  AlarmsNotifier.new,
);

final nextScheduledAlarmProvider = Provider<AlarmModel?>((ref) {
  final alarmsAsync = ref.watch(alarmsProvider);
  final alarms = alarmsAsync.value;
  if (alarms == null || alarms.isEmpty) return null;

  final enabledAlarms = alarms.where((alarm) => alarm.isEnabled).toList();
  if (enabledAlarms.isEmpty) return null;

  final now = DateTime.now();
  enabledAlarms.sort(
    (a, b) => a.nextTriggerTime(now).compareTo(b.nextTriggerTime(now)),
  );
  return enabledAlarms.first;
});
