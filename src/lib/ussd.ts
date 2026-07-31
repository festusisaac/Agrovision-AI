import { generateText, isGemmaConfigured } from "./gemma";
import { getOutbreakSummary, roundCoordTo500m } from "./outbreak";
import { LANGUAGE_NAMES } from "./languages";

// USSD (the *123# text-menu system that works on any phone, including basic
// feature phones, with zero data plan) reaches the farmer the rest of this
// app can't — it needs a smartphone and internet. Two features only, both
// text: a free-text farming question answered by Gemma 4, and a read-only
// summary of Village Watch's real outbreak data (no photo upload is
// possible over USSD). Sessions are stateless by design — the telecom
// gateway resends the FULL star-joined history of everything the caller
// has entered this session on every request (see handleUssdSession), so
// there's nothing to persist server-side and no session-state table.

type UssdLang = "en" | "ha" | "yo" | "ig";

const LANG_ORDER: UssdLang[] = ["en", "ha", "yo", "ig"];

interface UssdStrings {
  mainMenu: string;
  questionPrompt: string;
  stateMenuHeader: string;
  invalid: string;
  blankQuestion: string;
  noAi: string;
  error: string;
  noOutbreakData: (state: string) => string;
}

// Short, plain-register menu copy — same tone as the rest of this app's
// Hausa/Yorùbá/Igbo strings in src/lib/i18n.ts. Worth a native-speaker
// proofread pass before a live demo if anyone's available; same
// transparency caveat as the rest of this project's translations.
const STRINGS: Record<UssdLang, UssdStrings> = {
  en: {
    mainMenu: "1. Ask a farming question\n2. Outbreaks near me",
    questionPrompt: "Type your farming question:",
    stateMenuHeader: "Choose your state:",
    invalid: "Invalid input. Try again.",
    blankQuestion: "Please type a question.",
    noAi: "Demo: AI not connected yet.",
    error: "Something went wrong. Try again.",
    noOutbreakData: (state) => `No outbreak data yet for ${state}.`,
  },
  ha: {
    mainMenu: "1. Yi tambaya kan gona\n2. Barkewar cuta kusa da ni",
    questionPrompt: "Rubuta tambayarka:",
    stateMenuHeader: "Zaɓi jihar ka:",
    invalid: "Kuskure. Sake gwadawa.",
    blankQuestion: "Da fatan za a rubuta tambaya.",
    noAi: "Demo: Ba a haɗa AI ba tukuna.",
    error: "Wani kuskure ya faru. Sake gwadawa.",
    noOutbreakData: (state) => `Babu bayanan barkewa don ${state} tukuna.`,
  },
  yo: {
    mainMenu: "1. Béèrè ìbéèrè oko\n2. Àrùn nítòsí mi",
    questionPrompt: "Kọ ìbéèrè rẹ:",
    stateMenuHeader: "Yan ìpínlẹ̀ rẹ:",
    invalid: "Àṣìṣe. Gbìyànjú lẹ́ẹ̀kansí.",
    blankQuestion: "Jọ̀wọ́ kọ ìbéèrè kan.",
    noAi: "Demo: A ò tí so AI pọ̀ mọ́ ìsinsìnyí.",
    error: "Àṣìṣe kan ṣẹlẹ̀. Gbìyànjú lẹ́ẹ̀kansí.",
    noOutbreakData: (state) => `Kò sí data àrùn fún ${state} bẹ́ẹ̀ni.`,
  },
  ig: {
    mainMenu: "1. Jụọ ajụjụ ugbo\n2. Ọrịa nso m",
    questionPrompt: "Dee ajụjụ gị:",
    stateMenuHeader: "Họrọ steeti gị:",
    invalid: "Njehie. Nwaa ọzọ.",
    blankQuestion: "Biko dee ajụjụ.",
    noAi: "Demo: Ejikọtabeghị AI.",
    error: "Ihe adịghị mma mere. Nwaa ọzọ.",
    noOutbreakData: (state) => `Enweghị data ọrịa maka ${state} ugbu a.`,
  },
};

// Approximate state centroids, same "close enough for a demo, clearly a
// coordinate not a boundary" precedent as FALLBACK_LAT/FALLBACK_LON in
// weatherService.ts. Niger matches this app's own demo farm profile.
const USSD_STATES = [
  { name: "Niger", lat: 9.6, lon: 6.5 },
  { name: "Kano", lat: 12.0, lon: 8.5 },
  { name: "Oyo", lat: 8.0, lon: 3.9 },
  { name: "Kaduna", lat: 10.5, lon: 7.4 },
  { name: "Benue", lat: 7.3, lon: 8.8 },
  { name: "Enugu", lat: 6.5, lon: 7.5 },
];

// No real device to exclude in a phone session — this sentinel can never
// collide with a real client-generated UUID (see src/lib/deviceId.ts).
const USSD_EXCLUDE_DEVICE_ID = "ussd";

// Conservative cross-carrier USSD page limit (180 chars) minus "END ".length.
const USSD_CHAR_BUDGET = 176;

const USSD_QA_SYSTEM_PROMPT = `You are a farming assistant answering a farmer's question sent over
USSD — a basic-phone text menu with screens capped around 150-180 characters. Your ENTIRE reply
must be under 140 characters including spaces — a hard technical limit, not a style choice. Give
only the single most important, actionable piece of advice. Plain text only: no markdown, no
bullet points, no emoji, no line breaks.`;

function invalidEnd(lang: UssdLang): string {
  return `END ${STRINGS[lang].invalid}`;
}

async function answerQuestion(question: string, lang: UssdLang): Promise<string> {
  const trimmed = question.trim();
  if (!trimmed) return `END ${STRINGS[lang].blankQuestion}`;
  if (!isGemmaConfigured()) return `END ${STRINGS[lang].noAi}`;

  const languageName = LANGUAGE_NAMES[lang];
  const systemPrompt =
    languageName && languageName !== "English"
      ? `${USSD_QA_SYSTEM_PROMPT}\n\nWrite the reply in ${languageName}, in a way an everyday ${languageName} speaker with no technical background would understand.`
      : USSD_QA_SYSTEM_PROMPT;

  try {
    const answer = await generateText(trimmed, systemPrompt);
    const clipped = answer.trim().slice(0, USSD_CHAR_BUDGET);
    return `END ${clipped || STRINGS[lang].error}`;
  } catch {
    return `END ${STRINGS[lang].error}`;
  }
}

async function summarizeOutbreak(stateIndex: number, lang: UssdLang): Promise<string> {
  const state = USSD_STATES[stateIndex - 1];
  const center = roundCoordTo500m(state.lat, state.lon);

  let summary;
  try {
    summary = await getOutbreakSummary(center, 5, USSD_EXCLUDE_DEVICE_ID);
  } catch {
    return `END ${STRINGS[lang].error}`;
  }

  if (summary.scans === 0) {
    return `END ${STRINGS[lang].noOutbreakData(state.name)}`;
  }

  const spread = summary.spreadKmPerDay != null ? ` ~${summary.spreadKmPerDay}km/day ${summary.spreadBearing}.` : "";
  const demoNote = summary.demo ? " (Demo)" : "";
  const line = `${state.name}: ${summary.confirmed} confirmed, ${summary.suspected} suspected, ${summary.clear} clear (7d).${spread}${demoNote}`;
  return `END ${line.slice(0, USSD_CHAR_BUDGET)}`;
}

/**
 * Parses the star-joined USSD session history and returns the CON/END text
 * to send back. Screen layout: [lang] -> main menu -> either
 * [lang,"1",...question] (ask a question) or [lang,"2",state] (outbreaks).
 */
export async function handleUssdSession(text: string): Promise<string> {
  const parts = text.trim() === "" ? [] : text.trim().split("*");

  if (parts.length === 0) {
    return "CON Welcome to AgroVision\n1. English\n2. Hausa\n3. Yoruba\n4. Igbo";
  }

  const langIndex = Number(parts[0]);
  if (!Number.isInteger(langIndex) || langIndex < 1 || langIndex > LANG_ORDER.length) {
    return "END Invalid input. Try again.";
  }
  const lang = LANG_ORDER[langIndex - 1];

  if (parts.length === 1) {
    return `CON ${STRINGS[lang].mainMenu}`;
  }

  const choice = parts[1];

  if (choice === "1") {
    if (parts.length === 2) {
      return `CON ${STRINGS[lang].questionPrompt}`;
    }
    // Re-join with "*" so a literal "*" typed inside the farmer's own
    // question round-trips losslessly instead of being silently dropped.
    const question = parts.slice(2).join("*");
    return answerQuestion(question, lang);
  }

  if (choice === "2") {
    if (parts.length === 2) {
      const stateLines = USSD_STATES.map((s, i) => `${i + 1}. ${s.name}`).join("\n");
      return `CON ${STRINGS[lang].stateMenuHeader}\n${stateLines}`;
    }
    if (parts.length === 3) {
      const stateIndex = Number(parts[2]);
      if (!Number.isInteger(stateIndex) || stateIndex < 1 || stateIndex > USSD_STATES.length) {
        return invalidEnd(lang);
      }
      return summarizeOutbreak(stateIndex, lang);
    }
    return invalidEnd(lang);
  }

  return invalidEnd(lang);
}
