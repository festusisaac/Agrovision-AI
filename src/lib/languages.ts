export const LANGUAGES = [
  { code: "en", label: "English", speechLang: "en-US" },
  { code: "ha", label: "Hausa", speechLang: "ha-NG" },
  { code: "yo", label: "Yoruba", speechLang: "yo-NG" },
  { code: "ig", label: "Igbo", speechLang: "ig-NG" },
];

export const LANGUAGE_NAMES: Record<string, string> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l.label])
);
