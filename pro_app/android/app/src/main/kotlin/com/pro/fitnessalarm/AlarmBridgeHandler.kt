package com.pro.fitnessalarm

import android.app.AlarmManager
import android.content.Context
import android.content.Intent
import android.os.Build

class AlarmBridgeHandler(private val context: Context) {

    fun isBridgeReady(): Boolean {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            alarmManager?.canScheduleExactAlarms() ?: false
        } else {
            alarmManager != null
        }
    }

    fun syncAlarm(
        alarmId: String,
        hour: Int,
        minute: Int,
        enabled: Boolean,
        repeatDaysCsv: String,
        notificationTitle: String,
        notificationBody: String,
        localeCode: String,
        volume: Double,
        vibrate: Boolean
    ): Boolean {
        if (alarmId.isBlank() ||
            hour !in 0..23 ||
            minute !in 0..59 ||
            notificationTitle.isBlank() ||
            notificationBody.isBlank() ||
            (localeCode != "ar" && localeCode != "en")
        ) {
            return false
        }

        val record = NativeAlarmRecord(
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
        return AlarmScheduler.scheduleAlarm(context, record)
    }

    fun cancelAlarm(alarmId: String): Boolean {
        if (alarmId.isBlank()) return false
        return AlarmScheduler.cancelAlarm(context, alarmId)
    }

    fun stopAlarmPlayback(): Boolean {
        val stopIntent = Intent(context, AlarmPlaybackService::class.java).apply {
            action = AlarmPlaybackService.ACTION_STOP_PLAYBACK
        }
        runCatching {
            context.startService(stopIntent)
        }.onFailure {
            context.stopService(Intent(context, AlarmPlaybackService::class.java))
        }
        return true
    }
}
