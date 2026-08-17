// Mirrors the backend's core/languages.py SUPPORTED_LANGUAGES — keep the
// two lists in sync. This is the user's default communication language
// (automatic message translation), separate from the app's own UI chrome
// language (see LanguageToggle.tsx / src/i18n, which only toggles en/ha).
export interface LanguageOption {
  code: string;
  name: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English' },
  { code: 'ha', name: 'Hausa' },
  { code: 'ar', name: 'Arabic' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'tr', name: 'Turkish' },
  { code: 'sw', name: 'Swahili' },
  { code: 'yo', name: 'Yoruba' },
  { code: 'ig', name: 'Igbo' },
];

export function languageName(code?: string): string {
  if (!code) return 'English';
  return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.name ?? code;
}
