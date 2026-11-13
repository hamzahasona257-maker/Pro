# PRO — Store Submission & Release Checklist (Google Play & Apple App Store)

---

## 1. App Metadata / بيانات التطبيق

| Field | English | العربية |
|---|---|---|
| **App Name** | PRO | PRO |
| **Subtitle / Tagline** | Smart Fitness Alarm | منبه اللياقة الذكي |
| **Bundle / Package ID** | `com.pro.fitnessalarm` | `com.pro.fitnessalarm` |
| **Version** | `1.0.0` (Build `1`) | `1.0.0` (البناء `1`) |
| **Category** | Health & Fitness | الصحة واللياقة البدنية |
| **Default Language** | Arabic (`ar` RTL) + English (`en` LTR) | العربية (افتراضي RTL) + الإنجليزية (LTR) |
| **Age Rating** | 4+ / Everyone | 4+ / للجميع |
| **Monetization** | Free · No Ads · No Paid APIs | مجاني · بدون إعلانات |

---

## 2. Store Listing Copy — English

### Short Description (<= 80 chars)
Smart alarm that only stops after you verify your morning workout offline.

### Full Description
**Wake up with real movement — zero excuses, zero cloud tracking.**

PRO is a smart fitness alarm designed for people who snooze through ordinary clocks. Once your alarm rings, ordinary dismissal is locked until you complete your selected physical exercise in front of the camera.

**Key Features:**
- **Exercise-Gated Alarm Dismissal:** Choose Squats, Push-Ups, Jumping Jacks, Alternating Lunges, or Forearm Plank Hold with customizable targets.
- **100% Offline AI Pose Verification:** Powered by MediaPipe Pose Landmarker (33 skeletal keypoints) running locally on your device. No internet connection required, no video recorded, and zero cloud uploads.
- **Strict Wake-Up Discipline:** Repeat weekday schedules, adjustable alarm volume, vibration pulse, and optional one-time snooze control.
- **Verified Activity History & Streaks:** Only real completed exercise challenges count toward your daily streak, total sessions, and repetition stats.
- **Instant Bilingual Arabic & English:** Full RTL Arabic (default) and LTR English interface switching in Settings without restarting or losing alarms.

---

## 3. نص المتجر — العربية

### الوصف المختصر
منبه ذكي لا يتوقف إلا بعد إتمام تمرينك البدني أمام الكاميرا بدون إنترنت.

### الوصف الكامل
**استيقظ بالحركة الفعلية — بدون أعذار وبدون أي تتبع سحابي.**

**PRO** هو منبه لياقة ذكي مصمم لمن يغلقون المنبهات التقليدية ويعودون للنوم. عند رنين المنبه، يُمنع الإيقاف العادي حتى تكمل التمرين البدني المحدد أمام الكاميرا.

**المميزات الرئيسية:**
- **إيقاف المنبه بالتمرين:** اختر بين القرفصاء، الضغط، القفز المفتوح، الطعن المتبادل، أو ثبات البلانك مع تحديد العدد المطلوب.
- **تحقق ذكي ١٠٠٪ بدون إنترنت:** يعتمد على MediaPipe Pose Landmarker لتتبع ٣٣ نقطة مفصلية محلياً على جهازك دون تصوير محفوظ ودون إرسال أي بيانات للإنترنت.
- **انضباط كامل للاستيقاظ:** تكرار حسب أيام الأسبوع، تحكم بمستوى الصوت والاهتزاز، وخيار السماح بغفوة واحدة أو منعها.
- **سجل نشاط وسلاسل موثقة:** تُحتسب فقط جلسات التمارين المكتملة فعلياً لإيقاف المنبه.
- **واجهة عربية وإنجليزية متكاملة:** دعم كامل للغة العربية (افتراضياً من اليمين لليسار RTL) والإنجليزية مع التبديل الفوري دون إعادة تشغيل.

---

## 4. Permissions & Review Notes / توضيح الأذونات للمراجعة

1. **Camera (`CAMERA` / `NSCameraUsageDescription`):** Used strictly offline during an active alarm challenge to detect joint angles and verify exercise completion. No images or video leave the device.
2. **Exact Alarms (`SCHEDULE_EXACT_ALARM` on Android 12+):** Core app purpose — ensures scheduled wake-up alarms fire at the exact minute chosen by the user.
3. **Full-Screen Intent & Notifications (`USE_FULL_SCREEN_INTENT`, `POST_NOTIFICATIONS`):** Core alarm clock behavior so the workout dismissal screen surfaces above the lock screen when an alarm fires.
4. **Foreground Service Media Playback (`FOREGROUND_SERVICE_MEDIA_PLAYBACK`) & Audio Background Mode:** Keeps the wake-up alarm ringtone playing reliably until the user completes the exercise challenge.
5. **Boot Completed (`RECEIVE_BOOT_COMPLETED`):** Restores scheduled user alarms after device restart on Android.

---

## 5. Recommended Screenshot Plan (6 Screens × AR + EN)
1. **Dashboard Hero (`RTL` & `LTR`):** Next active alarm countdown, verified streak & stats.
2. **Alarms Management:** Active schedule cards with exercise targets & repeat days.
3. **Create Smart Alarm:** Time picker, weekday chips, exercise & rep stepper.
4. **Exercise Catalog:** 5 supported drills showing tracked MediaPipe landmarks & angle thresholds.
5. **Active Alarm Verification Challenge:** Live rep counter & form feedback prompt.
6. **Settings:** Instant Arabic/English switch, GPU/CPU inference delegate, backup/reset.

---

## 6. Release Build Commands (Run on Developer Workstation with Flutter, Android SDK & Xcode)

```bash
# 1. Bundle the MediaPipe model asset:
# Download pose_landmarker_lite.task into:
#   pro_app/android/app/src/main/assets/pose_landmarker_lite.task
# and add it to the Xcode Runner Copy Bundle Resources phase for iOS.

# 2. Verify Flutter analyzer & automated tests:
cd pro_app
flutter pub get
flutter gen-l10n
flutter analyze
flutter test

# 3. Android Release APK / AAB (after creating android/key.properties locally):
flutter build apk --release
flutter build appbundle --release

# 4. iOS Release IPA (macOS with Xcode & valid Team ID in ios/ExportOptions.plist):
flutter build ipa --release --export-options-plist=ios/ExportOptions.plist
```
