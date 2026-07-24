import AsyncStorage from '@react-native-async-storage/async-storage';

// The cached user object lives in AsyncStorage only (same key AuthContext
// uses) — SecureStore is reserved for tokens (accessToken/refreshToken).
// A prior version kept a second copy in SecureStore, which drifted out of
// sync with logout and let a stale session survive a cold restart.
export const storage = {
  getCurrentUser: async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      return userJson ? JSON.parse(userJson) : null;
    } catch (e) {
      return null;
    }
  },

  updateCurrentUser: async (partial: Record<string, any>) => {
    try {
      const asyncJson = await AsyncStorage.getItem('user');
      const merged = { ...(asyncJson ? JSON.parse(asyncJson) : {}), ...partial };
      await AsyncStorage.setItem('user', JSON.stringify(merged));
      return merged;
    } catch (e) {
      return null;
    }
  }
};
