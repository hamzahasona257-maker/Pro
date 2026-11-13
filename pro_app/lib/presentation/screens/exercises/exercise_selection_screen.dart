import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../domain/catalog/exercise_catalog.dart';
import '../../../domain/enums/exercise_type.dart';
import '../../../domain/models/exercise_definition.dart';
import '../../../l10n/app_localizations.dart';
import '../../providers/settings_providers.dart';
import '../../widgets/pro_card.dart';
import '../../widgets/pro_icon_badge.dart';
import '../../widgets/pro_primary_button.dart';

class ExerciseSelectionScreen extends ConsumerStatefulWidget {
  const ExerciseSelectionScreen({
    super.key,
    required this.isPickerMode,
    this.initialSelection,
  });

  final bool isPickerMode;
  final ExerciseType? initialSelection;

  @override
  ConsumerState<ExerciseSelectionScreen> createState() =>
      _ExerciseSelectionScreenState();
}

class _ExerciseSelectionScreenState
    extends ConsumerState<ExerciseSelectionScreen> {
  late ExerciseType _selectedType;

  @override
  void initState() {
    super.initState();
    _selectedType =
        widget.initialSelection ?? ref.read(settingsProvider).defaultExercise;
  }

  Future<void> _confirmSelection() async {
    final l10n = AppLocalizations.of(context);
    if (widget.isPickerMode) {
      context.pop(_selectedType);
      return;
    }

    await ref.read(settingsProvider.notifier).setDefaultExercise(_selectedType);
    if (mounted) {
      final def = ExerciseCatalog.byType(_selectedType);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            l10n.exercisesDefaultUpdatedToast(def.localizedName(l10n)),
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final exercises = ExerciseCatalog.all;
    final defaultExercise = ref.watch(settingsProvider).defaultExercise;
    final selectedDef = ExerciseCatalog.byType(_selectedType);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.isPickerMode
              ? l10n.exercisesChooseChallenge
              : l10n.exercisesTitle,
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsetsDirectional.fromSTEB(
              AppSpacing.lg,
              AppSpacing.sm,
              AppSpacing.lg,
              AppSpacing.md,
            ),
            child: ProCard(
              backgroundColor: AppColors.navyElevated,
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Row(
                children: [
                  const Icon(
                    Icons.visibility_outlined,
                    color: AppColors.neonLime,
                    size: 20,
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Text(
                      l10n.exercisesOfflineNotice,
                      style: const TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 12,
                        height: 1.35,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsetsDirectional.fromSTEB(
                AppSpacing.lg,
                AppSpacing.xs,
                AppSpacing.lg,
                AppSpacing.lg,
              ),
              itemCount: exercises.length,
              separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.md),
              itemBuilder: (context, index) {
                final item = exercises[index];
                final isSelected = item.type == _selectedType;
                final isDefault =
                    !widget.isPickerMode && item.type == defaultExercise;

                return _ExerciseCard(
                  exercise: item,
                  selected: isSelected,
                  isDefault: isDefault,
                  onTap: () => setState(() => _selectedType = item.type),
                );
              },
            ),
          ),
          SafeArea(
            top: false,
            child: Container(
              padding: const EdgeInsetsDirectional.fromSTEB(
                AppSpacing.lg,
                AppSpacing.md,
                AppSpacing.lg,
                AppSpacing.lg,
              ),
              decoration: const BoxDecoration(
                color: AppColors.navySurface,
                border: Border(
                  top: BorderSide(color: AppColors.navyBorder),
                ),
              ),
              child: ProPrimaryButton(
                label: widget.isPickerMode
                    ? l10n.exercisesUseBtn(selectedDef.localizedName(l10n))
                    : l10n.exercisesSetDefaultBtn,
                icon: Icons.check_circle_outline_rounded,
                onPressed: _confirmSelection,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ExerciseCard extends StatelessWidget {
  const _ExerciseCard({
    required this.exercise,
    required this.selected,
    required this.isDefault,
    required this.onTap,
  });

  final ExerciseDefinition exercise;
  final bool selected;
  final bool isDefault;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final unit = exercise.localizedUnit(l10n);

    return ProCard(
      highlighted: selected,
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              ProIconBadge(
                icon: exercise.icon,
                accent: selected ? AppColors.neonLime : AppColors.textSecondary,
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            exercise.localizedName(l10n),
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                        ),
                        if (isDefault) ...[
                          const SizedBox(width: AppSpacing.sm),
                          Text(
                            l10n.exercisesDefaultBadge,
                            style: const TextStyle(
                              color: AppColors.neonLime,
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      exercise.localizedSubtitle(l10n),
                      style: const TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                selected
                    ? Icons.radio_button_checked_rounded
                    : Icons.radio_button_unchecked_rounded,
                color: selected ? AppColors.neonLime : AppColors.textMuted,
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            exercise.localizedDescription(l10n),
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 13,
              height: 1.4,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            '${l10n.exercisesDefaultTargetLabel(exercise.defaultTarget, unit)} · ${exercise.localizedDifficulty(l10n)} · ${exercise.localizedMuscles(l10n)}',
            style: const TextStyle(
              color: AppColors.neonLime,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          const Divider(color: AppColors.navyBorder, height: 1),
          const SizedBox(height: AppSpacing.md),
          Text(
            '${l10n.exercisesLandmarksLabel}: ${exercise.localizedLandmarks(l10n)}',
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '${l10n.exercisesMetricLabel}: ${exercise.localizedMetric(l10n)}',
            style: const TextStyle(
              color: AppColors.textMuted,
              fontSize: 11,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '${l10n.exercisesInstructionsTitle}:\n${exercise.localizedInstructions(l10n)}',
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 12,
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }
}
