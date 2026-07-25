import apiClient from './config';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    const response = await apiClient.post('auth/login/', { email, password });
    if (response.data.tokens) {
      await SecureStore.setItemAsync('accessToken', response.data.tokens.access);
      await SecureStore.setItemAsync('refreshToken', response.data.tokens.refresh);
    }
    if (response.data.user) {
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('auth/profile/');
    return response.data;
  },

  updateProfile: async (data: Record<string, any>) => {
    const response = await apiClient.patch('auth/profile/', data);
    return response.data;
  },

  // Persist the device GPS point on the user's profile. This is what powers
  // "X km away": artisan search compares the client's coords against each
  // artisan's SAVED coords, so both sides should sync when they get a fix.
  saveCoordinates: async (latitude: number, longitude: number) => {
    const response = await apiClient.patch('auth/profile/', {
      latitude: latitude.toFixed(6),
      longitude: longitude.toFixed(6),
    });
    return response.data;
  },

  register: async (data: any) => {
    // Collect names: either from direct fields or by splitting 'name'
    let firstName = data.first_name;
    let lastName = data.last_name;

    if (!firstName && data.name) {
      const nameParts = data.name.trim().split(' ');
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ') || '';
    }

    const payload: Record<string, any> = {
      email: data.email,
      password: data.password,
      password_confirm: data.password_confirm || data.password,
      first_name: firstName || '',
      last_name: lastName || '',
      role: data.role,
      phone_number: data.phone_number || data.phone,
      country: data.country,
      state: data.state,
      lga: data.lga
    };

    // Artisan category: either an existing category ID or a custom name
    if (data.role === 'artisan') {
      if (data.custom_category_name) {
        payload.custom_category_name = data.custom_category_name;
        payload.category_id = null;
      } else if (data.category_id) {
        payload.category_id = Number(data.category_id);
      }
    }

    const response = await apiClient.post('auth/register/', payload);
    if (response.data.tokens) {
      await SecureStore.setItemAsync('accessToken', response.data.tokens.access);
      await SecureStore.setItemAsync('refreshToken', response.data.tokens.refresh);
    }
    // Store the user like login does: paymentAPI.initialize and other calls
    // rely on the cached user's email as a fallback when the JWT header
    // fails to attach (SecureStore timing on Android).
    if (response.data.user) {
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  getServices: async () => {
    const cats = await categoryAPI.getCategoriesFlat();
    return cats.map((cat: any) => ({
      label: cat.name,
      value: cat.id.toString()
    }));
  },

  // --- EMAIL VERIFICATION (OTP) ---
  // Sends (or resends) the 6-digit code. 429 = 60s resend cooldown active.
  requestEmailVerification: async () => {
    const response = await apiClient.post('auth/email/verify/request/');
    return response.data;
  },

  // Confirms the code. On 200 returns { message, user } — caller must refresh the cached user.
  confirmEmailVerification: async (code: string) => {
    const response = await apiClient.post('auth/email/verify/confirm/', { code });
    return response.data;
  },

  // --- PASSWORD RESET (OTP via email; user is logged OUT, so these take the email,
  // not the JWT). Note the hyphen: 'password-reset', unlike 'email/verify'.
  requestPasswordReset: async (email: string) => {
    const response = await apiClient.post('auth/password-reset/request/', { email });
    return response.data;
  },

  confirmPasswordReset: async (email: string, code: string, newPassword: string) => {
    const response = await apiClient.post('auth/password-reset/confirm/', {
      email,
      code,
      new_password: newPassword,
    });
    return response.data;
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await AsyncStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/profile/');
      return response.data;
    } catch (e) {
      return null;
    }
  },

  // Deactivates the account (Play Store account-deletion requirement).
  // Requires the current password as confirmation.
  deleteAccount: async (password: string) => {
    const response = await apiClient.post('/auth/account/delete/', { password });
    return response.data;
  }
};

// --- LOCATIONS ---
export const locationAPI = {
  getCountries: async () => {
    const response = await apiClient.get('locations/countries/');
    return response.data; 
  },

  getStates: async (countryId: number) => {
    const response = await apiClient.get(`locations/states/${countryId}/`);
    return response.data;
  },

  getLGAs: async (stateId: number) => {
    const response = await apiClient.get(`locations/lgas/${stateId}/`);
    return response.data;
  },

  searchLocations: async (query: string) => {
    const response = await apiClient.get(`locations/search/?q=${query}`);
    return response.data;
  }
};

// --- BOOKINGS ---
export const bookingAPI = {
  getBookings: async () => {
    const response = await apiClient.get('bookings/');
    return getData(response);
  },

  createBooking: async (data: any) => {
    const response = await apiClient.post('bookings/', data);
    return response.data;
  },

  getBookingsByArtisan: async (artisanId: number) => {
    try {
      const response = await apiClient.get(`bookings/`, { params: { artisan: artisanId } });
      return getData(response);
    } catch (error) {
      console.log("Error fetching bookings:", error);
      return [];
    }
  },

  // Status transitions (state machine enforced by the backend):
  // artisan: pending→confirmed→in_progress→completed, pending/confirmed→cancelled
  // client:  pending/confirmed→cancelled
  getBookingById: async (bookingId: string | number) => {
    const response = await apiClient.get(`bookings/${bookingId}/`);
    return response.data;
  },

  updateBooking: async (bookingId: number, data: { status: string; cancellation_reason?: string }) => {
    const response = await apiClient.patch(`bookings/${bookingId}/`, data);
    return response.data;
  },
};

// --- CATEGORIES (Hierarchical) ---
export const categoryAPI = {
  getCategories: async () => {
    try {
      const response = await apiClient.get('categories/');
      return response.data.results ? response.data.results : response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },
  getCategoriesFlat: async () => {
    try {
      const response = await apiClient.get('categories/all/');
      return response.data.results ? response.data.results : response.data;
    } catch (error) {
      console.error("Error fetching flat categories:", error);
      throw error;
    }
  },
  searchCategories: async (query: string) => {
    try {
      const response = await apiClient.get(`categories/?search=${encodeURIComponent(query)}`);
      return response.data.results ? response.data.results : response.data;
    } catch (error) {
      console.error("Error searching categories:", error);
      return [];
    }
  }
};

// --- ARTISANS ---
export const artisanAPI = {
  getArtisans: async (filters?: { 
    service?: string | number | null; 
    search?: string; 
    lga?: string | number; 
    state?: string | number; 
    latitude?: number; 
    longitude?: number; 
    max_distance?: number | null;
    use_saved?: boolean;
  }, page: number = 1) => {
    try {
      const params: any = { page: page };
      if (filters?.search) params.search = filters.search;
      if (filters?.service && filters.service !== 'All') params.category_id = filters.service;
      if (filters?.lga) params.lga_id = filters.lga;
      if (filters?.state) params.state_id = filters.state;
      if (filters?.latitude != null && !filters.use_saved) params.latitude = filters.latitude;
      if (filters?.longitude != null && !filters.use_saved) params.longitude = filters.longitude;
      if (filters?.use_saved) params.use_saved = 'true';
      if (filters?.max_distance !== undefined && filters?.max_distance !== null) {
        params.max_distance = filters.max_distance;
      }

      console.log("📡 FETCHING ARTISANS WITH PARAMS:", JSON.stringify(params));
      const response = await apiClient.get('artisans/', { params });
      return response.data;

    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return { results: [], next: null };
      }
      throw error;
    }
  },

  // Update the logged-in artisan's own profile (bio, rates, availability).
  // Note: bio lives on the ArtisanProfile model, NOT the user account —
  // auth/profile/ silently ignores it.
  updateMyProfile: async (data: Record<string, any>) => {
    const response = await apiClient.patch('artisan/profile/', data);
    return response.data;
  },

  // Fetch artisan profile by user ID
  getArtisanByUserId: async (userId: number) => {
    try {
      // ✅ FIXED: Changed from '/artisans-list/' to '/artisans/'
      const response = await apiClient.get(`artisans/`, { params: { user: userId } });
      // If paginated, return the first result; otherwise return data directly
      const data = response.data;
      if (data.results && Array.isArray(data.results)) {
        return data.results[0] || null;
      }
      return data;
    } catch (error) {
      console.error("Error fetching artisan by user ID:", error);
      throw error;
    }
  },

  getArtisanById: async (id: string | number) => {
    try {
      // ✅ FIXED: Using the artisans/ profile endpoint
      const response = await apiClient.get(`artisans/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching artisan ${id}:`, error);
      throw error;
    }
  },

  updateArtisan: async (artisanId: number, data: Record<string, any>) => {
    const response = await apiClient.patch(`artisans/${artisanId}/`, data);
    return response.data;
  },

  // Agent verification — takes the artisan's USER id, not the ArtisanProfile id.
  verifyArtisan: async (userId: number) => {
    try {
      const response = await apiClient.post(`/agent/verify-artisan/${userId}/`);
      return response.data;
    } catch (error) {
      console.error("Verification Error:", error);
      throw error;
    }
  },

  // Public reviews for this artisan (ArtisanProfile id). No auth required —
  // uses the privacy-safe PublicReviewSerializer (first name only, never
  // the reviewing client's email/phone).
  getArtisanReviews: async (artisanId: string | number, page: number = 1) => {
    try {
      const response = await apiClient.get(`artisans/${artisanId}/reviews/`, { params: { page } });
      return response.data;
    } catch (error) {
      console.error(`Error fetching reviews for artisan ${artisanId}:`, error);
      throw error;
    }
  },
};

// --- REVIEWS ---
export const reviewAPI = {
  submitReview: async (bookingId: number, rating: number, comment: string) => {
    const response = await apiClient.post('reviews/', { booking: bookingId, rating, comment });
    return response.data;
  },
};

// --- DISPUTES ---
// Lives under /api/v1/ — a genuinely new resource, not an extension of an
// existing one, per this project's API versioning decision. apiClient's
// baseURL already ends in '/api/', so a relative 'v1/disputes/' path
// resolves correctly without any special-casing.
export const disputeAPI = {
  submitDispute: async (category: string, description: string, bookingId?: number) => {
    const payload: Record<string, any> = { category, description };
    if (bookingId) payload.booking = bookingId;
    const response = await apiClient.post('v1/disputes/', payload);
    return response.data;
  },

  getMyDisputes: async (page: number = 1) => {
    const response = await apiClient.get('v1/disputes/', { params: { page } });
    return response.data;
  },
};

// --- CHAT ---
export const chatAPI = {
  getConversations: async () => {
    const response = await apiClient.get('/chat/conversations/');
    return response.data;
  },

  getMessages: async (conversationId: number) => {
    const response = await apiClient.get(`/chat/messages/`, { params: { conversation_id: conversationId } });
    return response.data;
  },

  sendMessage: async (data: { conversation_id: number; text: string }) => {
    const response = await apiClient.post('/chat/messages/', data);
    return response.data;
  },

  getOrCreateConversation: async (recipientId: number) => {
    const response = await apiClient.post('/chat/conversations/get_or_create/', { recipient_id: recipientId });
    return response.data;
  },

  markAsRead: async (conversationId: number) => {
    const response = await apiClient.post('/chat/messages/mark_as_read/', { conversation_id: conversationId });
    return response.data;
  }
};

// Note: dashboard stats now live under agentAPI.getDashboardStats() (agent/
// state-coordinator) and adminAPI.getStats() (admin) — both real endpoints.

// --- ADMIN ---
export const adminAPI = {
  getStats: async () => {
    try {
      const response = await apiClient.get('/admin/stats/');
      return response.data;
    } catch (error) {
      console.error('Admin Stats Error:', error);
      throw error;
    }
  },
  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/admin/users/');
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
  },

  updateTicket: async (id: string | number, data: any) => {
    try {
      const response = await apiClient.patch(`/core/tickets/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Update Ticket ${id} Error:`, error);
      throw error;
    }
  }
};
// src/api/client.ts

export const agentAPI = {
  // Backend generates and returns a one-time password — never send one from the client.
  registerArtisan: async (data: any) => {
    const response = await apiClient.post('/agent/register-artisan/', data);
    return response.data;
  },

  // All artisans in the agent's own state, regardless of availability/verification —
  // scoped server-side to request.user.state, so no location params needed here.
  getStateArtisans: async (params?: { search?: string; category_id?: string | number }, page: number = 1) => {
    const response = await apiClient.get('/agent/artisans/', { params: { page, ...params } });
    return response.data;
  },

  // All clients registered in the agent's own state.
  getStateClients: async (params?: { search?: string }, page: number = 1) => {
    const response = await apiClient.get('/agent/clients/', { params: { page, ...params } });
    return response.data;
  },

  // Summary counts (total_artisans, verified_artisans, pending_verification,
  // total_clients) for the agent/state-coordinator dashboard.
  getDashboardStats: async () => {
    const response = await apiClient.get('/agent/dashboard-stats/');
    return response.data;
  },
};

// --- PAYMENTS (Paystack registration fee) ---
export const paymentAPI = {
  // Pass the email explicitly when you have it (e.g. the register screen);
  // otherwise it falls back to the cached user. An in-memory accessToken
  // (from the registration response) bypasses the SecureStore timing race
  // entirely. The backend accepts either identity, so sending both makes
  // the call state-proof.
  initialize: async (explicitEmail?: string, accessToken?: string) => {
    let email = explicitEmail;
    if (!email) {
      try {
        const stored = await AsyncStorage.getItem('user');
        if (stored) email = JSON.parse(stored).email;
      } catch {}
    }
    console.log('[paymentAPI] initialize with email:', email || '(none)', 'token:', accessToken ? 'in-memory' : 'stored');
    // 30s: the backend's Paystack roundtrip on PythonAnywhere plus a mobile
    // network can exceed the client's default 15s timeout.
    const response = await apiClient.post(
      'auth/payments/initialize/',
      email ? { email } : undefined,
      {
        timeout: 30000,
        ...(accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {}),
      }
    );
    return response.data;
  },

  verify: async (reference: string) => {
    let email: string | undefined;
    try {
      const stored = await AsyncStorage.getItem('user');
      if (stored) email = JSON.parse(stored).email;
    } catch {}
    const response = await apiClient.post(`auth/payments/verify/${reference}/`, email ? { email } : undefined);
    return response.data;
  },
};