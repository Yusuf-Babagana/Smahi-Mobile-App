// src/utils/safeAudio.ts
// Pure JS fallback audio stub — avoids loading deprecated native expo-av on modern React Native.

export const isAudioAvailable = false;

const dummySound = {
  playAsync: async () => {},
  setOnPlaybackStatusUpdate: (_cb?: any) => {},
  unloadAsync: async () => {},
};

const dummyAudio = {
  Sound: {
    createAsync: async (..._args: any[]): Promise<{ sound: typeof dummySound }> => ({
      sound: dummySound,
    }),
  },
  Recording: {
    createAsync: async (..._args: any[]): Promise<{ recording: any }> => {
      throw new Error('Audio recording is not supported on this build.');
    },
  },
  requestPermissionsAsync: async () => ({
    granted: false,
    status: 'denied',
    canAskAgain: false,
    expires: 'never',
  }),
  setAudioModeAsync: async (..._args: any[]) => {},
  RecordingOptionsPresets: {
    HIGH_QUALITY: {},
    LOW_QUALITY: {},
  },
};

export const Audio: any = dummyAudio;
