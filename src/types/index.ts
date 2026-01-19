export type UserRole = 'client' | 'artisan' | 'agent' | 'admin';

export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'none';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

// Matches the 20 Services in Backend
export type ArtisanService =
  | 'plumbing'
  | 'electrical'
  | 'carpentry'
  | 'painting'
  | 'masonry'
  | 'welding'
  | 'mechanic'
  | 'generator'
  | 'ac_fridge'
  | 'fashion'
  | 'hair'
  | 'makeup'
  | 'catering'
  | 'photography'
  | 'events'
  | 'cleaning'
  | 'tiling'
  | 'aluminum'
  | 'tech_repair'
  | 'interior'
  | 'other';

// The User object returned from Django
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  service_category?: ArtisanService; // Only for artisans
  phone_number?: string;
  address?: string;
  profile_picture?: string;

  // Location IDs (numbers in Django)
  country?: number;
  state?: number;
  lga?: number;

  // Expanded details for UI
  lga_details?: { id: number; name: string };
  state_details?: { id: number; name: string };

  is_verified: boolean;
  account_status?: 'active' | 'suspended' | 'locked';
  created_at?: string;
  serial_number?: string;
}

// The data collected from the Register Form
export interface RegisterData {
  name: string;      // "John Doe" (Frontend combines this)
  email: string;
  password: string;
  role: UserRole;
  service_category?: string; // Optional (only if artisan)
  phone: string;

  // Location IDs as strings (from Dropdown Pickers)
  country: string;
  state: string;
  lga: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Artisan {
  id: string;
  userId: string;
  category: ArtisanService;
  description: string;
  experience: string;
  hourlyRate: number;
  availability: string;
  verificationStatus: VerificationStatus;
  rating: number;
  reviewCount: number;
  skills: string[];
  portfolio?: string[];
  createdAt: string;
}

export interface Booking {
  id: string;
  clientId: string;
  artisanId: string;
  date: string;
  time: string;
  description: string;
  status: BookingStatus;
  location: string;
  estimatedCost?: number;
  createdAt: string;
}