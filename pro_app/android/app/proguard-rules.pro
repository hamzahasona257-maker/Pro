# Keep PRO native bridge classes and Flutter Method/Event channels
-keep class com.pro.fitnessalarm.** { *; }

# Keep MediaPipe Pose Landmarker JNI classes when enabled
-keep class com.google.mediapipe.** { *; }
-dontwarn com.google.mediapipe.**
