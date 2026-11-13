import Foundation
import UserNotifications

final class AlarmBridgeHandler {
    private let audioManager = AlarmAudioManager()

    func isBridgeReady() -> Bool {
        return true
    }

    func syncAlarm(
        alarmId: String,
        hour: Int,
        minute: Int,
        enabled: Bool,
        repeatDaysCsv: String,
        notificationTitle: String,
        notificationBody: String,
        localeCode: String,
        volume: Double,
        vibrate: Bool
    ) -> Bool {
        guard
            !alarmId.isEmpty,
            (0...23).contains(hour),
            (0...59).contains(minute),
            !notificationTitle.isEmpty,
            !notificationBody.isEmpty,
            localeCode == "ar" || localeCode == "en"
        else {
            return false
        }

        _ = cancelAlarm(alarmId: alarmId)
        guard enabled else { return true }

        let center = UNUserNotificationCenter.current()
        let content = UNMutableNotificationContent()
        content.title = notificationTitle
        content.body = notificationBody
        content.sound = UNNotificationSound.defaultCritical
        content.userInfo = [
            "alarmId": alarmId,
            "volume": volume,
            "vibrate": vibrate
        ]

        let isoDays = repeatDaysCsv
            .split(separator: ",")
            .compactMap { Int($0.trimmingCharacters(in: .whitespaces)) }
            .filter { (1...7).contains($0) }

        if isoDays.isEmpty {
            var comps = DateComponents()
            comps.hour = hour
            comps.minute = minute
            let trigger = UNCalendarNotificationTrigger(dateMatching: comps, repeats: false)
            let req = UNNotificationRequest(
                identifier: "pro_alarm_\(alarmId)_once",
                content: content,
                trigger: trigger
            )
            center.add(req)
        } else {
            for isoDay in isoDays {
                // Convert ISO weekday (Mon=1..Sun=7) to Apple UNCalendar weekday (Sun=1..Sat=7)
                let appleWeekday = (isoDay % 7) + 1
                var comps = DateComponents()
                comps.weekday = appleWeekday
                comps.hour = hour
                comps.minute = minute
                let trigger = UNCalendarNotificationTrigger(dateMatching: comps, repeats: true)
                let req = UNNotificationRequest(
                    identifier: "pro_alarm_\(alarmId)_day_\(isoDay)",
                    content: content,
                    trigger: trigger
                )
                center.add(req)
            }
        }
        return true
    }

    func cancelAlarm(alarmId: String) -> Bool {
        guard !alarmId.isEmpty else { return false }
        var identifiers = ["pro_alarm_\(alarmId)_once"]
        for day in 1...7 {
            identifiers.append("pro_alarm_\(alarmId)_day_\(day)")
        }
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: identifiers)
        return true
    }

    func stopAlarmPlayback() -> Bool {
        audioManager.stopPlayback()
        return true
    }
}
