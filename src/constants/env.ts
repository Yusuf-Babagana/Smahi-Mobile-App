// Single source of runtime configuration.
// Values come from EXPO_PUBLIC_* variables (see .env / .env.example) and are
// inlined into the JS bundle at build time by Expo — restart the dev server
// after changing .env. Anything exported here ships inside the app bundle,
// so never add true server-side secrets.

export const BACKEND_URL =
    process.env.EXPO_PUBLIC_BACKEND_URL || 'https://smahi1.pythonanywhere.com';

export const API_URL = `${BACKEND_URL}/api`;

export const CLOUDINARY_CLOUD_NAME =
    process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dvj6cw5dq';

// Deliberately no fallback: the key must live only in your local .env
// (gitignored), never in committed source. Long-term the Whisper call should
// move behind the Django backend so no key ships in the bundle at all.
export const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
