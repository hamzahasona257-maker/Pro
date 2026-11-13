import 'package:flutter/material.dart';

import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';

abstract final class AppTheme {
  static ThemeData darkTheme(Locale locale) {
    final isArabic = locale.languageCode == 'ar';
    final fontFamily = isArabic ? 'Cairo' : null;
    const fontFallback = ['Noto Sans Arabic', 'Geeza Pro', 'Roboto'];

    const colorScheme = ColorScheme.dark(
      primary: AppColors.neonLime,
      onPrimary: AppColors.navyBackground,
      secondary: AppColors.neonLimeDim,
      onSecondary: AppColors.navyBackground,
      surface: AppColors.navySurface,
      onSurface: AppColors.textPrimary,
      error: AppColors.error,
      onError: AppColors.textPrimary,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      fontFamily: fontFamily,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: AppColors.navyBackground,
      canvasColor: AppColors.navyBackground,
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.navyBackground,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          fontFamily: fontFamily,
          fontFamilyFallback: fontFallback,
          color: AppColors.textPrimary,
          fontSize: 22,
          fontWeight: FontWeight.w800,
          letterSpacing: isArabic ? 0 : -0.4,
        ),
      ),
      textTheme: TextTheme(
        displayLarge: TextStyle(
          fontFamily: fontFamily,
          fontFamilyFallback: fontFallback,
          color: AppColors.textPrimary,
          fontSize: 44,
          fontWeight: FontWeight.w800,
          letterSpacing: isArabic ? 0 : -1.2,
        ),
        headlineMedium: TextStyle(
          fontFamily: fontFamily,
          fontFamilyFallback: fontFallback,
          color: AppColors.textPrimary,
          fontSize: 24,
          fontWeight: FontWeight.w700,
          letterSpacing: isArabic ? 0 : -0.5,
        ),
        titleLarge: TextStyle(
          fontFamily: fontFamily,
          fontFamilyFallback: fontFallback,
          color: AppColors.textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w700,
          letterSpacing: isArabic ? 0 : -0.2,
        ),
        titleMedium: TextStyle(
          fontFamily: fontFamily,
          fontFamilyFallback: fontFallback,
          color: AppColors.textPrimary,
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
        bodyLarge: TextStyle(
          fontFamily: fontFamily,
          fontFamilyFallback: fontFallback,
          color: AppColors.textPrimary,
          fontSize: 15,
          fontWeight: FontWeight.w400,
        ),
        bodyMedium: TextStyle(
          fontFamily: fontFamily,
          fontFamilyFallback: fontFallback,
          color: AppColors.textSecondary,
          fontSize: 14,
          fontWeight: FontWeight.w400,
        ),
        labelLarge: TextStyle(
          fontFamily: fontFamily,
          fontFamilyFallback: fontFallback,
          color: AppColors.textPrimary,
          fontSize: 14,
          fontWeight: FontWeight.w700,
          letterSpacing: isArabic ? 0 : 0.2,
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.navySurface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          side: const BorderSide(color: AppColors.navyBorder, width: 1),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.navyElevated,
        hintStyle: const TextStyle(color: AppColors.textMuted),
        labelStyle: const TextStyle(color: AppColors.textSecondary),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.md,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          borderSide: const BorderSide(color: AppColors.navyBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          borderSide: const BorderSide(color: AppColors.navyBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          borderSide: const BorderSide(color: AppColors.neonLime, width: 1.5),
        ),
      ),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return AppColors.navyBackground;
          }
          return AppColors.textSecondary;
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return AppColors.neonLime;
          }
          return AppColors.navyElevated;
        }),
        trackOutlineColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return Colors.transparent;
          }
          return AppColors.navyBorder;
        }),
      ),
      sliderTheme: SliderThemeData(
        activeTrackColor: AppColors.neonLime,
        inactiveTrackColor: AppColors.navyElevated,
        thumbColor: AppColors.neonLime,
        overlayColor: AppColors.neonLime.withValues(alpha: 0.16),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: AppColors.neonLime,
        foregroundColor: AppColors.navyBackground,
        elevation: 4,
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.navyElevated,
        contentTextStyle: TextStyle(
          fontFamily: fontFamily,
          fontFamilyFallback: fontFallback,
          color: AppColors.textPrimary,
        ),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          side: const BorderSide(color: AppColors.navyBorder),
        ),
      ),
      timePickerTheme: TimePickerThemeData(
        backgroundColor: AppColors.navySurface,
        hourMinuteColor: AppColors.navyElevated,
        hourMinuteTextColor: AppColors.textPrimary,
        dialBackgroundColor: AppColors.navyElevated,
        dialHandColor: AppColors.neonLime,
        dialTextColor: AppColors.textPrimary,
        entryModeIconColor: AppColors.neonLime,
        dayPeriodColor: AppColors.navyElevated,
        dayPeriodTextColor: AppColors.neonLime,
        helpTextStyle: TextStyle(
          fontFamily: fontFamily,
          fontFamilyFallback: fontFallback,
          color: AppColors.textSecondary,
          fontWeight: FontWeight.w600,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
          side: const BorderSide(color: AppColors.navyBorder),
        ),
      ),
    );
  }
}
