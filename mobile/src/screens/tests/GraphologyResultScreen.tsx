import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, Button, Surface, useTheme, Divider, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { GraphologyResultData } from '../../api/graphology';
import { LinearGradient } from 'expo-linear-gradient';

export default function GraphologyResultScreen() {
    const theme = useTheme();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { result } = route.params as { result: GraphologyResultData };

    if (!result) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Hasil tidak ditemukan.</Text>
                <Button onPress={() => navigation.goBack()}>Kembali</Button>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <LinearGradient
                colors={['#EEF2FF', '#F1F5F9', '#F8FAFC']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <View style={styles.headerIconWrap}>
                        <MaterialCommunityIcons name="file-certificate" size={40} color="#4F46E5" />
                    </View>
                    <Text variant="headlineSmall" style={styles.title}>Graphology Report</Text>
                    <Text variant="bodySmall" style={styles.subtitle}>Analisis kepribadian dari tulisan tangan Anda</Text>
                </View>

                <Surface style={styles.mainCard} elevation={0}>
                    <LinearGradient
                        colors={['#4F46E5', '#6366F1']}
                        style={styles.mainCardGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.typeContainer}>
                            <View style={styles.typeIconBox}>
                                <MaterialCommunityIcons name="account-search" size={32} color="#4F46E5" />
                            </View>
                            <View style={{ marginLeft: 16, flex: 1 }}>
                                <Text variant="labelMedium" style={{ color: 'rgba(255,255,255,0.8)' }}>TIPE KEPRIBADIAN</Text>
                                <Text variant="headlineSmall" style={styles.boldTextWhite}>{result.personality_type}</Text>
                            </View>
                        </View>
                        <Divider style={styles.dividerWhite} />
                        <View style={styles.row}>
                            <View style={[styles.col, { paddingRight: 10 }]}>
                                <Text variant="bodySmall" style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>Gaya Berpikir</Text>
                                <Text variant="titleMedium" style={styles.boldTextWhite}>{result.thinking_style}</Text>
                            </View>
                            <View style={styles.dividerVertical} />
                            <View style={[styles.col, { paddingLeft: 10 }]}>
                                <Text variant="bodySmall" style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>Emosi</Text>
                                <Text variant="titleMedium" style={styles.boldTextWhite}>{result.emotional_tendency}</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </Surface>

                <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons name="format-quote-open" size={20} color="#94A3B8" />
                    <Text variant="titleMedium" style={styles.sectionTitle}>Teks Diekstrak</Text>
                </View>
                <Surface style={styles.textCard} elevation={0}>
                    <Text style={styles.extractedText}>"{result.extracted_text || 'Tidak terbaca jelas'}"</Text>
                </Surface>

                <View style={styles.sectionHeader}>
                    <Feather name="check-circle" size={20} color="#10B981" />
                    <Text variant="titleMedium" style={styles.sectionTitle}>Kekuatan (Strengths)</Text>
                </View>
                <View style={styles.chipContainer}>
                    {result.strengths?.map((item, index) => (
                        <View key={index} style={styles.chipItemWrapper}>
                            <View style={styles.chipDotGreen} />
                            <Text style={styles.chipTextValue}>{item}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.sectionHeader}>
                    <Feather name="alert-circle" size={20} color="#F43F5E" />
                    <Text variant="titleMedium" style={styles.sectionTitle}>Area Pengembangan</Text>
                </View>
                <View style={styles.chipContainer}>
                    {result.weaknesses?.map((item, index) => (
                        <View key={index} style={styles.chipItemWrapper}>
                            <View style={styles.chipDotRed} />
                            <Text style={styles.chipTextValue}>{item}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.sectionHeader}>
                    <Feather name="briefcase" size={20} color="#3B82F6" />
                    <Text variant="titleMedium" style={styles.sectionTitle}>Rekomendasi Karir</Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 }}>
                    {result.career_recommendations?.map((item, index) => (
                        <View key={index} style={styles.careerPill}>
                            <Text style={styles.careerPillText}>{item}</Text>
                        </View>
                    ))}
                </View>

            </ScrollView>
            <Surface style={styles.footer} elevation={5}>
                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('Dashboard')}
                    style={styles.doneBtn}
                    labelStyle={styles.doneBtnText}
                    buttonColor="#4F46E5"
                >
                    Selesai & Kembali ke Dashboard
                </Button>
            </Surface>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 24, paddingBottom: 40 },
    header: { alignItems: 'center', marginBottom: 32, marginTop: 10 },
    headerIconWrap: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    title: { fontWeight: '800', color: '#1E293B', marginBottom: 6 },
    subtitle: { color: '#64748B', fontSize: 14 },
    mainCard: { borderRadius: 24, marginBottom: 32, overflow: 'hidden', shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 },
    mainCardGradient: { padding: 24 },
    typeContainer: { flexDirection: 'row', alignItems: 'center' },
    typeIconBox: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
    boldTextWhite: { fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5 },
    dividerWhite: { marginVertical: 20, backgroundColor: 'rgba(255,255,255,0.2)', height: 1 },
    dividerVertical: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 8 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    col: { flex: 1 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    sectionTitle: { fontWeight: 'bold', color: '#1E293B' },
    textCard: { padding: 20, borderRadius: 20, backgroundColor: '#F8FAFC', marginBottom: 32, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' },
    extractedText: { color: '#475569', fontStyle: 'italic', lineHeight: 24, fontSize: 15 },
    chipContainer: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 32, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    chipItemWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingRight: 8 },
    chipDotGreen: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 12, marginTop: 2 },
    chipDotRed: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F43F5E', marginRight: 12, marginTop: 2 },
    chipTextValue: { color: '#334155', fontSize: 15, lineHeight: 22, flex: 1 },
    careerPill: { backgroundColor: '#EEF2FF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#DBEAFE' },
    careerPillText: { color: '#4F46E5', fontWeight: '600', fontSize: 14 },
    footer: { padding: 24, paddingBottom: Platform.OS === 'ios' ? 34 : 24, backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32 },
    doneBtn: { borderRadius: 16, height: 56, justifyContent: 'center' },
    doneBtnText: { fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
});
