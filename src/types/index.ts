
export type UserRole = 'client' | 'artisan' | 'agent' | 'super_admin';

export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'none';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type ArtisanCategory = 
  | 'Plumber'
  | 'Electrician'
  | 'Carpenter'
  | 'Painter'
  | 'Mechanic'
  | 'Tailor'
  | 'Hairdresser'
  | 'Mason'
  | 'Welder'
  | 'Other';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  country?: string;
  state?: string;
  localGovernment?: string;
  createdAt: string;
}

export interface Artisan {
  id: string;
  userId: string;
  category: ArtisanCategory;
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

export interface Verification {
  id: string;
  artisanId: string;
  status: VerificationStatus;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export interface Country {
  name: string;
  code: string;
  states: State[];
}

export interface State {
  name: string;
  localGovernments: string[];
}
