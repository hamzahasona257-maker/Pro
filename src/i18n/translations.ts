import { AppLanguage, ExerciseType, Weekday } from '../types/pro';

export interface ExerciseCopy {
  name: string;
  subtitle: string;
  description: string;
  muscles: string;
  landmarks: string;
  metric: string;
  instructions: string[];
}

export interface Translations {
  appName: string;
  appTagline: string;
  documentTitle: string;
  splashInitializing: string;

  onboardingTitle: string;
  onboardingSlides: { title: string; body: string }[];
  onboardingSkip: string;
  onboardingNext: string;
  onboardingDone: string;

  nav: {
    primaryLabel: string;
    mobileLabel: string;
    dashboard: string;
    alarms: string;
    exercises: string;
    settings: string;
    newAlarm: string;
  };

  dashboard: {
    nextAlarm: string;
    noActiveAlarm: string;
    noActiveAlarmDesc: string;
    createSmartAlarm: string;
    dismissChallenge: (target: number, unit: string, exercise: string) => string;
    verifiedPerformance: string;
    verifiedNote: string;
    viewHistory: string;
    quickActions: string;
    scheduledAlarms: string;
    viewAll: string;
    noAlarmsPreview: string;
    statStreak: string;
    statStreakValue: (days: number) => string;
    statWorkouts: string;
    statTotalReps: string;
    quickAddAlarm: string;
    quickAddAlarmSub: string;
    quickAllAlarms: string;
    quickAllAlarmsSub: string;
    quickExercises: string;
    quickExercisesSub: string;
    quickSettings: string;
    quickSettingsSub: string;
  };

  alarms: {
    title: string;
    activeSummary: (active: number, total: number) => string;
    addAlarm: string;
    emptyTitle: string;
    emptyDesc: string;
    createFirst: string;
    vibrateTag: string;
    testChallenge: string;
    deleteTitle: string;
    deleteBody: (label: string) => string;
    deletedToast: (label: string) => string;
  };

  alarmForm: {
    newTitle: string;
    editTitle: string;
    subtitle: string;
    alarmTime: string;
    adjust: string;
    labelTitle: string;
    labelPlaceholder: string;
    defaultLabel: string;
    repeatTitle: string;
    actionWeekdays: string;
    actionClear: string;
    exerciseTitle: string;
    changeExercise: string;
    requiredTarget: string;
    behaviorTitle: string;
    vibrationTitle: string;
    vibrationSub: string;
    snoozeTitle: string;
    snoozeSub: string;
    saveButton: string;
    updateButton: string;
    labelMaxLengthError: string;
    invalidTargetError: string;
    savedToast: (label: string) => string;
    updatedToast: (label: string) => string;
  };

  time: {
    am: string;
    pm: string;
    once: string;
    everyDay: string;
    weekdays: string;
    weekends: string;
    listSeparator: string;
    lessThanMinute: string;
    daysHours: (days: number, hours: number) => string;
    hoursMinutes: (hours: number, minutes: number) => string;
    minutesOnly: (minutes: number) => string;
    daysShort: Record<Weekday, string>;
    daysLetter: Record<Weekday, string>;
  };

  exercises: {
    title: string;
    chooseChallenge: string;
    subtitle: string;
    offlineNotice: string;
    defaultLabel: string;
    defaultTargetLabel: (target: number, unit: string) => string;
    landmarksLabel: string;
    metricLabel: string;
    instructionsTitle: string;
    setDefaultBtn: string;
    useExerciseBtn: (name: string) => string;
    defaultUpdatedToast: (name: string) => string;
    unitReps: string;
    unitSec: string;
    difficulty: Record<'light' | 'moderate' | 'hard', string>;
    items: Record<ExerciseType, ExerciseCopy>;
  };

  history: {
    title: string;
    emptyTitle: string;
    emptyDesc: string;
    sessionsLabel: string;
    cameraTitle: string;
    cameraPrompt: string;
    completeTitle: string;
    completeSubtitle: string;
    deleteTitle: string;
    deleteBody: string;
    deletedToast: string;
    clearAllButton: string;
    clearDialogTitle: string;
    clearDialogBody: string;
    clearedToast: string;
  };

  settings: {
    title: string;
    subtitle: string;
    languageSection: string;
    languageLabel: string;
    languageSub: string;
    languageArabic: string;
    languageEnglish: string;
    clockSection: string;
    use24HourTitle: string;
    use24HourSub: string;
    hapticsTitle: string;
    hapticsSub: string;
    defaultsSection: string;
    defaultExercise: string;
    defaultTargetReps: string;
    alarmVolume: string;
    alarmToneLabel: string;
    alarmToneClassic: string;
    alarmToneChime: string;
    alarmToneRadar: string;
    vibrateDefault: string;
    aiSection: string;
    poseDelegate: string;
    poseDelegateSub: string;
    delegateGpu: string;
    delegateCpu: string;
    flutterProjectLabel: string;
    flutterProjectValue: string;
    nativeChannelsLabel: string;
    nativeChannelsValue: string;
    visionLabel: string;
    visionValue: string;
    permissionsSection: string;
    replayGuideBtn: string;
    privacyBtn: string;
    backupSection: string;
    exportBackupBtn: string;
    importBackupBtn: string;
    backupExportedToast: string;
    backupConfirmTitle: string;
    backupConfirmBody: (alarmsCount: number, sessionsCount: number) => string;
    backupImportedToast: (alarmsCount: number, sessionsCount: number) => string;
    backupInvalidError: string;
    storageSection: string;
    resetButton: string;
    resetDialogTitle: string;
    resetDialogBody: string;
    resetToast: string;
  };

  alarmChallenge: {
    ringingTitle: string;
    lockedHint: string;
    audioActive: string;
    enableAudioBtn: string;
    cameraStarting: string;
    cameraLiveBadge: string;
    cameraPermissionDenied: string;
    nativeAiNote: string;
    snoozeBtn: string;
    snoozeToast: string;
    snoozeUsedBadge: string;
    finishBtn: string;
  };

  privacy: {
    title: string;
    updated: string;
    sections: { heading: string; body: string }[];
  };

  permissions: {
    cameraTitle: string;
    cameraRationale: string;
    exactAlarmTitle: string;
    exactAlarmRationale: string;
    notifTitle: string;
    notifRationale: string;
    notifPreviewTitle: string;
    notifPreviewBody: (target: number, unit: string, exercise: string) => string;
  };

  errors: {
    databaseLoad: string;
    nativeBridge: string;
    cameraUnavailable: string;
  };

  actions: {
    cancel: string;
    delete: string;
    confirmReset: string;
    close: string;
  };

  a11y: {
    toggleAlarm: (label: string) => string;
    deleteAlarm: (label: string) => string;
    testChallenge: (label: string) => string;
    deleteSession: string;
    openSettings: string;
    back: string;
    toggleVibration: string;
    toggleSnooze: string;
    toggle24Hour: string;
    toggleHaptics: string;
    toggleDefaultVibration: string;
  };
}

export const AR_TRANSLATIONS: Translations = {
  appName: 'PRO',
  appTagline: 'منبه اللياقة الذكي',
  documentTitle: 'PRO — منبه اللياقة الذكي',
  splashInitializing: 'جاري تهيئة قاعدة البيانات المحلية ومحرك الحركة بدون إنترنت...',

  onboardingTitle: 'دليل البدء والأذونات',
  onboardingSlides: [
    {
      title: 'استيقظ بالحركة',
      body: 'يستمر المنبه في الرنين حتى تكمل التمرين البدني المحدد أمام الكاميرا.',
    },
    {
      title: 'تحقق ذكي ١٠٠٪ بدون إنترنت',
      body: 'يتتبع MediaPipe Pose Landmarker ٣٣ نقطة مفصلية محلياً على جهازك دون رفع أي صور أو فيديو.',
    },
    {
      title: 'جاهز للغة العربية والإنجليزية',
      body: 'تتبدل الواجهة والإشعارات والاتجاه RTL/LTR فوراً من الإعدادات دون إعادة تشغيل.',
    },
  ],
  onboardingSkip: 'إغلاق',
  onboardingNext: 'التالي',
  onboardingDone: 'تم',

  nav: {
    primaryLabel: 'التنقل الرئيسي',
    mobileLabel: 'التنقل السفلي',
    dashboard: 'الرئيسية',
    alarms: 'المنبهات',
    exercises: 'التمارين',
    settings: 'الإعدادات',
    newAlarm: 'منبه جديد',
  },

  dashboard: {
    nextAlarm: 'المنبه القادم',
    noActiveAlarm: 'لا يوجد منبه ذكي مفعّل',
    noActiveAlarmDesc: 'أنشئ منبهاً واربطه بتحدي تمرين MediaPipe بدون إنترنت لإيقاف الرنين.',
    createSmartAlarm: 'إنشاء منبه ذكي',
    dismissChallenge: (target, unit, exercise) =>
      `تحدي الإيقاف: ${target} ${unit} ${exercise}`,
    verifiedPerformance: 'الأداء الموثق',
    verifiedNote: 'تتحدث الإحصائيات فقط عند إتمام تمارين إيقاف المنبه عبر MediaPipe بدون إنترنت.',
    viewHistory: 'السجل',
    quickActions: 'إجراءات سريعة',
    scheduledAlarms: 'المنبهات المجدولة',
    viewAll: 'عرض الكل',
    noAlarmsPreview: 'لا توجد منبهات محفوظة محلياً بعد. أنشئ أول منبه ذكي.',
    statStreak: 'السلسلة',
    statStreakValue: (days) => `${days} ي`,
    statWorkouts: 'التمارين',
    statTotalReps: 'التكرارات',
    quickAddAlarm: 'إضافة منبه',
    quickAddAlarmSub: 'الوقت والتحدي',
    quickAllAlarms: 'كل المنبهات',
    quickAllAlarmsSub: 'إدارة الجداول',
    quickExercises: 'التمارين',
    quickExercisesSub: '٥ تمارين MediaPipe',
    quickSettings: 'الإعدادات',
    quickSettingsSub: 'اللغة ومحرك الذكاء',
  },

  alarms: {
    title: 'المنبهات',
    activeSummary: (active, total) => `${active} مفعّل · ${total} محفوظ محلياً`,
    addAlarm: 'إضافة منبه',
    emptyTitle: 'لا توجد منبهات مضبوطة',
    emptyDesc: 'أنشئ منبهاً ذكياً واختر التمرين البدني المطلوب قبل التمكن من إيقافه.',
    createFirst: 'إنشاء أول منبه',
    vibrateTag: 'اهتزاز',
    testChallenge: 'اختبار التحدي',
    deleteTitle: 'حذف المنبه؟',
    deleteBody: (label) => `هل تريد إزالة "${label}" من التخزين المحلي؟`,
    deletedToast: (label) => `تم حذف "${label}"`,
  },

  alarmForm: {
    newTitle: 'منبه ذكي جديد',
    editTitle: 'تعديل المنبه الذكي',
    subtitle: 'يُحفظ محلياً ويرتبط بتحدي تمرين بدون إنترنت',
    alarmTime: 'وقت المنبه',
    adjust: 'تعديل',
    labelTitle: 'التسمية',
    labelPlaceholder: 'مثال: تمرين القوة الصباحي',
    defaultLabel: 'تمرين الاستيقاظ',
    repeatTitle: 'تكرار الجدول',
    actionWeekdays: 'أيام العمل',
    actionClear: 'مسح',
    exerciseTitle: 'تمرين إيقاف المنبه',
    changeExercise: 'تغيير',
    requiredTarget: 'الهدف المطلوب',
    behaviorTitle: 'سلوك المنبه',
    vibrationTitle: 'الاهتزاز',
    vibrationSub: 'نبض اهتزازي أثناء رنين المنبه',
    snoozeTitle: 'السماح بغفوة واحدة',
    snoozeSub: 'يُفضّل الإيقاف للالتزام الصارم بالاستيقاظ',
    saveButton: 'حفظ المنبه الذكي',
    updateButton: 'تحديث المنبه الذكي',
    labelMaxLengthError: 'يجب ألا تتجاوز تسمية المنبه ٤٨ حرفاً.',
    invalidTargetError: 'الهدف المطلوب خارج النطاق المسموح لهذا التمرين.',
    savedToast: (label) => `تم حفظ "${label}"`,
    updatedToast: (label) => `تم تحديث "${label}"`,
  },

  time: {
    am: 'ص',
    pm: 'م',
    once: 'مرة واحدة',
    everyDay: 'كل يوم',
    weekdays: 'أيام العمل',
    weekends: 'عطلة نهاية الأسبوع',
    listSeparator: '، ',
    lessThanMinute: 'أقل من دقيقة',
    daysHours: (days, hours) => `بعد ${days} ي و ${hours} س`,
    hoursMinutes: (hours, minutes) => `بعد ${hours} س و ${minutes} د`,
    minutesOnly: (minutes) => `بعد ${minutes} د`,
    daysShort: {
      1: 'إث',
      2: 'ثل',
      3: 'أر',
      4: 'خم',
      5: 'جم',
      6: 'سب',
      7: 'أح',
    },
    daysLetter: {
      1: 'ن',
      2: 'ث',
      3: 'ر',
      4: 'خ',
      5: 'ج',
      6: 'س',
      7: 'ح',
    },
  },

  exercises: {
    title: 'دليل التمارين',
    chooseChallenge: 'اختر التحدي',
    subtitle: 'تحقق هيكلي بـ ٣٣ نقطة عبر MediaPipe Pose Landmarker بدون إنترنت',
    offlineNotice:
      'يبدأ التحقق الحي بالكاميرا في المرحلة الثانية عبر Android CameraX و iOS AVFoundation مع MediaPipe Pose Landmarker. اختر تمريناً أدناه لمراجعة النقاط المتتبعة والتعليمات أو ربطه بمنبه.',
    defaultLabel: 'الافتراضي',
    defaultTargetLabel: (target, unit) => `الافتراضي ${target} ${unit}`,
    landmarksLabel: 'النقاط',
    metricLabel: 'المعيار',
    instructionsTitle: 'تعليمات الأداء',
    setDefaultBtn: 'تعيين كتمرين افتراضي',
    useExerciseBtn: (name) => `اختيار ${name}`,
    defaultUpdatedToast: (name) => `تم تعيين التمرين الافتراضي إلى ${name}`,
    unitReps: 'تكرار',
    unitSec: 'ثانية',
    difficulty: {
      light: 'خفيف',
      moderate: 'متوسط',
      hard: 'صعب',
    },
    items: {
      squats: {
        name: 'تمرين القرفصاء',
        subtitle: 'قوة الجزء السفلي ومرونة الورك',
        description:
          'قف مواجهاً للكاميرا مع ظهور الجسم كاملاً. اخفض الوركين حتى تصبح الفخذان موازيتين للأرض ثم ارتفع للوقوف الكامل.',
        muscles: 'الأفخاذ الأمامية، الأرداف، الجذع',
        landmarks: 'الورك (23, 24) · الركبة (25, 26) · الكاحل (27, 28)',
        metric: 'زاوية ثني الركبة < 95° ثم امتداد > 165°',
        instructions: [
          'ثبّت الجهاز عمودياً على مستوى الخصر.',
          'تراجع للخلف حتى يظهر الرأس والوركان والكاحلان في الإطار.',
          'انزل بثبات حتى تتوازى الفخذان ثم قف باستقامة كاملة.',
        ],
      },
      push_ups: {
        name: 'تمرين الضغط',
        subtitle: 'قوة الجزء العلوي وثبات الجذع',
        description:
          'ضع الجهاز بمستوى الأرض من الجانب. اخفض الصدر نحو الأرض مع استقامة العمود الفقري ثم ادفع حتى فرد الذراعين.',
        muscles: 'الصدر، الترايسبس، الأكتاف',
        landmarks: 'الكتف (11, 12) · المرفق (13, 14) · الرسغ (15, 16) · الورك (23, 24)',
        metric: 'زاوية المرفق < 90° مع فحص استقامة الجذع',
        instructions: [
          'ضع الجهاز منخفضاً على الأرض بزاوية جانبية.',
          'حافظ على استقامة الكتفين والوركين والكاحلين.',
          'اخفض الجسم حتى يتجاوز المرفقان 90° ثم ادفع للأعلى.',
        ],
      },
      jumping_jacks: {
        name: 'القفز المفتوح',
        subtitle: 'رفع النبض وتنشيط اليقظة سريعاً',
        description:
          'ابقِ الجسم كاملاً في منتصف الإطار. اقفز مع فتح القدمين ورفع الذراعين فوق الرأس ثم عد لوضع البداية.',
        muscles: 'كامل الجسم، الساقين، الأكتاف',
        landmarks: 'الرسغ (15, 16) · الكتف (11, 12) · الكاحل (27, 28)',
        metric: 'ارتفاع الرسغين فوق الأنف + تباعد الكاحلين',
        instructions: [
          'قف في المنتصف مع مساحة كافية فوق الرأس.',
          'اقفز مع فتح القدمين ورفع اليدين أعلى الرأس.',
          'عد لوضع الضم لإتمام كل تكرار.',
        ],
      },
      lunges: {
        name: 'تمرين الطعن المتبادل',
        subtitle: 'توازن كل ساق وتنشيط الأرداف',
        description:
          'تقدم خطوة للأمام بإحدى الساقين واخفض الجسم حتى تقترب الركبتان من 90 درجة ثم عد للوقوف.',
        muscles: 'الأرداف، الأفخاذ الأمامية، الخلفية',
        landmarks: 'الورك (23, 24) · الركبة (25, 26) · الكاحل (27, 28)',
        metric: 'ثني الركبتين الأمامية والخلفية < 100°',
        instructions: [
          'واجه الكاميرا بزاوية مائلة خفيفة ٤٥°.',
          'اخطُ للأمام واخفض الركبتين نحو زاوية 90°.',
          'ادفع للعودة للوقوف وبدّل بين الساقين.',
        ],
      },
      plank_hold: {
        name: 'ثبات البلانك على الساعدين',
        subtitle: 'ثبات عضلات الجذع الأساسية',
        description:
          'حافظ على خط جسم مستقيم من الجانب. يراقب MediaPipe استقامة الكتف والورك والكاحل باستمرار.',
        muscles: 'الجذع، الأكتاف، أسفل الظهر',
        landmarks: 'الكتف (11, 12) · الورك (23, 24) · الكاحل (27, 28)',
        metric: 'زاوية الكتف-الورك-الكاحل بين 165° و 195°',
        instructions: [
          'ضع الجهاز على الأرض بزاوية جانبية.',
          'ارتكز على الساعدين وأطراف القدمين باستقامة تامة.',
          'اثبت حتى اكتمال الثواني المطلوبة.',
        ],
      },
    },
  },

  history: {
    title: 'سجل النشاط والإحصائيات',
    emptyTitle: 'لا توجد جلسات تمرين بعد',
    emptyDesc:
      'ستظهر جلسات إيقاف المنبه المكتملة هنا بمجرد تسجيل أول جلسة عبر التحقق الحي بالكاميرا في المرحلة الثانية.',
    sessionsLabel: 'الجلسات المكتملة',
    cameraTitle: 'التحقق بالكاميرا (المرحلة الثانية)',
    cameraPrompt: 'ضع جسمك كاملاً داخل إطار الكاميرا لإتمام التمرين.',
    completeTitle: 'تم إيقاف المنبه',
    completeSubtitle: 'تم التحقق من التمرين وحفظ الجلسة في سجل النشاط.',
    deleteTitle: 'حذف سجل التمرين؟',
    deleteBody: 'هل تريد إزالة هذا التمرين المكتمل من السجل المحلي؟',
    deletedToast: 'تم حذف سجل التمرين',
    clearAllButton: 'مسح السجل',
    clearDialogTitle: 'مسح سجل التمارين؟',
    clearDialogBody:
      'هل تريد حذف جميع جلسات التمرين؟ ستبقى المنبهات وإعدادات التطبيق محفوظة كما هي.',
    clearedToast: 'تم مسح سجل التمارين مع الحفاظ على المنبهات والإعدادات',
  },

  settings: {
    title: 'الإعدادات',
    subtitle: 'اللغة، تنسيق الوقت، افتراضيات المنبه، ومحرك MediaPipe بدون إنترنت',
    languageSection: 'اللغة',
    languageLabel: 'لغة التطبيق',
    languageSub: 'تتغير فوراً دون إعادة تشغيل مع الحفاظ على جميع المنبهات والبيانات',
    languageArabic: 'العربية',
    languageEnglish: 'English',
    clockSection: 'الساعة والواجهة',
    use24HourTitle: 'تنسيق ٢٤ ساعة',
    use24HourSub: 'عرض أوقات المنبه بنظام ٢٤ ساعة',
    hapticsTitle: 'الاستجابة اللمسية',
    hapticsSub: 'تأكيد لمسي خفيف عند التنقل بين التبويبات',
    defaultsSection: 'افتراضيات المنبه والتمارين',
    defaultExercise: 'التمرين الافتراضي',
    defaultTargetReps: 'التكرارات الافتراضية',
    alarmVolume: 'مستوى صوت المنبه',
    alarmToneLabel: 'نغمة صوت المنبه',
    alarmToneClassic: 'كلاسيكي',
    alarmToneChime: 'رنين هادئ',
    alarmToneRadar: 'تنبيه قوي',
    vibrateDefault: 'تفعيل الاهتزاز افتراضياً',
    aiSection: 'الذكاء بدون إنترنت والجسور الأصلية',
    poseDelegate: 'معالج استدلال MediaPipe',
    poseDelegateSub: 'تفضيل تسريع العتاد لكاشف الوضعية بدون إنترنت',
    delegateGpu: 'معالج الرسوميات GPU',
    delegateCpu: 'المعالج CPU احتياطياً',
    flutterProjectLabel: 'مشروع Flutter',
    flutterProjectValue: 'pro_app/ (Dart + Riverpod + GoRouter + ARB)',
    nativeChannelsLabel: 'القنوات الأصلية',
    nativeChannelsValue: 'Kotlin (Android) · Swift (iOS)',
    visionLabel: 'نموذج الرؤية',
    visionValue: 'حزمة المرحلة الثانية قيد الاستكمال',
    permissionsSection: 'الدليل والأذونات',
    replayGuideBtn: 'عرض دليل البدء والأذونات والإشعارات',
    privacyBtn: 'سياسة الخصوصية (بدون إنترنت)',
    backupSection: 'النسخ الاحتياطي المحلي (JSON)',
    exportBackupBtn: 'تصدير نسخة احتياطية JSON',
    importBackupBtn: 'استيراد نسخة احتياطية JSON',
    backupExportedToast: 'تم تصدير النسخة الاحتياطية بنجاح',
    backupConfirmTitle: 'استعادة النسخة الاحتياطية؟',
    backupConfirmBody: (alarmsCount, sessionsCount) =>
      `هل تريد استبدال البيانات الحالية بنسخة تحتوي على ${alarmsCount} منبه و ${sessionsCount} جلسة تمرين؟`,
    backupImportedToast: (alarmsCount, sessionsCount) =>
      `تمت استعادة ${alarmsCount} منبه و ${sessionsCount} جلسة تمرين والإعدادات`,
    backupInvalidError:
      'ملف النسخة الاحتياطية غير صالح أو تالف. لم تتأثر بياناتك الحالية.',
    storageSection: 'التخزين المحلي',
    resetButton: 'مسح جميع البيانات المحلية',
    resetDialogTitle: 'مسح جميع البيانات المحلية؟',
    resetDialogBody:
      'سيؤدي هذا إلى حذف جميع المنبهات المحفوظة وسجل التمارين والتفضيلات نهائياً من التخزين المحلي.',
    resetToast: 'تم مسح جميع المنبهات والإعدادات المحلية',
  },

  alarmChallenge: {
    ringingTitle: 'منبه PRO نشط الآن',
    lockedHint: 'الإغلاق العادي مقفول حتى إتمام التمرين المطلوب.',
    audioActive: 'صوت المنبه نشط',
    enableAudioBtn: 'تشغيل صوت المنبه',
    cameraStarting: 'جاري تشغيل الكاميرا...',
    cameraLiveBadge: 'الكاميرا نشطة محلياً',
    cameraPermissionDenied: 'تم رفض إذن الكاميرا أو تعذر الوصول إليها في المتصفح.',
    nativeAiNote:
      'في تطبيق الهاتف (pro_app/) يعمل كاشف MediaPipe Pose Landmarker الأصلي بدون إنترنت لتتبع ٣٣ نقطة مفصلية. لا يستخدم التطبيق أي عدّ وهمي أو نتائج مصطنعة.',
    snoozeBtn: 'غفوة واحدة (٥ دقائق)',
    snoozeToast: 'تمت جدولة غفوة لمدة ٥ دقائق',
    snoozeUsedBadge: 'تم استهلاك الغفوة',
    finishBtn: 'إنهاء وحفظ الجلسة',
  },

  privacy: {
    title: 'سياسة الخصوصية — PRO',
    updated: 'آخر تحديث: ٢٠٢٦-١١-١٢',
    sections: [
      {
        heading: '١. عدم جمع البيانات سحابياً',
        body: 'يعمل تطبيق PRO محلياً بالكامل بدون إنترنت ولا يستخدم حسابات أو أدوات تتبع أو إعلانات. تُحفظ المنبهات والجلسات والإعدادات محلياً على جهازك فقط.',
      },
      {
        heading: '٢. الكاميرا والذكاء الاصطناعي على الجهاز',
        body: 'يُستخدم إذن الكاميرا حصرياً للتحقق من أداء التمرين لإيقاف المنبه عبر MediaPipe Pose Landmarker محلياً في الذاكرة دون حفظ أو إرسال أي فيديو.',
      },
      {
        heading: '٣. النسخ الاحتياطي والتحكم بالبيانات',
        body: 'يمكنك تصدير نسخة احتياطية JSON أو حذف جميع البيانات المحلية نهائياً في أي وقت من الإعدادات.',
      },
    ],
  },

  permissions: {
    cameraTitle: 'إذن الكاميرا (بدون إنترنت)',
    cameraRationale:
      'يُستخدم محلياً بالكامل على الجهاز للتحقق من أداء التمرين قبل إيقاف المنبه.',
    exactAlarmTitle: 'جدولة المنبه الدقيق',
    exactAlarmRationale:
      'مطلوب على أندرويد ١٢+ لضمان رنين المنبه في الدقيقة المحددة تماماً.',
    notifTitle: 'الإشعارات والتنبيه بملء الشاشة',
    notifRationale: 'مطلوب لإظهار شاشة التحدي فوق شاشة القفل.',
    notifPreviewTitle: 'تحدي الاستيقاظ PRO',
    notifPreviewBody: (target, unit, exercise) =>
      `أكمل ${target} ${unit} من ${exercise} لإيقاف هذا المنبه.`,
  },

  errors: {
    databaseLoad: 'تعذر تحميل سجلات قاعدة البيانات المحلية.',
    nativeBridge: 'تعذر الاستعلام عن جسر النظام الأصلي.',
    cameraUnavailable: 'الكاميرا غير متوفرة على هذا الجهاز.',
  },

  actions: {
    cancel: 'إلغاء',
    delete: 'حذف',
    confirmReset: 'مسح',
    close: 'إغلاق',
  },

  a11y: {
    toggleAlarm: (label) => `تبديل حالة منبه ${label}`,
    deleteAlarm: (label) => `حذف منبه ${label}`,
    testChallenge: (label) => `اختبار تحدي منبه ${label}`,
    deleteSession: 'حذف جلسة التمرين',
    openSettings: 'فتح الإعدادات',
    back: 'رجوع',
    toggleVibration: 'تبديل الاهتزاز',
    toggleSnooze: 'تبديل السماح بالغفوة',
    toggle24Hour: 'تبديل تنسيق ٢٤ ساعة',
    toggleHaptics: 'تبديل الاستجابة اللمسية',
    toggleDefaultVibration: 'تبديل الاهتزاز الافتراضي',
  },
};

export const EN_TRANSLATIONS: Translations = {
  appName: 'PRO',
  appTagline: 'Smart Fitness Alarm',
  documentTitle: 'PRO — Smart Fitness Alarm',
  splashInitializing: 'Preparing local database and offline motion engine...',

  onboardingTitle: 'Onboarding & Permissions Guide',
  onboardingSlides: [
    {
      title: 'Wake Up With Movement',
      body: 'Alarms stay active until you complete your chosen physical exercise in front of the camera.',
    },
    {
      title: '100% Offline Pose Verification',
      body: 'MediaPipe Pose Landmarker tracks 33 skeletal keypoints locally on your device with zero cloud uploads.',
    },
    {
      title: 'Bilingual Arabic & English',
      body: 'Switch between RTL Arabic and LTR English instantly in Settings without restarting or losing alarms.',
    },
  ],
  onboardingSkip: 'Close',
  onboardingNext: 'Next',
  onboardingDone: 'Done',

  nav: {
    primaryLabel: 'Primary Navigation',
    mobileLabel: 'Mobile Navigation',
    dashboard: 'Dashboard',
    alarms: 'Alarms',
    exercises: 'Exercises',
    settings: 'Settings',
    newAlarm: 'New Alarm',
  },

  dashboard: {
    nextAlarm: 'Next Alarm',
    noActiveAlarm: 'No Active Smart Alarm',
    noActiveAlarmDesc:
      'Schedule an alarm and bind an offline MediaPipe exercise challenge required to dismiss it.',
    createSmartAlarm: 'Create Smart Alarm',
    dismissChallenge: (target, unit, exercise) =>
      `Dismiss challenge: ${target} ${unit} ${exercise}`,
    verifiedPerformance: 'Verified Performance',
    verifiedNote:
      'Metrics update strictly from completed offline MediaPipe exercise dismissals. No synthetic history is preloaded.',
    viewHistory: 'History',
    quickActions: 'Quick Actions',
    scheduledAlarms: 'Scheduled Alarms',
    viewAll: 'View All',
    noAlarmsPreview:
      'No alarms saved in local storage yet. Create your first smart alarm.',
    statStreak: 'Streak',
    statStreakValue: (days) => `${days}d`,
    statWorkouts: 'Workouts',
    statTotalReps: 'Total Reps',
    quickAddAlarm: 'Add Alarm',
    quickAddAlarmSub: 'Time & challenge',
    quickAllAlarms: 'All Alarms',
    quickAllAlarmsSub: 'Manage schedules',
    quickExercises: 'Exercises',
    quickExercisesSub: '5 MediaPipe drills',
    quickSettings: 'Settings',
    quickSettingsSub: 'Language & AI engine',
  },

  alarms: {
    title: 'Alarms',
    activeSummary: (active, total) => `${active} active · ${total} total saved locally`,
    addAlarm: 'Add Alarm',
    emptyTitle: 'No Alarms Configured',
    emptyDesc:
      'Create a smart alarm and choose the physical exercise required before it can be dismissed.',
    createFirst: 'Create First Alarm',
    vibrateTag: 'Vibrate',
    testChallenge: 'Test Challenge',
    deleteTitle: 'Delete Alarm?',
    deleteBody: (label) => `Remove "${label}" from local storage?`,
    deletedToast: (label) => `Deleted "${label}"`,
  },

  alarmForm: {
    newTitle: 'New Smart Alarm',
    editTitle: 'Edit Smart Alarm',
    subtitle: 'Saved locally and paired with an offline exercise challenge',
    alarmTime: 'Alarm Time',
    adjust: 'Adjust',
    labelTitle: 'Label',
    labelPlaceholder: 'e.g. Morning Strength Wake-Up',
    defaultLabel: 'Wake Up Workout',
    repeatTitle: 'Repeat Schedule',
    actionWeekdays: 'Weekdays',
    actionClear: 'Clear',
    exerciseTitle: 'Dismissal Exercise',
    changeExercise: 'Change',
    requiredTarget: 'Required Target',
    behaviorTitle: 'Alarm Behavior',
    vibrationTitle: 'Vibration',
    vibrationSub: 'Haptic pulse while alarm is active',
    snoozeTitle: 'Allow One-Time Snooze',
    snoozeSub: 'Recommended OFF for strict wake-up discipline',
    saveButton: 'Save Smart Alarm',
    updateButton: 'Update Smart Alarm',
    labelMaxLengthError: 'Alarm label must be 48 characters or fewer.',
    invalidTargetError: 'Required target is outside the allowed range for this exercise.',
    savedToast: (label) => `Saved "${label}"`,
    updatedToast: (label) => `Updated "${label}"`,
  },

  time: {
    am: 'AM',
    pm: 'PM',
    once: 'Once',
    everyDay: 'Every day',
    weekdays: 'Weekdays',
    weekends: 'Weekends',
    listSeparator: ', ',
    lessThanMinute: 'Less than 1m',
    daysHours: (days, hours) => `in ${days}d ${hours}h`,
    hoursMinutes: (hours, minutes) => `in ${hours}h ${minutes}m`,
    minutesOnly: (minutes) => `in ${minutes}m`,
    daysShort: {
      1: 'Mon',
      2: 'Tue',
      3: 'Wed',
      4: 'Thu',
      5: 'Fri',
      6: 'Sat',
      7: 'Sun',
    },
    daysLetter: {
      1: 'M',
      2: 'T',
      3: 'W',
      4: 'T',
      5: 'F',
      6: 'S',
      7: 'S',
    },
  },

  exercises: {
    title: 'Exercise Catalog',
    chooseChallenge: 'Choose Challenge',
    subtitle: 'Offline MediaPipe Pose Landmarker 33-point skeletal verification',
    offlineNotice:
      'Live camera inference activates in Phase 2 via native Android CameraX & iOS AVFoundation + MediaPipe Pose Landmarker. Select a challenge below to inspect tracked landmarks and form instructions or bind it to an alarm.',
    defaultLabel: 'Default',
    defaultTargetLabel: (target, unit) => `${target} ${unit} default`,
    landmarksLabel: 'Landmarks',
    metricLabel: 'Metric',
    instructionsTitle: 'Form Instructions',
    setDefaultBtn: 'Set as Default Exercise',
    useExerciseBtn: (name) => `Use ${name}`,
    defaultUpdatedToast: (name) => `Default exercise set to ${name}`,
    unitReps: 'reps',
    unitSec: 'sec',
    difficulty: {
      light: 'Light',
      moderate: 'Moderate',
      hard: 'Hard',
    },
    items: {
      squats: {
        name: 'Bodyweight Squats',
        subtitle: 'Lower-body strength & hip mobility',
        description:
          'Stand facing the camera with full body visible. Lower hips until thighs are parallel to the floor, then drive back to full extension.',
        muscles: 'Quads, Glutes, Core',
        landmarks: 'Hip (23, 24) · Knee (25, 26) · Ankle (27, 28)',
        metric: 'Knee flexion angle < 95° -> extension > 165°',
        instructions: [
          'Place your device upright at waist height.',
          'Step back until head, hips, and ankles are visible in frame.',
          'Lower steadily until thighs are parallel, then stand tall.',
        ],
      },
      push_ups: {
        name: 'Push-Ups',
        subtitle: 'Upper-body press & core stability',
        description:
          'Position the device at floor angle in side profile. Lower chest toward the ground while keeping spine aligned, then press to lockout.',
        muscles: 'Chest, Triceps, Shoulders',
        landmarks: 'Shoulder (11, 12) · Elbow (13, 14) · Wrist (15, 16) · Hip (23, 24)',
        metric: 'Elbow angle < 90° with torso linearity check',
        instructions: [
          'Prop the device low on the floor in side view.',
          'Keep shoulders, hips, and ankles aligned.',
          'Lower until elbows bend past 90°, then press cleanly to lockout.',
        ],
      },
      jumping_jacks: {
        name: 'Jumping Jacks',
        subtitle: 'Rapid heart-rate & alertness booster',
        description:
          'Keep full body centered in frame. Jump feet outward while raising arms overhead, then return to starting stance.',
        muscles: 'Full Body, Calves, Shoulders',
        landmarks: 'Wrist (15, 16) · Shoulder (11, 12) · Ankle (27, 28)',
        metric: 'Wrist elevation above nose + ankle spread delta',
        instructions: [
          'Stand centered with overhead arm clearance.',
          'Jump feet wide while bringing wrists above head level.',
          'Return feet together and arms to sides for each rep.',
        ],
      },
      lunges: {
        name: 'Alternating Lunges',
        subtitle: 'Single-leg balance & glute activation',
        description:
          'Step forward with one leg and lower until both knees approach 90 degrees, then push back to standing.',
        muscles: 'Glutes, Quads, Hamstrings',
        landmarks: 'Hip (23, 24) · Knee (25, 26) · Ankle (27, 28)',
        metric: 'Lead & trail knee flexion < 100°',
        instructions: [
          'Face the camera at a slight 45° angle.',
          'Step forward and lower both knees toward 90°.',
          'Drive back to upright stance and alternate legs.',
        ],
      },
      plank_hold: {
        name: 'Forearm Plank Hold',
        subtitle: 'Isometric core stabilization',
        description:
          'Hold a rigid plank line in side view. MediaPipe tracks shoulder-hip-ankle alignment continuously.',
        muscles: 'Core, Shoulders, Lower Back',
        landmarks: 'Shoulder (11, 12) · Hip (23, 24) · Ankle (27, 28)',
        metric: 'Shoulder-hip-ankle angle within 165°–195°',
        instructions: [
          'Set the device on the floor in side profile.',
          'Support on forearms and toes with straight torso alignment.',
          'Hold steady until the required seconds complete.',
        ],
      },
    },
  },

  history: {
    title: 'Activity History & Statistics',
    emptyTitle: 'No Workout Sessions Yet',
    emptyDesc:
      'Completed exercise dismissals will appear here once Phase 2 live camera verification records your first session.',
    sessionsLabel: 'Completed Sessions',
    cameraTitle: 'Camera Detection (Phase 2)',
    cameraPrompt: 'Position your full body inside the camera frame.',
    completeTitle: 'Alarm Dismissed',
    completeSubtitle: 'Challenge verified and saved to your activity history.',
    deleteTitle: 'Delete Workout Record?',
    deleteBody: 'Remove this completed session from your local workout history?',
    deletedToast: 'Workout record deleted',
    clearAllButton: 'Clear History',
    clearDialogTitle: 'Clear Workout History?',
    clearDialogBody:
      'Delete all workout sessions? Your saved alarms and app settings will remain intact.',
    clearedToast: 'Workout history cleared (alarms & settings preserved)',
  },

  settings: {
    title: 'Settings',
    subtitle: 'Language, clock format, alarm defaults, and offline MediaPipe delegate',
    languageSection: 'Language',
    languageLabel: 'App Language',
    languageSub: 'Updates immediately without restarting and preserves all alarms',
    languageArabic: 'العربية',
    languageEnglish: 'English',
    clockSection: 'Clock & Interface',
    use24HourTitle: '24-Hour Time Format',
    use24HourSub: 'Display alarm times in 24h military format',
    hapticsTitle: 'Haptic Feedback',
    hapticsSub: 'Tactile confirmation on navigation changes',
    defaultsSection: 'Alarm & Exercise Defaults',
    defaultExercise: 'Default Exercise',
    defaultTargetReps: 'Default Target Reps',
    alarmVolume: 'Alarm Volume',
    alarmToneLabel: 'Alarm Sound Tone',
    alarmToneClassic: 'Classic',
    alarmToneChime: 'Chime',
    alarmToneRadar: 'Radar',
    vibrateDefault: 'Vibrate by Default',
    aiSection: 'Offline AI & Native Bridges',
    poseDelegate: 'MediaPipe Inference Delegate',
    poseDelegateSub: 'Hardware acceleration preference for offline Pose Landmarker',
    delegateGpu: 'GPU Delegate',
    delegateCpu: 'CPU Fallback',
    flutterProjectLabel: 'Flutter Project',
    flutterProjectValue: 'pro_app/ (Dart + Riverpod + GoRouter + ARB)',
    nativeChannelsLabel: 'Native Channels',
    nativeChannelsValue: 'Kotlin (Android) · Swift (iOS)',
    visionLabel: 'MediaPipe Vision',
    visionValue: 'Phase 2 model bundle pending',
    permissionsSection: 'Guide & Permissions',
    replayGuideBtn: 'View Onboarding, Permissions & Notification Copy',
    privacyBtn: 'Privacy Policy (Offline-First)',
    backupSection: 'Local Backup (JSON)',
    exportBackupBtn: 'Export JSON Backup',
    importBackupBtn: 'Import JSON Backup',
    backupExportedToast: 'Local backup exported successfully',
    backupConfirmTitle: 'Restore Backup?',
    backupConfirmBody: (alarmsCount, sessionsCount) =>
      `Replace current local data with backup containing ${alarmsCount} alarms and ${sessionsCount} workout sessions?`,
    backupImportedToast: (alarmsCount, sessionsCount) =>
      `Restored ${alarmsCount} alarms, ${sessionsCount} workout sessions, and settings`,
    backupInvalidError: 'Invalid or corrupted backup file. Your existing data was preserved.',
    storageSection: 'Local Storage',
    resetButton: 'Reset All Local Data',
    resetDialogTitle: 'Reset All Local Data?',
    resetDialogBody:
      'This permanently deletes all saved alarms, workout history, and preferences from local storage.',
    resetToast: 'All local alarms and settings cleared',
  },

  alarmChallenge: {
    ringingTitle: 'PRO Alarm Active',
    lockedHint: 'Ordinary dismissal is locked until your required exercise is completed.',
    audioActive: 'Alarm tone active',
    enableAudioBtn: 'Enable Alarm Tone',
    cameraStarting: 'Starting camera stream...',
    cameraLiveBadge: 'Camera active locally',
    cameraPermissionDenied: 'Camera permission was denied or hardware is unavailable in this browser.',
    nativeAiNote:
      'In the mobile build (pro_app/), native offline MediaPipe Pose Landmarker tracks 33 skeletal keypoints. No synthetic rep counting or fake AI timer is used.',
    snoozeBtn: 'One-Time Snooze (5m)',
    snoozeToast: 'One-time 5-minute snooze scheduled',
    snoozeUsedBadge: 'Snooze already used',
    finishBtn: 'Finish & Save Session',
  },

  privacy: {
    title: 'Privacy Policy — PRO',
    updated: 'Last updated: 2026-11-12',
    sections: [
      {
        heading: '1. Zero Cloud Data Collection',
        body: 'PRO operates strictly offline with no user accounts, analytics trackers, or ads. All alarms, workout sessions, and preferences stay exclusively on your device.',
      },
      {
        heading: '2. On-Device Camera & AI Inference',
        body: 'Camera access is used solely to verify your exercise form via MediaPipe Pose Landmarker in volatile device memory. No video frames are recorded or uploaded.',
      },
      {
        heading: '3. Backups & User Control',
        body: 'You can export a local JSON backup or permanently clear all saved alarms, history, and preferences anytime in Settings.',
      },
    ],
  },

  permissions: {
    cameraTitle: 'Camera Permission (Offline)',
    cameraRationale:
      'Used strictly offline on-device to verify your exercise form before dismissing an alarm.',
    exactAlarmTitle: 'Exact Alarm Scheduling',
    exactAlarmRationale:
      'Required on Android 12+ so your wake-up alarm rings at the exact minute scheduled.',
    notifTitle: 'Notifications & Full-Screen Alert',
    notifRationale:
      'Required to surface the active alarm challenge over the lock screen.',
    notifPreviewTitle: 'PRO Wake-Up Challenge',
    notifPreviewBody: (target, unit, exercise) =>
      `Complete ${target} ${unit} of ${exercise} to dismiss this alarm.`,
  },

  errors: {
    databaseLoad: 'Failed to load local database records.',
    nativeBridge: 'Unable to query native platform bridge.',
    cameraUnavailable: 'Camera hardware is unavailable on this device.',
  },

  actions: {
    cancel: 'Cancel',
    delete: 'Delete',
    confirmReset: 'Reset',
    close: 'Close',
  },

  a11y: {
    toggleAlarm: (label) => `Toggle ${label}`,
    deleteAlarm: (label) => `Delete ${label}`,
    testChallenge: (label) => `Test challenge for ${label}`,
    deleteSession: 'Delete workout session',
    openSettings: 'Open Settings',
    back: 'Back',
    toggleVibration: 'Toggle Vibration',
    toggleSnooze: 'Toggle Snooze',
    toggle24Hour: 'Toggle 24-Hour Format',
    toggleHaptics: 'Toggle Haptic Feedback',
    toggleDefaultVibration: 'Toggle Default Vibration',
  },
};

export function getTranslations(language: AppLanguage): Translations {
  return language === 'ar' ? AR_TRANSLATIONS : EN_TRANSLATIONS;
}
