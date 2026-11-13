import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../domain/enums/exercise_type.dart';
import '../../domain/models/alarm_model.dart';
import '../../presentation/screens/alarm_ring/alarm_ring_screen.dart';
import '../../presentation/screens/alarms/add_alarm_screen.dart';
import '../../presentation/screens/alarms/alarms_screen.dart';
import '../../presentation/screens/dashboard/dashboard_screen.dart';
import '../../presentation/screens/exercises/exercise_selection_screen.dart';
import '../../presentation/screens/history/activity_history_screen.dart';
import '../../presentation/screens/settings/settings_screen.dart';
import '../../presentation/widgets/pro_bottom_nav_shell.dart';

abstract final class AppRoutes {
  static const String dashboard = '/dashboard';
  static const String alarms = '/alarms';
  static const String addAlarm = '/alarms/add';
  static const String editAlarm = '/alarms/edit/:id';
  static const String exercises = '/exercises';
  static const String exercisePicker = '/exercise-picker';
  static const String settings = '/settings';
  static const String history = '/history';
  static const String alarmRing = '/alarm-ring';
}

final _rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'root');

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: AppRoutes.dashboard,
    routes: [
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return ProBottomNavShell(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.dashboard,
                builder: (context, state) => const DashboardScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.alarms,
                builder: (context, state) => const AlarmsScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.exercises,
                builder: (context, state) => const ExerciseSelectionScreen(
                  isPickerMode: false,
                ),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.settings,
                builder: (context, state) => const SettingsScreen(),
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: AppRoutes.addAlarm,
        builder: (context, state) => const AddAlarmScreen(),
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: AppRoutes.editAlarm,
        builder: (context, state) {
          final alarmId = state.pathParameters['id'];
          return AddAlarmScreen(alarmId: alarmId);
        },
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: AppRoutes.exercisePicker,
        builder: (context, state) {
          final initial = state.extra as ExerciseType?;
          return ExerciseSelectionScreen(
            isPickerMode: true,
            initialSelection: initial,
          );
        },
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: AppRoutes.history,
        builder: (context, state) => const ActivityHistoryScreen(),
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: AppRoutes.alarmRing,
        builder: (context, state) {
          final alarm = state.extra;
          if (alarm is! AlarmModel) {
            return const AlarmsScreen();
          }
          return AlarmRingScreen(alarm: alarm);
        },
      ),
    ],
  );
});
