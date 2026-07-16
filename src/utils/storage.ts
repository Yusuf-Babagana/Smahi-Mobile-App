import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  getCurrentUser: async () => {
    try {
      const userJson = await SecureStore.getItemAsync('user');
      return userJson ? JSON.parse(userJson) : null;
    } catch (e) {
      return null;
    }
  },

  // Merges fields into BOTH cached copies of the user (SecureStore is read by
  // storage.getCurrentUser / app/index.tsx, AsyncStorage by AuthContext).
  updateCurrentUser: async (partial: Record<string, any>) => {
    try {
      const secureJson = await SecureStore.getItemAsync('user');
      const merged = { ...(secureJson ? JSON.parse(secureJson) : {}), ...partial };
      await SecureStore.setItemAsync('user', JSON.stringify(merged));

      const asyncJson = await AsyncStorage.getItem('user');
      if (asyncJson) {
        await AsyncStorage.setItem('user', JSON.stringify({ ...JSON.parse(asyncJson), ...partial }));
      }
      return merged;
    } catch (e) {
      return null;
    }
  }
};
