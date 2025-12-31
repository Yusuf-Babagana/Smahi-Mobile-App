import * as SecureStore from 'expo-secure-store';

export const storage = {
  getCurrentUser: async () => {
    try {
      const userJson = await SecureStore.getItemAsync('user');
      return userJson ? JSON.parse(userJson) : null;
    } catch (e) {
      return null;
    }
  }
};