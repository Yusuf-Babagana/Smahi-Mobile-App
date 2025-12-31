import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol, IconSymbolName } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { authAPI } from "@/src/api/client";
import { storage } from "@/src/utils/storage";

// Reusable Settings Row Component
const SettingsRow = ({
  icon,
  label,
  value,
  isDestructive,
  onPress,
  showChevron = true
}: {
  icon: IconSymbolName,
  label: string,
  value?: string,
  isDestructive?: boolean,
  onPress?: () => void,
  showChevron?: boolean
}) => {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.colors.card },
        pressed && { opacity: 0.7 }
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: isDestructive ? '#FFE5E5' : theme.dark ? '#333' : '#F2F2F7' }]}>
        <IconSymbol
          name={icon}
          size={20}
          color={isDestructive ? '#FF3B30' : theme.colors.text}
        />
      </View>
      <Text style={[styles.rowLabel, { color: isDestructive ? '#FF3B30' : theme.colors.text }]}>
        {label}
      </Text>
      <View style={{ flex: 1 }} />
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {showChevron && <IconSymbol name="chevron.right" size={16} color="#C7C7CC" />}
    </Pressable>
  );
};

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    storage.getCurrentUser().then(setUser);
  }, []);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await authAPI.logout();
          router.replace('/login');
        }
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Header Profile Section */}
        <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.header}>
          <View style={[styles.avatar, { borderColor: theme.colors.border }]}>
            <Text style={styles.avatarText}>{user?.name?.[0] || 'U'}</Text>
          </View>
          <Text style={[styles.name, { color: theme.colors.text }]}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>
          <View style={[styles.roleBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.roleText}>{user?.role || 'Client'}</Text>
          </View>
        </Animated.View>

        {/* Settings Sections */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.sectionContainer}>
            <SettingsRow icon="person.fill" label="Personal Information" onPress={() => { }} />
            <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
            <SettingsRow icon="creditcard.fill" label="Payment Methods" onPress={() => { }} />
            <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
            <SettingsRow icon="bell.fill" label="Notifications" onPress={() => { }} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={styles.sectionTitle}>SUPPORT</Text>
          <View style={styles.sectionContainer}>
            <SettingsRow icon="questionmark.circle.fill" label="Help Center" onPress={() => { }} />
            <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
            <SettingsRow icon="envelope.fill" label="Contact Us" onPress={() => { }} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <View style={styles.sectionContainer}>
            <SettingsRow
              icon="rectangle.portrait.and.arrow.right"
              label="Log Out"
              isDestructive
              showChevron={false}
              onPress={handleLogout}
            />
          </View>
          <Text style={styles.version}>Version 1.0.0</Text>
        </Animated.View>

        {/* Padding for Floating Tab Bar */}
        <View style={{ height: 100 }} />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E1E1E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#666',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#999',
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
    marginLeft: 12,
  },
  sectionContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 16,
    color: '#999',
    marginRight: 8,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 60, // Align with text, skipping icon
  },
  version: {
    textAlign: 'center',
    color: '#CCC',
    fontSize: 12,
    marginTop: -10,
  }
});