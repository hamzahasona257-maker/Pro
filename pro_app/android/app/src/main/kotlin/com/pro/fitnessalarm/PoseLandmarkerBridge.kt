package com.pro.fitnessalarm

import android.content.Context
import io.flutter.plugin.common.EventChannel

class PoseLandmarkerBridge(private val context: Context) : EventChannel.StreamHandler {
    companion object {
        private const val MODEL_ASSET = "pose_landmarker_lite.task"
    }

    private var eventSink: EventChannel.EventSink? = null
    private var sessionActive = false

    fun isModelAssetPresent(): Boolean {
        return try {
            context.assets.open(MODEL_ASSET).use { true }
        } catch (_: Exception) {
            false
        }
    }

    fun startSession(delegate: String): Boolean {
        if (!isModelAssetPresent()) {
            sessionActive = false
            return false
        }
        // Real MediaPipe PoseLandmarker + CameraX ImageAnalysis pipeline hooks here
        // once pose_landmarker_lite.task is bundled in android/app/src/main/assets/
        // and com.google.mediapipe:tasks-vision + CameraX dependencies are synced.
        sessionActive = delegate == "gpu" || delegate == "cpu"
        return sessionActive
    }

    fun stopSession() {
        sessionActive = false
    }

    fun emitLandmarks(landmarks: List<Map<String, Double>>) {
        if (!sessionActive) return
        eventSink?.success(landmarks)
    }

    override fun onListen(arguments: Any?, events: EventChannel.EventSink?) {
        eventSink = events
    }

    override fun onCancel(arguments: Any?) {
        eventSink = null
        stopSession()
    }
}
