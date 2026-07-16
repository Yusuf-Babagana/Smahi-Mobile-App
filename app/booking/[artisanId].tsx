import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

import { artisanAPI, bookingAPI } from '@/src/api/client';
import { storage } from '@/src/utils/storage';
import { color, font, radius, shadow, space, type } from '@/constants/theme';
import { Avatar, Button, StepHeader } from '@/src/components/ui';

const TIME_SLOTS = ['08:00', '09:30', '11:00', '13:00', '15:00', '16:30'];

function buildDays(t: (k: string) => string) {
  const days: { date: Date; iso: string; label: string; weekday: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    days.push({
      date: d,
      iso,
      label: i === 0 ? t('Today') : String(d.getDate()),
      weekday: d.toLocaleDateString(undefined, { weekday: 'short' }),
    });
  }
  return days;
}

export default function BookingFlow() {
  const { artisanId } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [artisan, setArtisan] = useState<any>(null);

  // Step 1 — when
  const days = useMemo(() => buildDays(t), [t]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Step 2 — details
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [address, setAddress] = useState('');
  const [editingAddress, setEditingAddress] = useState(false);

  useEffect(() => {
    if (!artisanId) return;
    artisanAPI.getArtisanById(String(artisanId)).then(setArtisan).catch(() => {});
    storage.getCurrentUser().then((user: any) => {
      if (user?.address) setAddress(user.address);
    }).catch(() => {});
  }, [artisanId]);

  const pickPhoto = async () => {
    if (photos.length >= 4) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setPhotos((prev) => [...prev, result.assets[0].uri].slice(0, 4));
    }
  };

  const removePhoto = (uri: string) => setPhotos((prev) => prev.filter((p) => p !== uri));

  const handleBack = () => {
    if (step === 1) router.back();
    else setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // NOTE: photos are collected for design parity but the bookings endpoint
      // has no attachment field yet — only text fields are sent.
      // The route param is the ArtisanProfile id; the bookings endpoint keys
      // artisans by USER id, which lives on the fetched profile ('user').
      const artisanUserId = artisan?.user ?? artisan?.user_details?.id ?? Number(artisanId);
      await bookingAPI.createBooking({
        artisan: Number(artisanUserId),
        date: selectedDate,
        time: selectedTime,
        description,
        location: address,
      });
      setSubmitted(true);
    } catch (error) {
      console.log('BOOKING ERROR:', error);
      Alert.alert(t('Error'), t('Failed to send booking request.'));
    } finally {
      setSubmitting(false);
    }
  };

  const userObj = artisan?.user_details || artisan?.user || artisan || {};
  const artisanName = `${userObj.first_name || ''} ${userObj.last_name || ''}`.trim() || t('Artisan');
  const trade = artisan?.profession_name || artisan?.category_name || t('Artisan');

  // --- SUCCESS ---
  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.successWrap}>
          <Animated.View entering={ZoomIn.duration(350)} style={styles.successDisc}>
            <MaterialIcons name="check" size={44} color="#FFF" />
          </Animated.View>
          <Text style={styles.successTitle}>{t('Booking sent!')}</Text>
          <Text style={styles.successBody}>
            {t('{{name}} will confirm your request shortly.', { name: artisanName, defaultValue: `${artisanName} will confirm your request shortly.` })}
          </Text>
          <View style={styles.successChip}>
            <MaterialIcons name="event" size={15} color={color.brand600} />
            <Text style={styles.successChipText}>{selectedDate}  ·  {selectedTime}</Text>
          </View>
          <View style={styles.successCtas}>
            <Button title={t('Track my booking')} onPress={() => router.replace('/(tabs)/bookings')} />
            <Button title={t('Back to home')} variant="secondary" onPress={() => router.replace('/(tabs)/(home)')} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const continueDisabled =
    (step === 1 && (!selectedDate || !selectedTime)) ||
    (step === 2 && description.trim().length === 0) ||
    submitting;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <StepHeader
          step={step}
          totalSteps={3}
          onBack={handleBack}
          stepLabel={t('Step {{n}} of {{m}}', { n: step, m: 3, defaultValue: `Step ${step} of 3` })}
          style={styles.stepHeader}
        />

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View key={step} entering={FadeInUp.duration(300)}>
            {step === 1 && (
              <View>
                <Text style={styles.stepTitle}>{t('When do you need help?')}</Text>
                <Text style={styles.stepSubtitle}>{t('Pick a day and a time that suits you.')}</Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayStrip}>
                  {days.map((day) => {
                    const active = selectedDate === day.iso;
                    return (
                      <Pressable
                        key={day.iso}
                        onPress={() => setSelectedDate(day.iso)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        style={[styles.dayChip, active && styles.dayChipActive]}
                      >
                        <Text style={[styles.dayWeekday, active && styles.dayTextActive]}>{day.weekday}</Text>
                        <Text style={[styles.dayLabel, active && styles.dayTextActive]}>{day.label}</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <Text style={styles.fieldLabel}>{t('Time')}</Text>
                <View style={styles.slotGrid}>
                  {TIME_SLOTS.map((slot) => {
                    const active = selectedTime === slot;
                    return (
                      <Pressable
                        key={slot}
                        onPress={() => setSelectedTime(slot)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        style={[styles.slot, active && styles.slotActive]}
                      >
                        <Text style={[styles.slotText, active && styles.slotTextActive]}>{slot}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {step === 2 && (
              <View>
                <Text style={styles.stepTitle}>{t('Job details')}</Text>
                <Text style={styles.stepSubtitle}>{t('Describe the problem so the artisan comes prepared.')}</Text>

                <Text style={styles.fieldLabel}>{t('Description')}</Text>
                <TextInput
                  style={styles.textarea}
                  placeholder={t('e.g. My kitchen sink is leaking under the cabinet…')}
                  placeholderTextColor={color.ink300}
                  multiline
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                />

                <Text style={styles.fieldLabel}>{t('Photos (optional)')}</Text>
                <View style={styles.photoRow}>
                  {photos.map((uri) => (
                    <View key={uri} style={styles.photoThumbWrap}>
                      <Image source={{ uri }} style={styles.photoThumb} />
                      <Pressable onPress={() => removePhoto(uri)} style={styles.photoRemove} accessibilityRole="button" accessibilityLabel={t('Remove photo')}>
                        <MaterialIcons name="close" size={12} color="#FFF" />
                      </Pressable>
                    </View>
                  ))}
                  {photos.length < 4 && (
                    <Pressable onPress={pickPhoto} style={styles.photoAdd} accessibilityRole="button" accessibilityLabel={t('Add photo')}>
                      <MaterialIcons name="add-a-photo" size={20} color={color.ink400} />
                      <Text style={styles.photoAddText}>{photos.length}/4</Text>
                    </Pressable>
                  )}
                </View>

                <Text style={styles.fieldLabel}>{t('Address')}</Text>
                <View style={styles.addressCard}>
                  <MaterialIcons name="place" size={18} color={color.brand600} />
                  {editingAddress ? (
                    <TextInput
                      style={styles.addressInput}
                      value={address}
                      onChangeText={setAddress}
                      placeholder={t('Enter your address')}
                      placeholderTextColor={color.ink300}
                      autoFocus
                      onBlur={() => setEditingAddress(false)}
                    />
                  ) : (
                    <Text style={styles.addressText} numberOfLines={2}>
                      {address || t('No address saved')}
                    </Text>
                  )}
                  <Pressable onPress={() => setEditingAddress(true)} accessibilityRole="button">
                    <Text style={styles.addressChange}>{t('Change')}</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {step === 3 && (
              <View>
                <Text style={styles.stepTitle}>{t('Review & confirm')}</Text>
                <Text style={styles.stepSubtitle}>{t('Check the details before sending your request.')}</Text>

                {/* Artisan summary */}
                <View style={styles.summaryCard}>
                  <Avatar name={artisanName} uri={userObj.profile_picture} size={52} borderRadius={16} verified={artisan?.is_verified || userObj.is_verified} />
                  <View style={{ flex: 1, marginLeft: space.md }}>
                    <Text style={styles.summaryName}>{artisanName}</Text>
                    <Text style={styles.summaryTrade}>{trade}</Text>
                  </View>
                  <View style={styles.summaryWhen}>
                    <Text style={styles.summaryWhenDate}>{selectedDate}</Text>
                    <Text style={styles.summaryWhenTime}>{selectedTime}</Text>
                  </View>
                </View>

                {/* Pricing happens off-app: the client and artisan agree on a
                    price after inspection, so no amounts are shown here. */}
                <View style={styles.amberNote}>
                  <MaterialIcons name="info-outline" size={16} color={color.warn600} />
                  <Text style={styles.amberNoteText}>
                    {t('The price is agreed directly with the artisan after inspection. Payment happens between you and the artisan.')}
                  </Text>
                </View>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          {submitting ? (
            <View style={styles.submittingWrap}>
              <ActivityIndicator color={color.brand600} />
            </View>
          ) : (
            <Button
              title={step === 3 ? t('Send booking request') : t('Continue')}
              onPress={step === 3 ? handleSubmit : () => setStep((s) => s + 1)}
              disabled={continueDisabled}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.surfaceSunken },
  stepHeader: { paddingHorizontal: space.xxl, paddingTop: space.md },
  scroll: { paddingHorizontal: space.xxl, paddingTop: space.xl, paddingBottom: 40 },

  stepTitle: { ...type.titleLg, marginBottom: 6 },
  stepSubtitle: {
    fontFamily: font.medium,
    fontSize: 14,
    lineHeight: 21,
    color: color.ink400,
    marginBottom: space.xxl,
  },
  fieldLabel: {
    fontFamily: font.bold,
    fontSize: 12.5,
    color: color.ink600,
    marginBottom: space.sm,
    marginTop: space.xl,
  },

  // Step 1
  dayStrip: { gap: space.sm },
  dayChip: {
    width: 58,
    paddingVertical: space.md,
    borderRadius: radius.lg,
    backgroundColor: color.surface,
    borderWidth: 1.5,
    borderColor: color.border,
    alignItems: 'center',
  },
  dayChipActive: { backgroundColor: color.brand600, borderColor: color.brand600 },
  dayWeekday: { fontFamily: font.bold, fontSize: 11.5, color: color.ink400 },
  dayLabel: { fontFamily: font.extrabold, fontSize: 15, color: color.ink900, marginTop: 4 },
  dayTextActive: { color: '#FFF' },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  slot: {
    width: '31%',
    height: 44,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    borderWidth: 1.5,
    borderColor: color.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotActive: { backgroundColor: color.brand600, borderColor: color.brand600 },
  slotText: { fontFamily: font.extrabold, fontSize: 13.5, color: color.ink600 },
  slotTextActive: { color: '#FFF' },

  // Step 2
  textarea: {
    minHeight: 120,
    backgroundColor: color.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: color.border,
    padding: space.lg,
    fontFamily: font.semibold,
    fontSize: 14,
    color: color.ink900,
  },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  photoThumbWrap: { position: 'relative' },
  photoThumb: { width: 72, height: 72, borderRadius: radius.md, backgroundColor: color.surfaceChip },
  photoRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: color.ink900,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAdd: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: color.ink300,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  photoAddText: { fontFamily: font.bold, fontSize: 10.5, color: color.ink400 },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#EEF2F8',
    padding: space.lg,
  },
  addressText: { flex: 1, fontFamily: font.bold, fontSize: 13.5, color: color.ink600 },
  addressInput: { flex: 1, fontFamily: font.semibold, fontSize: 13.5, color: color.ink900, paddingVertical: 0 },
  addressChange: { fontFamily: font.extrabold, fontSize: 13, color: color.brand600 },

  // Step 3
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#EEF2F8',
    padding: space.lg,
  },
  summaryName: { fontFamily: font.extrabold, fontSize: 14.5, color: color.ink900 },
  summaryTrade: { fontFamily: font.bold, fontSize: 12.5, color: color.ink400, marginTop: 2 },
  summaryWhen: { alignItems: 'flex-end' },
  summaryWhenDate: { fontFamily: font.extrabold, fontSize: 12.5, color: color.brand600 },
  summaryWhenTime: { fontFamily: font.bold, fontSize: 12, color: color.ink400, marginTop: 2 },
  amberNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: color.warn100,
    borderRadius: radius.md,
    padding: space.md,
    marginTop: space.lg,
  },
  amberNoteText: {
    flex: 1,
    fontFamily: font.bold,
    fontSize: 12.5,
    lineHeight: 18,
    color: color.warn600,
  },

  footer: {
    paddingHorizontal: space.xxl,
    paddingTop: space.md,
    paddingBottom: space.lg,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: color.surfaceSunken,
  },
  submittingWrap: { height: 54, alignItems: 'center', justifyContent: 'center' },

  // Success
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xxl },
  successDisc: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: color.accent600,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.xxl,
    ...shadow.e2,
  },
  successTitle: { ...type.titleLg, textAlign: 'center' },
  successBody: {
    fontFamily: font.medium,
    fontSize: 14,
    lineHeight: 21,
    color: color.ink400,
    textAlign: 'center',
    marginTop: space.sm,
  },
  successChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: color.brand100,
    borderRadius: radius.full,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    marginTop: space.xl,
  },
  successChipText: { fontFamily: font.extrabold, fontSize: 13, color: color.brand600 },
  successCtas: { alignSelf: 'stretch', gap: space.md, marginTop: space.xxxl },
});
