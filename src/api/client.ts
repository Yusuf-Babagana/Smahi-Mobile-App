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
      service_category: data.service_category,
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

  getServices: async () => {
    const response = await apiClient.get('/auth/services/');
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

  getBookingsByArtisan: async (artisanId: number) => {
    try {
      const response = await apiClient.get(`/bookings/`, { params: { artisan: artisanId } });
      return response.data;
    } catch (error) {
      console.log("Error fetching bookings:", error);
      return [];
    }
  },
};

// --- ARTISANS ---
export const artisanAPI = {
  getArtisans: async (filters?: { service?: string; search?: string; lga?: string | number; state?: string | number }, page: number = 1) => {
    try {
      const params: any = { page: page };
      if (filters?.search) params.search = filters.search;
      if (filters?.service && filters.service !== 'All') params.service_category = filters.service;
      if (filters?.lga) params.lga = filters.lga;
      if (filters?.state) params.state = filters.state;

      // ✅ FIXED: Removed '/auth' prefix to match backend urls.py
      const response = await apiClient.get('/artisans-list/', { params });
      return response.data;

    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return { results: [], next: null };
      }
      throw error;
    }
  },

  getArtisanById: async (id: number) => {
    try {
      // ✅ FIXED: Removed '/auth' prefix to match backend urls.py
      const response = await apiClient.get(`/users/${id}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching artisan details", error);
      throw error;
    }
  },

  // Agent Verification
  verifyArtisan: async (userId: number) => {
    try {
      const response = await apiClient.post(`/core/agent/verify-artisan/${userId}/`);
      return response.data;
    } catch (error) {
      console.error("Verification Error:", error);
      throw error;
    }
  },
};

// --- CHAT ---
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

  findConversation: async (recipientId: number) => {
    const response = await apiClient.get(`/chat/find/${recipientId}/`);
    return response.data;
  }
};

// --- DASHBOARD ---
export const dashboardAPI = {
  getStats: async () => {
    try {
      const response = await apiClient.get('/core/dashboard/stats/');
      return response.data;
    } catch (error) {
      console.error('Dashboard Stats Error:', error);
      throw error;
    }
  },
};

// --- ADMIN ---
export const adminAPI = {
  getStats: async () => {
    try {
      const response = await apiClient.get('/core/dashboard/stats/');
      return response.data;
    } catch (error) {
      console.error('Admin Stats Error:', error);
      throw error;
    }
  },
  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/auth/users/');
      return getData(response);
    } catch (error) {
      console.error('Admin All Users Error:', error);
      throw error;
    }
  }
};

// --- TICKETS ---
export const ticketAPI = {
  getTickets: async () => {
    try {
      const response = await apiClient.get('/core/tickets/');
      return response.data;
    } catch (error) {
      console.error('Fetch Tickets Error:', error);
      throw error;
    }
  },

  createTicket: async (data: any) => {
    try {
      if (data.attachment) {
        const formData = new FormData();
        formData.append('subject', data.subject);
        formData.append('description', data.description);
        formData.append('priority', data.priority);

        const uri = data.attachment;
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('attachment', { uri, name: filename, type } as any);

        const response = await apiClient.post('/core/tickets/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
      }

      const response = await apiClient.post('/core/tickets/', data);
      return response.data;
    } catch (error) {
      console.error('Create Ticket Error:', error);
      throw error;
    }
  },

  getTicketDetail: async (id: string | number) => {
    try {
      const response = await apiClient.get(`/core/tickets/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Fetch Ticket ${id} Error:`, error);
      throw error;
    }
  }
};
// src/api/client.ts

export const agentAPI = {
  registerArtisan: async (data: any) => {
    // We reuse the RegisterData type but send it to a different endpoint
    const response = await apiClient.post('/auth/agent/register-artisan/', data);
    return response.data;
  }
};