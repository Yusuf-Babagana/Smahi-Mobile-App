import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import en from './en.json';
import ha from './ha.json';

const RESOURCES = {
    en: { translation: en },
    ha: { translation: ha },
};

const LANGUAGE_DETECTOR = {
    type: 'languageDetector',
    async: true,
    detect: async (callback: any) => {
        try {
            // 1. Check saved preference
            const savedLanguage = await AsyncStorage.getItem('user-language');
            if (savedLanguage) {
                return callback(savedLanguage);
            }

            // 2. Or check phone settings
            // Localization.getLocales() returns an array, we take the first one
            const phoneLanguage = Localization.getLocales()[0]?.languageCode;

            return callback(phoneLanguage === 'ha' ? 'ha' : 'en');
        } catch (error) {
            callback('en');
        }
    },
    init: () => { },
    cacheUserLanguage: async (language: string) => {
        try {
            await AsyncStorage.setItem('user-language', language);
        } catch (error) { }
    },
};

i18n
    .use(LANGUAGE_DETECTOR as any)
    .use(initReactI18next)
    .init({
        compatibilityJSON: 'v3',
        resources: RESOURCES,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false // Prevents UI crash on Android
        }
    });

export default i18n;