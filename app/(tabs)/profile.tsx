import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useTranslation } from "react-i18next";

import { storage } from "@/src/utils/storage";
import { useAuth } from "@/src/contexts/AuthContext";
import { EmailVerificationBanner } from "@/src/components/EmailVerificationBanner";
import ContactList from "@/src/components/ContactList";
import { color, font, radius, space, type } from "@/constants/theme";
import { Avatar, Badge, useConfirm } from "@/src/components/ui";

// Reusable Settings Row Component
const SettingsRow = ({
  icon,
  label,
  value,
  isDestructive,
  onPress,
  showChevron = true
}: {
  icon: keyof typeof MaterialIcons.glyphMap,
  label: string,
  value?: string,
  isDestructive?: boolean,
  onPress?: () => void,
  showChevron?: boolean
}) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
  >
    <View style={[styles.iconContainer, { backgroundColor: isDestructive ? '#FDECEC' : color.surfaceChip }]}>
      <MaterialIcons
        name={icon}
        size={18}
        color={isDestructive ? color.danger600 : color.ink600}
      />
    </View>
    <Text style={[styles.rowLabel, isDestructive && { color: color.danger600 }]}>
      {label}
    </Text>
    <View style={{ flex: 1 }} />
    {value && <Text style={styles.rowValue}>{value}</Text>}
    {showChevron && <MaterialIcons name="chevron-right" size={18} color={color.ink300} />}
  </Pressable>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [user, setUser] = React.useState<any>(null);
  const [showContacts, setShowContacts] = React.useState(false);

  React.useEffect(() => {
    storage.getCurrentUser().then(setUser);
  }, []);

  const handleLogout = async () => {
    const ok = await confirm({
      title: t('Log Out'),
      message: t('Are you sure you want to log out?'),
      confirmLabel: t('Log Out'),
      cancelLabel: t('Cancel'),
      destructive: true,
    });
    if (ok) await logout();
  };

  // Users are stored with first_name/last_name; older sessions may have `name`.
  const displayName = user
    ? (`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || t('User'))
    : t('User');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Header Profile Section */}
        <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
          <Avatar name={displayName} uri={user?.profile_picture} gender={user?.gender} size={96} borderRadius={30} />
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>
          <Badge
            label={t(user?.role || 'Client')}
            bg={color.brand100}
            fg={color.brand600}
            style={{ marginTop: space.sm }}
          />
        </Animated.View>

        <EmailVerificationBanner />

        {/* Settings Sections */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={styles.sectionTitle}>{t('Account')}</Text>
          <View style={styles.sectionContainer}>
            <SettingsRow icon="person-outline" label={t('Personal Information')} onPress={() => router.push('/personal-info')} />
            <View style={styles.separator} />
            <SettingsRow icon="favorite-outline" label={t('Saved artisans')} onPress={() => router.push('/favorites')} />
            <View style={styles.separator} />
            <SettingsRow icon="notifications-none" label={t('Notifications')} onPress={() => router.push('/notification-settings')} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text style={styles.sectionTitle}>{t('Support')}</Text>
          <View style={styles.sectionContainer}>
            <SettingsRow icon="help-outline" label={t('Help Center')} onPress={() => router.push('/help-center')} />
            <View style={styles.separator} />
            <SettingsRow
              icon="mail-outline"
              label={t('Contact Us')}
              value={showContacts ? undefined : t('Show')}
              onPress={() => setShowContacts(prev => !prev)}
            />
            {showContacts && (
              <>
                <View style={styles.separator} />
                <ContactList />
              </>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <View style={styles.sectionContainer}>
            <SettingsRow
              icon="logout"
              label={t('Log Out')}
              isDestructive
              showChevron={false}
              onPress={handleLogout}
            />
          </View>
          <Text style={styles.version}>{t('Version')} 1.0.0</Text>
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
    backgroundColor: color.surfaceSunken,
  },
  content: {
    padding: space.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: space.xxl,
    marginTop: space.md,
  },
  name: {
    ...type.titleMd,
    marginTop: space.lg,
  },
  email: {
    fontFamily: font.bold,
    fontSize: 13.5,
    color: color.ink400,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: font.extrabold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: color.ink400,
    marginBottom: space.sm,
    marginLeft: space.md,
  },
  sectionContainer: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#EEF2F8',
    overflow: 'hidden',
    marginBottom: space.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.lg,
    minHeight: 56,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: radius.sm + 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: space.md,
  },
  rowLabel: {
    fontFamily: font.bold,
    fontSize: 14.5,
    color: color.ink900,
  },
  rowValue: {
    fontFamily: font.bold,
    fontSize: 13.5,
    color: color.ink400,
    marginRight: space.sm,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: color.border,
    marginLeft: 64,
  },
  version: {
    fontFamily: font.bold,
    textAlign: 'center',
    color: color.ink300,
    fontSize: 12,
    marginTop: -6,
  },
});
