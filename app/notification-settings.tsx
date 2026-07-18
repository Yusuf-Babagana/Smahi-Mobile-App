import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { color, font, radius, shadow, space } from "@/constants/theme";

const PREFS_KEY = '@smaahi_notification_prefs';

const DEFAULT_PREFS = {
    push: true,
    email: true,
    sounds: true,
};

type Prefs = typeof DEFAULT_PREFS;

export default function NotificationSettingsScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);

    useEffect(() => {
        AsyncStorage.getItem(PREFS_KEY).then((raw) => {
            if (raw) {
                try { setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) }); } catch {}
            }
        });
    }, []);

    const toggle = (key: keyof Prefs) => {
        setPrefs((prev) => {
            const next = { ...prev, [key]: !prev[key] };
            AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => {});
            return next;
        });
    };

    const rows: { key: keyof Prefs; icon: keyof typeof MaterialIcons.glyphMap; label: string; sub: string }[] = [
        { key: 'push', icon: 'notifications-active', label: t('Push Notifications'), sub: t('Booking updates and messages') },
        { key: 'email', icon: 'mail-outline', label: t('Email Notifications'), sub: t('Receipts and important updates') },
        { key: 'sounds', icon: 'volume-up', label: t('In-App Sounds'), sub: t('Message and action sounds') },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.navBar}>
                <Pressable onPress={() => router.back()} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel={t('Back')}>
                    <MaterialIcons name="arrow-back" size={22} color={color.ink900} />
                </Pressable>
                <Text style={styles.navTitle}>{t('Notifications')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Animated.View entering={FadeInDown.duration(400)} style={styles.card}>
                    {rows.map((row, i) => (
                        <React.Fragment key={row.key}>
                            {i > 0 && <View style={styles.separator} />}
                            <View style={styles.row}>
                                <View style={styles.iconContainer}>
                                    <MaterialIcons name={row.icon} size={18} color={color.ink600} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.rowLabel}>{row.label}</Text>
                                    <Text style={styles.rowSub}>{row.sub}</Text>
                                </View>
                                <Switch
                                    value={prefs[row.key]}
                                    onValueChange={() => toggle(row.key)}
                                    trackColor={{ false: color.border, true: color.brand600 }}
                                    thumbColor="#FFF"
                                />
                            </View>
                        </React.Fragment>
                    ))}
                </Animated.View>

                <Text style={styles.hint}>
                    {t('Preferences are saved on this device.')}
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.surfaceSunken },
    navBar: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: space.xl, paddingVertical: space.md,
    },
    iconBtn: {
        width: 40, height: 40, borderRadius: radius.lg, backgroundColor: color.surface,
        justifyContent: 'center', alignItems: 'center', ...shadow.e1,
    },
    navTitle: { fontFamily: font.extrabold, fontSize: 17, color: color.ink900 },
    content: { padding: space.xl },

    card: {
        backgroundColor: color.surface, borderRadius: radius.lg,
        borderWidth: 1, borderColor: '#EEF2F8', overflow: 'hidden',
    },
    row: { flexDirection: 'row', alignItems: 'center', padding: space.lg, minHeight: 64 },
    iconContainer: {
        width: 34, height: 34, borderRadius: 10, backgroundColor: color.surfaceChip,
        justifyContent: 'center', alignItems: 'center', marginRight: space.md,
    },
    rowLabel: { fontFamily: font.bold, fontSize: 14.5, color: color.ink900 },
    rowSub: { fontFamily: font.medium, fontSize: 12, color: color.ink400, marginTop: 1 },
    separator: { height: StyleSheet.hairlineWidth, backgroundColor: color.border, marginLeft: 64 },
    hint: {
        fontFamily: font.medium, fontSize: 12, color: color.ink300,
        textAlign: 'center', marginTop: space.lg,
    },
});
