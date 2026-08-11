import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { disputeAPI } from '@/src/api/client';
import { color, font, radius, shadow, space } from '@/constants/theme';
import { Button, Chip, useToast } from '@/src/components/ui';

const CATEGORIES: { value: string; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { value: 'payment', label: 'Payment issue', icon: 'payments' },
  { value: 'quality', label: 'Quality issue', icon: 'build' },
  { value: 'no_show', label: 'No show', icon: 'event-busy' },
  { value: 'harassment', label: 'Harassment', icon: 'report' },
  { value: 'other', label: 'Other', icon: 'more-horiz' },
];

export default function ReportProblemScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  // Optional — a booking this report is about. Absent for a general complaint.
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();

  const [category, setCategory] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { show: showToast } = useToast();

  const handleSubmit = async () => {
    if (!category) {
      showToast(t('Select what kind of problem this is.'), { type: 'error' });
      return;
    }
    if (description.trim().length < 10) {
      showToast(t('Please describe the problem in a bit more detail.'), { type: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      await disputeAPI.submitDispute(category, description.trim(), bookingId ? Number(bookingId) : undefined);
      showToast(t("We've received your report and will look into it. Thank you for letting us know."), { type: 'success' });
      router.back();
    } catch (err: any) {
      const data = err?.response?.data;
      const message = (Array.isArray(data) && data[0])
        || data?.detail
        || (data && typeof data === 'object' && Object.values(data)[0])
        || t('Failed to submit your report. Please try again.');
      showToast(String(message), { type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel={t('Back')}>
          <MaterialIcons name="close" size={22} color={color.ink900} />
        </Pressable>
        <Text style={styles.navTitle}>{t('Report a problem')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>{t('What kind of problem?')}</Text>
        <View style={styles.chipsRow}>
          {CATEGORIES.map((c) => (
            <Chip
              key={c.value}
              label={t(c.label)}
              icon={c.icon}
              selected={category === c.value}
              onPress={() => setCategory(c.value)}
              style={styles.chip}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('Tell us what happened')}</Text>
        <TextInput
          style={styles.textArea}
          placeholder={t('Describe the problem — include dates, names, and anything else that would help us look into it.')}
          placeholderTextColor={color.ink300}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={8}
          maxLength={2000}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{description.length}/2000</Text>

        <Button
          title={t('Submit report')}
          onPress={handleSubmit}
          loading={submitting}
          style={{ marginTop: space.lg }}
        />
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
  content: { padding: space.xl, paddingBottom: 60 },

  sectionTitle: { fontFamily: font.extrabold, fontSize: 14, color: color.ink900, marginBottom: space.md, marginTop: space.md },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: { marginBottom: space.sm },

  textArea: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.border,
    padding: space.md,
    minHeight: 160,
    fontFamily: font.medium,
    fontSize: 14,
    color: color.ink900,
  },
  charCount: { fontFamily: font.medium, fontSize: 11, color: color.ink300, textAlign: 'right', marginTop: 4 },
});
