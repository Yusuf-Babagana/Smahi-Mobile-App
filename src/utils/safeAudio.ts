// src/utils/safeAudio.ts
// Defensive wrapper around expo-av so the app boots cleanly in Expo Go
// (where the native ExponentAV module was removed in modern SDKs).

let AudioModule: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const expoAv = require('expo-av');
  AudioModule = expoAv?.Audio || null;
} catch {
  // ExponentAV native module not available in Expo Go
}

export const isAudioAvailable = !!AudioModule;

const dummyAudio = {
  Sound: {
    createAsync: async () => ({
      sound: {
        playAsync: async () => {},
        setOnPlaybackStatusUpdate: () => {},
        unloadAsync: async () => {},
      },
    }),
  },
  Recording: {
    createAsync: async () => {
      throw new Error('Audio recording is not supported in Expo Go. Please use a development build.');
    },
  },
  requestPermissionsAsync: async () => ({
    granted: false,
    status: 'denied',
    canAskAgain: false,
    expires: 'never',
  }),
  setAudioModeAsync: async () => {},
  RecordingOptionsPresets: {
    HIGH_QUALITY: {},
    LOW_QUALITY: {},
  },
};

export const Audio = AudioModule || dummyAudio;
