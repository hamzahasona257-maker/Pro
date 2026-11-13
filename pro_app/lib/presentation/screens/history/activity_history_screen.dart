import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../domain/catalog/exercise_catalog.dart';
import '../../../domain/models/workout_session.dart';
import '../../../l10n/app_localizations.dart';
import '../../providers/database_providers.dart';
import '../../providers/workout_providers.dart';
import '../../widgets/pro_card.dart';
import '../../widgets/pro_empty_state.dart';
import '../../widgets/pro_icon_badge.dart';

class ActivityHistoryScreen extends ConsumerWidget {
  const ActivityHistoryScreen({super.key});

  Future<void> _confirmDeleteSession(
    BuildContext context,
    WidgetRef ref,
    WorkoutSession session,
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
        title: Text(l10n.historyDeleteTitle),
        content: Text(
          l10n.historyDeleteBody,
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
      await ref.read(workoutRepositoryProvider).deleteSession(session.id);
      ref.invalidate(workoutSessionsProvider);
      ref.invalidate(dashboardStatsProvider);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.historyDeletedToast)),
        );
      }
    }
  }

  Future<void> _confirmClearAllHistory(
    BuildContext context,
    WidgetRef ref,
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
        title: Text(l10n.historyClearDialogTitle),
        content: Text(
          l10n.historyClearDialogBody,
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
      // Clears ONLY workout_sessions; alarms & SharedPreferences settings remain untouched
      await ref.read(workoutRepositoryProvider).clearAllSessions();
      ref.invalidate(workoutSessionsProvider);
      ref.invalidate(dashboardStatsProvider);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.historyClearedToast)),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final sessionsAsync = ref.watch(workoutSessionsProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.historyTitle),
        actions: [
          sessionsAsync.maybeWhen(
            data: (sessions) {
              if (sessions.isEmpty) return const SizedBox.shrink();
              return TextButton.icon(
                onPressed: () => _confirmClearAllHistory(context, ref),
                icon: const Icon(
                  Icons.delete_sweep_outlined,
                  color: AppColors.error,
                  size: 18,
                ),
                label: Text(
                  l10n.historyClearAllButton,
                  style: const TextStyle(
                    color: AppColors.error,
                    fontWeight: FontWeight.w700,
                    fontSize: 12,
                  ),
                ),
              );
            },
            orElse: () => const SizedBox.shrink(),
          ),
        ],
      ),
      body: sessionsAsync.when(
        data: (sessions) {
          if (sessions.isEmpty) {
            return Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Center(
                child: ProEmptyState(
                  icon: Icons.history_rounded,
                  title: l10n.historyEmptyTitle,
                  description: l10n.historyEmptyDesc,
                ),
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsetsDirectional.fromSTEB(
              AppSpacing.lg,
              AppSpacing.md,
              AppSpacing.lg,
              AppSpacing.xxl,
            ),
            itemCount: sessions.length,
            separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.md),
            itemBuilder: (context, index) {
              final session = sessions[index];
              return _SessionHistoryCard(
                session: session,
                onDelete: () => _confirmDeleteSession(context, ref, session),
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

class _SessionHistoryCard extends StatelessWidget {
  const _SessionHistoryCard({
    required this.session,
    required this.onDelete,
  });

  final WorkoutSession session;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final exercise = ExerciseCatalog.byType(session.exerciseType);
    final formattedDate = DateFormat.yMMMd(l10n.localeName)
        .add_jm()
        .format(session.completedAt.toLocal());

    return ProCard(
      child: Row(
        children: [
          ProIconBadge(icon: exercise.icon, accent: AppColors.neonLime),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  exercise.localizedName(l10n),
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '$formattedDate · ${l10n.workoutDurationLabel}: ${session.durationSeconds}s',
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          Text(
            '${session.completedReps} ${exercise.localizedUnit(l10n)}',
            style: const TextStyle(
              color: AppColors.neonLime,
              fontSize: 14,
              fontWeight: FontWeight.w800,
            ),
          ),
          IconButton(
            onPressed: onDelete,
            tooltip: l10n.a11yDeleteSession,
            icon: const Icon(
              Icons.delete_outline_rounded,
              color: AppColors.textMuted,
              size: 20,
            ),
          ),
        ],
      ),
    );
  }
}
