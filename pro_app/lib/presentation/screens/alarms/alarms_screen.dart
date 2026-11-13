import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/router/app_router.dart';
import '../../../core/utils/time_formatter.dart';
import '../../../domain/catalog/exercise_catalog.dart';
import '../../../domain/models/alarm_model.dart';
import '../../../l10n/app_localizations.dart';
import '../../providers/alarm_providers.dart';
import '../../providers/settings_providers.dart';
import '../../widgets/pro_card.dart';
import '../../widgets/pro_empty_state.dart';

class AlarmsScreen extends ConsumerWidget {
  const AlarmsScreen({super.key});

  Future<void> _confirmDelete(
    BuildContext context,
    WidgetRef ref,
    AlarmModel alarm,
  ) async {
    final l10n = AppLocalizations.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.navySurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          side: const BorderSide(color: AppColors.navyBorder),
        ),
        title: Text(l10n.alarmsDeleteDialogTitle),
        content: Text(
          l10n.alarmsDeleteDialogBody(alarm.label),
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
              l10n.actionDelete,
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
      await ref.read(alarmsProvider.notifier).deleteAlarm(alarm.id);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.alarmsDeletedToast(alarm.label))),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final alarmsAsync = ref.watch(alarmsProvider);
    final settings = ref.watch(settingsProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.alarmsTitle),
        actions: [
          alarmsAsync.maybeWhen(
            data: (alarms) {
              final activeCount = alarms.where((a) => a.isEnabled).length;
              return Padding(
                padding: const EdgeInsetsDirectional.only(end: AppSpacing.lg),
                child: Center(
                  child: Text(
                    l10n.alarmsActiveSummary(activeCount, alarms.length),
                    style: const TextStyle(
                      color: AppColors.neonLime,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              );
            },
            orElse: () => const SizedBox.shrink(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push(AppRoutes.addAlarm),
        icon: const Icon(Icons.add_rounded),
        label: Text(
          l10n.alarmsAddButton,
          style: const TextStyle(fontWeight: FontWeight.w800),
        ),
      ),
      body: alarmsAsync.when(
        data: (alarms) {
          if (alarms.isEmpty) {
            return Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Center(
                child: ProEmptyState(
                  icon: Icons.alarm_add_rounded,
                  title: l10n.alarmsEmptyTitle,
                  description: l10n.alarmsEmptyDesc,
                  actionLabel: l10n.alarmsCreateFirst,
                  onAction: () => context.push(AppRoutes.addAlarm),
                ),
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsetsDirectional.fromSTEB(
              AppSpacing.lg,
              AppSpacing.md,
              AppSpacing.lg,
              100,
            ),
            itemCount: alarms.length,
            separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.md),
            itemBuilder: (context, index) {
              final alarm = alarms[index];
              return _AlarmManagementCard(
                alarm: alarm,
                use24Hour: settings.use24HourFormat,
                onTap: () => context.push('/alarms/edit/${alarm.id}'),
                onToggle: (value) {
                  final ex = ExerciseCatalog.byType(alarm.exerciseType);
                  ref.read(alarmsProvider.notifier).toggleAlarm(
                        id: alarm.id,
                        isEnabled: value,
                        notificationTitle: l10n.notifAlarmTitle,
                        notificationBody: l10n.notifAlarmBody(
                          alarm.targetReps,
                          ex.localizedUnit(l10n),
                          ex.localizedName(l10n),
                        ),
                        localeCode: settings.languageCode,
                      );
                },
                onDelete: () => _confirmDelete(context, ref, alarm),
              );
            },
          );
        },
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppColors.neonLime),
        ),
        error: (_, __) => Center(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: ProCard(
              child: Text(
                l10n.errDatabaseLoad,
                style: const TextStyle(color: AppColors.error),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _AlarmManagementCard extends StatelessWidget {
  const _AlarmManagementCard({
    required this.alarm,
    required this.use24Hour,
    required this.onTap,
    required this.onToggle,
    required this.onDelete,
  });

  final AlarmModel alarm;
  final bool use24Hour;
  final VoidCallback onTap;
  final ValueChanged<bool> onToggle;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final exercise = ExerciseCatalog.byType(alarm.exerciseType);
    final timeStr = TimeFormatter.formatTime(
      hour: alarm.hour,
      minute: alarm.minute,
      use24Hour: use24Hour,
    );
    final repeatText = TimeFormatter.formatRepeatSummary(alarm.repeatDays, l10n);

    return ProCard(
      highlighted: alarm.isEnabled,
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Text(
                          timeStr,
                          style: TextStyle(
                            color: alarm.isEnabled
                                ? AppColors.textPrimary
                                : AppColors.textMuted,
                            fontSize: 34,
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.8,
                          ),
                        ),
                        if (!use24Hour) ...[
                          const SizedBox(width: 6),
                          Text(
                            TimeFormatter.formatPeriod(alarm.hour, l10n),
                            style: TextStyle(
                              color: alarm.isEnabled
                                  ? AppColors.neonLime
                                  : AppColors.textMuted,
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      alarm.label,
                      style: TextStyle(
                        color: alarm.isEnabled
                            ? AppColors.textPrimary
                            : AppColors.textSecondary,
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              Semantics(
                label: l10n.a11yToggleAlarm(alarm.label),
                child: Switch(
                  value: alarm.isEnabled,
                  onChanged: onToggle,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          const Divider(color: AppColors.navyBorder, height: 1),
          const SizedBox(height: AppSpacing.md),
          Row(
            children: [
              Expanded(
                child: Text(
                  '${alarm.targetReps} ${exercise.localizedUnit(l10n)} ${exercise.localizedName(l10n)} · $repeatText',
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              IconButton(
                onPressed: onDelete,
                tooltip: l10n.a11yDeleteAlarm(alarm.label),
                icon: const Icon(
                  Icons.delete_outline_rounded,
                  color: AppColors.textMuted,
                  size: 20,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
