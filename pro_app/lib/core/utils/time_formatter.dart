import 'package:intl/intl.dart';

import '../../domain/enums/weekday.dart';
import '../../l10n/app_localizations.dart';

abstract final class TimeFormatter {
  static String formatTime({
    required int hour,
    required int minute,
    required bool use24Hour,
  }) {
    final paddedMinute = minute.toString().padLeft(2, '0');
    if (use24Hour) {
      final paddedHour = hour.toString().padLeft(2, '0');
      return '$paddedHour:$paddedMinute';
    }
    final displayHour = hour % 12 == 0 ? 12 : hour % 12;
    return '$displayHour:$paddedMinute';
  }

  static String formatPeriod(int hour, AppLocalizations l10n) {
    return hour >= 12 ? l10n.periodPm : l10n.periodAm;
  }

  static String formatCurrentDate(DateTime date, AppLocalizations l10n) {
    return DateFormat('EEEE, MMM d', l10n.localeName).format(date);
  }

  static String shortDayLabel(Weekday day, AppLocalizations l10n) {
    switch (day) {
      case Weekday.monday:
        return l10n.dayMonShort;
      case Weekday.tuesday:
        return l10n.dayTueShort;
      case Weekday.wednesday:
        return l10n.dayWedShort;
      case Weekday.thursday:
        return l10n.dayThuShort;
      case Weekday.friday:
        return l10n.dayFriShort;
      case Weekday.saturday:
        return l10n.daySatShort;
      case Weekday.sunday:
        return l10n.daySunShort;
    }
  }

  static String singleLetterDayLabel(Weekday day, AppLocalizations l10n) {
    switch (day) {
      case Weekday.monday:
        return l10n.dayMonLetter;
      case Weekday.tuesday:
        return l10n.dayTueLetter;
      case Weekday.wednesday:
        return l10n.dayWedLetter;
      case Weekday.thursday:
        return l10n.dayThuLetter;
      case Weekday.friday:
        return l10n.dayFriLetter;
      case Weekday.saturday:
        return l10n.daySatLetter;
      case Weekday.sunday:
        return l10n.daySunLetter;
    }
  }

  static String formatRepeatSummary(
    List<Weekday> days,
    AppLocalizations l10n,
  ) {
    if (days.isEmpty) return l10n.repeatOnce;
    if (days.length == 7) return l10n.repeatEveryDay;

    final sorted = [...days]..sort((a, b) => a.isoIndex.compareTo(b.isoIndex));
    final indices = sorted.map((d) => d.isoIndex).toSet();

    if (indices.length == 5 && indices.containsAll([1, 2, 3, 4, 5])) {
      return l10n.repeatWeekdays;
    }
    if (indices.length == 2 && indices.containsAll([6, 7])) {
      return l10n.repeatWeekends;
    }
    final separator = l10n.localeName == 'ar' ? '، ' : ', ';
    return sorted.map((d) => shortDayLabel(d, l10n)).join(separator);
  }

  static String formatCountdown(Duration duration, AppLocalizations l10n) {
    if (duration.isNegative || duration.inMinutes == 0) {
      return l10n.countdownLessThanMinute;
    }
    final days = duration.inDays;
    final hours = duration.inHours.remainder(24);
    final minutes = duration.inMinutes.remainder(60);

    if (days > 0) {
      return l10n.countdownDaysHours(days, hours);
    }
    if (hours > 0) {
      return l10n.countdownHoursMinutes(hours, minutes);
    }
    return l10n.countdownMinutes(minutes);
  }
}
