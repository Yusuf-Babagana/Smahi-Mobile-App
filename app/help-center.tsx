import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTranslation } from "react-i18next";

import ContactList from "@/src/components/ContactList";
import { color, font, radius, shadow, space } from "@/constants/theme";

const FAQS: { q: string; a: string }[] = [
    {
        q: 'How do I book an artisan?',
        a: 'Browse or search for the service you need on the Home tab, open an artisan\'s profile, and tap "Book Now". Choose your preferred date and describe the job — the artisan will confirm your booking.',
    },
    {
        q: 'How do payments work?',
        a: 'You agree on the price directly with the artisan. S-MAHII connects you with verified professionals; payment is made to the artisan after the job is completed to your satisfaction.',
    },
    {
        q: 'How do I know an artisan is trustworthy?',
        a: 'Look for the verified badge on artisan profiles. Verified artisans have had their identity and skills checked by an S-MAHII agent. Reviews and ratings from other clients also help you choose.',
    },
    {
        q: 'What if I have a problem with a job?',
        a: 'First discuss it with the artisan through the in-app chat. If you cannot resolve it, contact our support team using the numbers below — S-MAHII provides mediation for disputes.',
    },
    {
        q: 'How do I become an artisan on S-MAHII?',
        a: 'Register a new account and choose "Artisan" as your role. Complete your profile, add portfolio photos, and submit your documents for verification to start receiving job requests.',
    },
];

export default function HelpCenterScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.navBar}>
                <Pressable onPress={() => router.back()} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel={t('Back')}>
                    <MaterialIcons name="arrow-back" size={22} color={color.ink900} />
                </Pressable>
                <Text style={styles.navTitle}>{t('Help Center')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Ask the AI */}
                <Animated.View entering={FadeInDown.duration(400)}>
                    <Pressable
                        onPress={() => router.push('/chat/ai')}
                        accessibilityRole="button"
                        style={({ pressed }) => [styles.aiCard, pressed && { opacity: 0.85 }]}
                    >
                        <View style={styles.aiIcon}>
                            <MaterialIcons name="auto-awesome" size={20} color="#FACC15" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.aiTitle}>{t('Ask S-MAHII AI')}</Text>
                            <Text style={styles.aiSub}>{t('Get instant answers about the app, in English or Hausa')}</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color="rgba(255,255,255,0.8)" />
                    </Pressable>
                </Animated.View>

                {/* FAQs */}
                <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                    <Text style={styles.sectionTitle}>{t('Frequently Asked Questions')}</Text>
                    <View style={styles.card}>
                        {FAQS.map((faq, i) => (
                            <React.Fragment key={faq.q}>
                                {i > 0 && <View style={styles.separator} />}
                                <Pressable
                                    onPress={() => setOpenIndex(openIndex === i ? null : i)}
                                    accessibilityRole="button"
                                    style={({ pressed }) => [styles.faqRow, pressed && { opacity: 0.7 }]}
                                >
                                    <View style={styles.faqHeader}>
                                        <Text style={styles.faqQuestion}>{t(faq.q)}</Text>
                                        <MaterialIcons
                                            name={openIndex === i ? 'expand-less' : 'expand-more'}
                                            size={20}
                                            color={color.ink400}
                                        />
                                    </View>
                                    {openIndex === i && <Text style={styles.faqAnswer}>{t(faq.a)}</Text>}
                                </Pressable>
                            </React.Fragment>
                        ))}
                    </View>
                </Animated.View>

                {/* Report a problem */}
                <Animated.View entering={FadeInDown.delay(150).duration(400)}>
                    <Pressable
                        onPress={() => router.push('/report-problem')}
                        accessibilityRole="button"
                        style={({ pressed }) => [styles.reportCard, pressed && { opacity: 0.85 }]}
                    >
                        <View style={styles.reportIcon}>
                            <MaterialIcons name="flag" size={20} color={color.danger600} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.reportTitle}>{t('Report a problem')}</Text>
                            <Text style={styles.reportSub}>{t('Had a bad experience? Let us know and we\'ll look into it')}</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color={color.ink300} />
                    </Pressable>
                </Animated.View>

                {/* Contact support */}
                <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                    <Text style={styles.sectionTitle}>{t('Contact Us')}</Text>
                    <View style={styles.card}>
                        <ContactList />
                    </View>
                </Animated.View>

                <View style={{ height: 40 }} />
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

    aiCard: {
        flexDirection: 'row', alignItems: 'center', gap: space.md,
        backgroundColor: color.brand900, borderRadius: radius.xl,
        padding: space.lg, marginBottom: space.xxl, ...shadow.e2,
    },
    aiIcon: {
        width: 42, height: 42, borderRadius: radius.md,
        backgroundColor: 'rgba(255,255,255,0.14)',
        justifyContent: 'center', alignItems: 'center',
    },
    aiTitle: { fontFamily: font.extrabold, fontSize: 15, color: '#FFF' },
    aiSub: { fontFamily: font.medium, fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

    reportCard: {
        flexDirection: 'row', alignItems: 'center', gap: space.md,
        backgroundColor: color.surface, borderRadius: radius.xl,
        borderWidth: 1, borderColor: '#EEF2F8',
        padding: space.lg, marginBottom: space.xxl,
    },
    reportIcon: {
        width: 42, height: 42, borderRadius: radius.md,
        backgroundColor: '#FDECEC',
        justifyContent: 'center', alignItems: 'center',
    },
    reportTitle: { fontFamily: font.extrabold, fontSize: 14.5, color: color.ink900 },
    reportSub: { fontFamily: font.medium, fontSize: 12, color: color.ink400, marginTop: 2 },

    sectionTitle: {
        fontFamily: font.extrabold, fontSize: 11, letterSpacing: 0.5,
        textTransform: 'uppercase', color: color.ink400,
        marginBottom: space.sm, marginLeft: space.md,
    },
    card: {
        backgroundColor: color.surface, borderRadius: radius.lg,
        borderWidth: 1, borderColor: '#EEF2F8', overflow: 'hidden', marginBottom: space.xl,
    },
    separator: { height: StyleSheet.hairlineWidth, backgroundColor: color.border },

    faqRow: { padding: space.lg },
    faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
    faqQuestion: { flex: 1, fontFamily: font.bold, fontSize: 14, color: color.ink900 },
    faqAnswer: {
        fontFamily: font.medium, fontSize: 13.5, lineHeight: 20,
        color: color.ink600, marginTop: space.sm,
    },
});
