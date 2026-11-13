import 'package:flutter/material.dart';

import '../enums/exercise_type.dart';
import '../models/exercise_definition.dart';

abstract final class ExerciseCatalog {
  static const List<ExerciseDefinition> all = [
    ExerciseDefinition(
      type: ExerciseType.squats,
      defaultTarget: 15,
      minTarget: 5,
      maxTarget: 50,
      step: 5,
      isTimeBased: false,
      icon: Icons.accessibility_new_rounded,
    ),
    ExerciseDefinition(
      type: ExerciseType.pushUps,
      defaultTarget: 10,
      minTarget: 5,
      maxTarget: 40,
      step: 5,
      isTimeBased: false,
      icon: Icons.fitness_center_rounded,
    ),
    ExerciseDefinition(
      type: ExerciseType.jumpingJacks,
      defaultTarget: 20,
      minTarget: 10,
      maxTarget: 60,
      step: 5,
      isTimeBased: false,
      icon: Icons.directions_run_rounded,
    ),
    ExerciseDefinition(
      type: ExerciseType.lunges,
      defaultTarget: 12,
      minTarget: 6,
      maxTarget: 40,
      step: 2,
      isTimeBased: false,
      icon: Icons.directions_walk_rounded,
    ),
    ExerciseDefinition(
      type: ExerciseType.plankHold,
      defaultTarget: 30,
      minTarget: 15,
      maxTarget: 90,
      step: 5,
      isTimeBased: true,
      icon: Icons.timer_rounded,
    ),
  ];

  static ExerciseDefinition byType(ExerciseType type) {
    return all.firstWhere(
      (item) => item.type == type,
      orElse: () => all.first,
    );
  }
}
