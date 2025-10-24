
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USERS: '@artisan_users',
  ARTISANS: '@artisan_artisans',
  BOOKINGS: '@artisan_bookings',
  VERIFICATIONS: '@artisan_verifications',
  CURRENT_USER: '@artisan_current_user',
  AUTH_TOKEN: '@artisan_auth_token',
};

export const storage = {
  // Generic storage methods
  async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      console.log(`Storage: Set ${key}`);
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      throw error;
    }
  },

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      console.log(`Storage: Get ${key}`, jsonValue ? 'found' : 'not found');
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`Storage: Removed ${key}`);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
      console.log('Storage: Cleared all data');
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  // Specific data methods
  async getUsers() {
    return this.getItem(KEYS.USERS) || [];
  },

  async setUsers(users: any[]) {
    return this.setItem(KEYS.USERS, users);
  },

  async getArtisans() {
    return this.getItem(KEYS.ARTISANS) || [];
  },

  async setArtisans(artisans: any[]) {
    return this.setItem(KEYS.ARTISANS, artisans);
  },

  async getBookings() {
    return this.getItem(KEYS.BOOKINGS) || [];
  },

  async setBookings(bookings: any[]) {
    return this.setItem(KEYS.BOOKINGS, bookings);
  },

  async getVerifications() {
    return this.getItem(KEYS.VERIFICATIONS) || [];
  },

  async setVerifications(verifications: any[]) {
    return this.setItem(KEYS.VERIFICATIONS, verifications);
  },

  async getCurrentUser() {
    return this.getItem(KEYS.CURRENT_USER);
  },

  async setCurrentUser(user: any) {
    return this.setItem(KEYS.CURRENT_USER, user);
  },

  async getAuthToken() {
    return this.getItem(KEYS.AUTH_TOKEN);
  },

  async setAuthToken(token: string) {
    return this.setItem(KEYS.AUTH_TOKEN, token);
  },

  async clearAuth() {
    await this.removeItem(KEYS.CURRENT_USER);
    await this.removeItem(KEYS.AUTH_TOKEN);
  },
};
