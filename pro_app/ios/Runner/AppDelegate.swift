import Flutter
import UIKit
import UniformTypeIdentifiers

@main
@objc class AppDelegate: FlutterAppDelegate, UIDocumentPickerDelegate {
    private let channelName = "com.pro.fitnessalarm/native"
    private let poseStreamChannel = "com.pro.fitnessalarm/native/pose_landmarks"
    private let alarmHandler = AlarmBridgeHandler()
    private let poseBridge = PoseLandmarkerBridge()

    private var pendingExportResult: FlutterResult?
    private var pendingImportResult: FlutterResult?
    private var tempExportUrl: URL?

    override func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        GeneratedPluginRegistrant.register(with: self)

        if let controller = window?.rootViewController as? FlutterViewController {
            let poseEventChannel = FlutterEventChannel(
                name: poseStreamChannel,
                binaryMessenger: controller.binaryMessenger
            )
            poseEventChannel.setStreamHandler(poseBridge)

            let channel = FlutterMethodChannel(
                name: channelName,
                binaryMessenger: controller.binaryMessenger
            )

            channel.setMethodCallHandler { [weak self] call, result in
                guard let self else { return }
                switch call.method {
                case "getPlatformStatus":
                    result([
                        "platformName": "iOS",
                        "osVersion": UIDevice.current.systemVersion,
                        "alarmBridgeReady": self.alarmHandler.isBridgeReady(),
                        "poseBridgeReady": true,
                        "poseModelBundled": self.poseBridge.isModelAssetPresent(),
                    ])
                case "syncAlarmContract":
                    guard
                        let args = call.arguments as? [String: Any],
                        let alarmId = args["alarmId"] as? String,
                        let hour = args["hour"] as? Int,
                        let minute = args["minute"] as? Int,
                        let enabled = args["enabled"] as? Bool
                    else {
                        result(FlutterError(code: "INVALID_ARGS", message: "Missing alarm parameters", details: nil))
                        return
                    }
                    let repeatDaysCsv = args["repeatDaysCsv"] as? String ?? ""
                    let title = args["notificationTitle"] as? String ?? ""
                    let body = args["notificationBody"] as? String ?? ""
                    let localeCode = args["localeCode"] as? String ?? "ar"
                    let volume = args["volume"] as? Double ?? 0.85
                    let vibrate = args["vibrate"] as? Bool ?? true
                    result(
                        self.alarmHandler.syncAlarm(
                            alarmId: alarmId,
                            hour: hour,
                            minute: minute,
                            enabled: enabled,
                            repeatDaysCsv: repeatDaysCsv,
                            notificationTitle: title,
                            notificationBody: body,
                            localeCode: localeCode,
                            volume: volume,
                            vibrate: vibrate
                        )
                    )
                case "cancelAlarmContract":
                    guard
                        let args = call.arguments as? [String: Any],
                        let alarmId = args["alarmId"] as? String
                    else {
                        result(FlutterError(code: "INVALID_ARGS", message: "Missing alarmId", details: nil))
                        return
                    }
                    result(self.alarmHandler.cancelAlarm(alarmId: alarmId))
                case "stopAlarmPlayback":
                    result(self.alarmHandler.stopAlarmPlayback())
                case "startPoseSession":
                    let args = call.arguments as? [String: Any]
                    let delegate = args?["delegate"] as? String ?? "gpu"
                    result(self.poseBridge.startSession(delegate: delegate))
                case "stopPoseSession":
                    self.poseBridge.stopSession()
                    result(nil)
                case "exportBackupDocument":
                    guard
                        let args = call.arguments as? [String: Any],
                        let fileName = args["fileName"] as? String,
                        let content = args["content"] as? String
                    else {
                        result(false)
                        return
                    }
                    self.presentExportPicker(controller: controller, fileName: fileName, content: content, result: result)
                case "importBackupDocument":
                    self.presentImportPicker(controller: controller, result: result)
                default:
                    result(FlutterMethodNotImplemented)
                }
            }
        }

        return super.application(application, didFinishLaunchingWithOptions: launchOptions)
    }

    private func presentExportPicker(
        controller: UIViewController,
        fileName: String,
        content: String,
        result: @escaping FlutterResult
    ) {
        let tempUrl = FileManager.default.temporaryDirectory.appendingPathComponent(fileName)
        do {
            try content.write(to: tempUrl, atomically: true, encoding: .utf8)
        } catch {
            result(false)
            return
        }
        pendingExportResult = result
        tempExportUrl = tempUrl
        let picker = UIDocumentPickerViewController(forExporting: [tempUrl], asCopy: true)
        picker.delegate = self
        controller.present(picker, animated: true)
    }

    private func presentImportPicker(
        controller: UIViewController,
        result: @escaping FlutterResult
    ) {
        pendingImportResult = result
        let types: [UTType] = [.json, .plainText]
        let picker = UIDocumentPickerViewController(forOpeningContentTypes: types, asCopy: true)
        picker.delegate = self
        controller.present(picker, animated: true)
    }

    func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
        if let exportRes = pendingExportResult {
            pendingExportResult = nil
            if let temp = tempExportUrl { try? FileManager.default.removeItem(at: temp) }
            tempExportUrl = nil
            exportRes(!urls.isEmpty)
            return
        }

        if let importRes = pendingImportResult {
            pendingImportResult = nil
            guard let url = urls.first else {
                importRes(nil)
                return
            }
            let content = try? String(contentsOf: url, encoding: .utf8)
            importRes(content)
        }
    }

    func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) {
        if let exportRes = pendingExportResult {
            pendingExportResult = nil
            if let temp = tempExportUrl { try? FileManager.default.removeItem(at: temp) }
            tempExportUrl = nil
            exportRes(false)
        }
        if let importRes = pendingImportResult {
            pendingImportResult = nil
            importRes(nil)
        }
    }
}
