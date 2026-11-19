"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera, Play, Printer, Square } from "lucide-react";
import {
  clearScanSession,
  getScanSessionSnapshot,
  getServerScanSessionSnapshot,
  markScanSessionSaved,
  setScanSession,
  subscribeScanSession,
} from "@/lib/scanSession";
import { addHistoryEntry, getHistorySnapshot, getServerHistorySnapshot, subscribeHistory } from "@/lib/storage";
import { getCropsSnapshot, getServerCropsSnapshot, subscribeCrops } from "@/lib/crops";
import { createThumbnail } from "@/lib/image";
import { buildDiagnosisSpeechText, hasSafetyInfo } from "@/lib/diagnosis";
import { prefetchSpeech, speakText, type SpeakController } from "@/lib/tts";
import { useAppPrefs } from "@/lib/appPrefs";
import { setPendingQuestion } from "@/lib/pendingQuestion";
import { getBrowserLocation, getWeatherWithForecast, type WeatherWithForecast } from "@/lib/weatherService";
import { relativeTime } from "@/lib/format";
import { tpl, type AppStrings } from "@/lib/i18n";
import { getProfileSnapshot, getServerProfileSnapshot, subscribeProfile, DEMO_PROFILE } from "@/lib/profile";
import { getDeviceId } from "@/lib/deviceId";
import PrintableReport from "@/components/diagnosis/PrintableReport";
import {
  buildActionPlan,
  buildUntreatedPrognosis,
  currentLadderStage,
  estimateFarmImpact,
  getRiskProfile,
  severityLadderLabel,
  summarizeSimilarCases,
  SEVERITY_LADDER,
  type Tone,
} from "@/lib/diagnosisReport";

function ordinalWord(n: number, t: AppStrings): string {
  const words = [t.ordinal1, t.ordinal2, t.ordinal3, t.ordinal4, t.ordinal5];
  return words[n - 1] ?? `${n}`;
}

function formatNaira(n: number): string {
  return `₦${Math.round(n).toLocaleString("en-NG")}`;
}

const TONE_TEXT: Record<Tone, string> = { accent: "var(--color-leaf)", warn: "var(--color-warn)", dim: "var(--color-fg-faint)" };
const TONE_TINT_BG: Record<Tone, string> = {
  accent: "rgba(163,230,53,0.10)",
  warn: "rgba(233,160,60,0.12)",
  dim: "rgba(242,240,230,0.06)",
};
const TONE_TINT_BORDER: Record<Tone, string> = {
  accent: "rgba(163,230,53,0.3)",
  warn: "rgba(233,160,60,0.35)",
  dim: "rgba(242,240,230,0.14)",
};

function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function Card({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-2xl border border-[var(--color-border)] p-5 ${className}`} style={style}>
      {children}
    </div>
  );
}

function CardEyebrow({ children, tone }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <div
      className="font-mono text-[10.5px] tracking-[0.12em] uppercase"
      style={{ color: tone ? TONE_TEXT[tone] : "var(--color-fg-faint)" }}
    >
      {children}
    </div>
  );
}

function RiskChip({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  return (
    <div
      className="rounded-xl border px-4 py-[11px]"
      style={{ background: TONE_TINT_BG[tone], borderColor: TONE_TINT_BORDER[tone] }}
    >
      <div className="font-mono text-[9.5px] tracking-[0.1em]" style={{ color: TONE_TEXT[tone] }}>
        {label}
      </div>
      <div className="font-heading mt-[3px] text-[17px] font-semibold" style={{ color: TONE_TEXT[tone] }}>
        {value}
      </div>
    </div>
  );
}

function getSampleDiagnosisSession(lang: string) {
  const common = {
    crop: "Maize",
    imageDataUrl: "/images/samples/maize-blight.jpg",
    capturedAt: Date.now() - 1000 * 60 * 15,
    elapsedMs: 2450,
  };

  if (lang === "ha") {
    return {
      ...common,
      result: {
        label: "Ciwon Ganyen Masara da Tsutsa (Armyworm)",
        crop: "Maize",
        type: "disease" as const,
        confidence: 0.94,
        severity: "high" as const,
        description:
          "Ganyen masara yana nuna tabo mai tsawo da ramukan cizon tsutsa a tsakiyar shuka.",
        explanation:
          "Naman gwari na Exserohilum tare da tsutsotsin Fall Armyworm ne suka mamaye sabbin ganyen masara. Idan ba a fesa magani a kan kari ba, amfanin gonar zai iya raguwa da sama da kashi arba'in a lokacin girbi.",
        visualEvidence:
          "Tabo mai launin toka-toka a kan ganye tare da ramukan cizon tsutsa da kashinta a cikin tsakiyar shukar.",
        confidenceBreakdown: [
          { label: "Siffar tabo da launin ganye", score: 0.96 },
          { label: "Ramukan cizon tsutsa a tsakiya", score: 0.94 },
          { label: "Yaduwar cuta a jikin shuka", score: 0.92 },
        ],
        treatment: [
          "Fesa maganin Mancozeb ko Azoxystrobin a kan ganye cikin gaggawa.",
          "Zuba maganin Emamectin benzoate ko man Neem a tsakiyar ganyen masara.",
          "Kwashe ganyen da suka kamu da cutar a kona su nesa da gona.",
        ],
        products: [
          {
            name: "Man Neem (Na Halitta)",
            category: "organic" as const,
            dose: "Cokali 5 a kowace lita ta ruwa a zuba a tsakiya",
            timing: "Da safe ko da yamma lokacin sanyi",
            reEntryInterval: "Awoyi 4",
            harvestWaitingPeriod: "Rana 1",
            costTier: "low" as const,
          },
          {
            name: "Mancozeb 80% WP",
            category: "chemical" as const,
            dose: "Gram 2.5 a kowace lita ta ruwa",
            timing: "Fesa a lokacin da babu iska mai karfi",
            reEntryInterval: "Awoyi 24",
            harvestWaitingPeriod: "Kwanaki 14",
            costTier: "medium" as const,
          },
          {
            name: "Emamectin Benzoate 5% SG",
            category: "chemical" as const,
            dose: "Gram 0.4 a kowace lita ta ruwa a zuba a tsakiya",
            timing: "Da yamma lokacin da tsutsotsi ke cin abinci",
            reEntryInterval: "Awoyi 24",
            harvestWaitingPeriod: "Kwanaki 7",
            costTier: "medium" as const,
          },
        ],
        prevention: [
          "Yi amfani da ingantaccen irin masara mai jure cututtuka.",
          "Juya shuka a kaka mai zuwa tare da wake ko gyada.",
          "Bada isasshen fili tsakanin shuka don samun hasken rana da iska.",
        ],
        safety: {
          protectiveEquipment: ["Safofin hannu na roba", "Gilashin kariya", "Takunkumin fuska", "Tufafin kariya"],
          applicationTiming: "Fesa da sassafe (karfe 7-9 na safe) ko da yamma lokacin natsuwa",
          reEntryInterval: "Awoyi 24 bayan fesa maganin sinadari",
          harvestWaitingPeriod: "Kalla kwanaki 14 kafin girbin masara",
        },
        photoQuality: { ok: true, cautions: [] },
        needsRetake: false,
        retakeInstruction: "",
      },
    };
  }

  if (lang === "yo") {
    return {
      ...common,
      result: {
        label: "Àrùn Èso Àgbàdo àti Kòkòrò Fall Armyworm",
        crop: "Maize",
        type: "disease" as const,
        confidence: 0.94,
        severity: "high" as const,
        description:
          "Àwọn àbàwọ́n lórí ewé àti ihò tí kòkòrò Fall Armyworm jẹ nínú ewé tuntun.",
        explanation:
          "Àrùn fungus àti ìdin Fall Armyworm ti bẹ̀rẹ̀ sí ní ba àwọn ewé tuntun jẹ́ ní àárín igi àgbàdo. Bí a kò bá tètè fún un ní oògùn, ìkórè rẹ lè dínkù ní ìwọ̀n ogójì nínú ọgọ́rùn-ún (40%).",
        visualEvidence:
          "Àwọn àbàwọ́n gígùn lórí ewé pẹ̀lú ihò tí kòkòrò jẹ lórí ewé àgbàdo náà.",
        confidenceBreakdown: [
          { label: "Àbàwọ́n ewé àti àwọ̀ rẹ̀", score: 0.96 },
          { label: "Ihò jíjẹ kòkòrò nínú ewé", score: 0.94 },
          { label: "Bí àrùn náà ṣe tàn kálẹ̀", score: 0.92 },
        ],
        treatment: [
          "Fún oògùn kòkòrò Mancozeb tàbí Azoxystrobin sí ewé àgbàdo náà dáradára.",
          "Lo oògùn epo Neem tàbí Emamectin benzoate sí àárín ewé àgbàdo náà.",
          "Ja àwọn ewé tí ó ti bàjẹ́ kúrò kí o sì sun wọ́n jìnà sí oko.",
        ],
        products: [
          {
            name: "Epo Neem (Ti Àdánidá)",
            category: "organic" as const,
            dose: "Síbí 5 sínú lita omi kan, da á sí àárín ewé",
            timing: "Ní kùtùkùtù òwúrọ̀ tàbí ìrọ̀lẹ́",
            reEntryInterval: "Wákàtí 4",
            harvestWaitingPeriod: "Ọjọ́ 1",
            costTier: "low" as const,
          },
          {
            name: "Mancozeb 80% WP",
            category: "chemical" as const,
            dose: "Giramu 2.5 sínú lita omi kan",
            timing: "Fún nígbà tí kò bá sí afẹ́fẹ́ líle",
            reEntryInterval: "Wákàtí 24",
            harvestWaitingPeriod: "Ọjọ́ 14",
            costTier: "medium" as const,
          },
          {
            name: "Emamectin Benzoate 5% SG",
            category: "chemical" as const,
            dose: "Giramu 0.4 sínú lita omi kan",
            timing: "Ní ìrọ̀lẹ́ nígbà tí àwọn kòkòrò ń jẹun",
            reEntryInterval: "Wákàtí 24",
            harvestWaitingPeriod: "Ọjọ́ 7",
            costTier: "medium" as const,
          },
        ],
        prevention: [
          "Gbin irúgbìn àgbàdo tó le kojú àwọn àrùn wọ̀nyí.",
          "Yí irúgbìn padà ní àsìkò tó ń bọ̀ pẹ̀lú ẹ̀wà tàbí ẹ̀pà.",
          "Fi ààyè sí àárín àwọn igi àgbàdo fún afẹ́fẹ́ àti ìmọ́lẹ̀ oòrùn.",
        ],
        safety: {
          protectiveEquipment: ["Ibeji ọwọ́ roba", "Gilaasi aabo", "Iboju", "Aṣọ aabo to bo gbogbo ara"],
          applicationTiming: "Fún oògùn ní àárọ̀ kùtù (ago 7-9) tàbí ìrọ̀lẹ́",
          reEntryInterval: "Wákàtí 24 lẹ́yìn fífún oògùn",
          harvestWaitingPeriod: "Kó kere jù ọjọ́ 14 kí o tó ká àgbàdo",
        },
        photoQuality: { ok: true, cautions: [] },
        needsRetake: false,
        retakeInstruction: "",
      },
    };
  }

  if (lang === "ig") {
    return {
      ...common,
      result: {
        label: "Ọrịa Akwụkwọ Ọka na Nnukwu Nriji (Fall Armyworm)",
        crop: "Maize",
        type: "disease" as const,
        confidence: 0.94,
        severity: "high" as const,
        description:
          "Akwụkwọ ọka nwere ntụpọ na oghere ndị nriji tara n'ime etiti akwụkwọ ọhụrụ.",
        explanation:
          "Fungus na nriji Armyworm amalitela imebi akwụkwọ ọka dị n'etiti osisi ahụ. Ọ bụrụ na ejighị ọgwụ gwọọ ya ugbu a, ihe ị ga-ewe n'ubi ga-ebelata site na pasentị iri anọ (40%).",
        visualEvidence:
          "Ntụpọ dị ogologo na oghere nriji tara n'elu akwụkwọ ọka ahụ nke ọma.",
        confidenceBreakdown: [
          { label: "Ọdịdị ntụpọ na agba akwụkwọ", score: 0.96 },
          { label: "Oghere nriji tara n'etiti akwụkwọ", score: 0.94 },
          { label: "Otú ọrịa si gbasaa", score: 0.92 },
        ],
        treatment: [
          "Fesa ọgwụ Mancozeb ma ọ bụ Azoxystrobin na akwụkwọ ọka ahụ nke ọma.",
          "Tinye mmanụ Neem ma ọ bụ Emamectin benzoate n'etiti akwụkwọ ọka ahụ.",
          "Wepụ akwụkwọ ndị mebiri emebi ma kpọọ ha ọkụ n'ebe dị anya site n'ubi.",
        ],
        products: [
          {
            name: "Mmanụ Neem (Nke Eke)",
            category: "organic" as const,
            dose: "Ngaji 5 n'ime lita mmiri ọ bụla n'ime etiti akwụkwọ",
            timing: "N'ụtụtụ ma ọ bụ n'uhuruchi",
            reEntryInterval: "Awa 4",
            harvestWaitingPeriod: "Ụbọchị 1",
            costTier: "low" as const,
          },
          {
            name: "Mancozeb 80% WP",
            category: "chemical" as const,
            dose: "Gram 2.5 n'ime lita mmiri ọ bụla",
            timing: "Fesa mgbe ikuku na-adịghị efe ike",
            reEntryInterval: "Awa 24",
            harvestWaitingPeriod: "Ụbọchị 14",
            costTier: "medium" as const,
          },
          {
            name: "Emamectin Benzoate 5% SG",
            category: "chemical" as const,
            dose: "Gram 0.4 n'ime lita mmiri ọ bụla n'ime etiti akwụkwọ",
            timing: "N'uhuruchi mgbe nriji na-eri nri",
            reEntryInterval: "Awa 24",
            harvestWaitingPeriod: "Ụbọchị 7",
            costTier: "medium" as const,
          },
        ],
        prevention: [
          "Kụọ mkpụrụ ọka na-anabataghị ọrịa nke ọma.",
          "Gbanwee ihe ọkụkụ n'oge na-abịa site n'ịkụ agwa ma ọ bụ ahụekere.",
          "Hụ na ohere dị n'etiti ọka maka ikuku na anwụ zuru oke.",
        ],
        safety: {
          protectiveEquipment: ["Uwe aka roba", "Ugogbe nchekwa anya", "Ihe mkpuchi ihu", "Uwe nchekwa ahụ niile"],
          applicationTiming: "Fesa n'isi ụtụtụ (awa 7-9) ma ọ bụ n'uhuruchi",
          reEntryInterval: "Awa 24 mgbe afesịrị ọgwụ",
          harvestWaitingPeriod: "Opekata mpe ụbọchị 14 tupu ewe ọka",
        },
        photoQuality: { ok: true, cautions: [] },
        needsRetake: false,
        retakeInstruction: "",
      },
    };
  }

  // English fallback
  return {
    ...common,
    result: {
      label: "Northern Corn Leaf Blight & Armyworm",
      crop: "Maize",
      type: "disease" as const,
      confidence: 0.94,
      severity: "high" as const,
      description:
        "Cigar-shaped grayish lesions with distinct margins and active caterpillar windowpane feeding on mid-whorl leaves.",
      explanation:
        "Fungal spores of Exserohilum turcicum have penetrated the lower canopy leaves, while early-instar Fall Armyworm larvae are feeding inside the whorl. If left untreated during the vegetative stage, photosynthetic capacity will drop by over 40%, significantly reducing cob yield.",
      visualEvidence:
        "Elongated, elliptical lesions with dark fungal borders alongside characteristic irregular chewed holes and caterpillar frass deposits.",
      confidenceBreakdown: [
        { label: "Lesion morphology & margin pattern", score: 0.96 },
        { label: "Whorl feeding holes & caterpillar presence", score: 0.94 },
        { label: "Canopy layer spread & foliage color", score: 0.92 },
      ],
      treatment: [
        "Spray Mancozeb or Azoxystrobin fungicide thoroughly on leaves.",
        "Apply Emamectin benzoate or biological neem oil directly into the whorl.",
        "Remove heavily infested dead leaves and destroy them outside the field.",
      ],
      products: [
        {
          name: "Neem Seed Oil (Biological)",
          category: "organic" as const,
          dose: "5 ml per litre of water into the whorl",
          timing: "Early morning or late afternoon",
          reEntryInterval: "4 hours",
          harvestWaitingPeriod: "1 day",
          costTier: "low" as const,
        },
        {
          name: "Mancozeb 80% WP",
          category: "chemical" as const,
          dose: "2.5 g per litre of water",
          timing: "Apply at calm wind conditions",
          reEntryInterval: "24 hours",
          harvestWaitingPeriod: "14 days",
          costTier: "medium" as const,
        },
        {
          name: "Emamectin Benzoate 5% SG",
          category: "chemical" as const,
          dose: "0.4 g per litre into the leaf whorl",
          timing: "Late afternoon when larvae feed",
          reEntryInterval: "24 hours",
          harvestWaitingPeriod: "7 days",
          costTier: "medium" as const,
        },
      ],
      prevention: [
        "Plant certified blight-resistant hybrid maize varieties.",
        "Rotate with non-host legumes like cowpea or groundnut next season.",
        "Ensure proper plant spacing for sunlight and air circulation.",
      ],
      safety: {
        protectiveEquipment: ["Rubber gloves", "Protective eyewear", "Nose mask", "Long sleeve overalls"],
        applicationTiming: "Spray early morning (7–9 AM) or dusk in calm weather",
        reEntryInterval: "24 hours after chemical application",
        harvestWaitingPeriod: "14 days minimum before harvesting green maize",
      },
      photoQuality: {
        ok: true,
        cautions: [],
      },
      needsRetake: false,
      retakeInstruction: "",
    },
  };
}

export default function DiagnosisPage() {
  const router = useRouter();
  const { language, t } = useAppPrefs();
  const session = useSyncExternalStore(subscribeScanSession, getScanSessionSnapshot, getServerScanSessionSnapshot);
  const crops = useSyncExternalStore(subscribeCrops, getCropsSnapshot, getServerCropsSnapshot);
  const history = useSyncExternalStore(subscribeHistory, getHistorySnapshot, getServerHistorySnapshot);
  const profile = useSyncExternalStore(subscribeProfile, getProfileSnapshot, getServerProfileSnapshot) ?? DEMO_PROFILE;
  const [speechStatus, setSpeechStatus] = useState<"idle" | "loading" | "speaking">("idle");
  const [speechProgress, setSpeechProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [weather, setWeather] = useState<WeatherWithForecast | null>(null);
  const [weatherError, setWeatherError] = useState(false);
  const speechControllerRef = useRef<SpeakController | null>(null);
  const preparedSpeechRef = useRef<Promise<Blob | null> | null>(null);

  useEffect(() => {
    if (session?.result) {
      preparedSpeechRef.current = prefetchSpeech(buildDiagnosisSpeechText(session.result, language), language);
    }
  }, [session?.result, language]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const location = await getBrowserLocation();
      const w = await getWeatherWithForecast(location?.lat ?? 6.5244, location?.lon ?? 3.3792, location !== null).catch(
        () => null
      );
      if (cancelled) return;
      if (w) setWeather(w);
      else setWeatherError(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!session) {
    return (
      <div className="animate-agv-rise max-w-[1100px]">
        <Card className="p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf/10 text-leaf">
            <Camera className="h-6 w-6" />
          </div>
          <h2 className="font-heading mt-4 text-[22px] font-semibold">{t.noScanYet}</h2>
          <p className="mx-auto mt-2 max-w-[44ch] text-[14px] text-fg-muted">
            Take a new leaf photo using the scanner, or load an instant sample diagnosis report to review the full diagnostic output.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/app/scan"
              className="inline-flex items-center gap-1.5 rounded-[11px] bg-leaf px-5 py-3 font-medium text-[14px] text-[#0A0F0C] transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              <Camera className="h-4 w-4" /> {t.startAScan}
            </Link>
            <button
              type="button"
              onClick={() => setScanSession(getSampleDiagnosisSession(language))}
              className="inline-flex items-center gap-1.5 rounded-[11px] border border-[var(--color-border)] px-5 py-3 font-medium text-[14px] hover:bg-[var(--color-surface)]"
            >
              ✦ Load Sample Diagnosis Report
            </button>
          </div>
        </Card>
      </div>
    );
  }

  const { result, imageDataUrl, crop, capturedAt, elapsedMs } = session;
  const risk = getRiskProfile(result, t);
  const ladderStage = currentLadderStage(result);
  const actionPlan = buildActionPlan(result, t);
  const untreatedPrognosis = buildUntreatedPrognosis(result, t);
  const capturedTime = new Date(capturedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const elapsedSeconds = (elapsedMs / 1000).toFixed(1);
  const cropLabel = result.crop !== "Unknown" ? result.crop : "crop";
  const trackedCrop = crops.find((c) => c.name.toLowerCase() === crop.toLowerCase());
  const farmImpact = estimateFarmImpact(result, trackedCrop);
  const similarCases = summarizeSimilarCases(result, history);

  function handleListen() {
    if (speechStatus !== "idle") {
      speechControllerRef.current?.stop();
      setSpeechStatus("idle");
      return;
    }
    setSpeechStatus("loading");
    setSpeechProgress(0);
    speechControllerRef.current = speakText(
      buildDiagnosisSpeechText(result, language),
      language,
      {
        onStart: () => setSpeechStatus("speaking"),
        onEnd: () => setSpeechStatus("idle"),
        onProgress: setSpeechProgress,
      },
      preparedSpeechRef.current ?? undefined
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      const thumbnail = await createThumbnail(imageDataUrl);
      addHistoryEntry({ type: "diagnosis", title: result.label, notes: `Crop: ${crop}`, imageDataUrl: thumbnail, diagnosis: result });
      markScanSessionSaved();
      shareToVillageWatchIfOptedIn(); // best-effort, never blocks the save
      router.push("/app/history");
    } finally {
      setSaving(false);
    }
  }

  /** Only runs when the farmer opted in (FarmProfile.shareToVillageWatch) — see the profile.ts comment for what is/isn't shared. */
  async function shareToVillageWatchIfOptedIn() {
    const currentProfile = getProfileSnapshot();
    if (!currentProfile?.shareToVillageWatch) return;
    if (result.severity === "unknown") return; // not confident enough to responsibly share

    const status = result.type === "healthy" ? "clear" : result.severity === "high" ? "confirmed" : "suspected";
    try {
      const location = await getBrowserLocation();
      if (!location) return; // never share a fallback/guessed location on a real map
      await fetch("/api/scans/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: location.lat,
          lon: location.lon,
          crop: result.crop !== "Unknown" ? result.crop : crop,
          status,
          label: result.label,
          deviceId: getDeviceId(),
        }),
      });
    } catch {
      // best-effort — Village Watch sharing should never surface as a save failure
    }
  }

  function askFollowUp(question: string) {
    setPendingQuestion(question);
    router.push("/app/assistant");
  }

  const followUps = [
    tpl(t.followUpHarvestTpl, { crop: cropLabel }),
    t.followUpSpread,
    t.followUpOrganic,
    t.followUpHowMuch,
  ];

  return (
    <>
    <div className="animate-agv-rise print:hidden max-w-[1100px]">
      {/* 1. Verdict header */}
      <div className="flex items-center gap-2.5 font-mono text-[10.5px] tracking-[0.12em] text-leaf uppercase">
        <span className="h-[7px] w-[7px] rounded-full bg-leaf" />
        {tpl(t.diagnosisCompleteTpl, { seconds: elapsedSeconds })}
      </div>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-7">
        <div>
          <h1 className="font-heading text-[44px] leading-[1.02] font-semibold tracking-[-0.035em]">{result.label}</h1>
          <div className="mt-[7px] text-[14px] text-fg-dim">
            {capitalize(result.type)}
            {result.crop !== "Unknown" && ` · ${result.crop}`}
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <RiskChip label={t.risk} value={risk.riskLabel} tone={risk.riskTone} />
          <RiskChip label={t.actWithin} value={risk.actWithin} tone={risk.actWithinTone} />
          <RiskChip label={t.outlook} value={risk.outlook} tone={risk.outlookTone} />
        </div>
      </div>

      {/* 2. Fact strip */}
      <div
        className="mt-6 grid grid-cols-2 gap-[2px] overflow-hidden rounded-2xl border sm:grid-cols-3 lg:grid-cols-6"
        style={{ background: "rgba(242,240,230,0.09)", borderColor: "rgba(242,240,230,0.09)" }}
      >
        {[
          { label: t.factCrop, value: result.crop, tone: undefined },
          { label: t.factType, value: capitalize(result.type), tone: undefined },
          { label: t.factConfidence, value: `${Math.round(result.confidence * 100)}%`, tone: "accent" as Tone },
          {
            label: t.factSeverity,
            value: capitalize(result.severity),
            tone: result.severity === "high" || result.severity === "moderate" ? ("warn" as Tone) : ("accent" as Tone),
          },
          {
            label: t.factTreatment,
            value: result.treatment.length ? tpl(t.treatmentStepsTpl, { count: result.treatment.length }) : t.noneNeeded,
            tone: undefined,
          },
          {
            label: t.factSafety,
            value: hasSafetyInfo(result.safety) ? t.required : t.noneNeeded,
            tone: hasSafetyInfo(result.safety) ? ("warn" as Tone) : ("accent" as Tone),
          },
        ].map((cell) => (
          <div key={cell.label} className="bg-background px-[18px] py-4">
            <div className="text-[11px] text-fg-faint">{cell.label}</div>
            <div
              className="font-heading mt-[5px] text-[19px] font-semibold"
              style={{ color: cell.tone ? TONE_TEXT[cell.tone] : undefined }}
            >
              {cell.value}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Body grid */}
      <div className="mt-[26px] grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[1.55fr_1fr]">
        {/* Left column */}
        <div className="flex flex-col gap-[18px]">
          {/* Gemma's reading */}
          <div
            className="rounded-2xl border p-6"
            style={{ borderColor: "rgba(163,230,53,0.22)", background: "rgba(163,230,53,0.06)" }}
          >
            <div className="flex items-center justify-between gap-4">
              <CardEyebrow tone="accent">{t.gemmasReading}</CardEyebrow>
              <button
                onClick={handleListen}
                className="flex items-center gap-2 rounded-full bg-leaf px-3.5 py-[7px] text-[12.5px] font-semibold text-[#0A0F0C]"
              >
                {speechStatus === "loading" ? (
                  `${speechProgress}%`
                ) : speechStatus === "speaking" ? (
                  <>
                    <Square className="h-3 w-3 fill-current" /> {t.stop}
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 fill-current" /> {t.listen}
                  </>
                )}
              </button>
            </div>
            <p className="mt-3.5 text-[16px] leading-[1.65] text-fg-muted" style={{ textWrap: "pretty" }}>
              {result.explanation || result.description}
            </p>
            {result.treatment[0] && <div className="mt-3.5 text-[12.5px] leading-[1.5] text-fg-dim">{result.treatment[0]}</div>}
          </div>

          {/* Action plan */}
          {actionPlan.length > 0 && (
            <Card>
              <CardEyebrow>{t.actionPlan}</CardEyebrow>
              <div className="mt-4 flex flex-col">
                {actionPlan.map((step, i) => (
                  <div
                    key={step.stage}
                    className="grid gap-4.5 py-4 first:pt-0 last:pb-0"
                    style={{
                      gridTemplateColumns: "130px 1fr",
                      borderBottom: i < actionPlan.length - 1 ? "1px solid rgba(242,240,230,0.07)" : undefined,
                    }}
                  >
                    <div>
                      <div className="font-mono text-[11px] tracking-[0.06em] text-leaf">{step.stage}</div>
                      <div className="mt-[3px] font-mono text-[10px] text-fg-faint">{step.dateLabel}</div>
                    </div>
                    <div>
                      <div className="text-[14.5px] font-semibold">{step.title}</div>
                      {step.note && <div className="mt-1 text-[13px] leading-[1.5] text-fg-dim">{step.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Evidence panel */}
          <div>
            <CardEyebrow>{t.whatModelLookedAt}</CardEyebrow>
            <div className="mt-3 grid grid-cols-1 items-start gap-3.5 md:grid-cols-[1.2fr_1fr]">
              <div className="flex flex-col gap-2.5">
                <div className="relative h-[250px] overflow-hidden rounded-2xl border border-[var(--color-border)]" style={{ background: "#16211a" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageDataUrl} alt="Captured leaf" className="h-full w-full object-cover" style={{ objectPosition: "50% 44%" }} />
                  <div
                    className="absolute bottom-3 left-3.5 rounded-md px-2.5 py-1 font-mono text-[9.5px] tracking-[0.06em] text-fg-muted"
                    style={{ background: "rgba(10,15,12,0.75)" }}
                  >
                    {tpl(t.capturedTpl, { time: capturedTime, crop: crop.toUpperCase() })}
                  </div>
                </div>
                {result.visualEvidence && <p className="text-[12.5px] leading-[1.5] text-fg-dim">{result.visualEvidence}</p>}
              </div>

              <Card>
                <CardEyebrow>{t.confidenceBreakdown}</CardEyebrow>
                <div className="mt-3.5 flex flex-col gap-2.5">
                  {(result.confidenceBreakdown.length > 0
                    ? result.confidenceBreakdown
                    : [{ label: t.overallConfidence, score: result.confidence }]
                  ).map((signal) => (
                    <div key={signal.label}>
                      <div className="flex items-center justify-between text-[12.5px] text-fg-muted">
                        <span>{signal.label}</span>
                        <span className="font-mono">{Math.round(signal.score * 100)}%</span>
                      </div>
                      <div className="mt-1 h-1 overflow-hidden rounded-full" style={{ background: "rgba(242,240,230,0.1)" }}>
                        <div className="h-full rounded-full bg-leaf" style={{ width: `${Math.round(signal.score * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-[var(--color-border)] pt-3.5">
                  <div className="font-mono text-[9.5px] tracking-[0.1em] text-fg-faint uppercase">{t.safety}</div>
                  {hasSafetyInfo(result.safety) ? (
                    <ul className="mt-2 space-y-1.5 text-[12.5px] leading-[1.5] text-fg-dim">
                      {result.safety.protectiveEquipment.length > 0 && (
                        <li>{tpl(t.wearTpl, { items: result.safety.protectiveEquipment.join(", ") })}</li>
                      )}
                      {result.safety.applicationTiming !== "Not applicable" && <li>{result.safety.applicationTiming}</li>}
                      {result.safety.reEntryInterval !== "Not applicable" && (
                        <li>{tpl(t.reEntryTpl, { value: result.safety.reEntryInterval })}</li>
                      )}
                      {result.safety.harvestWaitingPeriod !== "Not applicable" && (
                        <li>{tpl(t.beforeHarvestTpl, { value: result.safety.harvestWaitingPeriod })}</li>
                      )}
                    </ul>
                  ) : (
                    <p className="mt-2 text-[12.5px] leading-[1.5] text-fg-faint">{t.noSafetyNeeded}</p>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Recommended treatments */}
          <Card>
            <CardEyebrow>{t.recommendedTreatments}</CardEyebrow>
            {result.products.length > 0 ? (
              <>
                <div
                  className="mt-4 grid grid-cols-1 gap-[2px] overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-3"
                  style={{ background: "rgba(242,240,230,0.09)", borderColor: "rgba(242,240,230,0.09)" }}
                >
                  {result.products.map((product, i) => (
                    <div key={i} className="bg-background p-[18px]">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-heading text-[15px] font-semibold">{product.name}</span>
                        <span
                          className="rounded-full px-[7px] py-[3px] font-mono text-[9px] uppercase"
                          style={
                            product.category === "chemical"
                              ? { background: "rgba(233,160,60,0.16)", color: "var(--color-warn)" }
                              : { background: "rgba(163,230,53,0.16)", color: "var(--color-leaf)" }
                          }
                        >
                          {product.category}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-col gap-1.5 text-[12.5px] text-fg-dim">
                        {product.dose && (
                          <div>
                            <span className="text-fg-faint">{t.dose}</span> · {product.dose}
                          </div>
                        )}
                        {product.timing && (
                          <div>
                            <span className="text-fg-faint">{t.timing}</span> · {product.timing}
                          </div>
                        )}
                        {product.reEntryInterval !== "Not applicable" && (
                          <div>
                            <span className="text-fg-faint">{t.reEntry}</span> · {product.reEntryInterval}
                          </div>
                        )}
                        {product.harvestWaitingPeriod !== "Not applicable" && (
                          <div>
                            <span className="text-fg-faint">{t.preHarvest}</span> · {product.harvestWaitingPeriod}
                          </div>
                        )}
                        <div>
                          <span className="text-fg-faint">{t.relativeCost}</span> · {capitalize(product.costTier)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {hasSafetyInfo(result.safety) && (
                  <div className="mt-3.5 flex flex-wrap gap-3.5 text-[12.5px] text-fg-dim">
                    {result.safety.protectiveEquipment.length > 0 && (
                      <span>{tpl(t.wearTpl, { items: result.safety.protectiveEquipment.join(", ").toLowerCase() })}</span>
                    )}
                    {result.safety.applicationTiming !== "Not applicable" && (
                      <>
                        <span className="text-fg-faint">·</span>
                        <span>{result.safety.applicationTiming}</span>
                      </>
                    )}
                    <span className="text-fg-faint">·</span>
                    <span>{t.keepChildrenOut}</span>
                  </div>
                )}
              </>
            ) : result.treatment.length > 0 ? (
              <div
                className="mt-4 grid grid-cols-1 gap-[2px] overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-3"
                style={{ background: "rgba(242,240,230,0.09)", borderColor: "rgba(242,240,230,0.09)" }}
              >
                {result.treatment.map((step, i) => (
                  <div key={i} className="bg-background p-[18px]">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-heading text-[15px] font-semibold">{tpl(t.stepTpl, { n: i + 1 })}</span>
                    </div>
                    <p className="mt-3 text-[12.5px] leading-[1.55] text-fg-dim">{step}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3.5 text-[13.5px] text-fg-dim">
                {result.type === "healthy" ? t.noTreatmentHealthy : t.noTreatmentReturned}
              </p>
            )}
          </Card>

          {/* Ask AgroVision */}
          <Card>
            <CardEyebrow>{t.askAboutDiagnosis}</CardEyebrow>
            <div className="mt-3.5 flex flex-wrap gap-2">
              {followUps.map((q) => (
                <button
                  key={q}
                  onClick={() => askFollowUp(q)}
                  className="rounded-full border px-3.5 py-2 text-[13px] text-fg-muted hover:bg-[var(--color-surface)]"
                  style={{ borderColor: "rgba(242,240,230,0.12)" }}
                >
                  {q}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right rail */}
        <div className="flex flex-col gap-[18px]">
          {/* Severity ladder */}
          <Card>
            <CardEyebrow>{t.severity}</CardEyebrow>
            <div className="mt-3.5 flex flex-col gap-1.5">
              {SEVERITY_LADDER.map((stage) => {
                const active = stage === ladderStage;
                const tone: Tone = stage === "healthy" || stage === "low" ? "accent" : "warn";
                return (
                  <div
                    key={stage}
                    className="flex items-center gap-2.5 rounded-[10px] text-[13px]"
                    style={
                      active
                        ? {
                            fontWeight: 600,
                            fontSize: "14px",
                            color: TONE_TEXT[tone],
                            background: TONE_TINT_BG[tone],
                            border: `1px solid ${TONE_TINT_BORDER[tone]}`,
                            padding: "9px 11px",
                          }
                        : { color: "var(--color-fg-faint)", padding: "0 11px" }
                    }
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: active ? TONE_TEXT[tone] : "rgba(242,240,230,0.18)" }}
                    />
                    {severityLadderLabel(stage, t)}
                    {active && t.youAreHere}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* If left untreated */}
          {untreatedPrognosis && (
            <div className="rounded-2xl border p-5" style={{ borderColor: "rgba(233,160,60,0.28)", background: "rgba(233,160,60,0.06)" }}>
              <CardEyebrow tone="warn">{t.ifLeftUntreated}</CardEyebrow>
              <p className="mt-3.5 text-[13.5px] leading-[1.6] text-fg-muted">{untreatedPrognosis}</p>
            </div>
          )}

          {/* Estimated farm impact */}
          <Card>
            <CardEyebrow>{t.estimatedFarmImpact}</CardEyebrow>
            {farmImpact ? (
              <>
                <div className="mt-3.5 flex flex-col gap-3">
                  <div>
                    <div className="text-[12px] text-fg-faint">{t.expectedYieldTreated}</div>
                    <div className="font-heading mt-[3px] text-2xl font-semibold">{farmImpact.expectedYieldTreatedTonnes} t</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-fg-faint">{t.expectedYieldUntreated}</div>
                    <div className="font-heading mt-[3px] text-2xl font-semibold text-warn">
                      {farmImpact.expectedYieldUntreatedTonnes} t
                    </div>
                  </div>
                  <div>
                    <div className="text-[12px] text-fg-faint">{t.incomeProtected}</div>
                    <div className="font-heading mt-[3px] text-2xl font-semibold text-leaf">
                      ≈ {formatNaira(farmImpact.incomeProtectedNaira)}
                    </div>
                  </div>
                </div>
                <p className="mt-3.5 text-[11.5px] leading-[1.5] text-fg-faint">
                  {tpl(t.indicativeDisclaimerTpl, { area: farmImpact.areaHectares, crop: farmImpact.cropLabel.toLowerCase() })}
                </p>
              </>
            ) : trackedCrop ? (
              <p className="mt-3.5 text-[13px] leading-[1.55] text-fg-dim">{tpl(t.addFieldSizeTpl, { crop: trackedCrop.name })}</p>
            ) : (
              <p className="mt-3.5 text-[13px] leading-[1.55] text-fg-dim">
                {tpl(t.trackCropSizeTpl, { crop: result.crop !== "Unknown" ? result.crop : cropLabel })}
              </p>
            )}
          </Card>

          {/* Conditions */}
          <Card>
            <CardEyebrow>{t.conditions}</CardEyebrow>
            {weatherError ? (
              <p className="mt-3.5 text-[13px] text-fg-faint">{t.weatherUnavailable}</p>
            ) : !weather ? (
              <div className="mt-3.5 flex items-center gap-2 text-[13px] text-fg-faint">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-fg-dim/30 border-t-leaf" />
                {t.loadingForecast}
              </div>
            ) : (
              <>
                <div className="mt-3.5 flex flex-col gap-2.5 text-[13.5px] text-fg-muted">
                  <div className="flex justify-between gap-3">
                    <span className="text-fg-faint">{t.rain}</span>
                    <span
                      className="font-semibold"
                      style={{ color: weather.tomorrow.precipitationChance >= 40 ? "var(--color-warn)" : undefined }}
                    >
                      {tpl(t.chanceOnDayTpl, { pct: weather.tomorrow.precipitationChance, day: weather.tomorrow.dayLabel })}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-fg-faint">{t.sprayWindow}</span>
                    <span className="font-semibold">
                      {weather.tomorrow.precipitationChance >= 40 ? t.waitForDrier : t.earlyMorningOrDusk}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-fg-faint">{t.wind}</span>
                    <span className="font-semibold">
                      {tpl(t.windSafeTpl, { speed: weather.windSpeed, status: weather.windSpeed > 20 ? "too windy" : "safe" })}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-[11.5px] leading-[1.5] text-fg-faint">{t.liveForecastNote}</p>
              </>
            )}
          </Card>

          {/* Similar cases — this farm's own real history, not an external dataset */}
          <Card>
            <CardEyebrow>{t.similarCasesOnFarm}</CardEyebrow>
            {similarCases.count === 0 ? (
              <p className="mt-3 text-[13px] leading-[1.55] text-fg-dim">{tpl(t.firstTimeTpl, { label: result.label.toLowerCase() })}</p>
            ) : (
              <>
                <p className="mt-3 text-[13.5px] leading-[1.6] text-fg-muted">
                  {tpl(t.nthTimeTpl, {
                    nth: ordinalWord(similarCases.count + 1, t),
                    label: result.label.toLowerCase(),
                  })}
                </p>
                {similarCases.mostRecent && (
                  <p className="mt-2.5 text-[12.5px] leading-[1.5] text-fg-dim">
                    {similarCases.mostRecent.resolved === true
                      ? tpl(t.lastDiagnosedResolvedTpl, { time: relativeTime(similarCases.mostRecent.createdAt) })
                      : similarCases.mostRecent.resolved === false
                        ? tpl(t.lastDiagnosedUnresolvedTpl, { time: relativeTime(similarCases.mostRecent.createdAt) })
                        : tpl(t.lastDiagnosedTpl, { time: relativeTime(similarCases.mostRecent.createdAt) })}
                  </p>
                )}
              </>
            )}
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-leaf py-3.5 font-medium text-[14.5px] text-[#0A0F0C] transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
            >
              {saving ? t.saving : t.saveReport}
            </button>
            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  clearScanSession();
                  router.push("/app/scan");
                }}
                className="flex-1 rounded-xl border border-[var(--color-border)] py-3 text-[13.5px] hover:bg-[var(--color-surface)]"
              >
                {t.newScan}
              </button>
              <button
                onClick={() => window.print()}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--color-border)] py-3 text-[13.5px] hover:bg-[var(--color-surface)]"
              >
                <Printer className="h-3.5 w-3.5" /> {t.printReport}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="hidden print:block">
      <PrintableReport
        session={session}
        profile={profile}
        t={t}
        actionPlan={actionPlan}
        risk={risk}
        untreatedPrognosis={untreatedPrognosis}
        farmImpact={farmImpact}
      />
    </div>
    </>
  );
}
