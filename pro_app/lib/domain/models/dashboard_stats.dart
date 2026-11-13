import 'workout_session.dart';

class DashboardStats {
  const DashboardStats({
    required this.totalSessions,
    required this.totalReps,
    required this.currentStreakDays,
    required this.lastSession,
  });

  static const DashboardStats empty = DashboardStats(
    totalSessions: 0,
    totalReps: 0,
    currentStreakDays: 0,
    lastSession: null,
  );

  final int totalSessions;
  final int totalReps;
  final int currentStreakDays;
  final WorkoutSession? lastSession;
}
