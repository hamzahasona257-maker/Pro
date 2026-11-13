import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

import '../../domain/services/pose_exercise_evaluator.dart';
import '../constants/app_strings.dart';

class NativePlatformStatus {
  const NativePlatformStatus({
    required this.platformName,
    required this.osVersion,
    required this.alarmBridgeReady,
    required this.poseBridgeReady,
    required this.poseModelBundled,
  });

  final String platformName;
  final String osVersion;
  final bool alarmBridgeReady;
  final bool poseBridgeReady;
  final bool poseModelBundled;

  factory NativePlatformStatus.unavailable(String reason) {
    return NativePlatformStatus(
      platformName: reason,
      osVersion: '',
      alarmBridgeReady: false,
      poseBridgeReady: false,
      poseModelBundled: false,
    );
  }

  factory NativePlatformStatus.fromMap(Map<Object?, Object?> map) {
    return NativePlatformStatus(
      platformName: (map['platformName'] as String?) ?? 'Unknown',
      osVersion: (map['osVersion'] as String?) ?? '',
      alarmBridgeReady: (map['alarmBridgeReady'] as bool?) ?? false,
      poseBridgeReady: (map['poseBridgeReady'] as bool?) ?? false,
      poseModelBundled: (map['poseModelBundled'] as bool?) ?? false,
    );
  }
}

class NativeBridgeChannel {
  NativeBridgeChannel._();

  static const MethodChannel _channel = MethodChannel(
    AppStrings.nativeChannelName,
  );
  static const EventChannel _poseChannel = EventChannel(
    '${AppStrings.nativeChannelName}/pose_landmarks',
  );

  static Future<NativePlatformStatus> getPlatformStatus() async {
    try {
      final result = await _channel.invokeMapMethod<Object?, Object?>(
        'getPlatformStatus',
      );
      if (result == null) {
        return NativePlatformStatus.unavailable('empty');
      }
      return NativePlatformStatus.fromMap(result);
    } on MissingPluginException {
      return NativePlatformStatus.unavailable(
        kIsWeb ? 'web' : 'unattached',
      );
    } on PlatformException catch (e) {
      return NativePlatformStatus.unavailable(e.code);
    }
  }

  static Future<bool> syncAlarmContract({
    required String alarmId,
    required int hour,
    required int minute,
    required bool enabled,
    required String repeatDaysCsv,
    required String notificationTitle,
    required String notificationBody,
    required String localeCode,
    required double volume,
    required bool vibrate,
  }) async {
    try {
      final synced = await _channel.invokeMethod<bool>('syncAlarmContract', {
        'alarmId': alarmId,
        'hour': hour,
        'minute': minute,
        'enabled': enabled,
        'repeatDaysCsv': repeatDaysCsv,
        'notificationTitle': notificationTitle,
        'notificationBody': notificationBody,
        'localeCode': localeCode,
        'volume': volume,
        'vibrate': vibrate,
      });
      return synced ?? false;
    } on MissingPluginException {
      return false;
    } on PlatformException {
      return false;
    }
  }

  static Future<bool> cancelAlarmContract(String alarmId) async {
    try {
      final cancelled = await _channel.invokeMethod<bool>(
        'cancelAlarmContract',
        {'alarmId': alarmId},
      );
      return cancelled ?? false;
    } on MissingPluginException {
      return false;
    } on PlatformException {
      return false;
    }
  }

  static Future<bool> stopActiveAlarmPlayback(String alarmId) async {
    try {
      final stopped = await _channel.invokeMethod<bool>(
        'stopAlarmPlayback',
        {'alarmId': alarmId},
      );
      return stopped ?? false;
    } on MissingPluginException {
      return false;
    } on PlatformException {
      return false;
    }
  }

  static Future<bool> startPoseSession({required String delegate}) async {
    try {
      final started = await _channel.invokeMethod<bool>(
        'startPoseSession',
        {'delegate': delegate},
      );
      return started ?? false;
    } on MissingPluginException {
      return false;
    } on PlatformException {
      return false;
    }
  }

  static Future<void> stopPoseSession() async {
    try {
      await _channel.invokeMethod<void>('stopPoseSession');
    } on MissingPluginException {
      // No-op on unsupported host
    } on PlatformException {
      // Ignore cleanup errors
    }
  }

  static Future<bool> exportBackupDocument({
    required String fileName,
    required String content,
  }) async {
    try {
      final saved = await _channel.invokeMethod<bool>('exportBackupDocument', {
        'fileName': fileName,
        'content': content,
      });
      return saved ?? false;
    } on MissingPluginException {
      return false;
    } on PlatformException {
      return false;
    }
  }

  static Future<String?> importBackupDocument() async {
    try {
      return await _channel.invokeMethod<String>('importBackupDocument');
    } on MissingPluginException {
      return null;
    } on PlatformException {
      return null;
    }
  }

  static Stream<List<PoseLandmarkPoint>> poseLandmarkStream() {
    return _poseChannel.receiveBroadcastStream().map((event) {
      if (event is! List) return const <PoseLandmarkPoint>[];
      return event
          .whereType<Map<Object?, Object?>>()
          .map(PoseLandmarkPoint.fromMap)
          .toList(growable: false);
    });
  }
}
