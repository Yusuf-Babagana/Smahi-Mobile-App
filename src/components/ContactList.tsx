import React from 'react';
import { View, Text, Pressable, StyleSheet, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { color, font, space } from '@/constants/theme';

// Official S-MAHII support channels — keep in sync with the website footer
// (https://www.smahiglobalservices.com) and backend ai_knowledge.md.
const CONTACT_ROWS: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    sub: string;
    url: string;
    tint: string;
    bg: string;
}[] = [
    {
        icon: 'call-outline',
        label: '+234 906 606 2541',
        sub: 'Call us',
        url: 'tel:+2349066062541',
        tint: color.brand600,
        bg: color.brand100,
    },
    {
        icon: 'call-outline',
        label: '+234 905 237 3245',
        sub: 'Call us',
        url: 'tel:+2349052373245',
        tint: color.brand600,
        bg: color.brand100,
    },
    {
        icon: 'logo-whatsapp',
        label: '+234 806 911 0185',
        sub: 'Chat on WhatsApp',
        // wa.me works whether or not the WhatsApp app is installed
        url: 'https://wa.me/2348069110185',
        tint: '#25D366',
        bg: '#E7F9EE',
    },
    {
        icon: 'mail-outline',
        label: 'info@smahiglobalservices.com',
        sub: 'Email us',
        url: 'mailto:info@smahiglobalservices.com',
        tint: color.ink600,
        bg: color.surfaceChip,
    },
];

/**
 * Tappable list of official S-MAHII contact channels (calls, WhatsApp, email).
 * Renders bare rows — wrap in a card/section container to match the screen.
 */
export default function ContactList() {
    const { t } = useTranslation();

    const open = async (url: string, label: string) => {
        try {
            await Linking.openURL(url);
        } catch {
            // No dialer/mail app (e.g. emulator): at least show the value
            Alert.alert(t('Contact Us'), label);
        }
    };

    return (
        <View>
            {CONTACT_ROWS.map((row, i) => (
                <React.Fragment key={row.url}>
                    {i > 0 && <View style={styles.separator} />}
                    <Pressable
                        onPress={() => open(row.url, row.label)}
                        accessibilityRole="button"
                        accessibilityLabel={`${t(row.sub)}: ${row.label}`}
                        style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: row.bg }]}>
                            <Ionicons name={row.icon} size={18} color={row.tint} />
                        </View>
                        <View style={styles.textCol}>
                            <Text style={styles.label}>{row.label}</Text>
                            <Text style={styles.sub}>{t(row.sub)}</Text>
                        </View>
                        <Ionicons name="open-outline" size={16} color={color.ink300} />
                    </Pressable>
                </React.Fragment>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: space.lg,
        minHeight: 56,
    },
    iconContainer: {
        width: 34,
        height: 34,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: space.md,
    },
    textCol: { flex: 1 },
    label: {
        fontFamily: font.bold,
        fontSize: 14,
        color: color.ink900,
    },
    sub: {
        fontFamily: font.medium,
        fontSize: 11.5,
        color: color.ink400,
        marginTop: 1,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: color.border,
        marginLeft: 64,
    },
});
