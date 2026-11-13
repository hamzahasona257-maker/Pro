import Flutter
import Foundation

final class PoseLandmarkerBridge: NSObject, FlutterStreamHandler {
    private var eventSink: FlutterEventSink?
    private var sessionActive = false

    func isModelAssetPresent() -> Bool {
        return Bundle.main.path(forResource: "pose_landmarker_lite", ofType: "task") != nil
    }

    func startSession(delegate: String) -> Bool {
        guard isModelAssetPresent() else {
            sessionActive = false
            return false
        }
        // Native AVCaptureSession + MediaPipeTasksVision PoseLandmarker attaches here
        // once pose_landmarker_lite.task is added to the Xcode Runner bundle.
        sessionActive = (delegate == "gpu" || delegate == "cpu")
        return sessionActive
    }

    func stopSession() {
        sessionActive = false
    }

    func onListen(withArguments arguments: Any?, eventSink events: @escaping FlutterEventSink) -> FlutterError? {
        eventSink = events
        return nil
    }

    func onCancel(withArguments arguments: Any?) -> FlutterError? {
        eventSink = nil
        stopSession()
        return nil
    }
}
