import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_spacing.dart';

class ProIconBadge extends StatelessWidget {
  const ProIconBadge({
    super.key,
    required this.icon,
    this.accent = AppColors.neonLime,
    this.size = 44,
    this.iconSize = 22,
  });

  final IconData icon;
  final Color accent;
  final double size;
  final double iconSize;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: size,
      width: size,
      decoration: BoxDecoration(
        color: accent.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm + 2),
        border: Border.all(
          color: accent.withValues(alpha: 0.28),
        ),
      ),
      child: Icon(
        icon,
        color: accent,
        size: iconSize,
      ),
    );
  }
}
