import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
// import { CameraView, Camera } from 'expo-camera'; // 💡 INSTALL: npx expo install expo-camera
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { color, font } from '@/constants/theme';

export default function QRScannerScreen() {
    const router = useRouter();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        // const getPermissions = async () => {
        //     const { status } = await Camera.requestCameraPermissionsAsync();
        //     setHasPermission(status === 'granted');
        // };
        // getPermissions();
        setHasPermission(true); // Placeholder bypass
    }, []);

    const handleBarCodeScanned = ({ type, data }: any) => {
        setScanned(true);

        // Logic: We expect the QR code to contain just the ID (e.g., "54") or a JSON string
        try {
            let artisanId = data;

            // If data is JSON like {"id": 54}, parse it
            if (data.includes('{')) {
                const parsed = JSON.parse(data);
                artisanId = parsed.id || parsed.user_id;
            }

            // Validate it's a number
            if (!isNaN(artisanId)) {
                Alert.alert(
                    "Artisan Found",
                    `ID: ${artisanId}`,
                    [
                        { text: "Cancel", onPress: () => setScanned(false), style: "cancel" },
                        { text: "View Profile", onPress: () => router.replace({ pathname: '/agent/artisans/[id]', params: { id: artisanId } }) }
                    ]
                );
            } else {
                throw new Error("Invalid ID");
            }
        } catch (error) {
            Alert.alert("Invalid QR Code", "This QR code does not contain a valid Artisan ID.", [
                { text: "Scan Again", onPress: () => setScanned(false) }
            ]);
        }
    };

    if (hasPermission === null) {
        return <View style={styles.center}><Text>Requesting camera permission...</Text></View>;
    }
    if (hasPermission === false) {
        return <View style={styles.center}><Text>No access to camera</Text></View>;
    }

    return (
        <View style={styles.container}>
            {/* Camera View Placeholder */}
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="camera-outline" size={80} color="#374151" />
                <Text style={{ color: '#4B5563', marginTop: 20, textAlign: 'center', paddingHorizontal: 40 }}>
                    Camera package missing. To enable scanning, run:{"\n"}
                    <Text style={{ fontWeight: '700' }}>npx expo install expo-camera</Text>
                </Text>
            </View>
            {/* <CameraView
                style={StyleSheet.absoluteFillObject}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            /> */}

            {/* Overlay UI */}
            <View style={styles.overlay}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Scan Artisan ID</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Scan Frame */}
                <View style={styles.scanFrameContainer}>
                    <View style={styles.scanFrame} />
                    <Text style={styles.hint}>Align QR code within the frame</Text>
                </View>

                {/* Bottom Actions */}
                <View style={styles.footer}>
                    {scanned && (
                        <TouchableOpacity onPress={() => setScanned(false)} style={styles.scanAgainBtn}>
                            <Text style={styles.btnText}>Tap to Scan Again</Text>
                        </TouchableOpacity>
                    )}
                </View>

            </View>
        </View>
    );
}

const { width } = Dimensions.get('window');
const frameSize = width * 0.7;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    overlay: { flex: 1, justifyContent: 'space-between', paddingVertical: 50 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 },
    closeButton: { padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
    title: { color: '#FFF', fontFamily: font.extrabold, fontSize: 16.5 },

    scanFrameContainer: { alignItems: 'center', justifyContent: 'center' },
    scanFrame: {
        width: frameSize, height: frameSize,
        borderWidth: 2, borderColor: color.accent600, borderRadius: 22,
        backgroundColor: 'transparent'
    },
    hint: {
        color: '#FFF', fontFamily: font.bold, marginTop: 20, fontSize: 13,
        backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999
    },

    footer: { alignItems: 'center', height: 60 },
    scanAgainBtn: { backgroundColor: '#FFF', paddingHorizontal: 24, height: 44, justifyContent: 'center', borderRadius: 999 },
    btnText: { color: color.ink900, fontFamily: font.extrabold, fontSize: 14 }
});