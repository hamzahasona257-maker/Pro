import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/platform/native_bridge_channel.dart';
import '../../../core/router/app_router.dart';
import '../../../data/services/backup_service.dart';
import '../../../domain/catalog/exercise_catalog.dart';
import '../../../l10n/app_localizations.dart';
import '../../providers/alarm_providers.dart';
import '../../providers/database_providers.dart';
import '../../providers/settings_providers.dart';
import '../../providers/workout_providers.dart';
import '../../widgets/pro_card.dart';
import '../../widgets/pro_secondary_button.dart';
import '../../widgets/pro_section_header.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  Future<void> _confirmReset(BuildContext context, WidgetRef ref) async {
    final l10n = AppLocalizations.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.navySurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          side: const BorderSide(color: AppColors.navyBorder),
        ),
        title: Text(l10n.settingsResetDialogTitle),
        content: Text(
          l10n.settingsResetDialogBody,
          style: const TextStyle(color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: Text(
              l10n.actionCancel,
              style: const TextStyle(color: AppColors.textSecondary),
            ),
          ),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: Text(
              l10n.actionConfirm,
              style: const TextStyle(
                color: AppColors.error,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await ref.read(settingsProvider.notifier).clearAllLocalData();
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.settingsResetToast)),
        );
      }
    }
  }

  Future<void> _exportBackup(BuildContext context, WidgetRef ref) async {
    final l10n = AppLocalizations.of(context);
    try {
      final json = await ref.read(backupServiceProvider).exportBackupJson();
      final dateTag = DateTime.now().toIso8601String().substring(0, 10);
      final saved = await NativeBridgeChannel.exportBackupDocument(
        fileName: 'pro-backup-$dateTag.json',
        content: json,
      );
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              saved
                  ? l10n.settingsBackupExportSuccess
                  : l10n.settingsBackupExportCancelled,
            ),
          ),
        );
      }
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.settingsBackupInvalidError)),
        );
      }
    }
  }

  Future<void> _importBackup(BuildContext context, WidgetRef ref) async {
    final l10n = AppLocalizations.of(context);
    final rawJson = await NativeBridgeChannel.importBackupDocument();
    if (rawJson == null || rawJson.trim().isEmpty) return;

    final ParsedBackupBundle bundle;
    try {
      bundle = BackupService.parseAndValidate(rawJson);
    } on BackupValidationException {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.settingsBackupInvalidError)),
        );
      }
      return;
    }

    if (!context.mounted) return;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.navySurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          side: const BorderSide(color: AppColors.navyBorder),
        ),
        title: Text(l10n.settingsBackupImportConfirmTitle),
        content: Text(
          l10n.settingsBackupImportConfirmBody(
            bundle.alarms.length,
            bundle.sessions.length,
          ),
          style: const TextStyle(color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: Text(
              l10n.actionCancel,
              style: const TextStyle(color: AppColors.textSecondary),
            ),
          ),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: Text(
              l10n.actionConfirm,
              style: const TextStyle(
                color: AppColors.neonLime,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      final previousAlarms =
          await ref.read(alarmRepositoryProvider).getAllAlarms();
      await ref.read(backupServiceProvider).restoreValidatedBundle(bundle);
      await ref.read(settingsProvider.notifier).replaceAllSettings(
            bundle.settings,
          );
      ref.invalidate(alarmsProvider);
      ref.invalidate(workoutSessionsProvider);
      ref.invalidate(dashboardStatsProvider);

      final restoredIds = bundle.alarms.map((a) => a.id).toSet();
      for (final oldAlarm in previousAlarms) {
        if (!restoredIds.contains(oldAlarm.id)) {
          await NativeBridgeChannel.cancelAlarmContract(oldAlarm.id);
        }
      }

      for (final alarm in bundle.alarms) {
        final ex = ExerciseCatalog.byType(alarm.exerciseType);
        await NativeBridgeChannel.syncAlarmContract(
          alarmId: alarm.id,
          hour: alarm.hour,
          minute: alarm.minute,
          enabled: alarm.isEnabled,
          repeatDaysCsv: alarm.repeatDays.map((d) => d.isoIndex).join(','),
          notificationTitle: l10n.notifAlarmTitle,
          notificationBody: l10n.notifAlarmBody(
            alarm.targetReps,
            ex.localizedUnit(l10n),
            ex.localizedName(l10n),
          ),
          localeCode: bundle.settings.languageCode,
          volume: bundle.settings.alarmVolume,
          vibrate: alarm.vibrationEnabled,
        );
      }

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              l10n.settingsBackupImportSuccess(
                bundle.alarms.length,
                bundle.sessions.length,
              ),
            ),
          ),
        );
      }
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.settingsBackupInvalidError)),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final settings = ref.watch(settingsProvider);
    final notifier = ref.read(settingsProvider.notifier);
    final defaultExercise = ExerciseCatalog.byType(settings.defaultExercise);
    final nativeStatusAsync = ref.watch(nativePlatformStatusProvider);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.settingsTitle)),
      body: ListView(
        padding: const EdgeInsetsDirectional.fromSTEB(
          AppSpacing.lg,
          AppSpacing.md,
          AppSpacing.lg,
          AppSpacing.xxl,
        ),
        children: [
          ProSectionHeader(title: l10n.settingsLanguageSection),
          const SizedBox(height: AppSpacing.md),
          ProCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n.settingsLanguageLabel,
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  l10n.settingsLanguageSub,
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                SizedBox(
                  width: double.infinity,
                  child: SegmentedButton<String>(
                    segments: [
                      ButtonSegment(
                        value: 'ar',
                        label: Text(l10n.languageArabic),
                      ),
                      ButtonSegment(
                        value: 'en',
                        label: Text(l10n.languageEnglish),
                      ),
                    ],
                    selected: {settings.languageCode},
                    style: SegmentedButton.styleFrom(
                      backgroundColor: AppColors.navyElevated,
                      foregroundColor: AppColors.textSecondary,
                      selectedBackgroundColor: AppColors.neonLime,
                      selectedForegroundColor: AppColors.navyBackground,
                    ),
                    onSelectionChanged: (values) {
                      if (values.isNotEmpty) {
                        notifier.setLanguageCode(values.first);
                      }
                    },
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          ProSectionHeader(title: l10n.settingsClockSection),
          const SizedBox(height: AppSpacing.md),
          ProCard(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg,
              vertical: AppSpacing.xs,
            ),
            child: Column(
              children: [
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(
                    l10n.settings24HourTitle,
                    style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  subtitle: Text(
                    l10n.settings24HourSub,
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 12,
                    ),
                  ),
                  value: settings.use24HourFormat,
                  onChanged: notifier.setUse24HourFormat,
                ),
                const Divider(color: AppColors.navyBorder, height: 1),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(
                    l10n.settingsHapticsTitle,
                    style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  subtitle: Text(
                    l10n.settingsHapticsSub,
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 12,
                    ),
                  ),
                  value: settings.hapticFeedback,
                  onChanged: notifier.setHapticFeedback,
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          ProSectionHeader(title: l10n.settingsDefaultsSection),
          const SizedBox(height: AppSpacing.md),
          ProCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(
                    l10n.settingsDefaultExercise,
                    style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  subtitle: Text(
                    defaultExercise.localizedName(l10n),
                    style: const TextStyle(
                      color: AppColors.neonLime,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  trailing: const Icon(
                    Icons.chevron_right_rounded,
                    color: AppColors.textSecondary,
                  ),
                  onTap: () => context.go(AppRoutes.exercises),
                ),
                const Divider(color: AppColors.navyBorder, height: 1),
                const SizedBox(height: AppSpacing.md),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      l10n.settingsDefaultReps,
                      style: const TextStyle(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      '${settings.defaultTargetReps}',
                      style: const TextStyle(
                        color: AppColors.neonLime,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
                Slider(
                  value: settings.defaultTargetReps.toDouble(),
                  min: 5,
                  max: 50,
                  divisions: 9,
                  onChanged: (v) => notifier.setDefaultTargetReps(v.round()),
                ),
                const Divider(color: AppColors.navyBorder, height: 1),
                const SizedBox(height: AppSpacing.md),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      l10n.settingsAlarmVolume,
                      style: const TextStyle(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      '${(settings.alarmVolume * 100).round()}%',
                      style: const TextStyle(
                        color: AppColors.neonLime,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
                Slider(
                  value: settings.alarmVolume,
                  min: 0.2,
                  max: 1.0,
                  divisions: 8,
                  onChanged: notifier.setAlarmVolume,
                ),
                const Divider(color: AppColors.navyBorder, height: 1),
                const SizedBox(height: AppSpacing.md),
                Text(
                  l10n.settingsAlarmToneLabel,
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                SizedBox(
                  width: double.infinity,
                  child: SegmentedButton<String>(
                    segments: [
                      ButtonSegment(
                        value: 'classic',
                        label: Text(l10n.settingsAlarmToneClassic),
                      ),
                      ButtonSegment(
                        value: 'chime',
                        label: Text(l10n.settingsAlarmToneChime),
                      ),
                      ButtonSegment(
                        value: 'radar',
                        label: Text(l10n.settingsAlarmToneRadar),
                      ),
                    ],
                    selected: {settings.alarmTone},
                    style: SegmentedButton.styleFrom(
                      backgroundColor: AppColors.navyElevated,
                      foregroundColor: AppColors.textSecondary,
                      selectedBackgroundColor: AppColors.neonLime,
                      selectedForegroundColor: AppColors.navyBackground,
                    ),
                    onSelectionChanged: (values) {
                      if (values.isNotEmpty) {
                        notifier.setAlarmTone(values.first);
                      }
                    },
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                const Divider(color: AppColors.navyBorder, height: 1),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(
                    l10n.settingsVibrateDefault,
                    style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  value: settings.defaultVibration,
                  onChanged: notifier.setDefaultVibration,
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          ProSectionHeader(title: l10n.settingsAiSection),
          const SizedBox(height: AppSpacing.md),
          ProCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n.settingsPoseDelegate,
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  l10n.settingsPoseDelegateSub,
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                SizedBox(
                  width: double.infinity,
                  child: SegmentedButton<String>(
                    segments: [
                      ButtonSegment(
                        value: 'gpu',
                        label: Text(l10n.settingsDelegateGpu),
                      ),
                      ButtonSegment(
                        value: 'cpu',
                        label: Text(l10n.settingsDelegateCpu),
                      ),
                    ],
                    selected: {settings.poseDelegate},
                    style: SegmentedButton.styleFrom(
                      backgroundColor: AppColors.navyElevated,
                      foregroundColor: AppColors.textSecondary,
                      selectedBackgroundColor: AppColors.neonLime,
                      selectedForegroundColor: AppColors.navyBackground,
                    ),
                    onSelectionChanged: (values) {
                      if (values.isNotEmpty) {
                        notifier.setPoseDelegate(values.first);
                      }
                    },
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),
                const Divider(color: AppColors.navyBorder, height: 1),
                const SizedBox(height: AppSpacing.md),
                nativeStatusAsync.when(
                  data: (status) => Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _StatusLine(
                        label: l10n.settingsHostOs,
                        value: status.osVersion.isEmpty
                            ? status.platformName
                            : '${status.platformName} (${status.osVersion})',
                      ),
                      const SizedBox(height: 6),
                      _StatusLine(
                        label: l10n.settingsNativeAlarmBridge,
                        value: status.alarmBridgeReady
                            ? l10n.settingsBridgeReady
                            : l10n.settingsBridgeNotAttached,
                      ),
                      const SizedBox(height: 6),
                      _StatusLine(
                        label: l10n.settingsMediaPipeBridge,
                        value: status.poseModelBundled
                            ? l10n.settingsModelBundled
                            : l10n.settingsModelPending,
                      ),
                    ],
                  ),
                  loading: () => Text(
                    l10n.settingsInspecting,
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 12,
                    ),
                  ),
                  error: (_, __) => Text(
                    l10n.errNativeBridge,
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          ProSectionHeader(title: l10n.settingsBackupSection),
          const SizedBox(height: AppSpacing.md),
          ProSecondaryButton(
            label: l10n.settingsExportBackupBtn,
            icon: Icons.download_rounded,
            onPressed: () => _exportBackup(context, ref),
          ),
          const SizedBox(height: AppSpacing.sm),
          ProSecondaryButton(
            label: l10n.settingsImportBackupBtn,
            icon: Icons.upload_file_rounded,
            onPressed: () => _importBackup(context, ref),
          ),
          const SizedBox(height: AppSpacing.xl),
          ProSectionHeader(title: l10n.settingsStorageSection),
          const SizedBox(height: AppSpacing.md),
          ProSecondaryButton(
            label: l10n.settingsResetButton,
            icon: Icons.delete_sweep_rounded,
            destructive: true,
            onPressed: () => _confirmReset(context, ref),
          ),
        ],
      ),
    );
  }
}

class _StatusLine extends StatelessWidget {
  const _StatusLine({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: AppColors.textSecondary,
            fontSize: 12,
          ),
        ),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: const TextStyle(
              color: AppColors.textPrimary,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}
