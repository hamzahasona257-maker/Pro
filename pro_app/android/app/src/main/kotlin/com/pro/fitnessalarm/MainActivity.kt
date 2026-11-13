package com.pro.fitnessalarm

import android.app.Activity
import android.content.Intent
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.EventChannel
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    companion object {
        private const val CHANNEL_NAME = "com.pro.fitnessalarm/native"
        private const val POSE_STREAM_CHANNEL = "com.pro.fitnessalarm/native/pose_landmarks"
        private const val REQ_EXPORT_BACKUP = 8801
        private const val REQ_IMPORT_BACKUP = 8802
    }

    private var pendingExportResult: MethodChannel.Result? = null
    private var pendingExportContent: String? = null
    private var pendingImportResult: MethodChannel.Result? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        val alarmHandler = AlarmBridgeHandler(applicationContext)
        val poseBridge = PoseLandmarkerBridge(applicationContext)

        EventChannel(
            flutterEngine.dartExecutor.binaryMessenger,
            POSE_STREAM_CHANNEL
        ).setStreamHandler(poseBridge)

        MethodChannel(
            flutterEngine.dartExecutor.binaryMessenger,
            CHANNEL_NAME
        ).setMethodCallHandler { call, result ->
            when (call.method) {
                "getPlatformStatus" -> {
                    result.success(
                        mapOf(
                            "platformName" to "Android",
                            "osVersion" to "API ${android.os.Build.VERSION.SDK_INT}",
                            "alarmBridgeReady" to alarmHandler.isBridgeReady(),
                            "poseBridgeReady" to true,
                            "poseModelBundled" to poseBridge.isModelAssetPresent()
                        )
                    )
                }
                "syncAlarmContract" -> {
                    val alarmId = call.argument<String>("alarmId")
                    val hour = call.argument<Int>("hour")
                    val minute = call.argument<Int>("minute")
                    val enabled = call.argument<Boolean>("enabled") ?: false
                    val repeatDaysCsv = call.argument<String>("repeatDaysCsv") ?: ""
                    val notificationTitle = call.argument<String>("notificationTitle") ?: ""
                    val notificationBody = call.argument<String>("notificationBody") ?: ""
                    val localeCode = call.argument<String>("localeCode") ?: "ar"
                    val volume = call.argument<Double>("volume") ?: 0.85
                    val vibrate = call.argument<Boolean>("vibrate") ?: true
                    if (alarmId == null || hour == null || minute == null) {
                        result.error("INVALID_ARGS", "Missing alarm parameters", null)
                    } else {
                        result.success(
                            alarmHandler.syncAlarm(
                                alarmId = alarmId,
                                hour = hour,
                                minute = minute,
                                enabled = enabled,
                                repeatDaysCsv = repeatDaysCsv,
                                notificationTitle = notificationTitle,
                                notificationBody = notificationBody,
                                localeCode = localeCode,
                                volume = volume,
                                vibrate = vibrate
                            )
                        )
                    }
                }
                "cancelAlarmContract" -> {
                    val alarmId = call.argument<String>("alarmId")
                    if (alarmId == null) {
                        result.error("INVALID_ARGS", "Missing alarmId", null)
                    } else {
                        result.success(alarmHandler.cancelAlarm(alarmId))
                    }
                }
                "stopAlarmPlayback" -> {
                    result.success(alarmHandler.stopAlarmPlayback())
                }
                "startPoseSession" -> {
                    val delegate = call.argument<String>("delegate") ?: "gpu"
                    result.success(poseBridge.startSession(delegate))
                }
                "stopPoseSession" -> {
                    poseBridge.stopSession()
                    result.success(null)
                }
                "exportBackupDocument" -> {
                    val fileName = call.argument<String>("fileName") ?: "pro-backup.json"
                    val content = call.argument<String>("content") ?: ""
                    pendingExportResult?.error("CANCELLED", "Superseded", null)
                    pendingExportResult = result
                    pendingExportContent = content
                    val intent = Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
                        addCategory(Intent.CATEGORY_OPENABLE)
                        type = "application/json"
                        putExtra(Intent.EXTRA_TITLE, fileName)
                    }
                    @Suppress("DEPRECATION")
                    startActivityForResult(intent, REQ_EXPORT_BACKUP)
                }
                "importBackupDocument" -> {
                    pendingImportResult?.error("CANCELLED", "Superseded", null)
                    pendingImportResult = result
                    val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
                        addCategory(Intent.CATEGORY_OPENABLE)
                        type = "*/*"
                        putExtra(Intent.EXTRA_MIME_TYPES, arrayOf("application/json", "text/plain"))
                    }
                    @Suppress("DEPRECATION")
                    startActivityForResult(intent, REQ_IMPORT_BACKUP)
                }
                else -> result.notImplemented()
            }
        }
    }

    @Suppress("DEPRECATION")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == REQ_EXPORT_BACKUP) {
            val res = pendingExportResult
            val content = pendingExportContent
            pendingExportResult = null
            pendingExportContent = null
            if (res == null) return
            val uri = data?.data
            if (resultCode != Activity.RESULT_OK || uri == null || content == null) {
                res.success(false)
                return
            }
            val written = runCatching {
                contentResolver.openOutputStream(uri)?.use { stream ->
                    stream.write(content.toByteArray(Charsets.UTF_8))
                }
                true
            }.getOrDefault(false)
            res.success(written)
        } else if (requestCode == REQ_IMPORT_BACKUP) {
            val res = pendingImportResult
            pendingImportResult = null
            if (res == null) return
            val uri = data?.data
            if (resultCode != Activity.RESULT_OK || uri == null) {
                res.success(null)
                return
            }
            val text = runCatching {
                contentResolver.openInputStream(uri)?.use { stream ->
                    stream.bufferedReader(Charsets.UTF_8).readText()
                }
            }.getOrNull()
            res.success(text)
        }
    }
}
