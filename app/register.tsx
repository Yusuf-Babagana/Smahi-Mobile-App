import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, ImageBackground, Switch, Dimensions, Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { authAPI, locationAPI } from '@/src/api/client';
import { UserRole } from '@/src/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import Animated, { FadeInRight, FadeOutLeft, LinearTransition } from 'react-native-reanimated';
import CustomPicker from '@/components/CustomPicker';
import { ModernInput } from '@/src/components/ModernInput';
import { LinearGradient } from 'expo-linear-gradient';

// IMPORT COMMON STYLES
import { colors, commonStyles } from '@/styles/commonStyles';

const { height } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();

  // --- STEPS STATE ---
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // --- FORM STATE ---
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // --- DATA STATE ---
  const [services, setServices] = useState<any[]>([]); // Will contain [{label: "English (Hausa)", value: "English"}]
  const [selectedService, setSelectedService] = useState('');
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [lgas, setLgas] = useState<any[]>([]);

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedLga, setSelectedLga] = useState('');

  // --- DATA LOADING ---
  useEffect(() => {
    locationAPI.getCountries().then(setCountries).catch(console.error);

    // ✅ FETCH SERVICES: The backend now returns them translated and sorted.
    authAPI.getServices().then(setServices).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedCountry) return;
    locationAPI.getStates(Number(selectedCountry)).then(data => {
      setStates(data || []);
      setSelectedState(''); setLgas([]); setSelectedLga('');
    }).catch(console.error);
  }, [selectedCountry]);

  useEffect(() => {
    if (!selectedState) return;
    locationAPI.getLGAs(Number(selectedState)).then(data => {
      setLgas(data || []);
      setSelectedLga('');
    }).catch(console.error);
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

  const handleRegister = async () => {
    if (!validateStep(4)) return;
    setLoading(true);
    try {
      await authAPI.register({
        name, email, password, role, phone,
        service_category: role === 'artisan' ? selectedService : undefined,
        country: selectedCountry, state: selectedState, lga: selectedLga
      });
      Alert.alert('Success', 'Account created!', [{ text: 'Login Now', onPress: () => router.replace('/login') }]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data ? JSON.stringify(error.response.data) : 'Registration Failed');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.indicator,
            { width: `${(currentStep / totalSteps) * 100}%` }
          ]}
          layout={LinearTransition.springify()}
        />
      </View>
      <Text style={styles.stepText}>Step {currentStep} of {totalSteps}</Text>
    </View>
  );

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2574&auto=format&fit=crop' }}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.95)', '#FFFFFF']}
        locations={[0, 0.6, 1]}
        style={{ flex: 1 }}
      >
        <StatusBar style="dark" translucent={true} />

        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => currentStep === 1 ? router.back() : prevStep()} style={styles.backBtn}>
                <View style={styles.backBtnCircle}>
                  <IconSymbol name="chevron.left" size={24} color={colors.text} />
                </View>
              </TouchableOpacity>

              <View>
                <Text style={styles.headerTitle}>
                  {currentStep === 1 ? "Terms & Conditions" : currentStep === 2 ? "Create Account" : currentStep === 3 ? "Select Role" : "Finalize Profile"}
                </Text>
                <Text style={styles.headerSubtitle}>
                  {currentStep === 1 ? "Review corporate policy" : currentStep === 2 ? "Let's get to know you" : currentStep === 3 ? "How will you use the app?" : "Where are you based?"}
                </Text>
              </View>
            </View>

            {renderProgressBar()}

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Animated.View
                key={currentStep}
                entering={FadeInRight.duration(400).springify()}
                exiting={FadeOutLeft.duration(400)}
                layout={LinearTransition}
              >

                {/* STEP 1: TERMS AND CONDITIONS */}
                {currentStep === 1 && (
                  <View style={styles.termsContainer}>
                    <View style={styles.glassCard}>

                      {/* LOGO */}
                      <View style={{ alignItems: 'center', marginBottom: 16 }}>
                        <Image
                          source={require('../assets/images/smahi.png')}
                          style={styles.logoImage}
                          resizeMode="contain"
                        />
                      </View>

                      <Text style={styles.corporateTitle}>S. MAHI GLOBAL SERVICE LTD</Text>
                      <Text style={styles.corporateSubtitle}>TERMS, CONDITIONS & CORPORATE OVERVIEW</Text>

                      <ScrollView style={styles.termsScroll} nestedScrollEnabled>
                        <Text style={styles.termsText}>
                          <Text style={styles.bold}>1. Mission and Vision</Text>{'\n'}
                          S MAHI Global Services specializes in bridging the gap between skilled professionals and global opportunities through comprehensive training, AI-driven certification, and strategic job placement services across 195 countries.{'\n\n'}

                          <Text style={styles.bold}>2. Service Guarantee & Certification Policy</Text>{'\n'}
                          <Text style={styles.bold}>• Certified Professionals:</Text> S MAHI Global Services stands as a guarantor for any professional who holds an official S MAHI Training Certificate. In case of professional misconduct or damage, the company will investigate and mediate compensation.{'\n'}
                          <Text style={styles.bold}>• Independent Experts:</Text> For unverified experts on our platform, the transaction and risk are strictly between the Client and the Service Provider. S MAHI provides the connection but does not offer a guarantee for unverified workmanship.{'\n\n'}

                          <Text style={styles.bold}>3. The S MAHI Token Wallet</Text>{'\n'}
                          Our proprietary Token system facilitates seamless international payments, eliminating currency exchange barriers. Employers can pay workers globally, and tokens can be redeemed through S MAHI for local currency.{'\n\n'}

                          <Text style={styles.bold}>4. Human-to-Human Support</Text>{'\n'}
                          To ensure security and conflict resolution, S MAHI maintains a physical presence:{'\n'}
                          • <Text style={styles.bold}>LGA Agents:</Text> Six (6) trained agents in every Local Government Area (LGA) to resolve disputes and verify artisans.{'\n'}
                          • <Text style={styles.bold}>State Coordinators:</Text> One supervisor per state to manage agents and ensure quality control.{'\n\n'}

                          <Text style={styles.bold}>5. AI-Powered Verification & Security</Text>{'\n'}
                          We utilize Artificial Intelligence (AI) for:{'\n'}
                          • <Text style={styles.bold}>Data Accuracy:</Text> AI analyzes professional data to ensure honesty and competence.{'\n'}
                          • <Text style={styles.bold}>Automatic Translation:</Text> Our platform features real-time translation to facilitate communication between clients and experts of different languages.{'\n\n'}

                          <Text style={styles.bold}>6. Mutual Respect & Code of Conduct</Text>{'\n'}
                          S MAHI upholds a strict policy of mutual respect. It is mandatory for the service provider to respect the client, and the client must likewise respect the professional. We have zero tolerance for harassment, bullying, or indignity. Any violation will result in the immediate termination of the user's account.{'\n\n'}

                          <Text style={styles.bold}>7. Annual Account Renewal</Text>{'\n'}
                          To ensure all registered members are active and to update any changes in their biodata or professional status, an annual registration renewal is mandatory. This process ensures our database remains accurate.{'\n\n'}

                          <Text style={styles.bold}>8. Registration Fees</Text>{'\n'}
                          Registration fees are structured based on the economic status of each country.{'\n'}
                          • <Text style={styles.bold}>In Nigeria:</Text> The registration fee for every professional/artisan is set at N2,500.{'\n\n'}

                          <Text style={styles.bold}>9. Acceptable Use & Illegal Activity</Text>{'\n'}
                          S MAHI maintains a zero-tolerance policy for fraud, impersonation, or unlawful recruitment. Any breach of these terms will result in account termination and referral to the Police, EFCC, or relevant International Embassies.{'\n\n'}

                          <Text style={styles.bold}>10. Privacy & Data Protection</Text>{'\n'}
                          We are committed to protecting user data. Information collected is used strictly for professional matching and verification. We do not support the unauthorized sale of user data.{'\n\n'}

                          <Text style={styles.bold}>11. Contact & Support</Text>{'\n'}
                          CEO: ceo@smahiglobalservices.com{'\n'}
                          Support: customer@smahiglobalservices.com{'\n'}
                          Hotline: +2349066062541 / +2349052373245
                        </Text>
                      </ScrollView>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setAcceptedTerms(!acceptedTerms)}
                      style={styles.switchRow}
                    >
                      <Switch
                        value={acceptedTerms}
                        onValueChange={setAcceptedTerms}
                        trackColor={{ false: "#767577", true: colors.primary }}
                        thumbColor={acceptedTerms ? "#f4f3f4" : "#f4f3f4"}
                      />
                      <Text style={styles.switchText}>I have read and agree to the Terms</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* STEP 2: ACCOUNT INFO */}
                {currentStep === 2 && (
                  <View style={styles.formSection}>
                    <ModernInput label="Full Name" placeholder="John Doe" value={name} onChangeText={setName} error={errors.name} icon="person" />
                    <ModernInput label="Email Address" placeholder="john@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" error={errors.email} icon="envelope" />
                    <ModernInput label="Phone Number" placeholder="+234 800 000 0000" value={phone} onChangeText={setPhone} keyboardType="phone-pad" error={errors.phone} icon="phone" />
                    <ModernInput label="Password" placeholder="••••••••" value={password} onChangeText={setPassword} isPassword error={errors.password} icon="lock" />
                  </View>
                )}

                {/* STEP 3: ROLE SELECTION */}
                {currentStep === 3 && (
                  <View style={styles.formSection}>
                    <RoleCard title="Hire Artisans" subtitle="Find verified professionals" icon="person.2" selected={role === 'client'} onPress={() => setRole('client')} />
                    <RoleCard title="Work as an Artisan" subtitle="Offer services & earn tokens" icon="hammer" selected={role === 'artisan'} onPress={() => setRole('artisan')} />
                    <RoleCard title="Register as Agent" subtitle="Manage artisans in your LGA" icon="briefcase" selected={role === 'agent'} onPress={() => setRole('agent')} />
                  </View>
                )}

                {/* STEP 4: LOCATION & SERVICE */}
                {currentStep === 4 && (
                  <View style={styles.formSection}>
                    {role === 'artisan' && (
                      <View style={styles.glassCardSimple}>
                        <Text style={styles.cardTitle}>🛠️ Your Expertise</Text>
                        <CustomPicker label="Service Provided" placeholder="Select Service" value={selectedService} onValueChange={setSelectedService} items={services} />
                        {errors.service && <Text style={commonStyles.errorText}>{errors.service}</Text>}
                      </View>
                    )}

                    <CustomPicker label="Country" placeholder="Select Country" value={selectedCountry} onValueChange={setSelectedCountry} items={countries.map(c => ({ label: c.name, value: c.id.toString() }))} />

                    <View style={styles.row}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <CustomPicker label="State" placeholder="State" value={selectedState} onValueChange={setSelectedState} items={states.map(s => ({ label: s.name, value: s.id.toString() }))} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <CustomPicker label="LGA" placeholder="City / LGA" value={selectedLga} onValueChange={setSelectedLga} items={lgas.map(l => ({ label: l.name, value: l.id.toString() }))} />
                      </View>
                    </View>
                    {(errors.country || errors.state || errors.lga) && <Text style={commonStyles.errorText}>Please complete all location fields</Text>}
                  </View>
                )}

              </Animated.View>
            </ScrollView>

            {/* FLOATING ACTION BUTTON */}
            <View style={styles.footer}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.btn, { backgroundColor: currentStep === 1 && !acceptedTerms ? '#ccc' : colors.primary }]}
                onPress={currentStep === totalSteps ? handleRegister : nextStep}
                disabled={loading || (currentStep === 1 && !acceptedTerms)}
              >
                <LinearGradient
                  colors={currentStep === 1 && !acceptedTerms ? ['#ccc', '#bbb'] : [colors.primary, '#0056b3']}
                  style={styles.btnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.btnText}>
                        {currentStep === 1 ? "I Agree & Continue" : currentStep === totalSteps ? "Create Account" : "Continue"}
                      </Text>
                      <IconSymbol name="chevron.right" size={20} color="white" style={{ marginLeft: 8 }} />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}

// --- SUB COMPONENTS ---

const RoleCard = ({ title, subtitle, icon, selected, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.9}
    style={[
      styles.roleCard,
      {
        borderColor: selected ? colors.primary : '#E5E7EB',
        borderWidth: selected ? 2 : 1,
        backgroundColor: selected ? '#F0F9FF' : 'rgba(255,255,255,0.9)', // Increased opacity
      }
    ]}
  >
    <View style={[styles.iconCircle, { backgroundColor: selected ? colors.primary : '#F3F4F6' }]}>
      <IconSymbol name={icon} size={24} color={selected ? '#FFF' : '#6B7280'} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.roleTitle, { color: selected ? colors.primary : colors.text }]}>{title}</Text>
      <Text style={styles.roleSubtitle}>{subtitle}</Text>
    </View>
    {selected && (
      <View style={styles.checkIcon}>
        <IconSymbol name="checkmark.circle.fill" size={24} color={colors.primary} />
      </View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  // HEADER STYLES
  header: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 10 },
  backBtn: { marginBottom: 16, alignSelf: 'flex-start' },
  backBtnCircle: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 4, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 16, color: '#6B7280', fontWeight: '500' },

  // PROGRESS BAR
  progressContainer: { paddingHorizontal: 24, marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  track: { flex: 1, height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, marginRight: 12 },
  indicator: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  stepText: { fontSize: 12, fontWeight: '700', color: colors.primary },

  // FORM CONTENT
  scrollContent: { paddingHorizontal: 24, paddingBottom: 120 },
  formSection: { gap: 4 },

  // TERMS STYLES
  termsContainer: { marginTop: 10 },
  logoImage: { width: 80, height: 80, marginBottom: 8 }, // Logo style
  corporateTitle: { fontSize: 18, fontWeight: '900', color: colors.primary, textAlign: 'center', marginBottom: 4 },
  corporateSubtitle: { fontSize: 12, fontWeight: '700', color: '#6B7280', textAlign: 'center', marginBottom: 16, letterSpacing: 1 },
  termsScroll: { height: height * 0.45, paddingRight: 8 },
  termsText: { fontSize: 14, lineHeight: 22, color: '#4B5563', textAlign: 'justify' },
  bold: { fontWeight: '800', color: '#111827' },

  switchRow: {
    flexDirection: 'row', alignItems: 'center', marginTop: 20,
    padding: 16, backgroundColor: 'rgba(255,255,255,0.9)', // Increased opacity
    borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB'
  },
  switchText: { marginLeft: 12, fontSize: 15, fontWeight: '600', color: '#374151' },

  // FOOTER
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 24, backgroundColor: 'rgba(255,255,255,0.95)', // Increased opacity
    borderTopWidth: 1, borderTopColor: '#F3F4F6'
  },
  btn: {
    height: 56, borderRadius: 28, overflow: 'hidden',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8
  },
  btnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
  btnText: { color: 'white', fontWeight: '700', fontSize: 18 },

  // CARDS
  roleCard: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderRadius: 20, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.9)', // Increased opacity
    borderWidth: 1, borderColor: '#FFF',
    padding: 24, borderRadius: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4
  },
  glassCardSimple: {
    backgroundColor: 'rgba(255,255,255,0.9)', // Increased opacity
    borderWidth: 1, borderColor: '#FFF',
    padding: 20, borderRadius: 20, marginBottom: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4
  },
  iconCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  roleTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  roleSubtitle: { fontSize: 13, color: '#6B7280' },
  checkIcon: { marginLeft: 10 },
  cardTitle: { fontWeight: '700', marginBottom: 12, fontSize: 15, color: '#374151' },

  row: { flexDirection: 'row' },
});