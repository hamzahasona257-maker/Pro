import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';
import '../enums/exercise_type.dart';

class ExerciseDefinition {
  const ExerciseDefinition({
    required this.type,
    required this.defaultTarget,
    required this.minTarget,
    required this.maxTarget,
    required this.step,
    required this.isTimeBased,
    required this.icon,
  });

  final ExerciseType type;
  final int defaultTarget;
  final int minTarget;
  final int maxTarget;
  final int step;
  final bool isTimeBased;
  final IconData icon;

  String localizedName(AppLocalizations l10n) {
    switch (type) {
      case ExerciseType.squats:
        return l10n.exSquatsName;
      case ExerciseType.pushUps:
        return l10n.exPushUpsName;
      case ExerciseType.jumpingJacks:
        return l10n.exJumpingJacksName;
      case ExerciseType.lunges:
        return l10n.exLungesName;
      case ExerciseType.plankHold:
        return l10n.exPlankName;
    }
  }

  String localizedSubtitle(AppLocalizations l10n) {
    switch (type) {
      case ExerciseType.squats:
        return l10n.exSquatsSubtitle;
      case ExerciseType.pushUps:
        return l10n.exPushUpsSubtitle;
      case ExerciseType.jumpingJacks:
        return l10n.exJumpingJacksSubtitle;
      case ExerciseType.lunges:
        return l10n.exLungesSubtitle;
      case ExerciseType.plankHold:
        return l10n.exPlankSubtitle;
    }
  }

  String localizedDescription(AppLocalizations l10n) {
    switch (type) {
      case ExerciseType.squats:
        return l10n.exSquatsDesc;
      case ExerciseType.pushUps:
        return l10n.exPushUpsDesc;
      case ExerciseType.jumpingJacks:
        return l10n.exJumpingJacksDesc;
      case ExerciseType.lunges:
        return l10n.exLungesDesc;
      case ExerciseType.plankHold:
        return l10n.exPlankDesc;
    }
  }

  String localizedMuscles(AppLocalizations l10n) {
    switch (type) {
      case ExerciseType.squats:
        return l10n.exSquatsMuscles;
      case ExerciseType.pushUps:
        return l10n.exPushUpsMuscles;
      case ExerciseType.jumpingJacks:
        return l10n.exJumpingJacksMuscles;
      case ExerciseType.lunges:
        return l10n.exLungesMuscles;
      case ExerciseType.plankHold:
        return l10n.exPlankMuscles;
    }
  }

  String localizedLandmarks(AppLocalizations l10n) {
    switch (type) {
      case ExerciseType.squats:
        return l10n.exSquatsLandmarks;
      case ExerciseType.pushUps:
        return l10n.exPushUpsLandmarks;
      case ExerciseType.jumpingJacks:
        return l10n.exJumpingJacksLandmarks;
      case ExerciseType.lunges:
        return l10n.exLungesLandmarks;
      case ExerciseType.plankHold:
        return l10n.exPlankLandmarks;
    }
  }

  String localizedMetric(AppLocalizations l10n) {
    switch (type) {
      case ExerciseType.squats:
        return l10n.exSquatsMetric;
      case ExerciseType.pushUps:
        return l10n.exPushUpsMetric;
      case ExerciseType.jumpingJacks:
        return l10n.exJumpingJacksMetric;
      case ExerciseType.lunges:
        return l10n.exLungesMetric;
      case ExerciseType.plankHold:
        return l10n.exPlankMetric;
    }
  }

  String localizedInstructions(AppLocalizations l10n) {
    switch (type) {
      case ExerciseType.squats:
        return l10n.exSquatsInstructions;
      case ExerciseType.pushUps:
        return l10n.exPushUpsInstructions;
      case ExerciseType.jumpingJacks:
        return l10n.exJumpingJacksInstructions;
      case ExerciseType.lunges:
        return l10n.exLungesInstructions;
      case ExerciseType.plankHold:
        return l10n.exPlankInstructions;
    }
  }

  String localizedUnit(AppLocalizations l10n) {
    return isTimeBased ? l10n.unitSec : l10n.unitReps;
  }

  String localizedDifficulty(AppLocalizations l10n) {
    switch (type) {
      case ExerciseType.jumpingJacks:
        return l10n.difficultyLight;
      case ExerciseType.pushUps:
        return l10n.difficultyHard;
      case ExerciseType.squats:
      case ExerciseType.lunges:
      case ExerciseType.plankHold:
        return l10n.difficultyModerate;
    }
  }
}
