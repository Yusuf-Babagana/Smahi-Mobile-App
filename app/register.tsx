import React, { useState, useEffect } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { authAPI, locationAPI, categoryAPI } from '@/src/api/client';
import { UserRole } from '@/src/types';
import CustomPicker from '@/src/components/CustomPicker';
import { color, font, radius, space, type } from '@/constants/theme';
import { Button, Input, StepHeader } from '@/src/components/ui';
import '@/src/i18n'; // Ensure i18n is initialized

// Define expanded roles locally for this screen
type ExpandedRole = UserRole | 'lga_admin' | 'state_coordinator';

const STEP_META = [
  { title: 'Before we start', subtitle: 'A quick look at how S-MAHII works.' },
  { title: 'Tell us about you', subtitle: "Let's get to know you." },
  { title: 'How will you use S-MAHII?', subtitle: 'Pick the role that fits you.' },
  { title: 'Where are you based?', subtitle: 'We use this to match you locally.' },
];

const TERMS_POINTS: { icon: keyof typeof MaterialIcons.glyphMap; text: string }[] = [
  { icon: 'verified-user', text: 'Artisans are identity-verified; bookings and payments follow S. MAHI Global Service Ltd policy.' },
  { icon: 'lock-outline', text: 'Your personal data is used only to run the marketplace and is never sold.' },
  { icon: 'gavel', text: 'Misuse, fraud or abusive behaviour can lead to suspension of your account.' },
];

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  // --- STEPS STATE ---
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // --- FORM STATE ---
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showFullTerms, setShowFullTerms] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<ExpandedRole>('client');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // --- DATA STATE ---
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [lgas, setLgas] = useState<any[]>([]);

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedLga, setSelectedLga] = useState('');

  // --- DATA LOADING ---
  useEffect(() => {
    locationAPI.getCountries().then(data => {
      setCountries(data);
    }).catch(err => console.error("❌ COUNTRIES ERROR:", err));

    // Fetch flat category list for the registration picker
    categoryAPI.getCategoriesFlat().then(data => {
      const mapped = data.map((cat: any) => ({
        label: cat.name,
        value: cat.id.toString()
      }));
      setServices(mapped);
    }).catch(err => console.error("❌ CATEGORIES ERROR:", err));
  }, []);

  useEffect(() => {
    if (!selectedCountry) return;
    locationAPI.getStates(Number(selectedCountry)).then(data => {
      setStates(data || []);
      setSelectedState(''); setLgas([]); setSelectedLga('');
    }).catch(err => console.error("❌ STATES ERROR:", err));
  }, [selectedCountry]);

  useEffect(() => {
    if (!selectedState) return;
    locationAPI.getLGAs(Number(selectedState)).then(data => {
      setLgas(data || []);
      setSelectedLga('');
    }).catch(err => console.error("❌ LGAs ERROR:", err));
  }, [selectedState]);

  // --- VALIDATION ---
  const validateStep = (step: number) => {
    let newErrors: { [key: string]: string } = {};

    if (step === 1) {
      if (!acceptedTerms) {
        Alert.alert("Terms Required", "Please read and accept the Terms and Conditions to proceed.");
        return false;
      }
    }

    if (step === 2) {
      if (!name) newErrors['name'] = "Full Name is required";
      if (!email || !email.includes('@')) newErrors['email'] = "Valid email is required";
      if (!phone) newErrors['phone'] = "Phone number is required";
      if (!password || password.length < 6) newErrors['password'] = "Password must be 6+ chars";
    }

    if (step === 4) {
      if (!selectedCountry) newErrors['country'] = "Select your country";
      if (!selectedState) newErrors['state'] = "Select your state";
      if (!selectedLga) newErrors['lga'] = "Select your city/LGA";
      if (role === 'artisan' && !selectedService) newErrors['service'] = "Select your service";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => { if (validateStep(currentStep)) setCurrentStep(c => c + 1); };
  const prevStep = () => setCurrentStep(c => c - 1);
  const handleBack = () => {
    if (currentStep === 1) {
      if (router.canGoBack()) router.back();
      else router.replace('/welcome');
    } else {
      prevStep();
    }
  };

  const handleRegister = async () => {
    if (!validateStep(4)) return;
    setLoading(true);
    try {
      // Split name for backend compatibility
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || firstName; // Fallback to firstName if single name entered

      await authAPI.register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        role,
        phone_number: phone,
        service_category: role === 'artisan' ? selectedService : undefined,
        country: selectedCountry,
        state: selectedState,
        lga: selectedLga
      });

      // ✅ SUCCESS LOGIC: Check for Locked Roles
      if (['agent', 'lga_admin', 'state_coordinator'].includes(role)) {
        Alert.alert(
          'Account Created',
          'Your account requires activation. Please log in to enter your Serial Number.',
          [{ text: 'Go to Login', onPress: () => router.replace('/login') }]
        );
      } else {
        Alert.alert(
          'Success',
          'Account created!',
          [{ text: 'Login Now', onPress: () => router.replace('/login') }]
        );
      }

    } catch (error: any) {
      const msg = error.response?.data ? JSON.stringify(error.response.data) : 'Registration Failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const meta = STEP_META[currentStep - 1];
  const continueDisabled = loading || (currentStep === 1 && !acceptedTerms);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

        <StepHeader
          step={currentStep}
          totalSteps={totalSteps}
          onBack={handleBack}
          stepLabel={t('Step {{n}} of {{m}}', { n: currentStep, m: totalSteps, defaultValue: `Step ${currentStep} of ${totalSteps}` })}
          style={styles.stepHeader}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View key={currentStep} entering={FadeInUp.duration(300)}>
            <Text style={styles.stepTitle}>{t(meta.title)}</Text>
            <Text style={styles.stepSubtitle}>{t(meta.subtitle)}</Text>

            {/* STEP 1: TERMS AND CONDITIONS */}
            {currentStep === 1 && (
              <View>
                <View style={styles.pointsCard}>
                  {TERMS_POINTS.map((point, i) => (
                    <View key={point.icon} style={[styles.pointRow, i > 0 && styles.pointRowDivider]}>
                      <View style={styles.pointIcon}>
                        <MaterialIcons name={point.icon} size={18} color={color.accent600} />
                      </View>
                      <Text style={styles.pointText}>{t(point.text)}</Text>
                    </View>
                  ))}
                </View>

                <Pressable
                  onPress={() => setShowFullTerms(s => !s)}
                  accessibilityRole="button"
                  style={styles.fullTermsToggle}
                >
                  <Text style={styles.fullTermsToggleText}>
                    {showFullTerms ? t('Hide full terms') : t('Read the full terms')}
                  </Text>
                  <MaterialIcons
                    name={showFullTerms ? 'expand-less' : 'expand-more'}
                    size={18}
                    color={color.brand600}
                  />
                </Pressable>

                {showFullTerms && (
                  <View style={styles.termsCard}>
                    <Text style={styles.corporateTitle}>S. MAHI GLOBAL SERVICE LTD</Text>
                    <Text style={styles.corporateSubtitle}>{t('registration.termsSubtitle')}</Text>
                    <ScrollView style={styles.termsScroll} nestedScrollEnabled>
                    <Text style={styles.termsText}>
                      {t('registration.intro')}{'\n\n'}
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <React.Fragment key={num}>
                          <Text style={styles.bold}>{t(`registration.p${num}_title`)}</Text>{'\n'}
                          {t(`registration.p${num}_text`)}{'\n\n'}
                        </React.Fragment>
                      ))}
                      <Text style={styles.bold}>{t('registration.supportTitle')}</Text>{'\n'}
                      {t('registration.supportText')}
                    </Text>
                    </ScrollView>
                  </View>
                )}

                <Pressable
                  onPress={() => setAcceptedTerms(a => !a)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: acceptedTerms }}
                  style={[styles.acceptRow, acceptedTerms && styles.acceptRowSelected]}
                >
                  <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                    {acceptedTerms && <MaterialIcons name="check" size={16} color="#FFF" />}
                  </View>
                  <Text style={styles.acceptText}>{t('registration.agree')}</Text>
                </Pressable>
              </View>
            )}

            {/* STEP 2: ACCOUNT INFO */}
            {currentStep === 2 && (
              <View style={styles.formSection}>
                <Input
                  label={t('Full name')}
                  placeholder="Saidu Abdulmalik"
                  value={name}
                  onChangeText={setName}
                  error={errors.name}
                  icon="person-outline"
                />
                <Input
                  label={t('Email address')}
                  placeholder="yusuf@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                  icon="mail-outline"
                />
                <Input
                  label={t('Phone number')}
                  placeholder="+234 800 000 0000"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  error={errors.phone}
                  icon="phone-iphone"
                />
                <Input
                  label={t('Password')}
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  error={errors.password}
                  icon="lock-outline"
                  trailingIcon={showPassword ? 'visibility-off' : 'visibility'}
                  onTrailingIconPress={() => setShowPassword(s => !s)}
                />
              </View>
            )}

            {/* STEP 3: ROLE SELECTION */}
            {currentStep === 3 && (
              <View style={styles.formSection}>
                <RoleCard title={t('Hire artisans')} subtitle={t('Find verified professionals near you')} icon="search" selected={role === 'client'} onPress={() => setRole('client')} />
                <RoleCard title={t('Work as an artisan')} subtitle={t('Offer services & earn')} icon="handyman" selected={role === 'artisan'} onPress={() => setRole('artisan')} />
                <RoleCard title={t('Field agent')} subtitle={t('Register artisans (approval required)')} icon="badge" selected={role === 'agent'} onPress={() => setRole('agent')} />
                <RoleCard title={t('LGA admin')} subtitle={t('Manage a Local Govt Area (approval required)')} icon="account-balance" selected={role === 'lga_admin'} onPress={() => setRole('lga_admin')} />
                <RoleCard title={t('State coordinator')} subtitle={t('Manage state operations (approval required)')} icon="map" selected={role === 'state_coordinator'} onPress={() => setRole('state_coordinator')} />

                {['agent', 'lga_admin', 'state_coordinator'].includes(role) && (
                  <View style={styles.activationNote}>
                    <MaterialIcons name="info-outline" size={16} color={color.warn600} />
                    <Text style={styles.activationNoteText}>
                      {t('This role needs a serial number to activate. You can log in after registering to enter it.')}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* STEP 4: LOCATION & SERVICE */}
            {currentStep === 4 && (
              <View style={styles.formSection}>
                {role === 'artisan' && (
                  <View style={styles.sectionCard}>
                    <Text style={styles.cardTitle}>{t('Your expertise')}</Text>
                    <CustomPicker label={t('Service provided')} placeholder={t('Select Service')} value={selectedService} onValueChange={setSelectedService} items={services} />
                    {errors.service && <Text style={styles.errorText}>{errors.service}</Text>}
                  </View>
                )}

                <View style={styles.sectionCard}>
                  <Text style={styles.cardTitle}>{t('Location details')}</Text>
                  <CustomPicker label={t('Country')} placeholder={t('Select Country')} value={selectedCountry} onValueChange={setSelectedCountry} items={countries.map(c => ({ label: c.name, value: c.id.toString() }))} />
                  <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <CustomPicker label={t('State')} placeholder={t('State')} value={selectedState} onValueChange={setSelectedState} items={states.map(s => ({ label: s.name, value: s.id.toString() }))} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <CustomPicker label={t('LGA')} placeholder={t('City / LGA')} value={selectedLga} onValueChange={setSelectedLga} items={lgas.map(l => ({ label: l.name, value: l.id.toString() }))} />
                    </View>
                  </View>
                  {(errors.country || errors.state || errors.lga) && (
                    <Text style={styles.errorText}>{t('Please complete all location fields')}</Text>
                  )}
                </View>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        {/* FOOTER ACTION */}
        <View style={styles.footer}>
          <Button
            title={
              currentStep === 1
                ? t('I agree & continue')
                : currentStep === totalSteps
                  ? t('Create account')
                  : t('Continue')
            }
            onPress={currentStep === totalSteps ? handleRegister : nextStep}
            disabled={continueDisabled}
            loading={loading}
          />
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- SUB COMPONENTS ---

const RoleCard = ({ title, subtitle, icon, selected, onPress }: {
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  selected: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="radio"
    accessibilityState={{ selected }}
    style={[styles.roleCard, selected && styles.roleCardSelected]}
  >
    <View style={[styles.roleIcon, selected && styles.roleIconSelected]}>
      <MaterialIcons name={icon} size={22} color={selected ? '#FFF' : color.ink400} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.roleTitle, selected && { color: color.brand600 }]}>{title}</Text>
      <Text style={styles.roleSubtitle}>{subtitle}</Text>
    </View>
    <View style={[styles.radio, selected && styles.radioSelected]}>
      {selected && <View style={styles.radioDot} />}
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.canvas },
  stepHeader: { paddingHorizontal: space.xxl, paddingTop: space.md },
  scrollContent: { paddingHorizontal: space.xxl, paddingTop: space.xl, paddingBottom: 40 },

  stepTitle: { ...type.titleLg, marginBottom: 6 },
  stepSubtitle: {
    fontFamily: font.medium,
    fontSize: 14,
    lineHeight: 21,
    color: color.ink400,
    marginBottom: space.xxl,
  },

  // STEP 1
  pointsCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#EEF2F8',
    paddingHorizontal: space.lg,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.lg,
  },
  pointRowDivider: { borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  pointIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: color.accent100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space.md,
  },
  pointText: {
    flex: 1,
    fontFamily: font.medium,
    fontSize: 13.5,
    lineHeight: 20,
    color: color.ink600,
  },
  fullTermsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: space.lg,
  },
  fullTermsToggleText: { fontFamily: font.extrabold, fontSize: 13, color: color.brand600 },
  termsCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#EEF2F8',
    padding: space.lg,
    marginTop: space.md,
  },
  termsScroll: { maxHeight: 300 },
  corporateTitle: {
    fontFamily: font.extrabold,
    fontSize: 15,
    color: color.brand600,
    textAlign: 'center',
    marginBottom: 2,
  },
  corporateSubtitle: {
    fontFamily: font.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: color.ink400,
    textAlign: 'center',
    marginBottom: space.lg,
    textTransform: 'uppercase',
  },
  termsText: { fontFamily: font.medium, fontSize: 13, lineHeight: 21, color: color.ink600 },
  bold: { fontFamily: font.extrabold, color: color.ink900 },
  acceptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: space.xl,
    padding: space.lg,
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: color.border,
  },
  acceptRowSelected: { borderColor: color.brand600, backgroundColor: color.brand100 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: color.ink300,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space.md,
    backgroundColor: color.surface,
  },
  checkboxChecked: { backgroundColor: color.brand600, borderColor: color.brand600 },
  acceptText: {
    flex: 1,
    fontFamily: font.bold,
    fontSize: 13.5,
    lineHeight: 20,
    color: color.ink900,
  },

  // FORM
  formSection: { gap: space.lg },
  errorText: { fontFamily: font.bold, fontSize: 12, color: color.danger600, marginTop: 6 },

  // STEP 3 — role cards
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: color.surface,
    borderWidth: 1.5,
    borderColor: color.border,
  },
  roleCardSelected: { borderColor: color.brand600, backgroundColor: color.brand100 },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: color.surfaceChip,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space.md,
  },
  roleIconSelected: { backgroundColor: color.brand600 },
  roleTitle: { fontFamily: font.extrabold, fontSize: 14.5, color: color.ink900 },
  roleSubtitle: { fontFamily: font.medium, fontSize: 12.5, color: color.ink400, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: color.ink300,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: space.md,
  },
  radioSelected: { borderColor: color.brand600 },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: color.brand600 },
  activationNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: color.warn100,
    borderRadius: radius.md,
    padding: space.md,
  },
  activationNoteText: {
    flex: 1,
    fontFamily: font.bold,
    fontSize: 12.5,
    lineHeight: 18,
    color: color.warn600,
  },

  // STEP 4
  sectionCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#EEF2F8',
    padding: space.lg,
  },
  cardTitle: { fontFamily: font.extrabold, fontSize: 15, color: color.ink900, marginBottom: space.md },
  row: { flexDirection: 'row' },

  // FOOTER
  footer: {
    paddingHorizontal: space.xxl,
    paddingTop: space.md,
    paddingBottom: space.lg,
    backgroundColor: color.canvas,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
});
