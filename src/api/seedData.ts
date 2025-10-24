
import { User, Artisan } from '../types';
import { storage } from '../utils/storage';

export async function seedMockData() {
  console.log('Seeding mock data...');
  
  // Check if data already exists
  const existingUsers = await storage.getUsers();
  if (existingUsers && existingUsers.length > 0) {
    console.log('Data already seeded, skipping...');
    return;
  }

  // Seed users
  const users: User[] = [
    {
      id: 'user_1',
      name: 'Aminatu Bello',
      email: 'aminatu@example.com',
      password: 'password123',
      role: 'client',
      phone: '+234 801 234 5678',
      country: 'Nigeria',
      state: 'Lagos',
      localGovernment: 'Ikeja',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user_2',
      name: 'Sani Rabiu',
      email: 'sani@example.com',
      password: 'password123',
      role: 'client',
      phone: '+234 802 345 6789',
      country: 'Nigeria',
      state: 'Kano',
      localGovernment: 'Kano Municipal',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user_3',
      name: 'Muhammad Sani',
      email: 'muhammad@example.com',
      password: 'password123',
      role: 'artisan',
      phone: '+234 803 456 7890',
      country: 'Nigeria',
      state: 'Kaduna',
      localGovernment: 'Kaduna North',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user_4',
      name: 'Saidu Abdulmalik',
      email: 'saidu@example.com',
      password: 'password123',
      role: 'artisan',
      phone: '+234 804 567 8901',
      country: 'Nigeria',
      state: 'Abuja',
      localGovernment: 'Municipal Area Council',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user_5',
      name: 'Salisu Sani',
      email: 'salisu@example.com',
      password: 'password123',
      role: 'artisan',
      phone: '+234 805 678 9012',
      country: 'Nigeria',
      state: 'Lagos',
      localGovernment: 'Lagos Island',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user_6',
      name: 'Aliyu Bala',
      email: 'aliyu@example.com',
      password: 'password123',
      role: 'agent',
      phone: '+234 806 789 0123',
      country: 'Nigeria',
      state: 'Kano',
      localGovernment: 'Gwale',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user_7',
      name: 'Admin Yusuf',
      email: 'admin@example.com',
      password: 'password123',
      role: 'super_admin',
      phone: '+234 807 890 1234',
      country: 'Nigeria',
      state: 'Abuja',
      localGovernment: 'Municipal Area Council',
      createdAt: new Date().toISOString(),
    },
  ];

  await storage.setUsers(users);
  console.log('Users seeded:', users.length);

  // Seed artisans
  const artisans: Artisan[] = [
    {
      id: 'artisan_1',
      userId: 'user_3',
      category: 'Plumber',
      description: 'Experienced plumber with 10+ years in residential and commercial plumbing. Specializing in pipe installation, leak repairs, and bathroom fixtures.',
      experience: '10 years',
      hourlyRate: 5000,
      availability: 'Monday to Saturday, 8AM - 6PM',
      verificationStatus: 'approved',
      rating: 4.8,
      reviewCount: 45,
      skills: ['Pipe Installation', 'Leak Repair', 'Bathroom Fixtures', 'Water Heater Installation'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'artisan_2',
      userId: 'user_4',
      category: 'Electrician',
      description: 'Certified electrician providing quality electrical services. Expert in wiring, lighting installation, and electrical troubleshooting.',
      experience: '8 years',
      hourlyRate: 6000,
      availability: 'Monday to Friday, 9AM - 5PM',
      verificationStatus: 'pending',
      rating: 4.5,
      reviewCount: 32,
      skills: ['Wiring', 'Lighting Installation', 'Circuit Breaker Repair', 'Electrical Troubleshooting'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'artisan_3',
      userId: 'user_5',
      category: 'Carpenter',
      description: 'Skilled carpenter specializing in custom furniture, door and window installation, and home renovations.',
      experience: '12 years',
      hourlyRate: 4500,
      availability: 'Monday to Saturday, 7AM - 5PM',
      verificationStatus: 'approved',
      rating: 4.9,
      reviewCount: 67,
      skills: ['Custom Furniture', 'Door Installation', 'Window Installation', 'Home Renovations'],
      createdAt: new Date().toISOString(),
    },
  ];

  await storage.setArtisans(artisans);
  console.log('Artisans seeded:', artisans.length);

  // Initialize empty bookings and verifications
  await storage.setBookings([]);
  await storage.setVerifications([]);
  
  console.log('Mock data seeding complete!');
}
