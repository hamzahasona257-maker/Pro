import 'package:sqflite/sqflite.dart';

import '../../domain/models/alarm_model.dart';
import '../database/app_database.dart';

class AlarmRepository {
  AlarmRepository(this._appDatabase);

  final AppDatabase _appDatabase;

  Future<List<AlarmModel>> getAllAlarms() async {
    final db = await _appDatabase.database;
    final rows = await db.query(
      AppDatabase.alarmsTable,
      orderBy: 'hour ASC, minute ASC, created_at DESC',
    );
    return rows.map(AlarmModel.fromMap).toList();
  }

  Future<AlarmModel?> getAlarmById(String id) async {
    if (id.trim().isEmpty) return null;
    final db = await _appDatabase.database;
    final rows = await db.query(
      AppDatabase.alarmsTable,
      where: 'id = ?',
      whereArgs: [id],
      limit: 1,
    );
    if (rows.isEmpty) return null;
    return AlarmModel.fromMap(rows.first);
  }

  Future<void> upsertAlarm(AlarmModel alarm) async {
    validateAlarm(alarm);
    final db = await _appDatabase.database;
    await db.transaction((txn) async {
      await txn.insert(
        AppDatabase.alarmsTable,
        alarm.toMap(),
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    });
  }

  Future<void> setAlarmEnabled({
    required String id,
    required bool isEnabled,
  }) async {
    if (id.trim().isEmpty) {
      throw ArgumentError('Alarm id cannot be empty');
    }
    final db = await _appDatabase.database;
    await db.update(
      AppDatabase.alarmsTable,
      {
        'is_enabled': isEnabled ? 1 : 0,
        'updated_at': DateTime.now().millisecondsSinceEpoch,
      },
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  Future<void> deleteAlarm(String id) async {
    if (id.trim().isEmpty) return;
    final db = await _appDatabase.database;
    await db.transaction((txn) async {
      await txn.delete(
        AppDatabase.alarmsTable,
        where: 'id = ?',
        whereArgs: [id],
      );
    });
  }

  static void validateAlarm(AlarmModel alarm) {
    if (alarm.id.trim().isEmpty) {
      throw ArgumentError('Alarm id must not be empty');
    }
    if (alarm.hour < 0 || alarm.hour > 23) {
      throw RangeError.range(alarm.hour, 0, 23, 'hour');
    }
    if (alarm.minute < 0 || alarm.minute > 59) {
      throw RangeError.range(alarm.minute, 0, 59, 'minute');
    }
    if (alarm.targetReps < 1) {
      throw ArgumentError('targetReps must be at least 1');
    }
  }
}
