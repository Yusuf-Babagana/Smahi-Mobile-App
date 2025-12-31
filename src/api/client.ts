import apiClient from './config';
import * as SecureStore from 'expo-secure-store';
import { RegisterData } from '../types';

// Helper to unwrap Django Pagination
const getData = (response: any) => {
  if (response.data && response.data.results && Array.isArray(response.data.results)) {
    return response.data.results;
  }
  return response.data;
};

// --- AUTHENTICATION ---
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login/', { email, password });
    if (response.data.tokens) {
      await SecureStore.setItemAsync('accessToken', response.data.tokens.access);
      await SecureStore.setItemAsync('refreshToken', response.data.tokens.refresh);
    }
    if (response.data.user) {
      await SecureStore.setItemAsync('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (data: RegisterData) => {
    const safeName = data.name || 'User';
    const nameParts = safeName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || 'User';

    const payload = {
      email: data.email,
      password: data.password,
      password_confirm: data.password,
      first_name: firstName,
      last_name: lastName,
      role: data.role,
      service_category: data.service_category, // <--- Sent to backend
      phone_number: data.phone,
      country: data.country,
      state: data.state,
      lga: data.lga
    };

    const response = await apiClient.post('/auth/register/', payload);
    if (response.data.tokens) {
      await SecureStore.setItemAsync('accessToken', response.data.tokens.access);
      await SecureStore.setItemAsync('refreshToken', response.data.tokens.refresh);
    }
    return response.data;
  },

  // --- NEW FUNCTION: Fetch Services from Backend ---
  getServices: async () => {
    console.log("Fetching services from backend...");
    const response = await apiClient.get('/auth/services/');
    console.log("Services fetched:", response.data.length);
    return response.data;
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');
  },

  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/profile/');
      return response.data;
    } catch (e) {
      return null;
    }
  }
};

// --- LOCATIONS ---
export const locationAPI = {
  getCountries: async () => {
    const response = await apiClient.get('/locations/countries/');
    return getData(response);
  },

  getStates: async (countryId: number) => {
    const response = await apiClient.get(`/locations/states/?country_id=${countryId}`);
    return getData(response);
  },

  getLGAs: async (stateId: number) => {
    const response = await apiClient.get(`/locations/lgas/?state_id=${stateId}`);
    return getData(response);
  },

  searchLocations: async (query: string) => {
    const response = await apiClient.get(`/locations/search/?q=${query}`);
    return response.data;
  }
};

// --- BOOKINGS ---
export const bookingAPI = {
  getBookings: async () => {
    const response = await apiClient.get('/bookings/');
    return getData(response);
  },

  createBooking: async (data: any) => {
    const response = await apiClient.post('/bookings/', data);
    return response.data;
  }
};

// --- ARTISANS ---
export const artisanAPI = {
  getArtisans: async (filters?: { service?: string; search?: string }) => {
    console.log("[API] Fetching artisans from USER table...");

    try {
      // 1. Call the new endpoint /artisans-list/
      // This assumes your baseURL is .../api, so this becomes .../api/artisans-list/
      const response = await apiClient.get('/artisans-list/');

      console.log("[API] Artisans Found:", response.data.length || response.data.results?.length || 0);

      // 2. Return the array directly
      let results = response.data.results || response.data;
      return Array.isArray(results) ? results : [];

    } catch (error: any) {
      console.error("[API] Error fetching artisans:", error.response?.status, error.message);
      return [];
    }
  },

  getArtisanById: async (id: number) => {
    // We can just use the user detail for now since we rely on User table
    // Note: ensure your backend has a route for /users/<id>/ or similar if needed, 
    // otherwise fallback to fetching the list and finding the item.
    try {
      const response = await apiClient.get(`/auth/users/${id}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching artisan details", error);
      return null;
    }
  }
};

