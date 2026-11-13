package com.pro.fitnessalarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import org.json.JSONObject
import java.util.Calendar

data class NativeAlarmRecord(
    val alarmId: String,
    val hour: Int,
    val minute: Int,
    val enabled: Boolean,
    val repeatDaysCsv: String,
    val notificationTitle: String,
    val notificationBody: String,
    val localeCode: String,
    val volume: Double,
    val vibrate: Boolean
) {
    fun toJson(): JSONObject = JSONObject().apply {
        put("alarmId", alarmId)
        put("hour", hour)
        put("minute", minute)
        put("enabled", enabled)
        put("repeatDaysCsv", repeatDaysCsv)
        put("notificationTitle", notificationTitle)
        put("notificationBody", notificationBody)
        put("localeCode", localeCode)
        put("volume", volume)
        put("vibrate", vibrate)
    }

    companion object {
        fun fromJson(json: JSONObject): NativeAlarmRecord? {
            val id = json.optString("alarmId")
            if (id.isBlank()) return null
            return NativeAlarmRecord(
                alarmId = id,
                hour = json.optInt("hour", 7).coerceIn(0, 23),
                minute = json.optInt("minute", 0).coerceIn(0, 59),
                enabled = json.optBoolean("enabled", false),
                repeatDaysCsv = json.optString("repeatDaysCsv", ""),
                notificationTitle = json.optString("notificationTitle", "PRO"),
                notificationBody = json.optString("notificationBody", ""),
                localeCode = json.optString("localeCode", "ar"),
                volume = json.optDouble("volume", 0.85).coerceIn(0.0, 1.0),
                vibrate = json.optBoolean("vibrate", true)
            )
        }
    }
}

object AlarmScheduler {
    private const val PREFS_NAME = "pro_native_alarms"
    const val ACTION_ALARM_TRIGGER = "com.pro.fitnessalarm.ACTION_ALARM_TRIGGER"

    fun computeNextTriggerMillis(
        hour: Int,
        minute: Int,
        repeatDaysCsv: String,
        nowMillis: Long = System.currentTimeMillis()
    ): Long {
        val allowedWeekdays = repeatDaysCsv
            .split(',')
            .mapNotNull { it.trim().toIntOrNull() }
            .filter { it in 1..7 }
            .toSet()

        val candidate = Calendar.getInstance().apply {
            timeInMillis = nowMillis
            set(Calendar.HOUR_OF_DAY, hour)
            set(Calendar.MINUTE, minute)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }

        if (allowedWeekdays.isEmpty()) {
            if (candidate.timeInMillis <= nowMillis) {
                candidate.add(Calendar.DAY_OF_YEAR, 1)
            }
            return candidate.timeInMillis
        }

        for (offset in 0..7) {
            val probe = (candidate.clone() as Calendar).apply {
                add(Calendar.DAY_OF_YEAR, offset)
            }
            // Convert Calendar.DAY_OF_WEEK (Sun=1..Sat=7) to ISO weekday (Mon=1..Sun=7)
            val isoDay = when (probe.get(Calendar.DAY_OF_WEEK)) {
                Calendar.MONDAY -> 1
                Calendar.TUESDAY -> 2
                Calendar.WEDNESDAY -> 3
                Calendar.THURSDAY -> 4
                Calendar.FRIDAY -> 5
                Calendar.SATURDAY -> 6
                else -> 7
            }
            if (allowedWeekdays.contains(isoDay) && probe.timeInMillis > nowMillis) {
                return probe.timeInMillis
            }
        }
        candidate.add(Calendar.DAY_OF_YEAR, 1)
        return candidate.timeInMillis
    }

    fun scheduleAlarm(context: Context, record: NativeAlarmRecord): Boolean {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        if (!record.enabled) {
            prefs.edit().remove(record.alarmId).apply()
            cancelPendingIntent(context, record.alarmId)
            return true
        }

        prefs.edit().putString(record.alarmId, record.toJson().toString()).apply()

        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
            ?: return false

        val triggerAtMillis = computeNextTriggerMillis(
            hour = record.hour,
            minute = record.minute,
            repeatDaysCsv = record.repeatDaysCsv
        )

        val pendingIntent = buildTriggerPendingIntent(context, record)
        val launchIntent = PendingIntent.getActivity(
            context,
            record.alarmId.hashCode(),
            Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("alarmId", record.alarmId)
            },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
                alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
                true
            } else {
                val info = AlarmManager.AlarmClockInfo(triggerAtMillis, launchIntent)
                alarmManager.setAlarmClock(info, pendingIntent)
                true
            }
        } catch (_: SecurityException) {
            false
        }
    }

    fun cancelAlarm(context: Context, alarmId: String): Boolean {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().remove(alarmId).apply()
        cancelPendingIntent(context, alarmId)
        return true
    }

    fun restoreAllAlarms(context: Context): Int {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        var restored = 0
        for ((_, raw) in prefs.all) {
            val rawStr = raw as? String ?: continue
            val record = runCatching { NativeAlarmRecord.fromJson(JSONObject(rawStr)) }.getOrNull()
                ?: continue
            if (record.enabled && scheduleAlarm(context, record)) {
                restored++
            }
        }
        return restored
    }

    fun getRecord(context: Context, alarmId: String): NativeAlarmRecord? {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val rawStr = prefs.getString(alarmId, null) ?: return null
        return runCatching { NativeAlarmRecord.fromJson(JSONObject(rawStr)) }.getOrNull()
    }

    private fun cancelPendingIntent(context: Context, alarmId: String) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        val intent = Intent(context, AlarmReceiver::class.java).apply {
            action = ACTION_ALARM_TRIGGER
        }
        val pi = PendingIntent.getBroadcast(
            context,
            alarmId.hashCode(),
            intent,
            PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
        )
        if (pi != null) {
            alarmManager.cancel(pi)
            pi.cancel()
        }
    }

    private fun buildTriggerPendingIntent(context: Context, record: NativeAlarmRecord): PendingIntent {
        val intent = Intent(context, AlarmReceiver::class.java).apply {
            action = ACTION_ALARM_TRIGGER
            putExtra("alarmId", record.alarmId)
            putExtra("notificationTitle", record.notificationTitle)
            putExtra("notificationBody", record.notificationBody)
            putExtra("volume", record.volume)
            putExtra("vibrate", record.vibrate)
            putExtra("repeatDaysCsv", record.repeatDaysCsv)
        }
        return PendingIntent.getBroadcast(
            context,
            record.alarmId.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }
}
