// Best-effort drafted translations for the app shell's static UI copy — the
// same caveat as the original design handoff applies: have native speakers
// review before this ships to real farmers. Gemma's own generated text
// (diagnoses, chat replies) is translated live by the model via the
// `language` field sent to /api/diagnose and /api/chat, not from this table.

export type AppLanguage = "en" | "ha" | "yo" | "ig";

export interface AppStrings {
  // Sidebar / nav
  navDash: string;
  navScan: string;
  navDiag: string;
  navAsst: string;
  navHist: string;
  editFarmProfile: string;
  backToSite: string;
  offline: string;
  cloud: string;
  myFarmFallback: string;

  // Shared
  listen: string;
  stop: string;
  refresh: string;
  edit: string;
  loading: string;
  somethingWentWrong: string;

  // Greeting
  greetingMorning: string;
  greetingAfternoon: string;
  greetingEvening: string;

  // Dashboard
  noCropsTrackedYet: string;
  healthyNoAction: string;
  photographToStart: string;
  lastScannedTpl: string; // {{time}}, {{count}}
  noScansYetSeason: string;
  rainForecast: string;
  chanceTomorrow: string;
  openAlerts: string;
  allClear: string;
  severeAdvisoryTpl: string; // {{severe}}, {{advisory}}
  diagnosesLogged: string;
  totalScansTpl: string; // {{count}}
  stageSuffix: string;
  addOneInHistory: string;
  recommends: string;
  trackCropPrefix: string;
  trackCropSuffix: string;
  historyLinkLabel: string;
  preparingBriefing: string;
  farmProfile: string;
  farmer: string;
  location: string;
  cropLabel: string;
  farmSize: string;
  growthStage: string;
  today: string;
  spotSomethingUnusual: string;
  spotSomethingBody: string;
  startAScan: string;
  recentActivity: string;
  noActivityYet: string;
  openFarmHistory: string;

  // Scan
  stepOneOfTwo: string;
  scanTitle: string;
  whichCrop: string;
  otherOption: string;
  customCropPlaceholder: string;
  forAGoodPhoto: string;
  scanTip1: string;
  scanTip2: string;
  scanTip3: string;
  captureAndDiagnose: string;
  uploadPhoto: string;
  describeByVoice: string;
  liveHoldSteady: string;
  edgeOfflineNote: string;
  edgeCloudNote: string;
  analysing: string;
  waitingOnGemma: string;
  logLine1: string;
  logLine2: string;
  logLine3: string;
  logLine4: string;
  diagnosisFailedServerTpl: string; // {{status}}
  diagnosisFailed: string;
  diagnosisFailedRetry: string;

  // Diagnosis
  noScanYet: string;
  diagnosisCompleteTpl: string; // {{seconds}}
  risk: string;
  actWithin: string;
  outlook: string;
  factCrop: string;
  factType: string;
  factConfidence: string;
  factSeverity: string;
  factTreatment: string;
  factSafety: string;
  noneNeeded: string;
  required: string;
  treatmentStepsTpl: string; // {{count}}
  gemmasReading: string;
  preparingAudio: string;
  actionPlan: string;
  applyProductTpl: string; // {{product}}
  repeatWithProductTpl: string; // {{product}}
  whatModelLookedAt: string;
  capturedTpl: string; // {{time}}, {{crop}}
  confidenceBreakdown: string;
  overallConfidence: string;
  safety: string;
  wearTpl: string; // {{items}}
  reEntryTpl: string; // {{value}}
  beforeHarvestTpl: string; // {{value}}
  noSafetyNeeded: string;
  recommendedTreatments: string;
  dose: string;
  timing: string;
  reEntry: string;
  preHarvest: string;
  relativeCost: string;
  keepChildrenOut: string;
  stepTpl: string; // {{n}}
  noTreatmentHealthy: string;
  noTreatmentReturned: string;
  askAboutDiagnosis: string;
  followUpHarvestTpl: string; // {{crop}}
  followUpSpread: string;
  followUpOrganic: string;
  followUpHowMuch: string;
  severity: string;
  youAreHere: string;
  ifLeftUntreated: string;
  estimatedFarmImpact: string;
  expectedYieldTreated: string;
  expectedYieldUntreated: string;
  incomeProtected: string;
  indicativeDisclaimerTpl: string; // {{area}}, {{crop}}
  addFieldSizeTpl: string; // {{crop}}
  trackCropSizeTpl: string; // {{crop}}
  conditions: string;
  weatherUnavailable: string;
  loadingForecast: string;
  rain: string;
  sprayWindow: string;
  wind: string;
  chanceOnDayTpl: string; // {{pct}}, {{day}}
  waitForDrier: string;
  earlyMorningOrDusk: string;
  windSafeTpl: string; // {{speed}}
  liveForecastNote: string;
  similarCasesOnFarm: string;
  firstTimeTpl: string; // {{label}}
  nthTimeTpl: string; // {{nth}}, {{label}}
  lastDiagnosedResolvedTpl: string; // {{time}}
  lastDiagnosedUnresolvedTpl: string; // {{time}}
  lastDiagnosedTpl: string; // {{time}}
  saving: string;
  saveReport: string;
  newScan: string;
  printReport: string;
  ordinal1: string;
  ordinal2: string;
  ordinal3: string;
  ordinal4: string;
  ordinal5: string;

  // Assistant
  askTitle: string;
  askAnything: string;
  listeningEllipsis: string;
  voiceNotSupported: string;
  voiceNeedsSecureConnection: string;
  placeholder: string;
  quickPrompt1: string;
  quickPrompt2: string;
  quickPrompt3: string;

  // History
  tabTimeline: string;
  tabToday: string;
  tabInsights: string;
  historyTitle: string;
  storedOnDevice: string;
  eventsLogged: string;
  syncedToCloud: string;
  offlineFirstNote: string;

  // TodayReport
  dailyBriefingSubtitle: string;
  cropNamePlaceholder: string;
  areaPlaceholder: string;
  areaTooltip: string;
  addCrop: string;
  addCropAboveNote: string;
  preparingTodayReport: string;

  // Insights
  noScansInsights: string;
  scansThisMonth: string;
  avgCropHealth: string;
  treatmentSuccessRate: string;
  notEnoughData: string;
  mostCommonIssues: string;
  noIssuesRecorded: string;
  mostAffectedCrops: string;
  cropNotIdentified: string;
  tipAnswerQuestion: string;

  // HistoryList
  confirmClearHistory: string;
  diagnosesSavedNote: string;
  clearAll: string;
  noHistoryYet: string;
  didTreatmentWork: string;
  yes: string;
  notYetLabel: string;
  resolvedLabel: string;
  stillIssueLabel: string;

  // diagnosisReport.ts — derived, bounded vocabulary
  riskNone: string;
  riskHigh: string;
  riskModerate: string;
  riskLow: string;
  riskUnclear: string;
  actNoActionNeeded: string;
  act24to48: string;
  actThisWeek: string;
  actWhenConvenient: string;
  actReviewManually: string;
  outlookExcellent: string;
  outlookGuarded: string;
  outlookGoodSoon: string;
  outlookGood: string;
  outlookUncertain: string;
  stageToday: string;
  stageIn2to3Days: string;
  stageDay7: string;
  stageOngoing: string;
  nextSeason: string;
  prognosisHigh: string;
  prognosisModerate: string;
  prognosisLow: string;
  prognosisUnknown: string;
  ladderHealthy: string;
  ladderLow: string;
  ladderModerate: string;
  ladderHigh: string;

  // Scan clarify step
  navWatch: string;
  clarifyStepLabel: string;
  clarifyHeading: string;
  clarifySubline: string;
  clarifyQ1: string;
  whereOptWhorl: string;
  whereOptBase: string;
  whereOptStem: string;
  whereOptCobs: string;
  whereNoteWhorl: string;
  whereNoteBase: string;
  whereNoteStem: string;
  whereNoteCobs: string;
  whereNoteDefault: string;
  clarifyQ2: string;
  whenOptToday: string;
  whenOpt2to4: string;
  whenOptWeek: string;
  whenOptUnsure: string;
  whenNoteToday: string;
  whenNote2to4: string;
  whenNoteWeek: string;
  whenNoteUnsure: string;
  whenNoteDefault: string;
  clarifyBtnReady: string;
  clarifyBtnNotReady: string;
  retakePhoto: string;
  photoCheckCautionTpl: string;
  photoCheckOk: string;
  checkingPhoto: string;
  whatIKnow: string;
  refusalNote: string;
  needsRetakeHeading: string;
  needsRetakeBody: string;

  // Village watch
  watchEyebrowTpl: string;
  watchHeading: string;
  watchSubline: string;
  statScansThisWeek: string;
  statFarmsConfirmedTpl: string;
  statSpreadingTpl: string;
  statFarmsInRing: string;
  mapPanelTitle: string;
  legendConfirmed: string;
  legendSuspected: string;
  legendClear: string;
  gridCaption: string;
  originLabelTpl: string;
  yourFarmLabel: string;
  tableFarm: string;
  tableDistance: string;
  tableCrop: string;
  tableStatus: string;
  statusConfirmed: string;
  statusSuspected: string;
  statusClear: string;
  yourFarmNextTitle: string;
  yourFarmNextBodyTpl: string;
  warnFarmsTitleTpl: string;
  alertMetaTpl: string;
  sendAlertBtnTpl: string;
  alertSentBtnTpl: string;
  liveAlertSentMessage: string;
  alertNoChangeMessage: string;
  officerTitle: string;
  officerBodyTpl: string;
  casesTpl: string;
  watchDemoDisclaimer: string;
  watchLiveDataNote: string;
  watchOffline: string;
  watchCachedAsOfTpl: string;
}

export const APP_LANGUAGES: { code: AppLanguage; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ha", label: "Hausa" },
  { code: "yo", label: "Yorùbá" },
  { code: "ig", label: "Igbo" },
];

/** Replaces `{{token}}` placeholders in a translated template string. */
export function tpl(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(vars[key] ?? ""));
}

export const APP_STRINGS: Record<AppLanguage, AppStrings> = {
  en: {
    navDash: "Dashboard",
    navScan: "Scan",
    navDiag: "Diagnosis",
    navAsst: "Assistant",
    navHist: "History",
    editFarmProfile: "Edit farm profile",
    backToSite: "← Back to the site",
    offline: "OFFLINE",
    cloud: "CLOUD",
    myFarmFallback: "My farm",

    listen: "Listen",
    stop: "Stop",
    refresh: "Refresh",
    edit: "Edit",
    loading: "Loading…",
    somethingWentWrong: "Something went wrong. Please try again.",

    greetingMorning: "Good morning",
    greetingAfternoon: "Good afternoon",
    greetingEvening: "Good evening",

    noCropsTrackedYet: "NO CROPS TRACKED YET",
    healthyNoAction: "Healthy — no action needed",
    photographToStart: "Photograph a leaf to get started",
    lastScannedTpl: "Last scanned {{time}} · {{count}} photos this season",
    noScansYetSeason: "No scans yet this season",
    rainForecast: "Rain forecast",
    chanceTomorrow: "Chance tomorrow",
    openAlerts: "Open alerts",
    allClear: "All clear",
    severeAdvisoryTpl: "{{severe}} severe · {{advisory}} advisory",
    diagnosesLogged: "Diagnoses logged",
    totalScansTpl: "{{count}} total scans",
    stageSuffix: "stage",
    addOneInHistory: "Add one in History",
    recommends: "Gemma recommends",
    trackCropPrefix: "Track a crop in",
    trackCropSuffix: "to get a personalized Gemma briefing here.",
    historyLinkLabel: "History",
    preparingBriefing: "Preparing today's briefing…",
    farmProfile: "Farm profile",
    farmer: "Farmer",
    location: "Location",
    cropLabel: "Crop",
    farmSize: "Farm size",
    growthStage: "Growth stage",
    today: "Today",
    spotSomethingUnusual: "Spot something unusual?",
    spotSomethingBody: "Photograph the affected leaf and Gemma 4 will name the pest or disease in seconds.",
    startAScan: "Start a scan",
    recentActivity: "Recent activity",
    noActivityYet: "No activity yet.",
    openFarmHistory: "Open farm history",

    stepOneOfTwo: "Step 1 of 3",
    scanTitle: "Photograph an affected leaf",
    whichCrop: "Which crop?",
    otherOption: "Other",
    customCropPlaceholder: "Type your crop's name…",
    forAGoodPhoto: "For a good photo",
    scanTip1: "Fill the frame with a single affected leaf.",
    scanTip2: "Shoot in daylight, with the sun behind you.",
    scanTip3: "Include the curled-up middle leaves or the stem if that's where the damage is.",
    captureAndDiagnose: "Capture & diagnose",
    uploadPhoto: "Upload photo",
    describeByVoice: "Describe by voice",
    liveHoldSteady: "LIVE · HOLD STEADY",
    edgeOfflineNote: "this scan needs no internet connection.",
    edgeCloudNote: "this scan is processed in the cloud.",
    analysing: "Analysing leaf…",
    waitingOnGemma: "waiting on Gemma 4…",
    logLine1: "✓ image compressed for upload",
    logLine2: "✓ vision tokens → Gemma 4",
    logLine3: "✓ farm log context attached",
    logLine4: "· reasoning over crop disease & pest classes",
    diagnosisFailedServerTpl: "Diagnosis failed (server error {{status}}). Please try again.",
    diagnosisFailed: "Diagnosis failed",
    diagnosisFailedRetry: "Diagnosis failed. Please try again.",

    noScanYet: "No scan yet — photograph a leaf to get a diagnosis.",
    diagnosisCompleteTpl: "Diagnosis complete · {{seconds}}s on Gemma 4",
    risk: "RISK",
    actWithin: "ACT WITHIN",
    outlook: "OUTLOOK",
    factCrop: "Crop",
    factType: "Type",
    factConfidence: "Confidence",
    factSeverity: "Severity",
    factTreatment: "Treatment",
    factSafety: "Safety",
    noneNeeded: "None needed",
    required: "Required",
    treatmentStepsTpl: "{{count}} steps",
    gemmasReading: "Gemma's reading",
    preparingAudio: "Preparing audio…",
    actionPlan: "Action plan",
    applyProductTpl: "Apply {{product}}",
    repeatWithProductTpl: "Repeat with {{product}}",
    whatModelLookedAt: "What the model looked at",
    capturedTpl: "CAPTURED {{time}} · {{crop}}",
    confidenceBreakdown: "Confidence breakdown",
    overallConfidence: "Overall confidence",
    safety: "Safety",
    wearTpl: "Wear: {{items}}",
    reEntryTpl: "Re-entry: {{value}}",
    beforeHarvestTpl: "Before harvest: {{value}}",
    noSafetyNeeded: "No special safety precautions needed for this treatment.",
    recommendedTreatments: "Recommended treatments",
    dose: "Dose",
    timing: "Timing",
    reEntry: "Re-entry",
    preHarvest: "Pre-harvest",
    relativeCost: "Relative cost",
    keepChildrenOut: "Keep children and livestock out for the re-entry period",
    stepTpl: "Step {{n}}",
    noTreatmentHealthy: "No treatment needed — your crop looks healthy.",
    noTreatmentReturned: "No treatment steps were returned.",
    askAboutDiagnosis: "Ask AgroVision about this diagnosis",
    followUpHarvestTpl: "Can I still harvest this {{crop}}?",
    followUpSpread: "Will this spread to my other crops?",
    followUpOrganic: "Can I treat it organically?",
    followUpHowMuch: "How much treatment do I need?",
    severity: "Severity",
    youAreHere: " — you are here",
    ifLeftUntreated: "If left untreated",
    estimatedFarmImpact: "Estimated farm impact",
    expectedYieldTreated: "Expected yield if treated now",
    expectedYieldUntreated: "Expected yield if untreated",
    incomeProtected: "Income protected by treating now",
    indicativeDisclaimerTpl:
      "Indicative — based on your {{area}} ha of {{crop}} and typical smallholder yields/prices, not a live market feed or your actual harvest.",
    addFieldSizeTpl: "Add {{crop}}'s field size in History → Today's briefing to see a personalized yield and income estimate here.",
    trackCropSizeTpl:
      "Track {{crop}} with its field size in History → Today's briefing to see a personalized yield and income estimate here.",
    conditions: "Conditions",
    weatherUnavailable: "Weather unavailable — you appear to be offline.",
    loadingForecast: "Loading forecast…",
    rain: "Rain",
    sprayWindow: "Spray window",
    wind: "Wind",
    chanceOnDayTpl: "{{pct}}% chance {{day}}",
    waitForDrier: "Wait for drier conditions",
    earlyMorningOrDusk: "Early morning or dusk",
    windSafeTpl: "{{speed}} km/h — {{status}}",
    liveForecastNote: "Live forecast for your location.",
    similarCasesOnFarm: "Similar cases on this farm",
    firstTimeTpl: "First time {{label}} has been diagnosed on this farm — nothing to compare against yet.",
    nthTimeTpl: "This is the {{nth}} time {{label}} has appeared on your farm log.",
    lastDiagnosedResolvedTpl: "Last diagnosed {{time}} — you marked that treatment as resolved.",
    lastDiagnosedUnresolvedTpl: "Last diagnosed {{time}} — you marked that one as still an issue.",
    lastDiagnosedTpl: "Last diagnosed {{time}}.",
    saving: "Saving…",
    saveReport: "Save report to farm log",
    newScan: "New scan",
    printReport: "Print report",
    ordinal1: "first",
    ordinal2: "second",
    ordinal3: "third",
    ordinal4: "fourth",
    ordinal5: "fifth",

    askTitle: "Ask about your farm",
    askAnything: "Ask anything about your crops, pests, or farm.",
    listeningEllipsis: "Listening…",
    voiceNotSupported: "Voice input isn't supported in this browser.",
    voiceNeedsSecureConnection: "Voice input needs a secure (https) connection — it won't work over a plain network address. Try typing instead.",
    placeholder: "Ask about your farm…",
    quickPrompt1: "Why are my maize leaves turning yellow?",
    quickPrompt2: "When should I plant tomatoes?",
    quickPrompt3: "Is it safe to spray before rain?",

    tabTimeline: "Timeline",
    tabToday: "Today's briefing",
    tabInsights: "Insights",
    historyTitle: "Farm timeline",
    storedOnDevice: "Stored on this device",
    eventsLogged: "Events logged",
    syncedToCloud: "Synced to cloud",
    offlineFirstNote: "Offline-first by design",

    dailyBriefingSubtitle: "A short morning briefing for your tracked crops.",
    cropNamePlaceholder: "Crop name (e.g. Tomato)",
    areaPlaceholder: "Area (ha) — optional",
    areaTooltip: "Field size in hectares — powers real yield/impact estimates on diagnosis reports",
    addCrop: "Add Crop",
    addCropAboveNote: "Add a crop above to get your first daily report.",
    preparingTodayReport: "Preparing today's report…",

    noScansInsights: "No scans yet — diagnose a crop to start building insights.",
    scansThisMonth: "Scans this month",
    avgCropHealth: "Average crop health",
    treatmentSuccessRate: "Treatment success rate",
    notEnoughData: "Not enough data",
    mostCommonIssues: "Most common issues",
    noIssuesRecorded: "No issues recorded yet.",
    mostAffectedCrops: "Most affected crops",
    cropNotIdentified: "Crop not identified yet.",
    tipAnswerQuestion: 'Tip: answer "Did the treatment work?" in your farm history to start tracking a real success rate.',

    confirmClearHistory: "Clear all farm history? This can't be undone.",
    diagnosesSavedNote: "Diagnoses are saved on this device so you can track patterns over time.",
    clearAll: "Clear all",
    noHistoryYet: "No history yet — diagnose a crop to get started.",
    didTreatmentWork: "Did the treatment work?",
    yes: "Yes",
    notYetLabel: "Not yet",
    resolvedLabel: "Resolved",
    stillIssueLabel: "Still an issue",

    riskNone: "None",
    riskHigh: "High",
    riskModerate: "Moderate",
    riskLow: "Low",
    riskUnclear: "Unclear",
    actNoActionNeeded: "No action needed",
    act24to48: "24–48 hours",
    actThisWeek: "This week",
    actWhenConvenient: "When convenient",
    actReviewManually: "Review manually",
    outlookExcellent: "Excellent",
    outlookGuarded: "Guarded — treat promptly",
    outlookGoodSoon: "Good if treated soon",
    outlookGood: "Good",
    outlookUncertain: "Uncertain",
    stageToday: "TODAY",
    stageIn2to3Days: "IN 2–3 DAYS",
    stageDay7: "DAY 7",
    stageOngoing: "ONGOING",
    nextSeason: "next season",
    prognosisHigh: "Left untreated, issues at this severity typically worsen quickly and can spread to nearby plants within days.",
    prognosisModerate: "Left untreated, this tends to spread gradually and can reduce yield over the coming weeks if conditions favour it.",
    prognosisLow: "Left untreated, this is unlikely to cause serious damage on its own, but keep monitoring in case it develops further.",
    prognosisUnknown: "There isn't enough information here to predict how this develops if left untreated — a follow-up scan would help.",
    ladderHealthy: "Healthy",
    ladderLow: "Low",
    ladderModerate: "Moderate",
    ladderHigh: "High",

    navWatch: "Village watch",
    clarifyStepLabel: "Step 2 of 3 · Gemma is asking",
    clarifyHeading: "Two questions before I answer",
    clarifySubline: "One photo can look like three different problems. Your answers change the treatment, so I would rather ask than guess.",
    clarifyQ1: "Where is the damage worst?",
    whereOptWhorl: "The new leaves curled up in the middle",
    whereOptBase: "The old leaves near the bottom",
    whereOptStem: "The stem, near the ground",
    whereOptCobs: "The corn cobs",
    whereNoteWhorl: "Feeding in the curled-up middle leaves usually means fall armyworm, not stem borer.",
    whereNoteBase: "Damage low on the plant reads more like stem borer or the soil not feeding it well.",
    whereNoteStem: "Damage on the stem usually means stem borer — the treatment is different from pests that eat the middle leaves.",
    whereNoteCobs: "Feeding on the cobs means the caterpillars are already big, so there is less time left to treat.",
    whereNoteDefault: "Tap the answer that matches what you see.",
    clarifyQ2: "When did you first notice it?",
    whenOptToday: "Today",
    whenOpt2to4: "2–4 days ago",
    whenOptWeek: "Over a week ago",
    whenOptUnsure: "I am not sure",
    whenNoteToday: "First seeing it today means you caught it early — one spray may be enough.",
    whenNote2to4: "A few days of feeding means the caterpillars are still small enough for spray to work well.",
    whenNoteWeek: "After a week, the caterpillars are deep in the curled-up leaves and one spray will miss some of them.",
    whenNoteUnsure: "I will assume the caterpillars are medium-sized and plan two rounds of spraying to be safe.",
    whenNoteDefault: "Tap the closest answer — a rough date is enough.",
    clarifyBtnReady: "Diagnose with this context",
    clarifyBtnNotReady: "Answer both to continue",
    retakePhoto: "Retake photo",
    photoCheckCautionTpl: "Photo check · {{count}} caution{{plural}}",
    photoCheckOk: "Photo check · looks clear",
    checkingPhoto: "Checking photo…",
    whatIKnow: "What I already know",
    refusalNote: "If the photo were too dark to read at all, I would say so and ask you to shoot again rather than name a pest I cannot see.",
    needsRetakeHeading: "I need a clearer photo",
    needsRetakeBody: "A confident wrong answer is worse than asking again, so I'm not ready to name this one yet.",

    watchEyebrowTpl: "Anonymised scans · {{lga}} · last 7 days",
    watchHeading: "Village watch",
    watchSubline: "Every scan in the area feeds one shared picture. One farm's diagnosis becomes nine farms' early warning.",
    statScansThisWeek: "scans this week",
    statFarmsConfirmedTpl: "farms confirmed {{disease}}",
    statSpreadingTpl: "spreading {{direction}}",
    statFarmsInRing: "farms in the 5 km ring",
    mapPanelTitle: "Outbreak spread · 5 km radius",
    legendConfirmed: "CONFIRMED",
    legendSuspected: "SUSPECTED",
    legendClear: "CLEAR",
    gridCaption: "GRID = 1 KM · GPS ROUNDED TO 500 M FOR PRIVACY",
    originLabelTpl: "ORIGIN · {{days}} DAYS AGO",
    yourFarmLabel: "YOUR FARM",
    tableFarm: "Farm",
    tableDistance: "Distance",
    tableCrop: "Crop",
    tableStatus: "Status",
    statusConfirmed: "Confirmed",
    statusSuspected: "Suspected",
    statusClear: "Clear",
    yourFarmNextTitle: "Your farm is next in line",
    yourFarmNextBodyTpl:
      "The infestation started {{originDist}} km {{originBearing}} and has moved toward you at about {{speed}} km a day. {{nearestName}}, {{nearestDist}} km {{nearestBearing}}, reported symptoms {{nearestWhen}} — you are inside the front, not ahead of it.",
    warnFarmsTitleTpl: "Warn the {{count}} farms ahead",
    alertMetaTpl: "LIVE ALERT · {{chars}} CHARS · REACHES ANYONE WITH THE APP OPEN WITHIN SECONDS",
    sendAlertBtnTpl: "Send live alert to {{count}} farms",
    alertSentBtnTpl: "✓ Alert sent to {{count}} farms",
    liveAlertSentMessage: "Sent — anyone with Village Watch open will see it within a few seconds.",
    alertNoChangeMessage: "Nothing has changed here since the last alert — you can send another once the numbers above change.",
    officerTitle: "For extension officers",
    officerBodyTpl:
      "One officer covers roughly 1,800 farmers in {{lga}}. This view ranks wards by confirmed cases so visits go where the outbreak is, not where the road is good.",
    casesTpl: "{{count}} cases",
    watchDemoDisclaimer: "Demo data. Locations are illustrative and GPS is rounded so no farm is individually identifiable.",
    watchLiveDataNote: "Live data from real, opted-in nearby scans — locations rounded so no single farm is identifiable.",
    watchOffline: "Weather and outbreak data unavailable offline — showing the last cached result.",
    watchCachedAsOfTpl: "As of {{time}} (cached)",
  },

  ha: {
    navDash: "Allo",
    navScan: "Duba",
    navDiag: "Sakamako",
    navAsst: "Mataimaki",
    navHist: "Tarihi",
    editFarmProfile: "Gyara bayanan gona",
    backToSite: "← Koma zuwa shafin",
    offline: "BABU YANAR GIZO",
    cloud: "GIZAGIZAI",
    myFarmFallback: "Gonata",

    listen: "Saurara",
    stop: "Tsaya",
    refresh: "Sabunta",
    edit: "Gyara",
    loading: "Ana lodi…",
    somethingWentWrong: "Wani abu ya yi kuskure. Da fatan za a sake gwadawa.",

    greetingMorning: "Barka da safiya",
    greetingAfternoon: "Barka da rana",
    greetingEvening: "Barka da yamma",

    noCropsTrackedYet: "BABU AMFANIN GONA DA AKA BIYA DIYA",
    healthyNoAction: "Lafiya — babu buƙatar aiki",
    photographToStart: "Ɗauki hoton ganye don farawa",
    lastScannedTpl: "An duba na ƙarshe {{time}} · hotuna {{count}} a wannan lokacin",
    noScansYetSeason: "Babu dubawa a wannan lokacin tukuna",
    rainForecast: "Hasashen ruwan sama",
    chanceTomorrow: "Damar gobe",
    openAlerts: "Faɗakarwa da ke bude",
    allClear: "Komai lafiya",
    severeAdvisoryTpl: "{{severe}} mai tsanani · {{advisory}} shawara",
    diagnosesLogged: "Sakamakon da aka rubuta",
    totalScansTpl: "jimillar dubawa {{count}}",
    stageSuffix: "mataki",
    addOneInHistory: "Ƙara ɗaya a Tarihi",
    recommends: "Gemma ya ba da shawara",
    trackCropPrefix: "Bi diddigin amfanin gona a",
    trackCropSuffix: "don samun bayanin Gemma na musamman a nan.",
    historyLinkLabel: "Tarihi",
    preparingBriefing: "Ana shirya bayanin yau…",
    farmProfile: "Bayanan gona",
    farmer: "Manomi",
    location: "Wuri",
    cropLabel: "Amfanin gona",
    farmSize: "Girman gona",
    growthStage: "Matakin girma",
    today: "Yau",
    spotSomethingUnusual: "Ka ga wani abu da bai saba ba?",
    spotSomethingBody: "Ɗauki hoton ganyen da abin ya shafa, Gemma 4 zai ba da sunan cutar ko kwaro cikin daƙiƙa.",
    startAScan: "Fara dubawa",
    recentActivity: "Ayyukan kwanan nan",
    noActivityYet: "Babu ayyuka tukuna.",
    openFarmHistory: "Buɗe tarihin gona",

    stepOneOfTwo: "Mataki 1 na 3",
    scanTitle: "Ɗauki hoton ganyen da ya kamu",
    whichCrop: "Wanne amfanin gona?",
    otherOption: "Wani",
    customCropPlaceholder: "Rubuta sunan amfanin gonarka…",
    forAGoodPhoto: "Don kyakkyawan hoto",
    scanTip1: "Cika firam ɗin da ganye guda ɗaya da abin ya shafa.",
    scanTip2: "Ɗauki hoto da hasken rana, rana a bayanka.",
    scanTip3: "Haɗa da sabbin ganyaye a tsakiyar tsiro ko kara idan lalacewa tana can.",
    captureAndDiagnose: "Ɗauki hoto & bincika",
    uploadPhoto: "Loda hoto",
    describeByVoice: "Bayyana ta murya",
    liveHoldSteady: "KAI TSAYE · TSAYA DAIDAI",
    edgeOfflineNote: "wannan dubawa ba ta buƙatar intanet.",
    edgeCloudNote: "ana sarrafa wannan dubawa a gizagizai.",
    analysing: "Ana nazarin ganye…",
    waitingOnGemma: "ana jiran Gemma 4…",
    logLine1: "✓ an matse hoto don loda",
    logLine2: "✓ alamomin gani → Gemma 4",
    logLine3: "✓ an haɗa bayanan gona",
    logLine4: "· ana nazari kan nau'in cuta da kwari",
    diagnosisFailedServerTpl: "Bincike ya kasa (kuskuren sabar {{status}}). Da fatan za a sake gwadawa.",
    diagnosisFailed: "Bincike ya kasa",
    diagnosisFailedRetry: "Bincike ya kasa. Da fatan za a sake gwadawa.",

    noScanYet: "Babu dubawa tukuna — ɗauki hoton ganye don samun sakamako.",
    diagnosisCompleteTpl: "An gama bincike · dakika {{seconds}} akan Gemma 4",
    risk: "HADARI",
    actWithin: "AIKATA CIKIN",
    outlook: "SA RAI",
    factCrop: "Amfanin gona",
    factType: "Nau'i",
    factConfidence: "Tabbaci",
    factSeverity: "Tsanani",
    factTreatment: "Magani",
    factSafety: "Tsaro",
    noneNeeded: "Babu buƙata",
    required: "Ana buƙata",
    treatmentStepsTpl: "matakai {{count}}",
    gemmasReading: "Bayanin Gemma",
    preparingAudio: "Ana shirya sauti…",
    actionPlan: "Tsarin aiki",
    applyProductTpl: "Yi amfani da {{product}}",
    repeatWithProductTpl: "Sake yi da {{product}}",
    whatModelLookedAt: "Abin da tsarin ya duba",
    capturedTpl: "AN ƊAUKA {{time}} · {{crop}}",
    confidenceBreakdown: "Bayanin tabbaci",
    overallConfidence: "Jimillar tabbaci",
    safety: "Tsaro",
    wearTpl: "Sa: {{items}}",
    reEntryTpl: "Sake shiga: {{value}}",
    beforeHarvestTpl: "Kafin girbi: {{value}}",
    noSafetyNeeded: "Babu wani ƙarin tsaro da ake buƙata don wannan magani.",
    recommendedTreatments: "Shawarwarin magani",
    dose: "Yawan magani",
    timing: "Lokaci",
    reEntry: "Sake shiga",
    preHarvest: "Kafin girbi",
    relativeCost: "Kuɗin da ake kashewa",
    keepChildrenOut: "Ka kiyaye yara da dabbobi daga wurin har sai lokacin sake shiga ya wuce",
    stepTpl: "Mataki {{n}}",
    noTreatmentHealthy: "Babu buƙatar magani — amfanin gonarka yana lafiya.",
    noTreatmentReturned: "Ba a samu matakan magani ba.",
    askAboutDiagnosis: "Tambayi AgroVision game da wannan sakamako",
    followUpHarvestTpl: "Zan iya girbi wannan {{crop}}?",
    followUpSpread: "Zai bazu zuwa sauran amfanin gonata?",
    followUpOrganic: "Zan iya magance shi ta hanyar halitta?",
    followUpHowMuch: "Nawa magani nake buƙata?",
    severity: "Tsanani",
    youAreHere: " — kai nan kake",
    ifLeftUntreated: "Idan ba a yi magani ba",
    estimatedFarmImpact: "Kimanin tasiri ga gona",
    expectedYieldTreated: "Ana sa ran girbi idan an yi magani yanzu",
    expectedYieldUntreated: "Ana sa ran girbi idan ba a yi magani ba",
    incomeProtected: "Kudin da za a kiyaye ta hanyar yin magani yanzu",
    indicativeDisclaimerTpl:
      "Kimani ne kawai — dangane da hekta {{area}} na {{crop}} da farashin da ake amfani da su a gona, ba na kasuwa ta ainihi ba ko girbin ka na gaske.",
    addFieldSizeTpl: "Ƙara girman gonar {{crop}} a Tarihi → Bayanin yau don ganin kimanin girbi da kudi na musamman a nan.",
    trackCropSizeTpl: "Bi diddigin {{crop}} tare da girman gonarsa a Tarihi → Bayanin yau don ganin kimanin girbi da kudi a nan.",
    conditions: "Yanayi",
    weatherUnavailable: "Babu bayanin yanayi — kamar ba ka da intanet.",
    loadingForecast: "Ana loda hasashen yanayi…",
    rain: "Ruwan sama",
    sprayWindow: "Lokacin fesawa",
    wind: "Iska",
    chanceOnDayTpl: "damar {{pct}}% {{day}}",
    waitForDrier: "Jira lokacin da babu ruwa",
    earlyMorningOrDusk: "Da safe da wuri ko yamma",
    windSafeTpl: "{{speed}} km/h — {{status}}",
    liveForecastNote: "Hasashen yanayi na yanzu don wurinka.",
    similarCasesOnFarm: "Irin wannan a wannan gonar",
    firstTimeTpl: "Wannan shine karo na farko da aka gano {{label}} a wannan gonar — babu abin kwatantawa tukuna.",
    nthTimeTpl: "Wannan shine karo na {{nth}} da {{label}} ya bayyana a tarihin gonarka.",
    lastDiagnosedResolvedTpl: "An gano na ƙarshe {{time}} — ka rubuta cewa maganin ya yi aiki.",
    lastDiagnosedUnresolvedTpl: "An gano na ƙarshe {{time}} — ka rubuta cewa har yanzu matsala ce.",
    lastDiagnosedTpl: "An gano na ƙarshe {{time}}.",
    saving: "Ana ajiyewa…",
    saveReport: "Ajiye rahoto a tarihin gona",
    newScan: "Sabuwar dubawa",
    printReport: "Buga rahoto",
    ordinal1: "farko",
    ordinal2: "biyu",
    ordinal3: "uku",
    ordinal4: "hudu",
    ordinal5: "biyar",

    askTitle: "Yi tambaya game da gonarka",
    askAnything: "Yi tambaya game da amfanin gona, kwari, ko gonarka.",
    listeningEllipsis: "Ana saurara…",
    voiceNotSupported: "Wannan burauza ba ta goyi bayan shigar da murya ba.",
    voiceNeedsSecureConnection: "Shigar da murya tana buƙatar haɗin aminci (https) — ba zai yi aiki ba a kan adireshin cibiyar sadarwa kawai. Gwada rubutu maimakon.",
    placeholder: "Yi tambaya game da gonarka…",
    quickPrompt1: "Me yasa ganyen masarata ke rawaya?",
    quickPrompt2: "Yaushe zan shuka tumatir?",
    quickPrompt3: "Yana da lafiya in fesa kafin ruwan sama?",

    tabTimeline: "Jerin lokaci",
    tabToday: "Bayanin yau",
    tabInsights: "Bincike",
    historyTitle: "Tarihin gona",
    storedOnDevice: "An ajiye a wannan na'ura",
    eventsLogged: "Abubuwan da aka rubuta",
    syncedToCloud: "An aika zuwa gizagizai",
    offlineFirstNote: "An tsara shi don aiki ba tare da intanet ba",

    dailyBriefingSubtitle: "Ɗan taƙaitaccen bayani na safiya don amfanin gonarka.",
    cropNamePlaceholder: "Sunan amfanin gona (misali Tumatir)",
    areaPlaceholder: "Girma (hekta) — ba dole ba",
    areaTooltip: "Girman gona da hekta — yana taimakawa wajen samun ingantaccen kimanin girbi da tasiri",
    addCrop: "Ƙara Amfanin Gona",
    addCropAboveNote: "Ƙara amfanin gona a sama don samun rahoton yau na farko.",
    preparingTodayReport: "Ana shirya rahoton yau…",

    noScansInsights: "Babu dubawa tukuna — bincika amfanin gona don farawa da bincike.",
    scansThisMonth: "Dubawa a wannan wata",
    avgCropHealth: "Matsakaicin lafiyar amfanin gona",
    treatmentSuccessRate: "Adadin nasarar magani",
    notEnoughData: "Babu isasshen bayani",
    mostCommonIssues: "Matsalolin da suka fi yawa",
    noIssuesRecorded: "Babu matsalolin da aka rubuta tukuna.",
    mostAffectedCrops: "Amfanin gona da suka fi shafa",
    cropNotIdentified: "Ba a gano amfanin gona ba tukuna.",
    tipAnswerQuestion: 'Shawara: amsa "Shin maganin ya yi aiki?" a tarihin gonarka don fara bin diddigin nasara ta ainihi.',

    confirmClearHistory: "Share dukkan tarihin gona? Ba za a iya mayar da wannan ba.",
    diagnosesSavedNote: "Ana ajiye sakamakon bincike a wannan na'ura don bin diddigin abin da ke faruwa akan lokaci.",
    clearAll: "Share duka",
    noHistoryYet: "Babu tarihi tukuna — bincika amfanin gona don farawa.",
    didTreatmentWork: "Shin maganin ya yi aiki?",
    yes: "Eh",
    notYetLabel: "Tukuna ba",
    resolvedLabel: "An warware",
    stillIssueLabel: "Har yanzu matsala",

    riskNone: "Babu",
    riskHigh: "Mai tsanani",
    riskModerate: "Matsakaici",
    riskLow: "Kadan",
    riskUnclear: "Ba a bayyana ba",
    actNoActionNeeded: "Babu buƙatar aiki",
    act24to48: "Sa'o'i 24–48",
    actThisWeek: "A wannan makon",
    actWhenConvenient: "Duk lokacin da ya dace",
    actReviewManually: "A duba da kanka",
    outlookExcellent: "Mai kyau ƙwarai",
    outlookGuarded: "Ana tsammani — a yi magani da wuri",
    outlookGoodSoon: "Zai yi kyau idan an yi magani da wuri",
    outlookGood: "Mai kyau",
    outlookUncertain: "Ba a tabbata ba",
    stageToday: "YAU",
    stageIn2to3Days: "CIKIN KWANA 2-3",
    stageDay7: "RANA TA 7",
    stageOngoing: "MAI CI GABA",
    nextSeason: "kakar mai zuwa",
    prognosisHigh: "Idan ba a yi magani ba, matsalar wannan tsananin yakan yi muni cikin sauri kuma ya bazu zuwa tsire-tsire kusa cikin kwanaki.",
    prognosisModerate: "Idan ba a yi magani ba, wannan yakan bazu a hankali kuma zai iya rage girbi cikin makonni masu zuwa idan yanayi ya dace da shi.",
    prognosisLow: "Idan ba a yi magani ba, ba abin da zai haifar da babbar illa da kansa, amma a ci gaba da lura idan ya ci gaba.",
    prognosisUnknown: "Babu isasshen bayani don hasashen yadda wannan zai kasance idan ba a yi magani ba — sake dubawa zai taimaka.",
    ladderHealthy: "Lafiya",
    ladderLow: "Kadan",
    ladderModerate: "Matsakaici",
    ladderHigh: "Mai tsanani",

    navWatch: "Sa ido kauye",
    clarifyStepLabel: "Mataki 2 na 3 · Gemma tana tambaya",
    clarifyHeading: "Tambayoyi biyu kafin in amsa",
    clarifySubline: "Hoto ɗaya na iya kama da matsaloli uku daban-daban. Amsoshinka na canza magani, don haka na fi son yin tambaya maimakon ƙidaya kawai.",
    clarifyQ1: "A ina lalacewa ta fi muni?",
    whereOptWhorl: "Sabbin ganyaye a tsakiyar tsiro",
    whereOptBase: "Tsofaffin ganyaye kusa da ƙasa",
    whereOptStem: "Kara, kusa da ƙasa",
    whereOptCobs: "Kwarjinin masara",
    whereNoteWhorl: "Cin abinci a tsakiyar tsiro yana nuni ga fall armyworm maimakon stem borer.",
    whereNoteBase: "Lalacewa a ƙasan tsiro tana kama da stem borer ko rashin abinci mai gina jiki.",
    whereNoteStem: "Lalacewar tushe tana nuna stem borer — magani ya bambanta da na kwaron tsakiya.",
    whereNoteCobs: "Cin kwarjini yana nufin tsutsotsi sun girma sosai; lokacin magani yana kusa da ƙarewa.",
    whereNoteDefault: "Danna amsar da ta dace da abin da kake gani.",
    clarifyQ2: "Yaushe ka fara lura da shi?",
    whenOptToday: "Yau",
    whenOpt2to4: "Kwana 2-4 da suka wuce",
    whenOptWeek: "Fiye da mako guda da ya wuce",
    whenOptUnsure: "Ban tabbata ba",
    whenNoteToday: "Ganin farko a yau yana nufin ka zo da wuri — fesawa ɗaya na iya isa.",
    whenNote2to4: "Kwana kaɗan na ci yana nufin tsutsotsi har yanzu ana iya kaiwa da fesa.",
    whenNoteWeek: "Bayan mako guda, tsutsotsi sun shiga zurfi kuma fesa ɗaya ba zai kama duka ba.",
    whenNoteUnsure: "Zan ɗauka tsutsotsi sun tsakaita girma in tsara fesawa sau biyu don tabbaci.",
    whenNoteDefault: "Danna amsar da ta fi kusa — kwanan wata na kusa ya isa.",
    clarifyBtnReady: "Bincika da wannan bayani",
    clarifyBtnNotReady: "Amsa dukkan tambayoyin biyu don ci gaba",
    retakePhoto: "Sake ɗaukar hoto",
    photoCheckCautionTpl: "Bincike hoto · {{count}} gargaɗi",
    photoCheckOk: "Bincike hoto · ya bayyana a sarari",
    checkingPhoto: "Ana bincikar hoto…",
    whatIKnow: "Abin da na riga na sani",
    refusalNote: "Idan hoton ya yi duhu ƙwarai da ba za a iya karantawa ba, zan faɗa haka in nemi ka sake ɗaukar hoto maimakon in ambaci kwaron da ba na iya gani ba.",
    needsRetakeHeading: "Ina buƙatar hoto mai kyau",
    needsRetakeBody: "Amsa mara kyau da tabbaci ta fi muni da sake tambaya, don haka ban shirya in ambaci wannan ba tukuna.",

    watchEyebrowTpl: "Dubawa ba tare da suna ba · {{lga}} · kwana 7 da suka wuce",
    watchHeading: "Sa ido kauye",
    watchSubline: "Kowace dubawa a yankin tana ba da gudummawa ga hoto ɗaya na gaba ɗaya. Bincike na gona ɗaya ya zama faɗakarwa da wuri ga gonaki tara.",
    statScansThisWeek: "dubawa a wannan makon",
    statFarmsConfirmedTpl: "gonaki da aka tabbatar da {{disease}}",
    statSpreadingTpl: "yana yaɗuwa {{direction}}",
    statFarmsInRing: "gonaki cikin kilomita 5",
    mapPanelTitle: "Yaɗuwar ɓarkewa · radius na kilomita 5",
    legendConfirmed: "AN TABBATAR",
    legendSuspected: "AN ZARGI",
    legendClear: "BABU MATSALA",
    gridCaption: "GRID = KM 1 · GPS AN ZAGAYE ZUWA MITA 500 DON SIRRI",
    originLabelTpl: "TUSHE · KWANA {{days}} DA SUKA WUCE",
    yourFarmLabel: "GONARKA",
    tableFarm: "Gona",
    tableDistance: "Nisa",
    tableCrop: "Amfanin gona",
    tableStatus: "Matsayi",
    statusConfirmed: "An tabbatar",
    statusSuspected: "An zargi",
    statusClear: "Babu matsala",
    yourFarmNextTitle: "Gonarka ta gaba take",
    yourFarmNextBodyTpl:
      "Ɓarkewar ta fara nesa da kilomita {{originDist}} {{originBearing}} kuma tana matsawa zuwa gare ka da kimanin kilomita {{speed}} a rana. {{nearestName}}, mai nisan kilomita {{nearestDist}} {{nearestBearing}}, ya ba da rahoton alamu {{nearestWhen}} — kana cikin gaba, ba gabanta ba.",
    warnFarmsTitleTpl: "Faɗakar da gonaki {{count}} da ke gaba",
    alertMetaTpl: "FAƊAKARWA KAI TSAYE · HARAFI {{chars}} · TANA ISA GA DUK WANDA YE BUƊE APP CIKIN 'YAN DAKIKOKI",
    sendAlertBtnTpl: "Aika faɗakarwa kai tsaye zuwa gonaki {{count}}",
    alertSentBtnTpl: "✓ An aika faɗakarwa zuwa gonaki {{count}}",
    liveAlertSentMessage: "An aika — duk wanda ya buɗe Sa ido kauye zai gani cikin 'yan dakikoki.",
    alertNoChangeMessage: "Babu wani sabon canji a nan tun bayan faɗakarwa ta ƙarshe — za ka iya sake aikawa idan lambobi sun canza.",
    officerTitle: "Don jami'an fadada aikin gona",
    officerBodyTpl:
      "Jami'i ɗaya yana kula da kimanin manoma 1,800 a {{lga}}. Wannan ra'ayin yana jera wardoji bisa lamura da aka tabbatar don ziyara ta je inda ɓarkewar take, ba inda hanya take da kyau ba.",
    casesTpl: "lamura {{count}}",
    watchDemoDisclaimer: "Bayanan zanga-zanga ne. Wurare misalai ne kuma an zagaye GPS don kada a gane kowace gona.",
    watchLiveDataNote: "Bayanai na gaske daga dubawa na kusa da aka yarda a raba su — an zagaye wurare don kada a gane gona ɗaya.",
    watchOffline: "Babu bayanan yanayi da ɓarkewa a layi — ana nuna sakamakon da aka ajiye na ƙarshe.",
    watchCachedAsOfTpl: "Kamar na {{time}} (ajiye)",
  },

  yo: {
    navDash: "Pátákó",
    navScan: "Yẹ̀wò",
    navDiag: "Àyẹ̀wò",
    navAsst: "Olùrànlọ́wọ́",
    navHist: "Ìtàn",
    editFarmProfile: "Ṣàtúnṣe àlàyé oko",
    backToSite: "← Padà sí ojú-òpó",
    offline: "LÁÌ SÓRÍ AYÉ ÍNTÁNẸ́TÌ",
    cloud: "ÌṢÚRA ÁWỌ̀ SÁMMÌ",
    myFarmFallback: "Oko mi",

    listen: "Gbọ́",
    stop: "Dúró",
    refresh: "Tún ṣe",
    edit: "Ṣàtúnṣe",
    loading: "Ń kó wọlé…",
    somethingWentWrong: "Àṣìṣe kan ṣẹlẹ̀. Jọ̀wọ́ gbìyànjú lẹ́ẹ̀kansí.",

    greetingMorning: "Ẹ káàárọ̀",
    greetingAfternoon: "Ẹ káàsán",
    greetingEvening: "Ẹ kùúrọ̀lẹ́",

    noCropsTrackedYet: "KO SÍ ẸWỌ́ TÍ A TỌ́ KA SÍ",
    healthyNoAction: "Ó dára — kò sí ìgbésẹ̀ tí a nílò",
    photographToStart: "Ya fọ́tò ewé láti bẹ̀rẹ̀",
    lastScannedTpl: "Ìgbẹ̀yìn tí a yẹ̀wò {{time}} · fọ́tò {{count}} ní àsìkò yìí",
    noScansYetSeason: "Kò sí àyẹ̀wò kankan ní àsìkò yìí",
    rainForecast: "Àsọtẹ́lẹ̀ òjò",
    chanceTomorrow: "Àǹfààní ọ̀la",
    openAlerts: "Ìkìlọ̀ tí ó ṣí sílẹ̀",
    allClear: "Ohun gbogbo dára",
    severeAdvisoryTpl: "{{severe}} le · {{advisory}} ìmọ̀ràn",
    diagnosesLogged: "Àyẹ̀wò tí a kọ sílẹ̀",
    totalScansTpl: "àpapọ̀ àyẹ̀wò {{count}}",
    stageSuffix: "ìpele",
    addOneInHistory: "Fi ọ̀kan kún nínú Ìtàn",
    recommends: "Gemma dámọ̀ràn",
    trackCropPrefix: "Tọ́ ka ẹwọ́ kan nínú",
    trackCropSuffix: "láti rí àlàyé Gemma pàtàkì níbí.",
    historyLinkLabel: "Ìtàn",
    preparingBriefing: "Ń ṣe àlàyé òní…",
    farmProfile: "Àlàyé oko",
    farmer: "Àgbẹ̀",
    location: "Ibi tí ó wà",
    cropLabel: "Ẹwọ́",
    farmSize: "Ìwọ̀n oko",
    growthStage: "Ìpele ìdàgbàsókè",
    today: "Òní",
    spotSomethingUnusual: "Ṣé o rí ohun àjèjì kan?",
    spotSomethingBody: "Ya fọ́tò ewé tí ó ní àrùn, Gemma 4 yóò sọ orúkọ àrùn tàbí kòkòrò náà láàrin ìṣẹ́jú-àáyá.",
    startAScan: "Bẹ̀rẹ̀ àyẹ̀wò",
    recentActivity: "Ìṣe tuntun",
    noActivityYet: "Kò sí ìṣe kankan síbẹ̀.",
    openFarmHistory: "Ṣí ìtàn oko",

    stepOneOfTwo: "Ìgbésẹ̀ 1 nínú 3",
    scanTitle: "Ya fọ́tò ewé tí ó ní àrùn",
    whichCrop: "Ẹwọ́ wo?",
    otherOption: "Òmíràn",
    customCropPlaceholder: "Kọ orúkọ ẹwọ́ rẹ…",
    forAGoodPhoto: "Fún fọ́tò tí ó dára",
    scanTip1: "Fi ewé kan ṣoṣo tí ó ní àrùn kún gbogbo fọ́tò náà.",
    scanTip2: "Ya fọ́tò ní ìmọ́lẹ̀ ọ̀sán, oòrùn ní ẹ̀yìn rẹ.",
    scanTip3: "Fi àárín ewé tàbí igi kún tí ìparun bá wà níbẹ̀.",
    captureAndDiagnose: "Ya fọ́tò & ṣàyẹ̀wò",
    uploadPhoto: "Fi fọ́tò sí orí ẹ̀rọ",
    describeByVoice: "Ṣàlàyé pẹ̀lú ohùn",
    liveHoldSteady: "LÁÌ FÀÁ · DÚRÓ JẸ́ẸJẸ́",
    edgeOfflineNote: "àyẹ̀wò yìí kò nílò ìsopọ̀ ayélujára.",
    edgeCloudNote: "a ń ṣe àyẹ̀wò yìí nínú ìṣúra áwọ̀sámmì.",
    analysing: "Ń ṣàyẹ̀wò ewé…",
    waitingOnGemma: "ń dúró de Gemma 4…",
    logLine1: "✓ a rẹ́ fọ́tò kù fún fífi sí orí ẹ̀rọ",
    logLine2: "✓ àmì ìríran → Gemma 4",
    logLine3: "✓ àlàyé oko ti so pọ̀",
    logLine4: "· ń ronú lórí onírúurú àrùn àti kòkòrò",
    diagnosisFailedServerTpl: "Àyẹ̀wò kùnà (àṣìṣe sáfà {{status}}). Jọ̀wọ́ gbìyànjú lẹ́ẹ̀kansí.",
    diagnosisFailed: "Àyẹ̀wò kùnà",
    diagnosisFailedRetry: "Àyẹ̀wò kùnà. Jọ̀wọ́ gbìyànjú lẹ́ẹ̀kansí.",

    noScanYet: "Kò sí àyẹ̀wò síbẹ̀ — ya fọ́tò ewé láti rí àyẹ̀wò kan.",
    diagnosisCompleteTpl: "Àyẹ̀wò ti parí · ìṣẹ́jú-àáyá {{seconds}} lórí Gemma 4",
    risk: "EWU",
    actWithin: "ṢE NÍNÚ",
    outlook: "ÌRETÍ",
    factCrop: "Ẹwọ́",
    factType: "Irú",
    factConfidence: "Ìgbẹ́kẹ̀lé",
    factSeverity: "Bí ó ti le tó",
    factTreatment: "Ìtọ́jú",
    factSafety: "Ààbò",
    noneNeeded: "Kò nílò",
    required: "Ó nílò",
    treatmentStepsTpl: "ìgbésẹ̀ {{count}}",
    gemmasReading: "Àlàyé Gemma",
    preparingAudio: "Ń ṣe ohùn sílẹ̀…",
    actionPlan: "Ètò ìgbésẹ̀",
    applyProductTpl: "Lo {{product}}",
    repeatWithProductTpl: "Tún ṣe pẹ̀lú {{product}}",
    whatModelLookedAt: "Ohun tí àwòṣe náà wò",
    capturedTpl: "A YÀ Á {{time}} · {{crop}}",
    confidenceBreakdown: "Ìpínyà ìgbẹ́kẹ̀lé",
    overallConfidence: "Ìgbẹ́kẹ̀lé lápapọ̀",
    safety: "Ààbò",
    wearTpl: "Wọ̀: {{items}}",
    reEntryTpl: "Àkókò padà wọlé: {{value}}",
    beforeHarvestTpl: "Kí a tó kórè: {{value}}",
    noSafetyNeeded: "Kò sí ààbò pàtàkì tí a nílò fún ìtọ́jú yìí.",
    recommendedTreatments: "Ìtọ́jú tí a dámọ̀ràn",
    dose: "Ìwọ̀n oògùn",
    timing: "Àkókò",
    reEntry: "Àkókò padà wọlé",
    preHarvest: "Kí a tó kórè",
    relativeCost: "Iye owó tí ó jọ",
    keepChildrenOut: "Máa pa àwọn ọmọdé àti ẹran mọ́ kúrò títí àkókò padà wọlé yóò fi kọjá",
    stepTpl: "Ìgbésẹ̀ {{n}}",
    noTreatmentHealthy: "Kò nílò ìtọ́jú — ẹwọ́ rẹ dára gan-an.",
    noTreatmentReturned: "A kò rí àwọn ìgbésẹ̀ ìtọ́jú.",
    askAboutDiagnosis: "Bèèrè lọ́wọ́ AgroVision nípa àyẹ̀wò yìí",
    followUpHarvestTpl: "Ṣé mo lè kórè {{crop}} yìí síbẹ̀?",
    followUpSpread: "Ṣé yóò tàn kálẹ̀ sí àwọn ẹwọ́ mìíràn mi?",
    followUpOrganic: "Ṣé mo lè tọ́jú rẹ̀ ní ọ̀nà àdánidá?",
    followUpHowMuch: "Iye oògùn wo ni mo nílò?",
    severity: "Bí ó ti le tó",
    youAreHere: " — ìhín ni o wà",
    ifLeftUntreated: "Tí a kò bá tọ́jú rẹ̀",
    estimatedFarmImpact: "Ìṣírò ipa lórí oko",
    expectedYieldTreated: "Èso tí a retí tí a bá tọ́jú rẹ̀ báyìí",
    expectedYieldUntreated: "Èso tí a retí tí a kò bá tọ́jú rẹ̀",
    incomeProtected: "Owó tí a óò dáàbò bò nípa tọ́jú rẹ̀ báyìí",
    indicativeDisclaimerTpl:
      "Ìṣírò lásán ni — tí a gbé ka hektári {{area}} ti {{crop}} rẹ àti owó tí ó ṣe déédéé, kì í ṣe owó ọjà gidi tàbí èso rẹ gidi.",
    addFieldSizeTpl: "Fi ìwọ̀n oko {{crop}} kún nínú Ìtàn → Àlàyé òní láti rí ìṣírò èso àti owó pàtàkì níbí.",
    trackCropSizeTpl: "Tọ́ ka {{crop}} pẹ̀lú ìwọ̀n oko rẹ̀ nínú Ìtàn → Àlàyé òní láti rí ìṣírò èso àti owó níbí.",
    conditions: "Ipò ojú-ọjọ́",
    weatherUnavailable: "Kò sí ìsọfúnni ojú-ọjọ́ — ó dàbí pé o kò sórí ayélujára.",
    loadingForecast: "Ń kó àsọtẹ́lẹ̀ ojú-ọjọ́ wọlé…",
    rain: "Òjò",
    sprayWindow: "Àkókò fífun oògùn",
    wind: "Afẹ́fẹ́",
    chanceOnDayTpl: "àǹfààní {{pct}}% ní {{day}}",
    waitForDrier: "Dúró de ọjọ́ tí kò rí òjò",
    earlyMorningOrDusk: "Ní kùtùkùtù òwúrọ̀ tàbí ìrọ̀lẹ́",
    windSafeTpl: "{{speed}} km/h — {{status}}",
    liveForecastNote: "Àsọtẹ́lẹ̀ ojú-ọjọ́ lọ́wọ́lọ́wọ́ fún ibi tí o wà.",
    similarCasesOnFarm: "Irú àyẹ̀wò bẹ́ẹ̀ nínú oko yìí",
    firstTimeTpl: "Ìgbà àkọ́kọ́ tí a ṣàyẹ̀wò {{label}} nínú oko yìí — kò tíì sí ohun tí a fi ṣe àfiwé.",
    nthTimeTpl: "Èyí ni ìgbà {{nth}} tí {{label}} ti farahàn nínú ìtàn oko rẹ.",
    lastDiagnosedResolvedTpl: "Ìgbẹ̀yìn tí a ṣàyẹ̀wò {{time}} — o kọ pé ìtọ́jú náà ṣiṣẹ́.",
    lastDiagnosedUnresolvedTpl: "Ìgbẹ̀yìn tí a ṣàyẹ̀wò {{time}} — o kọ pé ìṣòro náà ṣì wà.",
    lastDiagnosedTpl: "Ìgbẹ̀yìn tí a ṣàyẹ̀wò {{time}}.",
    saving: "Ń fi pamọ́…",
    saveReport: "Fi ìjábọ̀ pamọ́ sínú ìtàn oko",
    newScan: "Àyẹ̀wò tuntun",
    printReport: "Tẹ ìjábọ̀ jáde",
    ordinal1: "àkọ́kọ́",
    ordinal2: "kejì",
    ordinal3: "kẹta",
    ordinal4: "kẹrin",
    ordinal5: "karùn-ún",

    askTitle: "Béèrè nípa oko rẹ",
    askAnything: "Béèrè ohunkóhun nípa ẹwọ́, kòkòrò, tàbí oko rẹ.",
    listeningEllipsis: "Ń gbọ́…",
    voiceNotSupported: "Ẹ̀rọ ìwádìí yìí kò ṣe àtìlẹ́yìn fún ohùn.",
    voiceNeedsSecureConnection: "Ìsọ̀rọ̀ nílò ìsopọ̀ tí ó dáàbò bò (https) — kò ní ṣiṣẹ́ lórí àdírẹ́sì nẹ́tíwọ̀kì lásán. Gbìyànjú láti kọ dípò.",
    placeholder: "Béèrè nípa oko rẹ…",
    quickPrompt1: "Kí ni ó ń mú kí ewé àgbàdo mi ń di ófeefee?",
    quickPrompt2: "Nígbà wo ni mo yẹ kí n gbin tòmátì?",
    quickPrompt3: "Ṣé ó dára láti fún oògùn kí òjò tó rọ̀?",

    tabTimeline: "Ìtòlẹ́sẹẹsẹ",
    tabToday: "Àlàyé òní",
    tabInsights: "Ìjìnlẹ̀ òye",
    historyTitle: "Ìtàn oko",
    storedOnDevice: "A ti fi pamọ́ sórí ẹ̀rọ yìí",
    eventsLogged: "Ìṣẹ̀lẹ̀ tí a kọ sílẹ̀",
    syncedToCloud: "A firanṣẹ́ sí ìṣúra áwọ̀sámmì",
    offlineFirstNote: "A ṣe é láti ṣiṣẹ́ láìní ayélujára",

    dailyBriefingSubtitle: "Àlàyé kúkúrú owurọ̀ fún àwọn ẹwọ́ tí o tọ́ka sí.",
    cropNamePlaceholder: "Orúkọ ẹwọ́ (bí i Tòmátì)",
    areaPlaceholder: "Ìwọ̀n (hektári) — kì í ṣe dandan",
    areaTooltip: "Ìwọ̀n oko ní hektári — ṣe ìrànlọ́wọ́ fún ìṣírò èso àti ipa gidi lórí àyẹ̀wò",
    addCrop: "Fi Ẹwọ́ Kún",
    addCropAboveNote: "Fi ẹwọ́ kún lókè láti rí ìjábọ̀ òní àkọ́kọ́ rẹ.",
    preparingTodayReport: "Ń ṣe ìjábọ̀ òní sílẹ̀…",

    noScansInsights: "Kò sí àyẹ̀wò síbẹ̀ — ṣàyẹ̀wò ẹwọ́ kan láti bẹ̀rẹ̀ kíkọ́ ìjìnlẹ̀ òye.",
    scansThisMonth: "Àyẹ̀wò ní oṣù yìí",
    avgCropHealth: "Ìwọ̀n àlàáfíà ẹwọ́ ní gbogbogbò",
    treatmentSuccessRate: "Ìwọ̀n àṣeyọrí ìtọ́jú",
    notEnoughData: "Kò tíì sí ìsọfúnni tó pọ̀",
    mostCommonIssues: "Àwọn ìṣòro tí ó wọ́pọ̀ jùlọ",
    noIssuesRecorded: "Kò sí ìṣòro tí a kọ sílẹ̀ síbẹ̀.",
    mostAffectedCrops: "Àwọn ẹwọ́ tí ó kan jùlọ",
    cropNotIdentified: "A kò tíì dá ẹwọ́ mọ̀ síbẹ̀.",
    tipAnswerQuestion: 'Ìmọ̀ràn: dáhùn "Ṣé ìtọ́jú náà ṣiṣẹ́?" nínú ìtàn oko rẹ láti bẹ̀rẹ̀ kíkọ́ ìwọ̀n àṣeyọrí gidi.',

    confirmClearHistory: "Pa gbogbo ìtàn oko rẹ rẹ́? A kò lè mú u padà.",
    diagnosesSavedNote: "A ń fi àwọn àyẹ̀wò pamọ́ sórí ẹ̀rọ yìí kí o lè tọpa àwọn àpẹẹrẹ ní àkókò.",
    clearAll: "Pa gbogbo rẹ̀ rẹ́",
    noHistoryYet: "Kò sí ìtàn síbẹ̀ — ṣàyẹ̀wò ẹwọ́ kan láti bẹ̀rẹ̀.",
    didTreatmentWork: "Ṣé ìtọ́jú náà ṣiṣẹ́?",
    yes: "Bẹ́ẹ̀ni",
    notYetLabel: "Kò tíì",
    resolvedLabel: "Ó ti yanjú",
    stillIssueLabel: "Ó ṣì jẹ́ ìṣòro",

    riskNone: "Kò sí",
    riskHigh: "Le",
    riskModerate: "Àárín",
    riskLow: "Kékeré",
    riskUnclear: "Kò ṣe kedere",
    actNoActionNeeded: "Kò sí ìgbésẹ̀ tí a nílò",
    act24to48: "Wákàtí 24–48",
    actThisWeek: "Ní ọ̀sẹ̀ yìí",
    actWhenConvenient: "Nígbàkígbà tí ó bá yẹ",
    actReviewManually: "Ṣàyẹ̀wò fúnra rẹ",
    outlookExcellent: "Ó dára gan-an",
    outlookGuarded: "A ṣọ́ra — tọ́jú rẹ̀ kíákíá",
    outlookGoodSoon: "Yóò dára tí a bá tọ́jú rẹ̀ láìpẹ́",
    outlookGood: "Ó dára",
    outlookUncertain: "Kò ṣe kedere",
    stageToday: "ÒNÍ",
    stageIn2to3Days: "NÍNÚ ỌJỌ́ 2–3",
    stageDay7: "ỌJỌ́ KEJE",
    stageOngoing: "Ó Ń LỌ LỌ́WỌ́",
    nextSeason: "àkókò tí ń bọ̀",
    prognosisHigh: "Tí a kò bá tọ́jú rẹ̀, ìṣòro ìwọ̀n yìí máa ń burú kíákíá tí ó sì lè tàn kálẹ̀ sí àwọn ohun ọ̀gbìn tí ó wà nítòsí láàrin ọjọ́ mélòó kan.",
    prognosisModerate: "Tí a kò bá tọ́jú rẹ̀, èyí máa ń tàn kálẹ̀ díẹ̀díẹ̀, ó sì lè dín èso kù ní àwọn ọ̀sẹ̀ tí ń bọ̀ tí ipò bá gbà á láàyè.",
    prognosisLow: "Tí a kò bá tọ́jú rẹ̀, kò ṣeéṣe kí ó fa ìparun ńlá fúnra rẹ̀, ṣùgbọ́n ẹ máa bójú tó ó bí ó bá ń burú síi.",
    prognosisUnknown: "Kò sí ìsọfúnni tó tó láti sọ bí èyí yóò ṣe rí tí a kò bá tọ́jú rẹ̀ — àyẹ̀wò mìíràn yóò ràn wá lọ́wọ́.",
    ladderHealthy: "Ó dára",
    ladderLow: "Kékeré",
    ladderModerate: "Àárín",
    ladderHigh: "Le",

    navWatch: "Ìṣọ́ ìletò",
    clarifyStepLabel: "Ìgbésẹ̀ 2 nínú 3 · Gemma ń bèèrè",
    clarifyHeading: "Ìbéèrè méjì kí n tó dáhùn",
    clarifySubline: "Fọ́tò kan lè dà bí ìṣòro mẹ́ta ọ̀tọ̀ọ̀tọ̀. Ìdáhùn rẹ ni yóò yí ìtọ́jú padà, nítorí náà mo fẹ́ràn láti béèrè ju láti gbéra kiri lọ.",
    clarifyQ1: "Níbo ni ìparun ti burú jùlọ?",
    whereOptWhorl: "Ewé tuntun tí ó wà ní àárín igi",
    whereOptBase: "Ewé àgbà nítòsí ìsàlẹ̀",
    whereOptStem: "Igi, nítòsí ilẹ̀",
    whereOptCobs: "Èso àgbàdo",
    whereNoteWhorl: "Jíjẹ nínú àárín ewé fi hàn fall armyworm ju stem borer lọ.",
    whereNoteBase: "Ìparun ní ìsàlẹ̀ ohun ọ̀gbìn jọ stem borer tàbí àìtó oúnjẹ.",
    whereNoteStem: "Ìparun ìsàlẹ̀ fi hàn stem borer — ìtọ́jú yàtọ̀ sí ti kòkòrò àárín ewé.",
    whereNoteCobs: "Jíjẹ èso fi hàn pé kòkòrò náà ti dàgbà; àkókò ìtọ́jú ń sún mọ́ òpin.",
    whereNoteDefault: "Tẹ ìdáhùn tí ó bá ohun tí o rí mu.",
    clarifyQ2: "Nígbà wo ni o kọ́kọ́ ṣàkíyèsí rẹ̀?",
    whenOptToday: "Òní",
    whenOpt2to4: "Ọjọ́ 2–4 sẹ́yìn",
    whenOptWeek: "Ju ọ̀sẹ̀ kan lọ sẹ́yìn",
    whenOptUnsure: "Èmi kò dá mi lójú",
    whenNoteToday: "Rírí i lákọ́kọ́ òní fi hàn pé o ti tọ́jú rẹ̀ ní kùtùkùtù — ìtọ́jú kan lè tó.",
    whenNote2to4: "Ọjọ́ díẹ̀ ti jíjẹ fi hàn kòkòrò kékeré tí a ṣì lè dé bá pẹ̀lú oògùn.",
    whenNoteWeek: "Lẹ́yìn ọ̀sẹ̀ kan, kòkòrò náà ti jinlẹ̀ nínú àárín ewé, oògùn kan kì yóò tó.",
    whenNoteUnsure: "Èmi yóò rò pé kòkòrò náà wà ní àárín ìdàgbàsókè, kí n gbìmọ̀ ìtọ́jú ẹ̀ẹ̀mejì láti dánilójú.",
    whenNoteDefault: "Tẹ ìdáhùn tí ó sún mọ́ jùlọ — ọjọ́ tí ó fẹ́rẹ̀ tọ́ ni ó tó.",
    clarifyBtnReady: "Ṣàyẹ̀wò pẹ̀lú àlàyé yìí",
    clarifyBtnNotReady: "Dáhùn àwọn ìbéèrè méjèèjì láti tẹ̀síwájú",
    retakePhoto: "Tún ya fọ́tò",
    photoCheckCautionTpl: "Àyẹ̀wò fọ́tò · ìkìlọ̀ {{count}}",
    photoCheckOk: "Àyẹ̀wò fọ́tò · ó ṣe kedere",
    checkingPhoto: "Ń ṣàyẹ̀wò fọ́tò…",
    whatIKnow: "Ohun tí mo ti mọ̀ tẹ́lẹ̀",
    refusalNote: "Tí fọ́tò náà bá ṣú jù kí á lè kà á rárá, èmi yóò sọ bẹ́ẹ̀ kí n bèèrè kí o tún ya fọ́tò dípò kí n sọ orúkọ kòkòrò tí n kò rí.",
    needsRetakeHeading: "Mo nílò fọ́tò tí ó ṣe kedere jù",
    needsRetakeBody: "Ìdáhùn àṣìṣe pẹ̀lú ìgbẹ́kẹ̀lé burú ju àtúnbéèrè lọ, nítorí náà n kò tíì ṣetán láti dárúkọ èyí.",

    watchEyebrowTpl: "Àyẹ̀wò aláìlórúkọ · {{lga}} · ọjọ́ 7 sẹ́yìn",
    watchHeading: "Ìṣọ́ ìletò",
    watchSubline: "Àyẹ̀wò kọ̀ọ̀kan ní àgbègbè náà ń ṣèrànwọ́ sí àwòrán kan ṣoṣo. Àyẹ̀wò oko kan di ìkìlọ̀ ni kùtùkùtù fún oko mẹ́sàn-án.",
    statScansThisWeek: "àyẹ̀wò ní ọ̀sẹ̀ yìí",
    statFarmsConfirmedTpl: "oko tí a jẹ́rìí sí {{disease}}",
    statSpreadingTpl: "ń tàn kálẹ̀ sí {{direction}}",
    statFarmsInRing: "oko nínú kìlómítà 5",
    mapPanelTitle: "Ìtànkálẹ̀ ìṣubu · rédíọ̀sì kìlómítà 5",
    legendConfirmed: "A JẸ́RÌÍ SÍ",
    legendSuspected: "A FURA SÍ",
    legendClear: "Ó MỌ́",
    gridCaption: "GIRÍDÌ = KM 1 · GPS TI YÍKÁ SÍ MÍTÀ 500 FÚN ÀSÌRÍ",
    originLabelTpl: "IBI ÌBẸ̀RẸ̀ · ỌJỌ́ {{days}} SẸ́YÌN",
    yourFarmLabel: "OKO RẸ",
    tableFarm: "Oko",
    tableDistance: "Ìjìnnà",
    tableCrop: "Ẹwọ́",
    tableStatus: "Ipò",
    statusConfirmed: "A jẹ́rìí sí",
    statusSuspected: "A fura sí",
    statusClear: "Ó mọ́",
    yourFarmNextTitle: "Oko rẹ ni ó kàn tẹ̀lé",
    yourFarmNextBodyTpl:
      "Ìṣubu náà bẹ̀rẹ̀ ní kìlómítà {{originDist}} sí {{originBearing}} ó sì ti ń tẹ̀síwájú sí ọ̀dọ̀ rẹ ní kìlómítà {{speed}} lójúmọ́. {{nearestName}}, tí ó jìn kìlómítà {{nearestDist}} sí {{nearestBearing}},ròyìn àmì àrùn {{nearestWhen}} — o wà nínú ìlà iwájú, kì í ṣe ṣáájú rẹ̀.",
    warnFarmsTitleTpl: "Kìlọ̀ fún oko {{count}} tí ó wà níwájú",
    alertMetaTpl: "ÌKÌLỌ̀ TààRà · LẸ́TÀ {{chars}} · Ó DÉ FÚN ẸNIKẸ́NI TÍ Ó ṢÍ APP SÍLẸ̀ NÍNÚ ìṣẹ́jú àáyá díẹ̀",
    sendAlertBtnTpl: "Fi ìkìlọ̀ tààrà ránṣẹ́ sí oko {{count}}",
    alertSentBtnTpl: "✓ A ti fi ìkìlọ̀ ránṣẹ́ sí oko {{count}}",
    liveAlertSentMessage: "A ti fi ránṣẹ́ — ẹnikẹ́ni tí ó ṣí Ìṣọ́ ìletò yóò rí i láàrin ìṣẹ́jú àáyá díẹ̀.",
    alertNoChangeMessage: "Kò sí ohun tí ó yí padà níbí láti ìgbà ìkìlọ̀ tí ó kẹ́yìn — o lè tún fi ránṣẹ́ nígbà tí àwọn nọ́mbà bá yí padà.",
    officerTitle: "Fún àwọn òṣìṣẹ́ ìtòsí àgbẹ̀",
    officerBodyTpl:
      "Òṣìṣẹ́ kan ń bójútó nǹkan bí àgbẹ̀ 1,800 ní {{lga}}. Ojú-ìwòye yìí ń to àwọn wàdì lẹ́sẹẹsẹ nípa iye tí a jẹ́rìí sí kí ìbẹ̀wò lè lọ sí ibi tí ìṣubu wà, kì í ṣe ibi tí ọ̀nà dára.",
    casesTpl: "ẹjọ́ {{count}}",
    watchDemoDisclaimer: "Dátà àpẹẹrẹ ni. Àwọn ibi jẹ́ àpẹẹrẹ, a sì ti yí GPS ká kí a má bàa mọ oko kọ̀ọ̀kan.",
    watchLiveDataNote: "Dátà gidi láti ọ̀dọ̀ àwọn àyẹ̀wò tí ó súnmọ́ tí a fọwọ́ sí láti pín — a ti yí ipò padà kí a má bàa mọ oko kan ṣoṣo.",
    watchOffline: "Kò sí dátà ojú-ọjọ́ àti ìṣubu láìní ayélujára — ń fi àbájáde tí a fi pamọ́ tí ó kẹ́yìn hàn.",
    watchCachedAsOfTpl: "Bí ti {{time}} (tí a fi pamọ́)",
  },

  ig: {
    navDash: "Ebe nchịkọta",
    navScan: "Nyochaa",
    navDiag: "Nchọpụta",
    navAsst: "Onye enyemaka",
    navHist: "Akụkọ",
    editFarmProfile: "Dezie profaịlụ ugbo",
    backToSite: "← Laghachi na saịtị",
    offline: "NÀ EJIGHỊ ỊNTANETI",
    cloud: "IGWE OJII",
    myFarmFallback: "Ugbo m",

    listen: "Gee ntị",
    stop: "Kwụsị",
    refresh: "Megharịa",
    edit: "Dezie",
    loading: "Na-ebu…",
    somethingWentWrong: "Ihe adịghị mma mere. Biko nwaa ọzọ.",

    greetingMorning: "Ụtụtụ ọma",
    greetingAfternoon: "Ehihie ọma",
    greetingEvening: "Mgbede ọma",

    noCropsTrackedYet: "ENWEGHỊ IHE ỌKỤKỤ E DEBERE",
    healthyNoAction: "Ahụike — enweghị ihe achọrọ ime",
    photographToStart: "See foto akwụkwọ ka ịmalite",
    lastScannedTpl: "Nyocha ikpeazụ {{time}} · foto {{count}} n'oge a",
    noScansYetSeason: "Enwebeghị nyocha n'oge a",
    rainForecast: "Amụma mmiri ozuzo",
    chanceTomorrow: "Ohere echi",
    openAlerts: "Ọkwa mepere emepe",
    allClear: "Ihe niile dị mma",
    severeAdvisoryTpl: "{{severe}} siri ike · {{advisory}} ndụmọdụ",
    diagnosesLogged: "Nchọpụta e dere ede",
    totalScansTpl: "mkpokọta nyocha {{count}}",
    stageSuffix: "ọkwa",
    addOneInHistory: "Tinye otu na Akụkọ",
    recommends: "Gemma na-atụ aro",
    trackCropPrefix: "Debe ihe ọkụkụ na",
    trackCropSuffix: "iji nweta akụkọ Gemma pụrụ iche ebe a.",
    historyLinkLabel: "Akụkọ",
    preparingBriefing: "Na-akwado akụkọ taa…",
    farmProfile: "Profaịlụ ugbo",
    farmer: "Onye ọrụ ugbo",
    location: "Ebe",
    cropLabel: "Ihe ọkụkụ",
    farmSize: "Ogo ugbo",
    growthStage: "Ọkwa uto",
    today: "Taa",
    spotSomethingUnusual: "Ị hụrụ ihe adịghị mma?",
    spotSomethingBody: "See foto akwụkwọ merụrụ ahụ, Gemma 4 ga-akpọ aha ọrịa ma ọ bụ ahụhụ n'ime sekọnd ole na ole.",
    startAScan: "Malite nyocha",
    recentActivity: "Ihe omume ọhụrụ",
    noActivityYet: "Enwebeghị ihe omume.",
    openFarmHistory: "Mepee akụkọ ugbo",

    stepOneOfTwo: "Nzọụkwụ 1 nke 3",
    scanTitle: "See foto akwụkwọ merụrụ ahụ",
    whichCrop: "Ihe ọkụkụ ole?",
    otherOption: "Ọzọ",
    customCropPlaceholder: "Dee aha ihe ọkụkụ gị…",
    forAGoodPhoto: "Maka foto mara mma",
    scanTip1: "Jupụta foto ahụ na otu akwụkwọ merụrụ ahụ.",
    scanTip2: "See foto n'ìhè ehihie, ka anyanwụ dịrị n'azụ gị.",
    scanTip3: "Gụnye etiti akwụkwọ ma ọ bụ ogwe ahịhịa ma ọ bụrụ na mmebi dị ebe ahụ.",
    captureAndDiagnose: "See foto & nyochaa",
    uploadPhoto: "Bulite foto",
    describeByVoice: "Kọwaa site n'olu",
    liveHoldSteady: "NA-EME UGBU A · GUZOSIE IKE",
    edgeOfflineNote: "nyocha a achọghị ntinye ịntanetị.",
    edgeCloudNote: "a na-ahazi nyocha a n'igwe ojii.",
    analysing: "Na-enyocha akwụkwọ…",
    waitingOnGemma: "na-eche Gemma 4…",
    logLine1: "✓ e mikpuru foto maka mbulite",
    logLine2: "✓ akara ọhụụ → Gemma 4",
    logLine3: "✓ ejikọtala data ugbo",
    logLine4: "· na-atụle ụdị ọrịa na ahụhụ ihe ọkụkụ",
    diagnosisFailedServerTpl: "Nchọpụta dara (njehie sava {{status}}). Biko nwaa ọzọ.",
    diagnosisFailed: "Nchọpụta dara",
    diagnosisFailedRetry: "Nchọpụta dara. Biko nwaa ọzọ.",

    noScanYet: "Enwebeghị nyocha — see foto akwụkwọ ka ị nweta nchọpụta.",
    diagnosisCompleteTpl: "Nchọpụta zuru oke · sekọnd {{seconds}} na Gemma 4",
    risk: "IHE ỊTỤ EGWU",
    actWithin: "MEE N'IME",
    outlook: "AGA IHU",
    factCrop: "Ihe ọkụkụ",
    factType: "Ụdị",
    factConfidence: "Ntụkwasị obi",
    factSeverity: "Ike ọrịa",
    factTreatment: "Ọgwụgwọ",
    factSafety: "Nchekwa",
    noneNeeded: "Achọghị",
    required: "Achọrọ",
    treatmentStepsTpl: "usoro {{count}}",
    gemmasReading: "Nkọwa Gemma",
    preparingAudio: "Na-akwado ụda…",
    actionPlan: "Atụmatụ mmemme",
    applyProductTpl: "Jiri {{product}}",
    repeatWithProductTpl: "Megharịa jiri {{product}}",
    whatModelLookedAt: "Ihe modeli ahụ lere anya",
    capturedTpl: "E WERE {{time}} · {{crop}}",
    confidenceBreakdown: "Nkewa ntụkwasị obi",
    overallConfidence: "Ntụkwasị obi n'ozuzu",
    safety: "Nchekwa",
    wearTpl: "Yiri: {{items}}",
    reEntryTpl: "Ọ̀ghé mbata: {{value}}",
    beforeHarvestTpl: "Tupu owuwe ihe ubi: {{value}}",
    noSafetyNeeded: "Enweghị nchekwa pụrụ iche achọrọ maka ọgwụgwọ a.",
    recommendedTreatments: "Ọgwụgwọ e tụrụ aro",
    dose: "Ogo ọgwụ",
    timing: "Oge",
    reEntry: "Ọ̀ghé mbata",
    preHarvest: "Tupu owuwe ihe ubi",
    relativeCost: "Ọnụ ahịa yiri ya",
    keepChildrenOut: "Debe ụmụaka na anụ ụlọ n'èzí ruo mgbe oge ọ̀ghé mbata gafere",
    stepTpl: "Nzọụkwụ {{n}}",
    noTreatmentHealthy: "Achọghị ọgwụgwọ — ihe ọkụkụ gị dị ahụike.",
    noTreatmentReturned: "Enweghị usoro ọgwụgwọ e nyeghachiri.",
    askAboutDiagnosis: "Jụọ AgroVision maka nchọpụta a",
    followUpHarvestTpl: "Enwere m ike iwe {{crop}} a?",
    followUpSpread: "Ọ ga-agbasa gaa n'ihe ọkụkụ m ndị ọzọ?",
    followUpOrganic: "Enwere m ike iji ọgwụ eke gwọọ ya?",
    followUpHowMuch: "Ego ọgwụ ole ka m chọrọ?",
    severity: "Ike ọrịa",
    youAreHere: " — ebe a ka ị nọ",
    ifLeftUntreated: "Ọ bụrụ na a gwọghị ya",
    estimatedFarmImpact: "Atụmatụ mmetụta n'ugbo",
    expectedYieldTreated: "Owuwe a tụrụ anya ma ọ bụrụ na a gwọọ ya ugbu a",
    expectedYieldUntreated: "Owuwe a tụrụ anya ma ọ bụrụ na a gwọghị ya",
    incomeProtected: "Ego a ga-echekwa site n'ịgwọ ya ugbu a",
    indicativeDisclaimerTpl:
      "Atụmatụ nanị — dabere na hektaa {{area}} nke {{crop}} gị na ọnụ ahịa a na-ahụkarị, ọ bụghị ọnụ ahịa ahịa n'ezie ma ọ bụ ihe owuwe gị n'ezie.",
    addFieldSizeTpl: "Tinye ogo ubi {{crop}} na Akụkọ → Akụkọ taa iji hụ atụmatụ owuwe na ego pụrụ iche ebe a.",
    trackCropSizeTpl: "Debe {{crop}} na ogo ubi ya na Akụkọ → Akụkọ taa iji hụ atụmatụ owuwe na ego ebe a.",
    conditions: "Ọnọdụ ihu igwe",
    weatherUnavailable: "Enweghị ozi ihu igwe — o yikarịrị ka ị na-ejighị ịntanetị.",
    loadingForecast: "Na-ebu amụma ihu igwe…",
    rain: "Mmiri ozuzo",
    sprayWindow: "Oge ịfụ ọgwụ",
    wind: "Ifufe",
    chanceOnDayTpl: "ohere {{pct}}% {{day}}",
    waitForDrier: "Chere ruo mgbe mmiri na-adịghị ezo",
    earlyMorningOrDusk: "N' isi ụtụtụ ma ọ bụ mgbede",
    windSafeTpl: "{{speed}} km/h — {{status}}",
    liveForecastNote: "Amụma ihu igwe dị ndụ maka ebe ị nọ.",
    similarCasesOnFarm: "Ọnọdụ yiri nke a n'ugbo a",
    firstTimeTpl: "Bụ oge mbụ e chọpụtara {{label}} n'ugbo a — enwebeghị ihe e ji tụnyere ya.",
    nthTimeTpl: "Nke a bụ oge nke {{nth}} {{label}} pụtara na akụkọ ugbo gị.",
    lastDiagnosedResolvedTpl: "Nchọpụta ikpeazụ {{time}} — ị kwuru na ọgwụgwọ ahụ rụrụ ọrụ.",
    lastDiagnosedUnresolvedTpl: "Nchọpụta ikpeazụ {{time}} — ị kwuru na ọ ka bụ nsogbu.",
    lastDiagnosedTpl: "Nchọpụta ikpeazụ {{time}}.",
    saving: "Na-echekwa…",
    saveReport: "Chekwaa akụkọ n'akụkọ ugbo",
    newScan: "Nyocha ọhụrụ",
    printReport: "Bipụta akụkọ",
    ordinal1: "mbụ",
    ordinal2: "abụọ",
    ordinal3: "atọ",
    ordinal4: "anọ",
    ordinal5: "ise",

    askTitle: "Jụọ maka ugbo gị",
    askAnything: "Jụọ ihe ọ bụla gbasara ihe ọkụkụ, ahụhụ, ma ọ bụ ugbo gị.",
    listeningEllipsis: "Na-ege ntị…",
    voiceNotSupported: "Nyocha ọzụzụ a anaghị akwado ntinye olu.",
    voiceNeedsSecureConnection: "Ntinye olu chọrọ njikọ echekwabara (https) — ọ gaghị arụ ọrụ na adreesị netwọkụ efu. Nwaa ide ya kama.",
    placeholder: "Jụọ maka ugbo gị…",
    quickPrompt1: "Gịnị mere akwụkwọ ọka m ji na-acha odo odo?",
    quickPrompt2: "Kedu mgbe m kwesịrị ịkụ tomato?",
    quickPrompt3: "Ọ dị mma ịfụ ọgwụ tupu mmiri ezoo?",

    tabTimeline: "Usoro oge",
    tabToday: "Akụkọ taa",
    tabInsights: "Nghọta",
    historyTitle: "Usoro ihe mere n'ugbo",
    storedOnDevice: "Echekwara na ngwaọrụ a",
    eventsLogged: "Ihe omume e dere ede",
    syncedToCloud: "Ezigara n'igwe ojii",
    offlineFirstNote: "E mere ka ọ na-arụ ọrụ na-enweghị ịntanetị",

    dailyBriefingSubtitle: "Nkenke akụkọ ụtụtụ maka ihe ọkụkụ gị ndị e debere.",
    cropNamePlaceholder: "Aha ihe ọkụkụ (dịka Tomato)",
    areaPlaceholder: "Ogo (hektaa) — ọ bụghị mkpa",
    areaTooltip: "Ogo ubi na hektaa — na-enyere aka nweta atụmatụ owuwe na mmetụta n'ezie",
    addCrop: "Tinye Ihe Ọkụkụ",
    addCropAboveNote: "Tinye ihe ọkụkụ n'elu iji nweta akụkọ mbụ gị nke ụbọchị.",
    preparingTodayReport: "Na-akwado akụkọ taa…",

    noScansInsights: "Enwebeghị nyocha — nyochaa ihe ọkụkụ ka ịmalite ịmata ihe.",
    scansThisMonth: "Nyocha n'ọnwa a",
    avgCropHealth: "Ọnụ ọgụgụ ahụike ihe ọkụkụ",
    treatmentSuccessRate: "Ọnụ ọgụgụ ihe ịga nke ọma nke ọgwụgwọ",
    notEnoughData: "Enweghị data zuru ezu",
    mostCommonIssues: "Nsogbu ndị a na-ahụkarị",
    noIssuesRecorded: "Enwebeghị nsogbu e dere ede.",
    mostAffectedCrops: "Ihe ọkụkụ ndị metụtara nke ukwuu",
    cropNotIdentified: "Amatabeghị ihe ọkụkụ.",
    tipAnswerQuestion: 'Ndụmọdụ: zaa "Ọgwụgwọ ahụ ọ rụrụ ọrụ?" n\'akụkọ ugbo gị ka ịmalite ịchọpụta ezigbo ọnụ ọgụgụ ihe ịga nke ọma.',

    confirmClearHistory: "Ị chọrọ ihichapụ akụkọ ugbo niile? Enweghị ike iweghachi nke a.",
    diagnosesSavedNote: "A na-echekwa nchọpụta na ngwaọrụ a ka ị nwee ike ịchọpụta usoro n'oge.",
    clearAll: "Hichapụ ihe niile",
    noHistoryYet: "Enwebeghị akụkọ — nyochaa ihe ọkụkụ ka ịmalite.",
    didTreatmentWork: "Ọgwụgwọ ahụ ọ rụrụ ọrụ?",
    yes: "Ee",
    notYetLabel: "Ka",
    resolvedLabel: "Edozila",
    stillIssueLabel: "Ọ ka bụ nsogbu",

    riskNone: "Ọ nweghị",
    riskHigh: "Siri ike",
    riskModerate: "Etiti",
    riskLow: "Ntakịrị",
    riskUnclear: "Amabeghị nke ọma",
    actNoActionNeeded: "Enweghị ihe achọrọ ime",
    act24to48: "Awa 24–48",
    actThisWeek: "N'izu a",
    actWhenConvenient: "Mgbe ọ bụla dabara adaba",
    actReviewManually: "Nyochaa n'onwe gị",
    outlookExcellent: "Mma nke ukwuu",
    outlookGuarded: "Nlezianya — gwọọ ngwa ngwa",
    outlookGoodSoon: "Ọ ga-adị mma ma a gwọọ ngwa ngwa",
    outlookGood: "Ọ dị mma",
    outlookUncertain: "Amabeghị nke ọma",
    stageToday: "TAA",
    stageIn2to3Days: "N'IME ỤBỌCHỊ 2-3",
    stageDay7: "ỤBỌCHỊ 7",
    stageOngoing: "NA-AGA N'IHU",
    nextSeason: "oge ọzọ na-abịa",
    prognosisHigh: "Ọ bụrụ na a gwọghị ya, nsogbu dị otu a na-akawanye njọ ngwa ngwa ma nwee ike ịgbasa gaa n'ihe ọkụkụ dị nso n'ime ụbọchị ole na ole.",
    prognosisModerate: "Ọ bụrụ na a gwọghị ya, nke a na-agbasakarị nwayọọ ma nwee ike belata owuwe n'izu ndị na-abịa ma ọ bụrụ na ọnọdụ kwadoro ya.",
    prognosisLow: "Ọ bụrụ na a gwọghị ya, ọ gaghị ekwe omume na ọ ga-akpata mmebi dị ukwuu naanị ya, mana na-elezi anya ma ọ bụrụ na ọ na-akawanye njọ.",
    prognosisUnknown: "Enweghị ozi zuru ezu iji buo amụma ka nke a ga-esi dị ma a gwọghị ya — nyocha ọzọ ga-enyere aka.",
    ladderHealthy: "Ahụike",
    ladderLow: "Ntakịrị",
    ladderModerate: "Etiti",
    ladderHigh: "Siri ike",

    navWatch: "Nche obodo",
    clarifyStepLabel: "Nzọụkwụ 2 nke 3 · Gemma na-ajụ",
    clarifyHeading: "Ajụjụ abụọ tupu m aza",
    clarifySubline: "Foto otu nwere ike ịdị ka nsogbu atọ dị iche iche. Azịza gị na-agbanwe ọgwụgwọ, ya mere ọ ka mma ka m jụọ karịa iche echiche efu.",
    clarifyQ1: "Ebee ka mmebi kachasị njọ?",
    whereOptWhorl: "Akwụkwọ ọhụrụ n'etiti osisi",
    whereOptBase: "Akwụkwọ ochie nso ala",
    whereOptStem: "Ogwe osisi, nso ala",
    whereOptCobs: "Mkpuru ọka",
    whereNoteWhorl: "Iri n'etiti osisi na-egosi fall armyworm karịa stem borer.",
    whereNoteBase: "Mmebi dị ala na-adị ka stem borer ma ọ bụ ụkọ nri.",
    whereNoteStem: "Mmebi na ala na-egosi stem borer — ọgwụgwọ dị iche na nke ahụhụ etiti osisi.",
    whereNoteCobs: "Iri mkpuru ọka pụtara na ahụhụ ahụ etolitela; oge ọgwụgwọ na-emechi.",
    whereNoteDefault: "Pịa azịza kwekọrọ n'ihe ị hụrụ.",
    clarifyQ2: "Kedu mgbe ị buru ụzọ hụ ya?",
    whenOptToday: "Taa",
    whenOpt2to4: "Ụbọchị 2–4 gara aga",
    whenOptWeek: "Karịa izu otu gara aga",
    whenOptUnsure: "Amaghị m nke ọma",
    whenNoteToday: "Ịhụ ya taa pụtara na ị bịara n'oge — otu ọgwụ nwere ike ezuru.",
    whenNote2to4: "Ụbọchị ole na ole nke iri na-egosi na ahụhụ ahụ ka dị nta, a ka nwere ike iji ọgwụ ruo ya.",
    whenNoteWeek: "Mgbe izu otu gasịrị, ahụhụ ahụ abanyewo n'ime akwụkwọ etiti osisi, otu ọgwụ agaghị eru ha niile.",
    whenNoteUnsure: "M ga-eche na ahụhụ ahụ dị n'etiti uto ha, hazie ọgwụgwọ ugboro abụọ ka o guzozie.",
    whenNoteDefault: "Pịa azịza kacha nso — ụbọchị ejiri eje nso ezuola.",
    clarifyBtnReady: "Nyochaa iji ihe omume a",
    clarifyBtnNotReady: "Zaa ajụjụ abụọ ahụ iji gaa n'ihu",
    retakePhoto: "Setịpụ foto ọzọ",
    photoCheckCautionTpl: "Nyocha foto · ịkpachara anya {{count}}",
    photoCheckOk: "Nyocha foto · doro anya",
    checkingPhoto: "Na-enyocha foto…",
    whatIKnow: "Ihe m maralarị",
    refusalNote: "Ọ bụrụ na foto ahụ jọrọ njọ nke na enweghị ike ịgụ ya ma ọlị, m ga-ekwu otú ahụ ma jụọ ka i setịpụ ọzọ karịa ịkpọ aha ahụhụ m na-apụghị ịhụ.",
    needsRetakeHeading: "Achọrọ m foto doro anya karị",
    needsRetakeBody: "Azịza ezighi ezi nwere ntụkwasị obi dị njọ karịa ịjụ ọzọ, ya mere adịbeghị m njikere ịkpọ aha nke a.",

    watchEyebrowTpl: "Nyocha na-ekwughị aha · {{lga}} · ụbọchị 7 gara aga",
    watchHeading: "Nche obodo",
    watchSubline: "Nyocha ọ bụla dị n'ógbè na-enye aka n'otu foto. Nyocha otu ugbo na-aghọ ọkwa mbụ maka ugbo itoolu.",
    statScansThisWeek: "nyocha n'izu a",
    statFarmsConfirmedTpl: "ugbo e kwenyesiri ike na {{disease}}",
    statSpreadingTpl: "na-agbasa {{direction}}",
    statFarmsInRing: "ugbo dị n'ime kilomita 5",
    mapPanelTitle: "Mgbasa ọrịa · ogologo kilomita 5",
    legendConfirmed: "E KWENYESIRI IKE",
    legendSuspected: "A NA-ENYO ENYO",
    legendClear: "DỊ MMA",
    gridCaption: "GRID = KM 1 · GPS ETIGHARIRI RUO M 500 MAKA NZUZO",
    originLabelTpl: "EBE Ọ MALITERE · ỤBỌCHỊ {{days}} GARA AGA",
    yourFarmLabel: "UGBO GỊ",
    tableFarm: "Ugbo",
    tableDistance: "Ebe dị anya",
    tableCrop: "Ihe ọkụkụ",
    tableStatus: "Ọnọdụ",
    statusConfirmed: "E kwenyesiri ike",
    statusSuspected: "A na-enyo enyo",
    statusClear: "Dị mma",
    yourFarmNextTitle: "Ugbo gị na-esote",
    yourFarmNextBodyTpl:
      "Ọrịa ahụ malitere na kilomita {{originDist}} {{originBearing}} ma na-abịaru gị nso na kilomita {{speed}} kwa ụbọchị. {{nearestName}}, nke dị kilomita {{nearestDist}} {{nearestBearing}}, kọrọ mgbaàmà {{nearestWhen}} — ị nọ n'ime ihu agha ahụ, ọ bụghị n'ihu ya.",
    warnFarmsTitleTpl: "Dọọ ugbo {{count}} dị n'ihu aka ná ntị",
    alertMetaTpl: "ỌKWA NGWA NGWA · MKPỤRỤEDEMEDE {{chars}} · NA-ERUTE ONYE Ọ BỤLA MEGHERE APP N'IME OGE NKENKE",
    sendAlertBtnTpl: "Zipu ọkwa ngwa ngwa ka ugbo {{count}}",
    alertSentBtnTpl: "✓ Ezipula ọkwa ka ugbo {{count}}",
    liveAlertSentMessage: "Ezipula — onye ọ bụla meghere Nche obodo ga-ahụ ya n'ime obere oge.",
    alertNoChangeMessage: "Ọ nweghị ihe gbanwere ebe a kemgbe ọkwa ikpeazụ — ị nwere ike izigharị ozugbo ọnụọgụ ndị ahụ gbanwere.",
    officerTitle: "Maka ndị ọrụ ngalaba ugbo",
    officerBodyTpl:
      "Otu onye ọrụ na-elekọta ihe dị ka ndị ọrụ ugbo 1,800 na {{lga}}. Anya nkiri a na-ahazi mpaghara dabere n'ọnụọgụ e kwenyesiri ike ka nleta gaa ebe ọrịa ahụ dị, ọ bụghị ebe okporo ụzọ mara mma.",
    casesTpl: "ọnụọgụ {{count}}",
    watchDemoDisclaimer: "Data ngosipụta. Ebe ndị a bụ ihe atụ, e tigharịkwara GPS ka a ghara ịmata ugbo ọ bụla n'onwe ya.",
    watchLiveDataNote: "Data ezigbo si na nyocha ndị dị nso kwenyere ikesa - a tigharịkwara ebe ka a ghara ịmata otu ugbo.",
    watchOffline: "Enweghị data ihu igwe na ọrịa n'ịntanetị — na-egosi nsonaazụ echekwara ikpeazụ.",
    watchCachedAsOfTpl: "Dịka nke {{time}} (echekwara)",
  },
};

export function timeOfDayGreeting(strings: AppStrings, date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return strings.greetingMorning;
  if (hour < 17) return strings.greetingAfternoon;
  return strings.greetingEvening;
}
