import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { Text, Button, Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { GraphologyResultData } from '../../api/graphology';
import { LinearGradient } from 'expo-linear-gradient';
import { useQueryClient } from '@tanstack/react-query';
import ShareResultModal from '../../components/ui/ShareResultModal';
import { buildShareCaption, shareResultPosterPDF, shareResultText } from '../../utils/testResultShare';
import { generateGraphologyCertificatePDF } from '../../utils/graphologyCertificateGenerator';

export default function GraphologyResultScreen() {
    const theme = useTheme();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { result } = route.params as { result: GraphologyResultData };
    const queryClient = useQueryClient();
    const [shareOpen, setShareOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const me = queryClient.getQueryData<any>(['me']);
    const userName = route.params?.memberName || me?.user?.fullname || 'Pengguna';

    useEffect(() => {
        let t: any = undefined;
        (async () => {
            try {
                await queryClient.invalidateQueries({ queryKey: ['me'] });
                await queryClient.refetchQueries({ queryKey: ['me'] });
            } catch { }
            t = setTimeout(() => {
                queryClient.refetchQueries({ queryKey: ['me'] }).catch(() => { });
            }, 1200);
        })();
        return () => {
            if (t) clearTimeout(t);
        };
    }, [queryClient]);

    const handleDownloadCertificate = async () => {
        setIsDownloading(true);
        try {
            await generateGraphologyCertificatePDF({
                studentName: userName,
                completionDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                certificateId: result.type_id || 'GRP-8-UNKNOWN',
                typeId: result.type_id || 'GRP-8-TRLBLZ',
                title: result.title || 'Graphology',
                subtitle: result.subtitle || 'Analisis Kepribadian',
                matchScore: result.match_score || '100%',
                summary: result.summary || '',
                brainProcess: result.brain_process || '',
                workEnv: result.work_environment || '',
                traits: result.traits || [],
                strengths: result.strengths || [],
                challenges: result.challenges || [],
                careers: result.careers || [],
                collabTips: result.collab_tips || [],
                conflictRisks: result.conflict_risks || [],
                devTips: result.dev_tips || [],
            });
        } catch (error) {
            Alert.alert('Gagal', 'Terjadi kesalahan saat mengunduh sertifikat.');
        } finally {
            setIsDownloading(false);
        }
    };

    const shareTheme = useMemo(() => ({ a: '#8B5CF6', b: '#6366F1' }), []);
    const sharePrimary = result?.title || 'Graphology';
    const shareSecondary = result?.subtitle || '';
    const shareHighlights = useMemo(
        () => (result?.strengths || []).slice(0, 4),
        [result?.strengths]
    );
    const shareDescription = useMemo(
        () => `Kekuatan utama: ${(result?.strengths || []).slice(0, 3).join(', ')}. Cocok di bidang: ${(result?.careers || []).slice(0, 2).join(', ')}.`,
        [result?.strengths, result?.careers]
    );
    const shareCaption = useMemo(
        () =>
            buildShareCaption({
                type: 'grp',
                userName,
                createdAtISO: new Date().toISOString(),
                primary: sharePrimary,
                secondary: shareSecondary,
                highlights: shareHighlights,
                description: shareDescription,
            }),
        [shareHighlights, sharePrimary, shareSecondary, userName, shareDescription]
    );

    if (!result) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Hasil tidak ditemukan.</Text>
                <Button onPress={() => navigation.goBack()}>Kembali</Button>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <View style={styles.headerIconWrap}>
                        <MaterialCommunityIcons name="file-certificate" size={40} color="#4F46E5" />
                    </View>
                    <Text variant="headlineSmall" style={styles.title}>Detail Laporan Assessment</Text>
                    <Text variant="bodySmall" style={styles.subtitle}>Graphology & Talent Mapping</Text>
                </View>

                {/* Score Circle Card */}
                <View style={styles.enhancedCard}>
                    <View style={styles.enhancedTop}>
                        <View style={styles.enhancedIcon}>
                            <Feather name="star" size={18} color="#7C3AED" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.enhancedTitle}>
                                {result.title}
                            </Text>
                            <Text style={styles.enhancedSubtitle}>
                                {result.subtitle}
                            </Text>
                        </View>
                        {result.match_score && (
                            <View style={styles.enhancedBadge}>
                                <Text style={styles.enhancedBadgeText}>{result.match_score}</Text>
                            </View>
                        )}
                    </View>

                    {/* AI Details Details */}
                    {result.summary && (
                        <View style={styles.block}>
                            <Text style={styles.blockTitle}>Ringkasan Profil</Text>
                            <Text style={styles.blockBody}>{result.summary}</Text>
                        </View>
                    )}

                    {result.brain_process && (
                        <View style={styles.block}>
                            <Text style={styles.blockTitle}>Cara Otak Memproses Informasi</Text>
                            <Text style={styles.blockBody}>{result.brain_process}</Text>
                        </View>
                    )}

                    {result.traits && result.traits.length > 0 && (
                        <View style={styles.block}>
                            <Text style={styles.blockTitle}>Karakter Bawah Sadar</Text>
                            {result.traits.map((t, idx) => (
                                <View key={idx} style={styles.listItem}>
                                    <View style={styles.bulletPoint} />
                                    <Text style={styles.listItemText}>{t}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {result.strengths && result.strengths.length > 0 && (
                        <View style={[styles.block, styles.blockGreen]}>
                            <Text style={[styles.blockTitle, { color: '#047857' }]}>Kekuatan Utama</Text>
                            {result.strengths.map((t, idx) => (
                                <View key={idx} style={styles.listItem}>
                                    <Feather name="check" size={14} color="#059669" style={{ marginRight: 8, marginTop: 2 }} />
                                    <Text style={styles.listItemText}>{t}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {result.challenges && result.challenges.length > 0 && (
                        <View style={[styles.block, styles.blockAmber]}>
                            <Text style={[styles.blockTitle, { color: '#B45309' }]}>Titik Buta (Blind Spots)</Text>
                            {result.challenges.map((t, idx) => (
                                <View key={idx} style={styles.listItem}>
                                    <Feather name="alert-circle" size={14} color="#D97706" style={{ marginRight: 8, marginTop: 2 }} />
                                    <Text style={styles.listItemText}>{t}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {result.work_environment && (
                        <View style={styles.block}>
                            <Text style={styles.blockTitle}>Lingkungan Kerja Ideal</Text>
                            <Text style={styles.blockBody}>{result.work_environment}</Text>
                        </View>
                    )}

                    {result.careers && result.careers.length > 0 && (
                        <View style={styles.block}>
                            <Text style={styles.blockTitle}>Rekomendasi Karir Digital</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                {result.careers.map((t, idx) => (
                                    <View key={idx} style={styles.careerChip}>
                                        <Text style={styles.careerChipText}>{t}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {result.collab_tips && result.collab_tips.length > 0 && (
                        <View style={[styles.block, styles.blockBlue]}>
                            <Text style={[styles.blockTitle, { color: '#1D4ED8' }]}>Cara Berkolaborasi</Text>
                            {result.collab_tips.map((t, idx) => (
                                <View key={idx} style={styles.listItem}>
                                    <Feather name="users" size={14} color="#2563EB" style={{ marginRight: 8, marginTop: 2 }} />
                                    <Text style={styles.listItemText}>{t}</Text>
                                </View>
                            ))}
                            
                            {result.conflict_risks && result.conflict_risks.length > 0 && (
                                <>
                                    <View style={styles.blueDivider} />
                                    <Text style={[styles.blockTitle, { color: '#BE123C' }]}>Potensi Konflik</Text>
                                    {result.conflict_risks.map((t, idx) => (
                                        <View key={idx} style={styles.listItem}>
                                            <Feather name="zap" size={14} color="#E11D48" style={{ marginRight: 8, marginTop: 2 }} />
                                            <Text style={styles.listItemText}>{t}</Text>
                                        </View>
                                    ))}
                                </>
                            )}
                        </View>
                    )}

                    {result.dev_tips && result.dev_tips.length > 0 && (
                        <View style={[styles.block, styles.blockIndigo]}>
                            <Text style={[styles.blockTitle, { color: '#4338CA' }]}>Tips Pengembangan Diri</Text>
                            {result.dev_tips.map((t, idx) => (
                                <View key={idx} style={styles.listItem}>
                                    <Feather name="trending-up" size={14} color="#4F46E5" style={{ marginRight: 8, marginTop: 2 }} />
                                    <Text style={styles.listItemText}>{t}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {result.extracted_text && (
                    <View style={styles.extractedCard}>
                        <Text style={styles.extractedLabel}>Teks Diekstrak dari Gambar:</Text>
                        <Text style={styles.extractedText}>"{result.extracted_text}"</Text>
                    </View>
                )}

            </ScrollView>

            <Surface style={styles.footer} elevation={5}>
                <Button
                    mode="contained"
                    icon="download"
                    onPress={handleDownloadCertificate}
                    loading={isDownloading}
                    disabled={isDownloading}
                    style={styles.doneBtn}
                    labelStyle={styles.doneBtnText}
                    buttonColor="#4F46E5"
                >
                    Download Sertifikat
                </Button>
                <Button
                    mode="text"
                    onPress={() => navigation.navigate('Dashboard')}
                    textColor="#64748B"
                    style={{ marginTop: 4 }}
                >
                    Kembali ke Dashboard
                </Button>
            </Surface>
            
            <ShareResultModal
                visible={shareOpen}
                onClose={() => setShareOpen(false)}
                title="Graphology"
                subtitle="Analisis tulisan tangan"
                primary={sharePrimary}
                secondary={shareSecondary}
                theme={shareTheme}
                caption={shareCaption}
                onSharePoster={() =>
                    shareResultPosterPDF({
                        type: 'grp',
                        userName,
                        createdAtISO: new Date().toISOString(),
                        primary: sharePrimary,
                        secondary: shareSecondary,
                        highlights: shareHighlights,
                        description: shareDescription,
                    })
                }
                onShareText={() =>
                    shareResultText({
                        type: 'grp',
                        userName,
                        createdAtISO: new Date().toISOString(),
                        primary: sharePrimary,
                        secondary: shareSecondary,
                        highlights: shareHighlights,
                        description: shareDescription,
                    })
                }
            />
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
    
    enhancedCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, marginBottom: 24, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 5, borderWidth: 1, borderColor: '#F1F5F9' },
    enhancedTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    enhancedIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    enhancedTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
    enhancedSubtitle: { fontSize: 13, color: '#64748B', lineHeight: 18 },
    enhancedBadge: { backgroundColor: '#4F46E5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginLeft: 12 },
    enhancedBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
    
    block: { marginBottom: 20 },
    blockGreen: { backgroundColor: '#ECFDF5', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#D1FAE5' },
    blockAmber: { backgroundColor: '#FFFBEB', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#FEF3C7' },
    blockBlue: { backgroundColor: '#EFF6FF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#DBEAFE' },
    blockIndigo: { backgroundColor: '#EEF2FF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E0E7FF' },
    
    blockTitle: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 8, letterSpacing: 0.2 },
    blockBody: { fontSize: 13.5, color: '#475569', lineHeight: 22 },
    
    listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
    bulletPoint: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#64748B', marginTop: 8, marginRight: 10 },
    listItemText: { flex: 1, fontSize: 13.5, color: '#475569', lineHeight: 22 },
    
    careerChip: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
    careerChipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
    
    blueDivider: { height: 1, backgroundColor: '#BFDBFE', marginVertical: 12 },
    
    extractedCard: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' },
    extractedLabel: { fontSize: 12, fontWeight: '600', color: '#94A3B8', marginBottom: 8 },
    extractedText: { fontSize: 13, color: '#64748B', fontStyle: 'italic', lineHeight: 20 },

    footer: { padding: 24, paddingBottom: Platform.OS === 'ios' ? 34 : 24, backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, gap: 10 },
    doneBtn: { borderRadius: 16, height: 56, justifyContent: 'center' },
    doneBtnText: { fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
});
