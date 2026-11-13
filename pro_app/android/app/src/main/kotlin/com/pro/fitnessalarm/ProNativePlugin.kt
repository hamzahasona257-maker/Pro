package com.pro.fitnessalarm

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.os.Build
import io.flutter.embedding.engine.plugins.FlutterPlugin
import io.flutter.embedding.engine.plugins.activity.ActivityAware
import io.flutter.embedding.engine.plugins.activity.ActivityPluginBinding
import io.flutter.plugin.common.EventChannel
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import io.flutter.plugin.common.PluginRegistry

class ProNativePlugin :
    FlutterPlugin,
    MethodChannel.MethodCallHandler,
    ActivityAware,
    PluginRegistry.ActivityResultListener {

    companion object {
        private const val CHANNEL_NAME = "com.pro.fitnessalarm/native"
        private const val POSE_STREAM_CHANNEL = "com.pro.fitnessalarm/native/pose_landmarks"
        private const val REQ_EXPORT_BACKUP = 8801
        private const val REQ_IMPORT_BACKUP = 8802
    }

    private lateinit var applicationContext: Context
    private var methodChannel: MethodChannel? = null
    private var poseEventChannel: EventChannel? = null
    private var alarmHandler: AlarmBridgeHandler? = null
    private var poseBridge: PoseLandmarkerBridge? = null

    private var activityBinding: ActivityPluginBinding? = null
    private var pendingExportResult: MethodChannel.Result? = null
    private var pendingExportContent: String? = null
    private var pendingImportResult: MethodChannel.Result? = null

    override fun onAttachedToEngine(binding: FlutterPlugin.FlutterPluginBinding) {
        applicationContext = binding.applicationContext
        val handler = AlarmBridgeHandler(applicationContext)
        val bridge = PoseLandmarkerBridge(applicationContext)

        alarmHandler = handler
        poseBridge = bridge

        poseEventChannel = EventChannel(
            binding.binaryMessenger,
            POSE_STREAM_CHANNEL
        ).apply {
            setStreamHandler(bridge)
        }

        methodChannel = MethodChannel(
            binding.binaryMessenger,
            CHANNEL_NAME
        ).apply {
            setMethodCallHandler(this@ProNativePlugin)
        }
    }

    override fun onDetachedFromEngine(binding: FlutterPlugin.FlutterPluginBinding) {
        methodChannel?.setMethodCallHandler(null)
        methodChannel = null
        poseEventChannel?.setStreamHandler(null)
        poseEventChannel = null
        poseBridge?.stopSession()
        poseBridge = null
        alarmHandler = null
    }

    override fun onAttachedToActivity(binding: ActivityPluginBinding) {
        activityBinding = binding
        binding.addActivityResultListener(this)
    }

    override fun onDetachedFromActivityForConfigChanges() {
        activityBinding?.removeActivityResultListener(this)
        activityBinding = null
    }

    override fun onReattachedToActivityForConfigChanges(binding: ActivityPluginBinding) {
        activityBinding = binding
        binding.addActivityResultListener(this)
    }

    override fun onDetachedFromActivity() {
        activityBinding?.removeActivityResultListener(this)
        activityBinding = null
    }

    override fun onMethodCall(call: MethodCall, result: MethodChannel.Result) {
        val currentAlarmHandler = alarmHandler
        val currentPoseBridge = poseBridge
        if (currentAlarmHandler == null || currentPoseBridge == null) {
            result.error("DETACHED", "Native plugin is not attached to Flutter engine", null)
            return
        }

        when (call.method) {
            "getPlatformStatus" -> {
                result.success(
                    mapOf(
                        "platformName" to "Android",
                        "osVersion" to "API ${Build.VERSION.SDK_INT}",
                        "alarmBridgeReady" to currentAlarmHandler.isBridgeReady(),
                        "poseBridgeReady" to true,
                        "poseModelBundled" to currentPoseBridge.isModelAssetPresent()
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
                        currentAlarmHandler.syncAlarm(
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
                    result.success(currentAlarmHandler.cancelAlarm(alarmId))
                }
            }
            "stopAlarmPlayback" -> {
                result.success(currentAlarmHandler.stopAlarmPlayback())
            }
            "startPoseSession" -> {
                val delegate = call.argument<String>("delegate") ?: "gpu"
                result.success(currentPoseBridge.startSession(delegate))
            }
            "stopPoseSession" -> {
                currentPoseBridge.stopSession()
                result.success(null)
            }
            "exportBackupDocument" -> {
                val activity = activityBinding?.activity
                if (activity == null) {
                    result.error("NO_ACTIVITY", "Foreground activity is required for SAF export", null)
                    return
                }
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
                activity.startActivityForResult(intent, REQ_EXPORT_BACKUP)
            }
            "importBackupDocument" -> {
                val activity = activityBinding?.activity
                if (activity == null) {
                    result.error("NO_ACTIVITY", "Foreground activity is required for SAF import", null)
                    return
                }
                pendingImportResult?.error("CANCELLED", "Superseded", null)
                pendingImportResult = result
                val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "*/*"
                    putExtra(Intent.EXTRA_MIME_TYPES, arrayOf("application/json", "text/plain"))
                }
                activity.startActivityForResult(intent, REQ_IMPORT_BACKUP)
            }
            else -> result.notImplemented()
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?): Boolean {
        if (requestCode == REQ_EXPORT_BACKUP) {
            val res = pendingExportResult
            val content = pendingExportContent
            pendingExportResult = null
            pendingExportContent = null
            if (res == null) return false
            val uri = data?.data
            if (resultCode != Activity.RESULT_OK || uri == null || content == null) {
                res.success(false)
                return true
            }
            val written = runCatching {
                applicationContext.contentResolver.openOutputStream(uri)?.use { stream ->
                    stream.write(content.toByteArray(Charsets.UTF_8))
                }
                true
            }.getOrDefault(false)
            res.success(written)
            return true
        } else if (requestCode == REQ_IMPORT_BACKUP) {
            val res = pendingImportResult
            pendingImportResult = null
            if (res == null) return false
            val uri = data?.data
            if (resultCode != Activity.RESULT_OK || uri == null) {
                res.success(null)
                return true
            }
            val text = runCatching {
                applicationContext.contentResolver.openInputStream(uri)?.use { stream ->
                    stream.bufferedReader(Charsets.UTF_8).readText()
                }
            }.getOrNull()
            res.success(text)
            return true
        }
        return false
    }
}
