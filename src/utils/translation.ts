import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@smaahi_translate_';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  text: string;
  ts: number;
}

interface CacheStore {
  [key: string]: CacheEntry;
}

let cache: CacheStore = {};

async function loadCache(): Promise<CacheStore> {
  try {
    const raw = await AsyncStorage.getItem('@smaahi_translation_cache');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function saveCache(c: CacheStore): Promise<void> {
  try {
    await AsyncStorage.setItem('@smaahi_translation_cache', JSON.stringify(c));
  } catch {}
}

function cacheKey(text: string, from: string, to: string): string {
  return `${from}:${to}:${text}`;
}

function getFromCache(key: string): string | null {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) return null;
  return entry.text;
}

async function setCache(key: string, text: string): Promise<void> {
  cache[key] = { text, ts: Date.now() };
  await saveCache(cache);
}

export async function translateText(
  text: string,
  from: string = 'auto',
  to: string = 'en'
): Promise<string> {
  if (!text || !text.trim()) return text;

  const key = cacheKey(text, from, to);
  const cached = getFromCache(key);
  if (cached) return cached;

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json && json[0]) {
      const translated = json[0].map((s: any[]) => s[0]).join('');
      await setCache(key, translated);
      return translated;
    }
  } catch (err) {
    console.log('[Translation] Failed:', err);
  }

  return text;
}

export async function detectLanguage(text: string): Promise<string> {
  if (!text || !text.trim()) return 'en';

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json && json[2]) {
      return json[2]; // detected language code
    }
  } catch {}

  return 'en';
}

export async function translateBatch(
  texts: string[],
  from: string = 'auto',
  to: string = 'en'
): Promise<string[]> {
  return Promise.all(texts.map((t) => translateText(t, from, to)));
}
