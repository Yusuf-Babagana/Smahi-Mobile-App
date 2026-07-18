import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ticketAPI } from '@/src/api/client';
import { color, font, radius, space } from '@/constants/theme';
import { Button, Input } from '@/src/components/ui';

export default function EditTicketScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams(); // Get Ticket ID

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  useEffect(() => {
    if (id) fetchTicketDetails();
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      const data = await ticketAPI.getTicketDetail(id as string);
      setSubject(data.subject);
      setDescription(data.description);
      setPriority(data.priority);
    } catch (error) {
      Alert.alert("Error", "Could not load ticket details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!subject || !description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await ticketAPI.updateTicket(id as string, { subject, description, priority });
      Alert.alert('Success', 'Complaint updated successfully', [
        { text: 'OK', onPress: () => router.push('/agent/tickets') } // Go back to list
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const PriorityChip = ({ level, label, tone }: { level: string; label: string; tone: string }) => {
    const selected = priority === level;
    return (
      <Pressable
        style={[styles.chip, selected && { backgroundColor: tone, borderColor: tone }]}
        onPress={() => setPriority(level)}
        accessibilityRole="button"
        accessibilityState={{ selected }}
      >
        <Text style={[styles.chipText, selected && { color: '#FFF' }]}>{label}</Text>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={color.brand600} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel={t('Close')}>
            <MaterialIcons name="close" size={20} color={color.ink900} />
          </Pressable>
          <Text style={styles.headerTitle}>{t('Edit complaint')} #{id}</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Input
          label={t('Subject')}
          value={subject}
          onChangeText={setSubject}
          icon="subject"
          containerStyle={styles.field}
        />

        <Text style={styles.label}>{t('Priority level')}</Text>
        <View style={styles.priorityRow}>
          <PriorityChip level="low" label={t('Low')} tone={color.accent600} />
          <PriorityChip level="medium" label={t('Medium')} tone={color.warn600} />
          <PriorityChip level="high" label={t('High')} tone={color.danger600} />
        </View>

        <Text style={styles.label}>{t('Description')}</Text>
        <TextInput
          style={styles.textArea}
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
          placeholderTextColor={color.ink300}
        />

        <Button
          title={t('Save changes')}
          onPress={handleUpdate}
          loading={submitting}
          style={styles.submitButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.surfaceSunken },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: color.surfaceSunken },

  headerSafe: { backgroundColor: color.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    backgroundColor: color.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: { fontFamily: font.extrabold, fontSize: 16, color: color.ink900 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: color.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  form: { padding: space.xl, paddingBottom: 60 },
  field: { marginBottom: space.sm },
  label: {
    fontFamily: font.bold,
    fontSize: 12.5,
    color: color.ink600,
    marginBottom: space.sm,
    marginTop: space.lg,
  },

  priorityRow: { flexDirection: 'row', gap: space.sm },
  chip: {
    height: 36,
    paddingHorizontal: 18,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: color.border,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontFamily: font.extrabold, fontSize: 13, color: color.ink600 },

  textArea: {
    minHeight: 120,
    backgroundColor: color.surface,
    borderWidth: 1.5,
    borderColor: color.border,
    borderRadius: 14,
    padding: space.lg,
    fontFamily: font.semibold,
    fontSize: 14,
    color: color.ink900,
  },

  submitButton: { marginTop: space.xxl },
});
