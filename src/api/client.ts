
import { User, Artisan, Booking, Verification, UserRole, ArtisanCategory, BookingStatus, VerificationStatus } from '../types';
import { storage } from '../utils/storage';
import { MOCK_DELAY } from '../constants/config';

// Helper to simulate API delay
const delay = (ms: number = MOCK_DELAY) => new Promise(resolve => setTimeout(resolve, ms));

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Auth API
export const authAPI = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    await delay();
    console.log('API: Login attempt', email);
    
    const users: User[] = await storage.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    const token = `token_${user.id}_${Date.now()}`;
    await storage.setAuthToken(token);
    await storage.setCurrentUser(user);
    
    console.log('API: Login successful', user.role);
    return { user, token };
  },

  async register(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    await delay();
    console.log('API: Register attempt', userData.email);
    
    const users: User[] = await storage.getUsers();
    
    // Check if email already exists
    if (users.find(u => u.email === userData.email)) {
      throw new Error('Email already registered');
    }
    
    const newUser: User = {
      ...userData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    await storage.setUsers(users);
    
    console.log('API: Registration successful', newUser.id);
    return newUser;
  },

  async logout(): Promise<void> {
    await delay();
    console.log('API: Logout');
    await storage.clearAuth();
  },

  async getCurrentUser(): Promise<User | null> {
    return await storage.getCurrentUser();
  },
};

// Artisan API
export const artisanAPI = {
  async getArtisans(category?: ArtisanCategory): Promise<Artisan[]> {
    await delay();
    console.log('API: Get artisans', category);
    
    let artisans: Artisan[] = await storage.getArtisans();
    
    if (category && category !== 'All') {
      artisans = artisans.filter(a => a.category === category);
    }
    
    // Only return verified artisans for public listing
    artisans = artisans.filter(a => a.verificationStatus === 'approved');
    
    console.log('API: Found artisans', artisans.length);
    return artisans;
  },

  async getArtisanById(id: string): Promise<Artisan | null> {
    await delay();
    console.log('API: Get artisan by ID', id);
    
    const artisans: Artisan[] = await storage.getArtisans();
    return artisans.find(a => a.id === id) || null;
  },

  async getArtisanByUserId(userId: string): Promise<Artisan | null> {
    await delay();
    console.log('API: Get artisan by user ID', userId);
    
    const artisans: Artisan[] = await storage.getArtisans();
    return artisans.find(a => a.userId === userId) || null;
  },

  async updateArtisan(id: string, updates: Partial<Artisan>): Promise<Artisan> {
    await delay();
    console.log('API: Update artisan', id);
    
    const artisans: Artisan[] = await storage.getArtisans();
    const index = artisans.findIndex(a => a.id === id);
    
    if (index === -1) {
      throw new Error('Artisan not found');
    }
    
    artisans[index] = { ...artisans[index], ...updates };
    await storage.setArtisans(artisans);
    
    console.log('API: Artisan updated');
    return artisans[index];
  },

  async createArtisanProfile(userId: string, data: Omit<Artisan, 'id' | 'userId' | 'createdAt' | 'verificationStatus' | 'rating' | 'reviewCount'>): Promise<Artisan> {
    await delay();
    console.log('API: Create artisan profile', userId);
    
    const artisans: Artisan[] = await storage.getArtisans();
    
    const newArtisan: Artisan = {
      ...data,
      id: generateId(),
      userId,
      verificationStatus: 'none',
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };
    
    artisans.push(newArtisan);
    await storage.setArtisans(artisans);
    
    console.log('API: Artisan profile created');
    return newArtisan;
  },
};

// Booking API
export const bookingAPI = {
  async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<Booking> {
    await delay();
    console.log('API: Create booking');
    
    const bookings: Booking[] = await storage.getBookings();
    
    const newBooking: Booking = {
      ...bookingData,
      id: generateId(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    bookings.push(newBooking);
    await storage.setBookings(bookings);
    
    console.log('API: Booking created', newBooking.id);
    return newBooking;
  },

  async getBookingsByClient(clientId: string): Promise<Booking[]> {
    await delay();
    console.log('API: Get bookings by client', clientId);
    
    const bookings: Booking[] = await storage.getBookings();
    return bookings.filter(b => b.clientId === clientId);
  },

  async getBookingsByArtisan(artisanId: string): Promise<Booking[]> {
    await delay();
    console.log('API: Get bookings by artisan', artisanId);
    
    const bookings: Booking[] = await storage.getBookings();
    return bookings.filter(b => b.artisanId === artisanId);
  },

  async updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
    await delay();
    console.log('API: Update booking status', id, status);
    
    const bookings: Booking[] = await storage.getBookings();
    const index = bookings.findIndex(b => b.id === id);
    
    if (index === -1) {
      throw new Error('Booking not found');
    }
    
    bookings[index].status = status;
    await storage.setBookings(bookings);
    
    console.log('API: Booking status updated');
    return bookings[index];
  },
};

// Verification API
export const verificationAPI = {
  async requestVerification(artisanId: string): Promise<Verification> {
    await delay();
    console.log('API: Request verification', artisanId);
    
    const verifications: Verification[] = await storage.getVerifications();
    
    // Check if there's already a pending verification
    const existing = verifications.find(v => v.artisanId === artisanId && v.status === 'pending');
    if (existing) {
      throw new Error('Verification request already pending');
    }
    
    const newVerification: Verification = {
      id: generateId(),
      artisanId,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };
    
    verifications.push(newVerification);
    await storage.setVerifications(verifications);
    
    // Update artisan verification status
    const artisans: Artisan[] = await storage.getArtisans();
    const artisanIndex = artisans.findIndex(a => a.id === artisanId);
    if (artisanIndex !== -1) {
      artisans[artisanIndex].verificationStatus = 'pending';
      await storage.setArtisans(artisans);
    }
    
    console.log('API: Verification requested');
    return newVerification;
  },

  async getPendingVerifications(): Promise<Verification[]> {
    await delay();
    console.log('API: Get pending verifications');
    
    const verifications: Verification[] = await storage.getVerifications();
    return verifications.filter(v => v.status === 'pending');
  },

  async updateVerification(id: string, status: VerificationStatus, reviewedBy: string, notes?: string): Promise<Verification> {
    await delay();
    console.log('API: Update verification', id, status);
    
    const verifications: Verification[] = await storage.getVerifications();
    const index = verifications.findIndex(v => v.id === id);
    
    if (index === -1) {
      throw new Error('Verification not found');
    }
    
    verifications[index] = {
      ...verifications[index],
      status,
      reviewedAt: new Date().toISOString(),
      reviewedBy,
      notes,
    };
    
    await storage.setVerifications(verifications);
    
    // Update artisan verification status
    const artisans: Artisan[] = await storage.getArtisans();
    const artisanIndex = artisans.findIndex(a => a.id === verifications[index].artisanId);
    if (artisanIndex !== -1) {
      artisans[artisanIndex].verificationStatus = status;
      await storage.setArtisans(artisans);
    }
    
    console.log('API: Verification updated');
    return verifications[index];
  },
};

// Admin API
export const adminAPI = {
  async getAllUsers(): Promise<User[]> {
    await delay();
    console.log('API: Get all users');
    return await storage.getUsers();
  },

  async getAllArtisans(): Promise<Artisan[]> {
    await delay();
    console.log('API: Get all artisans');
    return await storage.getArtisans();
  },

  async getAllBookings(): Promise<Booking[]> {
    await delay();
    console.log('API: Get all bookings');
    return await storage.getBookings();
  },

  async getStats(): Promise<{
    totalUsers: number;
    totalArtisans: number;
    totalBookings: number;
    pendingVerifications: number;
  }> {
    await delay();
    console.log('API: Get stats');
    
    const users = await storage.getUsers();
    const artisans = await storage.getArtisans();
    const bookings = await storage.getBookings();
    const verifications = await storage.getVerifications();
    
    return {
      totalUsers: users.length,
      totalArtisans: artisans.length,
      totalBookings: bookings.length,
      pendingVerifications: verifications.filter(v => v.status === 'pending').length,
    };
  },
};
