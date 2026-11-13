import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/utils/time_formatter.dart';
import '../../domain/enums/weekday.dart';
import '../../l10n/app_localizations.dart';

class ProDayChip extends StatelessWidget {
  const ProDayChip({
    super.key,
    required this.day,
    required this.selected,
    required this.onTap,
  });

  final Weekday day;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final shortName = TimeFormatter.shortDayLabel(day, l10n);
    final letter = TimeFormatter.singleLetterDayLabel(day, l10n);

    return Semantics(
      button: true,
      selected: selected,
      label: l10n.a11ySelectWeekday(shortName),
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          curve: Curves.easeOut,
          width: 40,
          height: 40,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: selected ? AppColors.neonLime : AppColors.navyElevated,
            shape: BoxShape.circle,
            border: Border.all(
              color: selected ? AppColors.neonLime : AppColors.navyBorder,
            ),
          ),
          child: Text(
            letter,
            style: TextStyle(
              color:
                  selected ? AppColors.navyBackground : AppColors.textSecondary,
              fontSize: 13,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
      ),
    );
  }
}
