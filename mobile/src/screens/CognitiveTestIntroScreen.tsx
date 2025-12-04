import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import ReactNativeBiometrics from 'react-native-biometrics';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import TextField from '../components/basic/TextField';
import { loadToken } from '../store/auth';
import { submitTest } from '../api/thinkingStyle';
import { resolvedBaseURL } from '../api/client';

const API_URL = `${resolvedBaseURL}/api`;
const { width } = Dimensions.get('window');

export default function CognitiveTestIntroScreen({ route }: any) {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    const [dob, setDob] = useState('');
    const [bloodType, setBloodType] = useState('');
    const fromQuestionnaire = route?.params?.fromQuestionnaire;
    const qDob = route?.params?.dob as string | undefined;
    const qBlood = route?.params?.bloodType as string | undefined;
    const questionnaire = route?.params?.questionnaire as any | undefined;
    const [loading, setLoading] = useState(false);
    const [biometricsAvailable, setBiometricsAvailable] = useState(false);

    // Use useRef to maintain stable biometrics instance
    const rnBiometricsRef = useRef(new ReactNativeBiometrics());

    // Animation for biometric icon
    const scale = useSharedValue(1);

    useEffect(() => {
        scale.value = withRepeat(
            withSequence(
                withTiming(1.1, { duration: 1000 }),
                withTiming(1, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    useEffect(() => {
        checkBiometricAvailability();
    }, []);

    const checkBiometricAvailability = async () => {
        try {
            const rnBiometrics = rnBiometricsRef.current;
            if (!rnBiometrics) {
                console.log('Biometrics instance not available');
                setBiometricsAvailable(false);
                return;
            }

            const { available, biometryType } = await rnBiometrics.isSensorAvailable();
            setBiometricsAvailable(available && !!biometryType);

            if (!available || !biometryType) {
                Alert.alert(
                    'Biometrik Tidak Tersedia',
                    'Fitur sidik jari tidak terdeteksi atau belum diaktifkan di HP Anda. Silakan aktifkan di Pengaturan HP untuk melanjutkan.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Biometric check error:', error);
            setBiometricsAvailable(false);
        }
    };

    const fnv1a = (str: string) => {
        let h = 0x811c9dc5;
        for (let i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
        }
        return ('0000000' + h.toString(16)).slice(-8);
    };

    const handleBiometricAuth = async () => {
        const effectiveDob = qDob || dob;
        const effectiveBlood = qBlood || bloodType;
        if (!effectiveDob || !effectiveBlood) {
            Alert.alert('Data Belum Lengkap', 'Mohon isi Tanggal Lahir dan Golongan Darah Anda.');
            return;
        }

        const normalizedDob = effectiveDob.trim();
        const currentDobHash = fnv1a(normalizedDob);
        const firstDobHash = await AsyncStorage.getItem('cst:firstDobHash');
        if (firstDobHash && firstDobHash !== currentDobHash) {
            Alert.alert('Validasi Gagal', 'Tanggal lahir tidak sesuai dengan data pertama Anda. Gunakan data asli untuk melanjutkan.');
            return;
        }

        setLoading(true);
        try {
            const token = await loadToken();
            if (!token) throw new Error('No auth token');

            const headers = { Authorization: `Bearer ${token}` };
            const rnBiometrics = rnBiometricsRef.current;

            const keysExist = await (rnBiometrics as any).biometricKeysExist?.();
            let publicKey: string | undefined;
            if (!keysExist?.keysExist) {
                const created = await rnBiometrics.createKeys();
                publicKey = created.publicKey;
                if (!publicKey) throw new Error('Failed to create keys');
                await AsyncStorage.setItem('cst:fingerprintPublicKey', publicKey);
            } else {
                publicKey = await AsyncStorage.getItem('cst:fingerprintPublicKey') || undefined;
            }

            console.log('Registering public key with backend...');
            await axios.post(`${API_URL}/biometrics/register-key`, { publicKey, deviceId: Platform.OS }, { headers });

            // 4. Get Challenge
            const challengeRes = await axios.get(`${API_URL}/biometrics/challenge`, { headers });
            const { challenge } = challengeRes.data;

            // 5. Prompt Fingerprint & Sign
            const { success, signature } = await rnBiometrics.createSignature({
                promptMessage: 'Verifikasi Identitas',
                cancelButtonText: 'Batal',
                payload: challenge
            });

            if (success && signature) {
                try {
                    // 6. Verify Signature
                    const verifyRes = await axios.post(`${API_URL}/biometrics/verify`, { signature, challenge }, { headers });

                    if (verifyRes.data.verified) {
                        // 7. Submit Test to Backend
                        try {
                            // Convert DD-MM-YYYY to YYYY-MM-DD
                            let formattedDate = effectiveDob;
                            const dobParts = effectiveDob.split('-');
                            if (dobParts.length === 3) {
                                // Assuming format is DD-MM-YYYY
                                formattedDate = `${dobParts[2]}-${dobParts[1]}-${dobParts[0]}`;
                            }

                            const testResult = await submitTest({
                                fullname: '',
                                birthdate: formattedDate,
                                bloodType: effectiveBlood,
                            });

                            // Navigate to report detail with result
                            if (!firstDobHash) {
                                await AsyncStorage.setItem('cst:firstDobHash', currentDobHash);
                            }

                            navigation.replace('ReportDetail', {
                                report: {
                                    id: testResult.data.data.id.toString(),
                                    title: 'Cognitive Style Test',
                                    date: new Date(testResult.data.data.createdAt).toLocaleDateString('id-ID'),
                                    summary: `${testResult.data.data.thinkingStyle?.type} (${testResult.data.data.thinkingStyle?.code})`,
                                    type: 'cst',
                                    fullData: testResult.data.data
                                }
                            });
                        } catch (submitError: any) {
                            console.error('Test submission error:', submitError);
                            if (submitError.response?.status === 403) {
                                Alert.alert('Token Tidak Cukup', 'Token Anda tidak mencukupi untuk melakukan tes.');
                            } else {
                                Alert.alert('Gagal Submit Tes', submitError.response?.data?.message || 'Terjadi kesalahan saat submit tes.');
                            }
                        }
                    } else {
                        Alert.alert('Verifikasi Gagal', 'Tanda tangan digital tidak valid.');
                    }
                } catch (verifyError: any) {
                    // If 404, it means the public key is not registered in the backend
                    if (verifyError.response?.status === 404) {
                        console.log('Public key not found in backend, re-registering...');

                        // Delete local keys and re-register
                        await rnBiometrics.deleteKeys();
                        const { publicKey } = await rnBiometrics.createKeys();

                        if (publicKey) {
                            await axios.post(`${API_URL}/biometrics/register-key`, { publicKey, deviceId: Platform.OS }, { headers });
                            Alert.alert('Registrasi Ulang Berhasil', 'Silakan coba verifikasi lagi.');
                        } else {
                            throw new Error('Failed to recreate keys');
                        }
                    } else {
                        throw verifyError;
                    }
                }
            }

        } catch (error: any) {
            console.error('Biometric error:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                url: error.config?.url,
                data: error.response?.data
            });
            if (error.message !== 'User cancellation') {
                Alert.alert('Terjadi Kesalahan', 'Gagal memproses verifikasi biometrik.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#EEF2FF', '#F8FAFC', '#FFFFFF']}
                style={[styles.backgroundGradient, { paddingTop: insets.top }]}
            />

            <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 30 }]}>

                {/* Header Section */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <View style={styles.headerIconContainer}>
                        <LinearGradient colors={['#4F46E5', '#818CF8']} style={styles.headerIconBg}>
                            <Feather name="activity" size={32} color="#FFFFFF" />
                        </LinearGradient>
                    </View>
                    <Text style={styles.title}>Cognitive Style Test</Text>
                    <Text style={styles.subtitle}>
                        Kenali potensi diri Anda melalui analisis pola berpikir yang mendalam.
                    </Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Data Diri</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Wajib</Text>
                        </View>
                    </View>
                    {fromQuestionnaire ? (
                        <View style={{ gap: 8 }}>
                            <Text style={styles.subtitle}>Tanggal Lahir: {qDob}</Text>
                            <Text style={styles.subtitle}>Golongan Darah: {qBlood}</Text>
                        </View>
                    ) : (
                        <View style={styles.inputGroup}>
                            <TextField
                                label="Tanggal Lahir"
                                placeholder="DD-MM-YYYY"
                                value={dob}
                                onChangeText={setDob}
                                startIcon={<Feather name="calendar" size={18} color="#64748B" />}
                                containerStyle={styles.inputContainer}
                            />
                            <TextField
                                label="Golongan Darah"
                                placeholder="A / B / AB / O"
                                value={bloodType}
                                onChangeText={setBloodType}
                                startIcon={<Feather name="droplet" size={18} color="#64748B" />}
                                containerStyle={styles.inputContainer}
                            />
                        </View>
                    )}
                </View>

                {/* Biometric Section */}
                <View style={styles.biometricContainer}>
                    <Text style={styles.biometricTitle}>Verifikasi Biometrik</Text>
                    <Text style={styles.biometricDesc}>
                        Keamanan data Anda adalah prioritas kami. Gunakan sidik jari untuk memulai tes.
                    </Text>
                </View>

                {/* Action Button */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleBiometricAuth}
                    disabled={loading}
                    style={styles.buttonShadow}
                >
                    <LinearGradient
                        colors={loading ? ['#94A3B8', '#CBD5E1'] : ['#4F46E5', '#4338CA']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.button}
                    >
                        {loading ? (
                            <Text style={styles.buttonText}>Memproses...</Text>
                        ) : (
                            <>
                                <Text style={styles.buttonText}>Verifikasi & Mulai</Text>
                                <Feather name="arrow-right" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    backgroundGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 400 },
    scrollContent: { padding: 24 },

    header: { alignItems: 'center', marginBottom: 32, marginTop: 10 },
    backButton: { position: 'absolute', left: 0, top: 0, padding: 8, borderRadius: 12, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    headerIconContainer: { marginBottom: 16, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 },
    headerIconBg: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-5deg' }] },
    title: { fontSize: 26, fontWeight: '800', color: '#1E293B', marginBottom: 8, textAlign: 'center', letterSpacing: -0.5 },
    subtitle: { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 24, paddingHorizontal: 20 },

    card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, shadowColor: '#64748B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 24, elevation: 4, marginBottom: 32 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    cardTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
    badge: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#DBEAFE' },
    badgeText: { fontSize: 12, fontWeight: '600', color: '#3B82F6' },
    inputGroup: { gap: 16 },
    inputContainer: { marginBottom: 0 },

    biometricContainer: { alignItems: 'center', marginBottom: 40 },
    biometricIconRing: { padding: 8, borderRadius: 50, backgroundColor: '#FFFFFF', shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
    biometricIconBg: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#EEF2FF' },
    biometricTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginTop: 16, marginBottom: 6 },
    biometricDesc: { fontSize: 14, color: '#64748B', textAlign: 'center', maxWidth: 280, lineHeight: 22 },

    buttonShadow: { shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 },
    button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, borderRadius: 16 },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
