import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';
// import QRCode from 'react-native-qrcode-svg'; // 💡 INSTALL: npx expo install react-native-qrcode-svg react-native-svg

export default function AgentProfileScreen() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [showIdCard, setShowIdCard] = useState(false);

    const handleLogout = () => {
        Alert.alert("Log Out", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { text: "Log Out", style: 'destructive', onPress: async () => { await logout(); router.replace('/auth/login'); } }
        ]);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Profile</Text>
                <TouchableOpacity onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        {user?.profile_picture ? (
                            <Image source={{ uri: user.profile_picture }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.placeholder]}>
                                <Text style={styles.placeholderText}>{user?.first_name?.[0]}</Text>
                            </View>
                        )}
                        <View style={styles.editIcon}>
                            <Ionicons name="camera" size={16} color="#FFF" />
                        </View>
                    </View>
                    <Text style={styles.name}>{user?.first_name} {user?.last_name}</Text>
                    <Text style={styles.role}>Verified Field Agent</Text>
                    <Text style={styles.location}>{user?.lga_details?.name}, {user?.state_details?.name}</Text>
                </View>

                {/* Digital ID Card Button */}
                <TouchableOpacity style={styles.idCardButton} onPress={() => setShowIdCard(true)}>
                    <LinearGradient colors={['#4F46E5', '#3730A3']} style={styles.idCardGradient}>
                        <View>
                            <Text style={styles.idCardTitle}>Digital Agent ID</Text>
                            <Text style={styles.idCardSub}>Tap to view</Text>
                        </View>
                        <Ionicons name="id-card-outline" size={32} color="#FFF" />
                    </LinearGradient>
                </TouchableOpacity>

                {/* Settings Menu */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Settings</Text>

                    <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert("Coming Soon", "Edit Profile")}>
                        <Ionicons name="person-outline" size={22} color="#4B5563" />
                        <Text style={styles.menuText}>Personal Information</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert("Coming Soon", "Change Password")}>
                        <Ionicons name="lock-closed-outline" size={22} color="#4B5563" />
                        <Text style={styles.menuText}>Security & Password</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert("Coming Soon", "Notifications")}>
                        <Ionicons name="notifications-outline" size={22} color="#4B5563" />
                        <Text style={styles.menuText}>Notifications</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>
                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="help-circle-outline" size={22} color="#4B5563" />
                        <Text style={styles.menuText}>Help Center</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* Digital ID Modal */}
            <Modal visible={showIdCard} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.idCardContainer}>
                        <LinearGradient colors={['#1e1b4b', '#312e81']} style={styles.digitalId}>
                            {/* ID Header */}
                            <View style={styles.idHeader}>
                                <View style={styles.logoCircle}><Text style={styles.logoText}>S</Text></View>
                                <Text style={styles.idCompany}>SMAHI AGENT</Text>
                            </View>

                            {/* ID Photo & Details */}
                            <View style={styles.idBody}>
                                <View style={styles.idPhotoContainer}>
                                    {user?.profile_picture ? (
                                        <Image source={{ uri: user.profile_picture }} style={styles.idPhoto} />
                                    ) : (
                                        <View style={[styles.idPhoto, styles.placeholder]} />
                                    )}
                                </View>
                                <View style={styles.idDetails}>
                                    <Text style={styles.idLabel}>NAME</Text>
                                    <Text style={styles.idValue}>{user?.first_name} {user?.last_name}</Text>

                                    <Text style={styles.idLabel}>AGENT ID</Text>
                                    <Text style={styles.idValue}>{user?.serial_number || 'N/A'}</Text>

                                    <Text style={styles.idLabel}>ZONE</Text>
                                    <Text style={styles.idValue}>{user?.lga_details?.name}</Text>
                                </View>
                            </View>

                            {/* QR Code Placeholder */}
                            <View style={styles.qrContainer}>
                                {/* <QRCode value={String(user?.serial_number || user?.id || 'N/A')} size={80} /> */}
                                <View style={{ width: 80, height: 80, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' }}>
                                    <Ionicons name="qr-code-outline" size={40} color="rgba(255,255,255,0.3)" />
                                </View>
                            </View>

                            <View style={styles.verifiedBadge}>
                                <Text style={styles.verifiedText}>OFFICIAL AGENT</Text>
                            </View>
                        </LinearGradient>

                        <TouchableOpacity onPress={() => setShowIdCard(false)} style={styles.closeIdButton}>
                            <Ionicons name="close" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
        borderBottomWidth: 1, borderBottomColor: '#F3F4F6'
    },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    backButton: { padding: 4 },

    content: { padding: 24 },

    profileHeader: { alignItems: 'center', marginBottom: 30 },
    avatarContainer: { position: 'relative', marginBottom: 16 },
    avatar: { width: 100, height: 100, borderRadius: 50 },
    placeholder: { backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center' },
    placeholderText: { fontSize: 40, fontWeight: '700', color: '#4F46E5' },
    editIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.primary, padding: 8, borderRadius: 20, borderWidth: 2, borderColor: '#FFF' },
    name: { fontSize: 22, fontWeight: '800', color: '#1F2937' },
    role: { fontSize: 14, color: '#059669', fontWeight: '600', marginTop: 4 },
    location: { fontSize: 14, color: '#6B7280', marginTop: 2 },

    idCardButton: { marginBottom: 30 },
    idCardGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderRadius: 16 },
    idCardTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
    idCardSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },

    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 12 },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
    menuText: { flex: 1, marginLeft: 16, fontSize: 16, color: '#1F2937' },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
    idCardContainer: { width: '85%', alignItems: 'center' },
    digitalId: { width: '100%', height: 450, borderRadius: 20, padding: 24, justifyContent: 'space-between' },
    idHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', paddingBottom: 16 },
    logoCircle: { width: 30, height: 30, backgroundColor: '#FFF', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    logoText: { color: '#1e1b4b', fontWeight: 'bold' },
    idCompany: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 2 },

    idBody: { flexDirection: 'row', gap: 20, marginTop: 20 },
    idPhotoContainer: { width: 100, height: 120, borderRadius: 10, overflow: 'hidden', borderWidth: 2, borderColor: '#FFF' },
    idPhoto: { width: '100%', height: '100%', backgroundColor: '#CCC' },
    idDetails: { flex: 1, justifyContent: 'center' },
    idLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700', marginTop: 8 },
    idValue: { color: '#FFF', fontSize: 16, fontWeight: '700' },

    qrContainer: { alignItems: 'center', marginTop: 20 },

    verifiedBadge: { position: 'absolute', bottom: 20, right: 20, borderWidth: 2, borderColor: '#10B981', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, transform: [{ rotate: '-10deg' }] },
    verifiedText: { color: '#10B981', fontWeight: '900', fontSize: 12 },

    closeIdButton: { marginTop: 20, backgroundColor: '#FFF', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' }
});