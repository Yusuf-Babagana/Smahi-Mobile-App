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
  },
  // ✅ ADD THIS MISSING FUNCTION
  getBookingsByArtisan: async (artisanId: number) => {
    try {
      const response = await apiClient.get(`/bookings/`, { params: { artisan: artisanId } });
      return response.data;
    } catch (error) {
      console.log("Error fetching bookings:", error);
      return []; // Return empty array on error so app doesn't crash
    }
  },
};

export const artisanAPI = {
  // ✅ List Fetch: Added '/auth' prefix
  getArtisans: async (filters?: { service?: string; search?: string }, page: number = 1) => {
    console.log(`[API] Fetching artisans (Page ${page})...`);

    try {
      const params: any = { page: page };
      if (filters?.search) params.search = filters.search;
      if (filters?.service && filters.service !== 'All') params.service_category = filters.service;

      // FIX: Added /auth/ before artisans-list/
      const response = await apiClient.get('/auth/artisans-list/', { params });
      return response.data;

    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return { results: [], next: null };
      }
      console.error("[API] Error fetching artisans:", error.message);
      throw error;
    }
  },

  getArtisanById: async (id: number) => {
    try {
      // FIX: Added /auth/ prefix
      const response = await apiClient.get(`/auth/users/${id}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching artisan details", error);
      return null;
    }
  },

  // ✅ Detail Fetch: Added '/auth' prefix
  getArtisanByUserId: async (userId: number) => {
    // FIX: Added /auth/ before artisans-list/
    const response = await apiClient.get(`/auth/artisans-list/${userId}/`);
    return response.data;
  },
};


export const chatAPI = {
  getConversations: async () => {
    const response = await apiClient.get('/chat/conversations/');
    return response.data;
  },

  getMessages: async (conversationId: number) => {
    const response = await apiClient.get(`/chat/conversations/${conversationId}/messages/`);
    return response.data;
  },

  sendMessage: async (data: { recipient_id?: number; conversation_id?: number; text: string }) => {
    const response = await apiClient.post('/chat/send/', data);
    return response.data;
  },

  // ✅ NEW FUNCTION
  findConversation: async (recipientId: number) => {
    const response = await apiClient.get(`/chat/find/${recipientId}/`);
    return response.data;
  }
};