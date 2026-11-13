package com.pro.fitnessalarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat

class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != AlarmScheduler.ACTION_ALARM_TRIGGER) return

        val alarmId = intent.getStringExtra("alarmId") ?: return
        val title = intent.getStringExtra("notificationTitle") ?: "PRO"
        val body = intent.getStringExtra("notificationBody") ?: ""
        val volume = intent.getDoubleExtra("volume", 0.85)
        val vibrate = intent.getBooleanExtra("vibrate", true)
        val repeatDaysCsv = intent.getStringExtra("repeatDaysCsv") ?: ""

        val serviceIntent = Intent(context, AlarmPlaybackService::class.java).apply {
            action = AlarmPlaybackService.ACTION_START_PLAYBACK
            putExtra("alarmId", alarmId)
            putExtra("notificationTitle", title)
            putExtra("notificationBody", body)
            putExtra("volume", volume)
            putExtra("vibrate", vibrate)
        }
        ContextCompat.startForegroundService(context, serviceIntent)

        // Schedule next repeating occurrence or mark one-shot complete
        val stored = AlarmScheduler.getRecord(context, alarmId)
        if (stored != null && repeatDaysCsv.isNotBlank()) {
            AlarmScheduler.scheduleAlarm(context, stored)
        }
    }
}
