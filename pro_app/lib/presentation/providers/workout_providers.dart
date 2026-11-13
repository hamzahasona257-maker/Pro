import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/models/dashboard_stats.dart';
import '../../domain/models/workout_session.dart';
import 'database_providers.dart';

final workoutSessionsProvider = FutureProvider<List<WorkoutSession>>((ref) async {
  return ref.watch(workoutRepositoryProvider).getAllSessions();
});

final dashboardStatsProvider = FutureProvider<DashboardStats>((ref) async {
  return ref.watch(workoutRepositoryProvider).getDashboardStats();
});

