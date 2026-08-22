export type UserRole = 'client' | 'artisan' | 'agent' | 'state_coordinator' | 'admin';

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

// NOTE: ArtisanService type removed — categories now come from the API

export interface Subcategory {
  id: number;
  name: string;
  name_ha?: string;
  description: string;
  icon: string;
}

export interface CategoryGroup {
  id: number;
  name: string;
  name_ha?: string;
  description: string;
  icon: string;
  subcategories: Subcategory[];
  created_at: string;
}

export interface FlatCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  parent_id: number | null;
}

// The User object returned from Django
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  service_category?: string; // Category ID as string from API
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
  // Email OTP confirmation — distinct from is_verified (the artisan ID-verification badge)
  email_verified?: boolean;
  // Artisans must pay a registration fee before their account is activated
  registration_fee_paid?: boolean;
  account_status?: 'active' | 'suspended' | 'locked';
  created_at?: string;
  serial_number?: string;
  // Default language incoming/outgoing chat messages are automatically
  // translated into (see src/constants/languages.ts). Blank = never
  // explicitly chosen.
  preferred_language?: string;
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
  category: string;
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

// --- AI Action types (returned by the AI chat backend) ---

export interface AIArtisanResult {
  id: number;
  user_id: number;
  name: string;
  category: string;
  /** Blank unless this category is a custom "Other" one whose registrant
   * explicitly picked an icon for it — see resolveProfessionIcon(). */
  category_material_icon: string;
  rating: number;
  is_verified: boolean;
  /** Absolute or relative URL; null when the artisan has no photo uploaded. */
  profile_picture: string | null;
  /** Null when the caller's location wasn't available — never guess a distance for display. */
  distance_km: number | null;
}

export interface AISearchActionResult {
  type: 'search_results';
  data: { query: string; results: AIArtisanResult[] };
}

export interface AICategoryFilterAction {
  type: 'category_filter';
  data: { category: string; category_id?: number; results: AIArtisanResult[] };
}

export interface AIArtisanProfileAction {
  type: 'artisan_profile';
  data: {
    found: boolean;
    name: string;
    id?: number;
    user_id?: number;
    category?: string;
    category_material_icon?: string;
    rating?: number;
    is_verified?: boolean;
    profile_picture?: string | null;
    distance_km?: number | null;
    bio?: string;
  };
}

export interface AINavigationAction {
  type: 'navigation';
  data: { screen: string; route: string };
}

export type AIAction =
  | AISearchActionResult
  | AICategoryFilterAction
  | AIArtisanProfileAction
  | AINavigationAction;