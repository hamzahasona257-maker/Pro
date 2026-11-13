import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

class AppDatabase {
  AppDatabase._();

  static final AppDatabase instance = AppDatabase._();

  static const String _dbName = 'pro_fitness_alarm.db';
  static const int _dbVersion = 3;

  static const String alarmsTable = 'alarms';
  static const String workoutSessionsTable = 'workout_sessions';
  static const String metaTable = 'schema_meta';

  Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _open();
    return _database!;
  }

  Future<String> getDatabaseFilePath() async {
    final dbPath = await getDatabasesPath();
    return join(dbPath, _dbName);
  }

  Future<Database> _open() async {
    final path = await getDatabaseFilePath();

    return openDatabase(
      path,
      version: _dbVersion,
      onConfigure: (db) async {
        await db.execute('PRAGMA foreign_keys = ON');
      },
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE $alarmsTable (
            id TEXT PRIMARY KEY,
            hour INTEGER NOT NULL,
            minute INTEGER NOT NULL,
            label TEXT NOT NULL,
            is_enabled INTEGER NOT NULL DEFAULT 1,
            repeat_days TEXT NOT NULL DEFAULT '',
            exercise_type TEXT NOT NULL,
            target_reps INTEGER NOT NULL,
            vibration_enabled INTEGER NOT NULL DEFAULT 1,
            snooze_allowed INTEGER NOT NULL DEFAULT 0,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
          )
        ''');

        await db.execute('''
          CREATE TABLE $workoutSessionsTable (
            id TEXT PRIMARY KEY,
            alarm_id TEXT,
            exercise_type TEXT NOT NULL,
            target_reps INTEGER NOT NULL,
            completed_reps INTEGER NOT NULL,
            duration_seconds INTEGER NOT NULL,
            completed_at INTEGER NOT NULL
          )
        ''');

        await db.execute('''
          CREATE TABLE $metaTable (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
          )
        ''');

        await db.execute(
          'CREATE INDEX IF NOT EXISTS idx_alarms_enabled ON $alarmsTable (is_enabled)',
        );
        await db.execute(
          'CREATE INDEX IF NOT EXISTS idx_workouts_completed ON $workoutSessionsTable (completed_at DESC)',
        );

        await db.insert(
          metaTable,
          {'key': 'schema_version', 'value': '$version'},
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      },
      onUpgrade: (db, oldVersion, newVersion) async {
        // Safe additive migrations preserving all existing alarms and workout sessions
        if (oldVersion < 2) {
          await db.execute('''
            CREATE TABLE IF NOT EXISTS $metaTable (
              key TEXT PRIMARY KEY,
              value TEXT NOT NULL
            )
          ''');
          await db.execute(
            'CREATE INDEX IF NOT EXISTS idx_alarms_enabled ON $alarmsTable (is_enabled)',
          );
          await db.execute(
            'CREATE INDEX IF NOT EXISTS idx_workouts_completed ON $workoutSessionsTable (completed_at DESC)',
          );
        }
        if (oldVersion < 3) {
          await db.execute(
            'CREATE INDEX IF NOT EXISTS idx_workouts_exercise ON $workoutSessionsTable (exercise_type)',
          );
          await db.insert(
            metaTable,
            {
              'key': 'last_migrated_at',
              'value': '${DateTime.now().millisecondsSinceEpoch}',
            },
            conflictAlgorithm: ConflictAlgorithm.replace,
          );
        }
        await db.insert(
          metaTable,
          {'key': 'schema_version', 'value': '$newVersion'},
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      },
    );
  }

  Future<void> clearWorkoutHistoryOnly() async {
    final db = await database;
    await db.transaction((txn) async {
      await txn.delete(workoutSessionsTable);
    });
  }

  Future<void> clearAllData() async {
    final db = await database;
    await db.transaction((txn) async {
      await txn.delete(alarmsTable);
      await txn.delete(workoutSessionsTable);
    });
  }
}
