import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const resources = {
  en: {
    translation: {
      "greeting": "Welcome",
      "Premium": "Premium",
      "Finding services near": "Finding services near",
      "Current GPS Location": "Current GPS Location",
      "Saved Home Address": "Saved Home Address",
      "Real-time GPS": "Real-time GPS",
      "Based on your phone's sensors": "Based on your phone's sensors",
      "Registered Address": "Registered Address",
      "The address in your profile": "The address in your profile",
      "What service do you need?": "What service do you need?",
      "List": "List",
      "Map": "Map",
      "All": "All",
      "Plumbing": "Plumbing",
      "Electrical": "Electrical",
      "Carpentry": "Carpentry",
      "Cleaning": "Cleaning",
      "Mechanic": "Mechanic",
      "5 km": "5 km",
      "10 km": "10 km",
      "25 km": "25 km",
      "50 km": "50 km",
      "Anywhere": "Anywhere",
      "Your Location": "Your Location",
      "Tap to view profile": "Tap to view profile",
      "Capturing GPS...": "Capturing GPS...",
      "No more artisans nearby": "No more artisans nearby",
      "No artisans found in this area.": "No artisans found in this area.",
      "Try changing your category or search query.": "Try changing your category or search query.",
      "loadMore": "Load More",
      "Artisan": "Artisan",
      "Location Unknown": "Location Unknown",
      "reviews": "reviews",
      "km away": "km away",
      "View Profile": "View Profile",
      "No Phone": "No Phone",
      "No Contact": "No Contact",
      "Phone number not available.": "Phone number not available."
    }
  },
  ha: {
    translation: {
      "greeting": "Barka da zuwa",
      "Premium": "Firimiyam",
      "Finding services near": "Neman ayyuka kusa",
      "Current GPS Location": "Wurin da kake a yanzu",
      "Saved Home Address": "Adireshin Gida da aka Ajiye",
      "Real-time GPS": "GPS na ainihi",
      "Based on your phone's sensors": "Dangane da na'urorin wayarka",
      "Registered Address": "Adireshin da aka rijista",
      "The address in your profile": "Adireshin da ke cikin bayaninka",
      "What service do you need?": "Wane sabis kake bukata?",
      "List": "Jeri",
      "Map": "Taswira",
      "All": "Duka",
      "Plumbing": "Aikin Famfo",
      "Electrical": "Aikin Lantarki",
      "Carpentry": "Aikin Kafinta",
      "Cleaning": "Tsaftacewa",
      "Mechanic": "Makaniki",
      "5 km": "kilomita 5",
      "10 km": "kilomita 10",
      "25 km": "kilomita 25",
      "50 km": "kilomita 50",
      "Anywhere": "Ko'ina",
      "Your Location": "Wurinka",
      "Tap to view profile": "Danna don duba bayani",
      "Capturing GPS...": "Ana Kama GPS...",
      "No more artisans nearby": "Babu sauran masanan kusa",
      "No artisans found in this area.": "Babu masanan da aka samu a wannan yankin.",
      "Try changing your category or search query.": "Gwada canza rukuni ko bincike.",
      "loadMore": "Duba Wasu",
      "Artisan": "Mai sana'a",
      "Location Unknown": "Ba a san wurin ba",
      "reviews": "bita",
      "km away": "kilomi nesa",
      "View Profile": "Duba Bayani",
      "No Phone": "Babu Waya",
      "No Contact": "Babu Lamba",
      "Phone number not available.": "Babu lambar waya."
    }
  }
};

const STORE_LANGUAGE_KEY = "settings.lang";

const languageDetectorPlugin = {
  type: 'languageDetector' as const,
  async: true,
  init: () => {},
  detect: async function (callback: (lang: string) => void) {
    try {
      const savedLanguage = await AsyncStorage.getItem(STORE_LANGUAGE_KEY);
      if (savedLanguage) {
        return callback(savedLanguage);
      } else {
        return callback('en');
      }
    } catch (error) {
      console.log("Error reading language", error);
      return callback('en');
    }
  },
  cacheUserLanguage: async function (language: string) {
    try {
      await AsyncStorage.setItem(STORE_LANGUAGE_KEY, language);
    } catch (error) {
      console.log("Error saving language", error);
    }
  }
};

i18n
  .use(languageDetectorPlugin)
  .use(initReactI18next)
  .init({
    resources,
    compatibilityJSON: 'v3',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
