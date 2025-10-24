
import React, { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { StyleSheet, View, Text, Alert, Platform, Pressable, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { storage } from "@/src/utils/storage";
import { authAPI, artisanAPI } from "@/src/api/client";
import { User, Artisan } from "@/src/types";
import ArtisanCard from "@/src/components/ArtisanCard";

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [artisans, setArtisans] = useState<Artisan[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await storage.getCurrentUser();
      if (!currentUser) {
        router.replace('/login');
        return;
      }

      setUser(currentUser);

      const allArtisans = await artisanAPI.getArtisans();
      setArtisans(allArtisans);
    } catch (error) {
      console.error('Error loading home data:', error);
      Alert.alert('Error', 'Failed to load artisans');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await authAPI.logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const renderHeaderRight = () => (
    <Pressable
      onPress={handleLogout}
      style={styles.headerButtonContainer}
    >
      <IconSymbol name="rectangle.portrait.and.arrow.right" color={theme.colors.primary} />
    </Pressable>
  );

  const renderHeaderLeft = () => (
    <Pressable
      onPress={() => Alert.alert("Not Implemented", "Search feature coming soon")}
      style={styles.headerButtonContainer}
    >
      <IconSymbol
        name="magnifyingglass"
        color={theme.colors.primary}
      />
    </Pressable>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Artisan Connect",
            headerRight: renderHeaderRight,
            headerLeft: renderHeaderLeft,
          }}
        />
      )}
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
        {Platform.OS !== 'ios' && (
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Artisan Connect
            </Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={() => Alert.alert("Not Implemented", "Search feature coming soon")} style={styles.headerButton}>
                <IconSymbol name="magnifyingglass" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
                <IconSymbol name="rectangle.portrait.and.arrow.right" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <View style={[styles.welcomeCard, { backgroundColor: theme.dark ? '#1C1C1E' : '#fff' }]}>
            <Text style={[styles.welcomeText, { color: theme.colors.text }]}>
              Welcome back, {user?.name}!
            </Text>
            <Text style={[styles.welcomeSubtext, { color: theme.dark ? '#98989D' : '#666' }]}>
              Find skilled artisans for your needs
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Available Artisans ({artisans.length})
            </Text>
            {artisans.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.dark ? '#1C1C1E' : '#fff' }]}>
                <IconSymbol name="person.2.slash" size={48} color={theme.dark ? '#98989D' : '#666'} />
                <Text style={[styles.emptyText, { color: theme.dark ? '#98989D' : '#666' }]}>
                  No artisans available at the moment
                </Text>
              </View>
            ) : (
              artisans.map((artisan) => (
                <ArtisanCard
                  key={artisan.id}
                  artisan={artisan}
                  onPress={() => Alert.alert('Coming Soon', 'Artisan profile view will be available soon')}
                />
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  welcomeCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyCard: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  headerButtonContainer: {
    padding: 6,
  },
});
