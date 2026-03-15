import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import TextField from '../components/basic/TextField';
import { meApi } from '../api/auth';
import { submitTest } from '../api/thinkingStyle';
import PrimaryButton from '../components/basic/PrimaryButton';

export default function CognitiveTestIntroScreen({ route }: any) {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    const [dob, setDob] = useState('');
    const fromQuestionnaire = route?.params?.fromQuestionnaire;
    const qDob = route?.params?.dob as string | undefined;
    const questionnaire = route?.params?.questionnaire as any | undefined;
    const [loading, setLoading] = useState(false);
    const [userFullname, setUserFullname] = useState('Pengguna');
    const [autoSubmitted, setAutoSubmitted] = useState(false);

    useEffect(() => {
        meApi()
            .then(res => {
                if (res.data?.user?.fullname) setUserFullname(res.data.user.fullname);
            })
            .catch(() => { });
    }, []);

    const resultPrimary = useMemo(() => {
        const t = String(questionnaire?.finalType || questionnaire?.tipeUtama || '').trim();
        return t || 'Cognitive Style';
    }, [questionnaire?.finalType, questionnaire?.tipeUtama]);

    const questionnairePercent = useMemo(() => {
        const n = Number(questionnaire?.percent ?? 0);
        return Math.max(0, Math.min(100, Math.round(n)));
    }, [questionnaire?.percent]);

    const fnv1a = (str: string) => {
        let h = 0x811c9dc5;
        for (let i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
        }
        return ('0000000' + h.toString(16)).slice(-8);
    };

    const handleSubmit = useCallback(async () => {
        const effectiveDob = qDob || dob;
        if (!effectiveDob) {
            Alert.alert('Data Belum Lengkap', 'Mohon isi Tanggal Lahir Anda.');
            return;
        }
        if (!questionnaire) {
            Alert.alert('Data Tidak Lengkap', 'Kuesioner tidak ditemukan. Silakan ulangi dari awal.');
            return;
        }

        const normalizedDob = effectiveDob.trim();
        const currentDobHash = fnv1a(normalizedDob);
        const firstDobHash = await AsyncStorage.getItem('cst:firstDobHash');
        if (firstDobHash && firstDobHash !== currentDobHash) {
            Alert.alert('Validasi Gagal', 'Tanggal lahir tidak sesuai dengan data pertama Anda. Gunakan data asli untuk melanjutkan.');
            return;
        }

        let formattedDate = effectiveDob;
        const dobParts = effectiveDob.split('-');
        if (dobParts.length === 3) {
            formattedDate = `${dobParts[2]}-${dobParts[1]}-${dobParts[0]}`;
        }
        if (!formattedDate || formattedDate.split('-').length !== 3) {
            Alert.alert('Tanggal Lahir Tidak Valid', 'Gunakan format DD-MM-YYYY.');
            return;
        }

        setLoading(true);
        try {
            const testResult = await submitTest({
                fullname: userFullname,
                birthdate: formattedDate,
                questionnaire,
            });

            if (!firstDobHash) {
                await AsyncStorage.setItem('cst:firstDobHash', currentDobHash);
            }

            const testId = testResult.data.data.id.toString();
            try {
                await AsyncStorage.setItem('cst:lastQuestionnaire', JSON.stringify(questionnaire));
                await AsyncStorage.setItem(`cst:questionnaireByTestId:${testId}`, JSON.stringify(questionnaire));
            } catch { }

            const finalPercent = questionnairePercent;
            const summary = resultPrimary;

            navigation.replace('ReportDetail', {
                fromFingerprint: true,
                report: {
                    id: testId,
                    title: 'Cognitive Style Test',
                    date: new Date(testResult.data.data.createdAt).toLocaleDateString('id-ID'),
                    summary,
                    type: 'cst',
                    fullname: userFullname,
                    fullData: testResult.data.data,
                    combine: {
                        finalPercent,
                        questionnairePercent,
                        questionnaire
                    }
                }
            });
        } catch (submitError: any) {
            const status = submitError?.response?.status;
            if (status === 403) {
                Alert.alert(
                    'Token Tidak Cukup',
                    'Token Anda tidak mencukupi untuk melakukan tes.',
                    [
                        { text: 'Batal', style: 'cancel' },
                        { text: 'Beli Token', onPress: () => navigation.navigate('TokenPackages') }
                    ]
                );
                return;
            }
            Alert.alert('Gagal Submit Tes', submitError?.response?.data?.message || 'Terjadi kesalahan saat submit tes.');
        } finally {
            setLoading(false);
        }
    }, [dob, navigation, qDob, questionnaire, questionnairePercent, resultPrimary, userFullname]);

    useEffect(() => {
        if (!fromQuestionnaire) return;
        if (!qDob || !questionnaire) return;
        if (autoSubmitted) return;
        setAutoSubmitted(true);
        handleSubmit();
    }, [autoSubmitted, fromQuestionnaire, handleSubmit, qDob, questionnaire]);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#EEF2FF', '#F8FAFC', '#FFFFFF']}
                style={[styles.backgroundGradient, { paddingTop: insets.top }]}
            />

            <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 30 }]}>

                {/* Header Section */}
                <View style={styles.header}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={20} color="#475569" />
                    </Pressable>
                    <View style={styles.headerIconContainer}>
                        <LinearGradient colors={['#4F46E5', '#818CF8']} style={styles.headerIconBg}>
                            <Feather name="activity" size={32} color="#FFFFFF" />
                        </LinearGradient>
                    </View>
                    <Text style={styles.title}>Cognitive Style Test</Text>
                    <Text style={styles.subtitle}>
                        Hasil tes dihitung dari kuesioner yang Anda isi.
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
                            <Text style={styles.subtitle}>Hasil Kuesioner: {resultPrimary}</Text>
                            <Text style={styles.subtitle}>Skor: {questionnairePercent}%</Text>
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
                        </View>
                    )}
                </View>

                <PrimaryButton
                    title={loading ? 'Memproses...' : 'Kirim & Lihat Hasil'}
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={!fromQuestionnaire || !questionnaire}
                    style={{ marginTop: 2 }}
                    leftIcon={!loading ? <Feather name="arrow-right" size={18} color="#FFFFFF" /> : undefined}
                />

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
