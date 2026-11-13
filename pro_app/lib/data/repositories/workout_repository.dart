import 'package:sqflite/sqflite.dart';

import '../../domain/models/dashboard_stats.dart';
import '../../domain/models/workout_session.dart';
import '../database/app_database.dart';

class WorkoutRepository {
  WorkoutRepository(this._appDatabase);

  final AppDatabase _appDatabase;

  Future<List<WorkoutSession>> getAllSessions() async {
    final db = await _appDatabase.database;
    final rows = await db.query(
      AppDatabase.workoutSessionsTable,
      orderBy: 'completed_at DESC',
    );
    return rows.map(WorkoutSession.fromMap).toList();
  }

  Future<void> insertSession(WorkoutSession session) async {
    validateSession(session);
    final db = await _appDatabase.database;
    await db.transaction((txn) async {
      await txn.insert(
        AppDatabase.workoutSessionsTable,
        session.toMap(),
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    });
  }

  Future<void> deleteSession(String id) async {
    if (id.trim().isEmpty) return;
    final db = await _appDatabase.database;
    await db.transaction((txn) async {
      await txn.delete(
        AppDatabase.workoutSessionsTable,
        where: 'id = ?',
        whereArgs: [id],
      );
    });
  }

  Future<void> clearAllSessions() async {
    await _appDatabase.clearWorkoutHistoryOnly();
  }

  Future<DashboardStats> getDashboardStats() async {
    final sessions = await getAllSessions();
    if (sessions.isEmpty) {
      return DashboardStats.empty;
    }

    var totalReps = 0;
    final uniqueDays = <DateTime>{};

    for (final session in sessions) {
      totalReps += session.completedReps;
      final local = session.completedAt.toLocal();
      uniqueDays.add(DateTime(local.year, local.month, local.day));
    }

    final streak = _calculateStreak(uniqueDays, DateTime.now());

    return DashboardStats(
      totalSessions: sessions.length,
      totalReps: totalReps,
      currentStreakDays: streak,
      lastSession: sessions.first,
    );
  }

  int _calculateStreak(Set<DateTime> completedDays, DateTime now) {
    final today = DateTime(now.year, now.month, now.day);
    var cursor = completedDays.contains(today)
        ? today
        : today.subtract(const Duration(days: 1));

    var streak = 0;
    while (completedDays.contains(cursor)) {
      streak++;
      cursor = cursor.subtract(const Duration(days: 1));
    }
    return streak;
  }

  static void validateSession(WorkoutSession session) {
    if (session.id.trim().isEmpty) {
      throw ArgumentError('Session id must not be empty');
    }
    if (session.targetReps < 1) {
      throw ArgumentError('targetReps must be at least 1');
    }
    if (session.completedReps < 0) {
      throw ArgumentError('completedReps cannot be negative');
    }
    if (session.durationSeconds < 1) {
      throw ArgumentError('durationSeconds must be at least 1');
    }
  }
}
