import { Translations } from '../i18n/translations';
import { AlarmModel, AppLanguage, Weekday } from '../types/pro';

export const WEEKDAY_IDS: Weekday[] = [1, 2, 3, 4, 5, 6, 7];

export function formatTime(
  hour: number,
  minute: number,
  use24Hour: boolean,
): string {
  const mm = String(minute).padStart(2, '0');
  if (use24Hour) {
    const hh = String(hour).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${mm}`;
}

export function formatPeriod(hour: number, t: Translations): string {
  return hour >= 12 ? t.time.pm : t.time.am;
}

export function formatCurrentDate(date: Date, language: AppLanguage): string {
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatRepeatSummary(days: Weekday[], t: Translations): string {
  if (days.length === 0) return t.time.once;
  if (days.length === 7) return t.time.everyDay;

  const sorted = [...days].sort((a, b) => a - b);
  const set = new Set(sorted);
  if (set.size === 5 && [1, 2, 3, 4, 5].every((d) => set.has(d as Weekday))) {
    return t.time.weekdays;
  }
  if (set.size === 2 && set.has(6) && set.has(7)) {
    return t.time.weekends;
  }
  return sorted.map((id) => t.time.daysShort[id]).join(t.time.listSeparator);
}

function getIsoWeekday(date: Date): Weekday {
  const jsDay = date.getDay();
  return (jsDay === 0 ? 7 : jsDay) as Weekday;
}

export function getNextTriggerTime(alarm: AlarmModel, now: Date): Date {
  const todayCandidate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    alarm.hour,
    alarm.minute,
    0,
    0,
  );

  if (alarm.repeatDays.length === 0) {
    if (todayCandidate.getTime() > now.getTime()) {
      return todayCandidate;
    }
    const tomorrow = new Date(todayCandidate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  const allowed = new Set(alarm.repeatDays);
  for (let offset = 0; offset < 7; offset += 1) {
    const candidate = new Date(todayCandidate);
    candidate.setDate(candidate.getDate() + offset);
    if (
      allowed.has(getIsoWeekday(candidate)) &&
      candidate.getTime() > now.getTime()
    ) {
      return candidate;
    }
  }

  const nextWeek = new Date(todayCandidate);
  nextWeek.setDate(nextWeek.getDate() + 7);
  return nextWeek;
}

export function formatCountdown(
  target: Date,
  now: Date,
  t: Translations,
): string {
  const diffMs = target.getTime() - now.getTime();
  const totalMinutes = Math.floor(diffMs / 60000);
  if (totalMinutes <= 0) return t.time.lessThanMinute;

  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return t.time.daysHours(days, hours);
  if (hours > 0) return t.time.hoursMinutes(hours, minutes);
  return t.time.minutesOnly(minutes);
}
