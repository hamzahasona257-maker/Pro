import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/router/app_router.dart';
import '../../../core/utils/time_formatter.dart';
import '../../../domain/catalog/exercise_catalog.dart';
import '../../../domain/enums/exercise_type.dart';
import '../../../domain/enums/weekday.dart';
import '../../../l10n/app_localizations.dart';
import '../../providers/alarm_providers.dart';
import '../../providers/database_providers.dart';
import '../../providers/settings_providers.dart';
import '../../widgets/pro_card.dart';
import '../../widgets/pro_day_chip.dart';
import '../../widgets/pro_icon_badge.dart';
import '../../widgets/pro_primary_button.dart';
import '../../widgets/pro_section_header.dart';

class AddAlarmScreen extends ConsumerStatefulWidget {
  const AddAlarmScreen({
    super.key,
    this.alarmId,
  });

  final String? alarmId;

  @override
  ConsumerState<AddAlarmScreen> createState() => _AddAlarmScreenState();
}

class _AddAlarmScreenState extends ConsumerState<AddAlarmScreen> {
  final _labelController = TextEditingController();

  late TimeOfDay _selectedTime;
  late Set<Weekday> _repeatDays;
  late ExerciseType _exerciseType;
  late int _targetReps;
  late bool _vibrationEnabled;
  late bool _snoozeAllowed;
  bool _isEnabled = true;
  bool _isSaving = false;
  bool _isLoadingExisting = false;

  bool get _isEditMode => widget.alarmId != null;

  @override
  void initState() {
    super.initState();
    final settings = ref.read(settingsProvider);
    _selectedTime = const TimeOfDay(hour: 7, minute: 0);
    _repeatDays = {};
    _exerciseType = settings.defaultExercise;
    final definition = ExerciseCatalog.byType(_exerciseType);
    _targetReps = settings.defaultTargetReps.clamp(
      definition.minTarget,
      definition.maxTarget,
    );
    _vibrationEnabled = settings.defaultVibration;
    _snoozeAllowed = false;

    if (_isEditMode) {
      _loadExistingAlarm();
    }
  }

  Future<void> _loadExistingAlarm() async {
    setState(() => _isLoadingExisting = true);
    final existing = await ref
        .read(alarmRepositoryProvider)
        .getAlarmById(widget.alarmId!);
    if (!mounted) return;
    if (existing != null) {
      setState(() {
        _selectedTime = TimeOfDay(
          hour: existing.hour,
          minute: existing.minute,
        );
        _labelController.text = existing.label;
        _repeatDays = existing.repeatDays.toSet();
        _exerciseType = existing.exerciseType;
        _targetReps = existing.targetReps;
        _vibrationEnabled = existing.vibrationEnabled;
        _snoozeAllowed = existing.snoozeAllowed;
        _isEnabled = existing.isEnabled;
      });
    }
    setState(() => _isLoadingExisting = false);
  }

  @override
  void dispose() {
    _labelController.dispose();
    super.dispose();
  }

  Future<void> _pickTime() async {
    final use24Hour = ref.read(settingsProvider).use24HourFormat;
    final picked = await showTimePicker(
      context: context,
      initialTime: _selectedTime,
      builder: (context, child) {
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(
            alwaysUse24HourFormat: use24Hour,
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() => _selectedTime = picked);
    }
  }

  Future<void> _pickExercise() async {
    final picked = await context.push<ExerciseType>(
      AppRoutes.exercisePicker,
      extra: _exerciseType,
    );
    if (picked != null && mounted) {
      final definition = ExerciseCatalog.byType(picked);
      setState(() {
        _exerciseType = picked;
        _targetReps = definition.defaultTarget;
      });
    }
  }

  void _toggleDay(Weekday day) {
    setState(() {
      if (_repeatDays.contains(day)) {
        _repeatDays.remove(day);
      } else {
        _repeatDays.add(day);
      }
    });
  }

  Future<void> _save() async {
    final l10n = AppLocalizations.of(context);
    final settings = ref.read(settingsProvider);
    final exercise = ExerciseCatalog.byType(_exerciseType);

    setState(() => _isSaving = true);
    try {
      await ref.read(alarmsProvider.notifier).saveAlarm(
            existingId: widget.alarmId,
            hour: _selectedTime.hour,
            minute: _selectedTime.minute,
            label: _labelController.text,
            fallbackLabel: l10n.alarmDefaultLabel,
            repeatDays: _repeatDays.toList(),
            exerciseType: _exerciseType,
            targetReps: _targetReps,
            vibrationEnabled: _vibrationEnabled,
            snoozeAllowed: _snoozeAllowed,
            notificationTitle: l10n.notifAlarmTitle,
            notificationBody: l10n.notifAlarmBody(
              _targetReps,
              exercise.localizedUnit(l10n),
              exercise.localizedName(l10n),
            ),
            localeCode: settings.languageCode,
            isEnabled: _isEnabled,
          );
      if (mounted) {
        final effectiveLabel = _labelController.text.trim().isEmpty
            ? l10n.alarmDefaultLabel
            : _labelController.text.trim();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              _isEditMode
                  ? l10n.alarmUpdatedToast(effectiveLabel)
                  : l10n.alarmSavedToast(effectiveLabel),
            ),
          ),
        );
        context.pop();
      }
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final use24Hour = ref.watch(settingsProvider).use24HourFormat;
    final exercise = ExerciseCatalog.byType(_exerciseType);
    final timeStr = TimeFormatter.formatTime(
      hour: _selectedTime.hour,
      minute: _selectedTime.minute,
      use24Hour: use24Hour,
    );
    final unit = exercise.localizedUnit(l10n);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          _isEditMode ? l10n.alarmFormEditTitle : l10n.alarmFormNewTitle,
        ),
      ),
      body: _isLoadingExisting
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.neonLime),
            )
          : SingleChildScrollView(
              padding: const EdgeInsetsDirectional.fromSTEB(
                AppSpacing.lg,
                AppSpacing.md,
                AppSpacing.lg,
                AppSpacing.xxl,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ProCard(
                    highlighted: true,
                    onTap: _pickTime,
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.xl,
                      vertical: AppSpacing.xl,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              l10n.alarmTimeLabel,
                              style: const TextStyle(
                                color: AppColors.neonLime,
                                fontSize: 12,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const SizedBox(height: AppSpacing.xs),
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.baseline,
                              textBaseline: TextBaseline.alphabetic,
                              children: [
                                Text(
                                  timeStr,
                                  style: Theme.of(context).textTheme.displayLarge,
                                ),
                                if (!use24Hour) ...[
                                  const SizedBox(width: AppSpacing.sm),
                                  Text(
                                    TimeFormatter.formatPeriod(
                                      _selectedTime.hour,
                                      l10n,
                                    ),
                                    style: const TextStyle(
                                      color: AppColors.neonLime,
                                      fontSize: 18,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ],
                        ),
                        const ProIconBadge(
                          icon: Icons.schedule_rounded,
                          size: 50,
                          iconSize: 24,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xl),
                  ProSectionHeader(title: l10n.alarmLabelTitle),
                  const SizedBox(height: AppSpacing.sm),
                  TextField(
                    controller: _labelController,
                    textCapitalization: TextCapitalization.sentences,
                    style: const TextStyle(color: AppColors.textPrimary),
                    decoration: InputDecoration(
                      hintText: l10n.alarmLabelPlaceholder,
                      prefixIcon: const Icon(
                        Icons.label_outline_rounded,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xl),
                  ProSectionHeader(
                    title: l10n.alarmRepeatTitle,
                    actionLabel: _repeatDays.isEmpty
                        ? l10n.alarmRepeatWeekdaysAction
                        : l10n.alarmRepeatClearAction,
                    onAction: () {
                      setState(() {
                        if (_repeatDays.isEmpty) {
                          _repeatDays = {
                            Weekday.monday,
                            Weekday.tuesday,
                            Weekday.wednesday,
                            Weekday.thursday,
                            Weekday.friday,
                          };
                        } else {
                          _repeatDays.clear();
                        }
                      });
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  ProCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: Weekday.values
                              .map(
                                (day) => ProDayChip(
                                  day: day,
                                  selected: _repeatDays.contains(day),
                                  onTap: () => _toggleDay(day),
                                ),
                              )
                              .toList(),
                        ),
                        const SizedBox(height: AppSpacing.md),
                        Text(
                          TimeFormatter.formatRepeatSummary(
                            _repeatDays.toList(),
                            l10n,
                          ),
                          style: const TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xl),
                  ProSectionHeader(title: l10n.alarmExerciseTitle),
                  const SizedBox(height: AppSpacing.md),
                  ProCard(
                    onTap: _pickExercise,
                    child: Row(
                      children: [
                        ProIconBadge(icon: exercise.icon),
                        const SizedBox(width: AppSpacing.md),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                exercise.localizedName(l10n),
                                style: Theme.of(context).textTheme.titleMedium,
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
                        Text(
                          l10n.alarmExerciseChange,
                          style: const TextStyle(
                            color: AppColors.neonLime,
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(
                          Icons.chevron_right_rounded,
                          color: AppColors.neonLime,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  ProCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              l10n.alarmRequiredTarget,
                              style: const TextStyle(
                                color: AppColors.textPrimary,
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            Text(
                              '$_targetReps $unit',
                              style: const TextStyle(
                                color: AppColors.neonLime,
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        Slider(
                          value: _targetReps.toDouble(),
                          min: exercise.minTarget.toDouble(),
                          max: exercise.maxTarget.toDouble(),
                          divisions:
                              (exercise.maxTarget - exercise.minTarget) ~/
                                  exercise.step,
                          onChanged: (val) {
                            setState(() => _targetReps = val.round());
                          },
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '${exercise.minTarget} $unit',
                              style: const TextStyle(
                                color: AppColors.textMuted,
                                fontSize: 12,
                              ),
                            ),
                            Text(
                              '${exercise.maxTarget} $unit',
                              style: const TextStyle(
                                color: AppColors.textMuted,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xl),
                  ProSectionHeader(title: l10n.alarmBehaviorTitle),
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
                            l10n.alarmVibrationTitle,
                            style: const TextStyle(
                              color: AppColors.textPrimary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          subtitle: Text(
                            l10n.alarmVibrationSub,
                            style: const TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 12,
                            ),
                          ),
                          value: _vibrationEnabled,
                          onChanged: (val) =>
                              setState(() => _vibrationEnabled = val),
                        ),
                        const Divider(color: AppColors.navyBorder, height: 1),
                        SwitchListTile(
                          contentPadding: EdgeInsets.zero,
                          title: Text(
                            l10n.alarmSnoozeTitle,
                            style: const TextStyle(
                              color: AppColors.textPrimary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          subtitle: Text(
                            l10n.alarmSnoozeSub,
                            style: const TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 12,
                            ),
                          ),
                          value: _snoozeAllowed,
                          onChanged: (val) =>
                              setState(() => _snoozeAllowed = val),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xl),
                  ProPrimaryButton(
                    label: _isEditMode
                        ? l10n.alarmUpdateButton
                        : l10n.alarmSaveButton,
                    icon: Icons.check_rounded,
                    isLoading: _isSaving,
                    onPressed: _save,
                  ),
                ],
              ),
            ),
    );
  }
}
