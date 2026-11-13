# Keep PRO native bridge classes and Flutter v2 plugin/channel registrations
-keep class com.pro.fitnessalarm.** { *; }
-keep class io.flutter.plugins.** { *; }
-keep class io.flutter.embedding.** { *; }

# Keep MediaPipe Pose Landmarker JNI classes when enabled
-keep class com.google.mediapipe.** { *; }
-dontwarn com.google.mediapipe.**
