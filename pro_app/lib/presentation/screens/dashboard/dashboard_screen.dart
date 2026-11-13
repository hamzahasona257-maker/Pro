import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/router/app_router.dart';
import '../../../core/utils/time_formatter.dart';
import '../../../domain/catalog/exercise_catalog.dart';
import '../../../domain/models/alarm_model.dart';
import '../../../domain/models/dashboard_stats.dart';
import '../../../l10n/app_localizations.dart';
import '../../providers/alarm_providers.dart';
import '../../providers/settings_providers.dart';
import '../../providers/workout_providers.dart';
import '../../widgets/pro_card.dart';
import '../../widgets/pro_icon_badge.dart';
import '../../widgets/pro_primary_button.dart';
import '../../widgets/pro_section_header.dart';
import '../../widgets/pro_stat_tile.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final alarmsAsync = ref.watch(alarmsProvider);
    final nextAlarm = ref.watch(nextScheduledAlarmProvider);
    final statsAsync = ref.watch(dashboardStatsProvider);
    final settings = ref.watch(settingsProvider);
    final now = DateTime.now();

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          color: AppColors.neonLime,
          backgroundColor: AppColors.navySurface,
          onRefresh: () async {
            await ref.read(alarmsProvider.notifier).refresh();
            ref.invalidate(dashboardStatsProvider);
            ref.invalidate(workoutSessionsProvider);
          },
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              SliverPadding(
                padding: const EdgeInsetsDirectional.fromSTEB(
                  AppSpacing.lg,
                  AppSpacing.lg,
                  AppSpacing.lg,
                  AppSpacing.xxl,
                ),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    _DashboardHeader(
                      dateLabel: TimeFormatter.formatCurrentDate(now, l10n),
                    ),
                    const SizedBox(height: AppSpacing.xl),
                    _NextAlarmHero(
                      nextAlarm: nextAlarm,
                      use24Hour: settings.use24HourFormat,
                      now: now,
                      onCreateAlarm: () => context.push(AppRoutes.addAlarm),
                      onOpenAlarm: (alarm) =>
                          context.push('/alarms/edit/${alarm.id}'),
                    ),
                    const SizedBox(height: AppSpacing.xl),
                    ProSectionHeader(
                      title: l10n.dashboardVerifiedPerformance,
                      actionLabel: l10n.dashboardViewHistory,
                      onAction: () => context.push(AppRoutes.history),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    statsAsync.when(
                      data: (stats) => _StatsRow(stats: stats),
                      loading: () =>
                          const _StatsRow(stats: DashboardStats.empty),
                      error: (_, __) =>
                          const _StatsRow(stats: DashboardStats.empty),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      l10n.dashboardVerifiedNote,
                      style: const TextStyle(
                        color: AppColors.textMuted,
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.xl),
                    ProSectionHeader(title: l10n.dashboardQuickActions),
                    const SizedBox(height: AppSpacing.md),
                    _QuickActionGrid(
                      onNewAlarm: () => context.push(AppRoutes.addAlarm),
                      onManageAlarms: () => context.go(AppRoutes.alarms),
                      onSelectExercise: () => context.go(AppRoutes.exercises),
                      onOpenSettings: () => context.go(AppRoutes.settings),
                    ),
                    const SizedBox(height: AppSpacing.xl),
                    ProSectionHeader(
                      title: l10n.dashboardScheduledAlarms,
                      actionLabel: l10n.dashboardViewAll,
                      onAction: () => context.go(AppRoutes.alarms),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    alarmsAsync.when(
                      data: (alarms) => _AlarmsPreview(
                        alarms: alarms,
                        use24Hour: settings.use24HourFormat,
                        onToggle: (alarm, value) {
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
                        onTapAlarm: (alarm) =>
                            context.push('/alarms/edit/${alarm.id}'),
                        onCreateAlarm: () => context.push(AppRoutes.addAlarm),
                      ),
                      loading: () => const Center(
                        child: Padding(
                          padding: EdgeInsets.all(AppSpacing.xl),
                          child: CircularProgressIndicator(
                            color: AppColors.neonLime,
                          ),
                        ),
                      ),
                      error: (_, __) => ProCard(
                        child: Text(
                          l10n.errDatabaseLoad,
                          style: const TextStyle(color: AppColors.error),
                        ),
                      ),
                    ),
                  ]),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DashboardHeader extends StatelessWidget {
  const _DashboardHeader({required this.dateLabel});

  final String dateLabel;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.neonLime,
                      borderRadius: BorderRadius.circular(
                        AppSpacing.radiusPill,
                      ),
                    ),
                    child: Text(
                      l10n.appName,
                      style: const TextStyle(
                        color: AppColors.navyBackground,
                        fontSize: 13,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Flexible(
                    child: Text(
                      l10n.appTagline,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                dateLabel,
                style: Theme.of(context).textTheme.headlineMedium,
              ),
            ],
          ),
        ),
        IconButton(
          onPressed: () => context.go(AppRoutes.settings),
          tooltip: l10n.a11yOpenSettings,
          style: IconButton.styleFrom(
            backgroundColor: AppColors.navySurface,
            side: const BorderSide(color: AppColors.navyBorder),
            padding: const EdgeInsets.all(12),
          ),
          icon: const Icon(
            Icons.tune_rounded,
            color: AppColors.textPrimary,
            size: 20,
          ),
        ),
      ],
    );
  }
}

class _NextAlarmHero extends StatelessWidget {
  const _NextAlarmHero({
    required this.nextAlarm,
    required this.use24Hour,
    required this.now,
    required this.onCreateAlarm,
    required this.onOpenAlarm,
  });

  final AlarmModel? nextAlarm;
  final bool use24Hour;
  final DateTime now;
  final VoidCallback onCreateAlarm;
  final void Function(AlarmModel alarm) onOpenAlarm;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    if (nextAlarm == null) {
      return ProCard(
        highlighted: false,
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const ProIconBadge(icon: Icons.alarm_add_rounded),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        l10n.dashboardNoActiveAlarm,
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        l10n.dashboardNoActiveAlarmDesc,
                        style: const TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),
            ProPrimaryButton(
              label: l10n.dashboardCreateSmartAlarm,
              icon: Icons.add_rounded,
              onPressed: onCreateAlarm,
            ),
          ],
        ),
      );
    }

    final alarm = nextAlarm!;
    final triggerAt = alarm.nextTriggerTime(now);
    final countdown = TimeFormatter.formatCountdown(
      triggerAt.difference(now),
      l10n,
    );
    final exercise = ExerciseCatalog.byType(alarm.exerciseType);
    final formattedTime = TimeFormatter.formatTime(
      hour: alarm.hour,
      minute: alarm.minute,
      use24Hour: use24Hour,
    );

    return ProCard(
      highlighted: true,
      onTap: () => onOpenAlarm(alarm),
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 5,
                ),
                decoration: BoxDecoration(
                  color: AppColors.neonLime.withValues(alpha: 0.16),
                  borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.bolt_rounded,
                      color: AppColors.neonLime,
                      size: 15,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${l10n.dashboardNextAlarm} · $countdown',
                      style: const TextStyle(
                        color: AppColors.neonLime,
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.arrow_forward_ios_rounded,
                size: 14,
                color: AppColors.textSecondary,
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                formattedTime,
                style: Theme.of(context).textTheme.displayLarge,
              ),
              if (!use24Hour) ...[
                const SizedBox(width: AppSpacing.sm),
                Text(
                  TimeFormatter.formatPeriod(alarm.hour, l10n),
                  style: const TextStyle(
                    color: AppColors.neonLime,
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            alarm.label,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 15,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.navyBackground.withValues(alpha: 0.65),
              borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
              border: Border.all(color: AppColors.navyBorder),
            ),
            child: Row(
              children: [
                Icon(exercise.icon, color: AppColors.neonLime, size: 20),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(
                    l10n.dashboardDismissChallenge(
                      alarm.targetReps,
                      exercise.localizedUnit(l10n),
                      exercise.localizedName(l10n),
                    ),
                    style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatsRow extends StatelessWidget {
  const _StatsRow({required this.stats});

  final DashboardStats stats;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    return Row(
      children: [
        Expanded(
          child: ProStatTile(
            label: l10n.statStreak,
            value: l10n.statStreakValue(stats.currentStreakDays),
            icon: Icons.local_fire_department_rounded,
          ),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: ProStatTile(
            label: l10n.statWorkouts,
            value: '${stats.totalSessions}',
            icon: Icons.check_circle_outline_rounded,
            accent: AppColors.success,
          ),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: ProStatTile(
            label: l10n.statTotalReps,
            value: '${stats.totalReps}',
            icon: Icons.fitness_center_rounded,
            accent: AppColors.info,
          ),
        ),
      ],
    );
  }
}

class _QuickActionGrid extends StatelessWidget {
  const _QuickActionGrid({
    required this.onNewAlarm,
    required this.onManageAlarms,
    required this.onSelectExercise,
    required this.onOpenSettings,
  });

  final VoidCallback onNewAlarm;
  final VoidCallback onManageAlarms;
  final VoidCallback onSelectExercise;
  final VoidCallback onOpenSettings;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: AppSpacing.md,
      crossAxisSpacing: AppSpacing.md,
      childAspectRatio: 1.55,
      children: [
        _QuickActionTile(
          icon: Icons.add_alarm_rounded,
          title: l10n.quickAddAlarm,
          subtitle: l10n.quickAddAlarmSub,
          onTap: onNewAlarm,
        ),
        _QuickActionTile(
          icon: Icons.alarm_on_rounded,
          title: l10n.quickAllAlarms,
          subtitle: l10n.quickAllAlarmsSub,
          onTap: onManageAlarms,
        ),
        _QuickActionTile(
          icon: Icons.fitness_center_rounded,
          title: l10n.quickExercises,
          subtitle: l10n.quickExercisesSub,
          onTap: onSelectExercise,
        ),
        _QuickActionTile(
          icon: Icons.settings_rounded,
          title: l10n.quickSettings,
          subtitle: l10n.quickSettingsSub,
          onTap: onOpenSettings,
        ),
      ],
    );
  }
}

class _QuickActionTile extends StatelessWidget {
  const _QuickActionTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ProCard(
      onTap: onTap,
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          ProIconBadge(icon: icon, size: 36, iconSize: 18),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                ),
              ),
              Text(
                subtitle,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _AlarmsPreview extends StatelessWidget {
  const _AlarmsPreview({
    required this.alarms,
    required this.use24Hour,
    required this.onToggle,
    required this.onTapAlarm,
    required this.onCreateAlarm,
  });

  final List<AlarmModel> alarms;
  final bool use24Hour;
  final void Function(AlarmModel alarm, bool value) onToggle;
  final void Function(AlarmModel alarm) onTapAlarm;
  final VoidCallback onCreateAlarm;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    if (alarms.isEmpty) {
      return ProCard(
        onTap: onCreateAlarm,
        child: Row(
          children: [
            const ProIconBadge(
              icon: Icons.alarm_off_rounded,
              accent: AppColors.textMuted,
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Text(
                l10n.dashboardNoAlarmsPreview,
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 13,
                ),
              ),
            ),
            const Icon(Icons.add_rounded, color: AppColors.neonLime),
          ],
        ),
      );
    }

    final previewItems = alarms.take(3).toList();
    return Column(
      children: [
        for (var i = 0; i < previewItems.length; i++) ...[
          _AlarmCompactTile(
            alarm: previewItems[i],
            use24Hour: use24Hour,
            onToggle: (value) => onToggle(previewItems[i], value),
            onTap: () => onTapAlarm(previewItems[i]),
          ),
          if (i < previewItems.length - 1) const SizedBox(height: AppSpacing.md),
        ],
      ],
    );
  }
}

class _AlarmCompactTile extends StatelessWidget {
  const _AlarmCompactTile({
    required this.alarm,
    required this.use24Hour,
    required this.onToggle,
    required this.onTap,
  });

  final AlarmModel alarm;
  final bool use24Hour;
  final ValueChanged<bool> onToggle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final exercise = ExerciseCatalog.byType(alarm.exerciseType);
    final timeStr = TimeFormatter.formatTime(
      hour: alarm.hour,
      minute: alarm.minute,
      use24Hour: use24Hour,
    );

    return ProCard(
      onTap: onTap,
      child: Row(
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
                        fontSize: 26,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    if (!use24Hour) ...[
                      const SizedBox(width: 4),
                      Text(
                        TimeFormatter.formatPeriod(alarm.hour, l10n),
                        style: TextStyle(
                          color: alarm.isEnabled
                              ? AppColors.neonLime
                              : AppColors.textMuted,
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  '${alarm.label} · ${alarm.targetReps} ${exercise.localizedUnit(l10n)} ${exercise.localizedName(l10n)}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 13,
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
    );
  }
}
