# Privacy Policy — PRO Smart Fitness Alarm
# سياسة الخصوصية — تطبيق PRO منبه اللياقة الذكي

*Last updated / آخر تحديث: 2026-11-12*

---

## English

### 1. Zero Cloud Data Collection
**PRO** is a strictly offline-first mobile application. We do not operate user accounts, analytics trackers, advertising SDKs, or remote cloud servers. All alarms, workout sessions, streaks, and user preferences are stored exclusively in local storage on your device (`sqflite` and `SharedPreferences`).

### 2. Camera & On-Device AI Processing
- Camera access (`CAMERA` / `NSCameraUsageDescription`) is requested solely to verify physical exercises required to dismiss an active alarm.
- Skeletal landmark inference runs **100% locally on your device** via MediaPipe Pose Landmarker (GPU/CPU).
- Video frames and skeletal coordinates are processed transiently in volatile memory and are **never recorded, saved to gallery, or transmitted** over any network.

### 3. Notifications, Exact Alarms & Audio
- Alarm schedules, exact-alarm permissions (`SCHEDULE_EXACT_ALARM`), and foreground playback exist exclusively to fire wake-up alerts reliably at your chosen times.
- Switching between Arabic and English updates local preferences and re-syncs local notification strings on-device only.

### 4. User Control & Data Deletion
You can delete any individual alarm or permanently clear all local alarms, workout history, and preferences at any time inside **Settings → Reset All Local Data**, or by uninstalling the app.

---

## العربية

### ١. عدم جمع البيانات سحابياً
تطبيق **PRO** يعمل محلياً بالكامل بدون إنترنت. لا نستخدم حسابات مستخدمين أو أدوات تتبع أو إعلانات أو خوادم سحابية. جميع المنبهات وجلسات التمارين وسلاسل الإنجاز والتفضيلات تُحفظ حصرياً في التخزين المحلي على جهازك.

### ٢. الكاميرا ومعالجة الذكاء الاصطناعي على الجهاز
- يُطلب إذن الكاميرا فقط للتحقق من أداء التمرين البدني المطلوب لإيقاف المنبه النشط.
- يعمل كاشف الوضعية MediaPipe Pose Landmarker **محلياً ١٠٠٪ على جهازك** (عبر GPU أو CPU).
- تتم معالجة إطارات الفيديو ونقاط المفاصل لحظياً في الذاكرة المؤقتة ولا يتم تسجيل الفيديو أو حفظه أو إرساله إلى أي جهة خارجية مطلقاً.

### ٣. الإشعارات والمنبهات الدقيقة والصوت
- تُستخدم أذونات المنبه الدقيق والإشعارات والتشغيل في المقدمة حصرياً لضمان رنين المنبه في مواعيده المحددة.
- يتم حفظ تفضيل اللغة العربية أو الإنجليزية وتحديث نصوص الإشعارات محلياً على جهازك فقط.

### ٤. تحكم المستخدم وحذف البيانات
يمكنك حذف أي منبه منفرد أو مسح جميع المنبهات وسجل التمارين والتفضيلات نهائياً في أي وقت من خلال **الإعدادات ← مسح جميع البيانات المحلية** أو عبر إلغاء تثبيت التطبيق.
