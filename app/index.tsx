
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { storage } from '@/src/utils/storage';
import { seedMockData } from '@/src/api/seedData';
import { User } from '@/src/types';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('Initializing app...');
      
      // Seed mock data if needed
      await seedMockData();
      
      // Check if user is logged in
      const user = await storage.getCurrentUser();
      console.log('Current user:', user?.email || 'none');
      
      setCurrentUser(user);
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Redirect based on authentication status
  if (!currentUser) {
    return <Redirect href="/login" />;
  }

  // Redirect based on user role
  switch (currentUser.role) {
    case 'client':
      return <Redirect href="/(tabs)/(home)/" />;
    case 'artisan':
      return <Redirect href="/artisan/dashboard" />;
    case 'agent':
      return <Redirect href="/agent/dashboard" />;
    case 'super_admin':
      return <Redirect href="/admin/dashboard" />;
    default:
      return <Redirect href="/login" />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
