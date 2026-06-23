import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, Button, Surface, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { DiscResultData, getDiscAiReport } from '../api/disc';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import ShareResultModal from '../components/ui/ShareResultModal';
import { buildShareCaption, shareResultPosterPDF, shareResultText } from '../utils/testResultShare';

export default function DiscResultScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { result } = route.params as { result: DiscResultData };
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [shareOpen, setShareOpen] = useState(false);

  const { data: aiReportRes } = useQuery({
    queryKey: ['discAiReport', result?.id],
    queryFn: () => getDiscAiReport(result?.id!),
    enabled: !!result?.id,
    refetchInterval: (q: any) => {
      const status = q?.state?.data?.data?.data?.status;
      if (!status || status === 'pending' || status === 'processing') return 3000;
      return false;
    },
  });
  const effectiveDiscAiReport = aiReportRes?.data?.data?.report;

  const me = queryClient.getQueryData<any>(['me']);
  const userName = me?.user?.fullname || 'Pengguna';

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = { D: 'Dominance', I: 'Influence', S: 'Steadiness', C: 'Compliance' };
    return map[type] || type;
  };

  const getTypeDescription = (type: string) => {
    const map: Record<string, string> = {
      D: 'Tegas, fokus hasil, berani mengambil keputusan, dan suka tantangan.',
      I: 'Komunikatif, antusias, ekspresif, dan mudah membangun relasi.',
      S: 'Tenang, sabar, konsisten, suportif, dan menyukai stabilitas.',
      C: 'Teliti, analitis, sistematis, dan berorientasi pada akurasi.',
    };
    return map[type] || '';
  };

  const shareTheme = useMemo(() => ({ a: '#0EA5E9', b: '#38BDF8' }), []);
  const sharePrimary = result?.dominantType || 'DISC';
  const shareSecondary = `${result?.dominantType || ''} (${getTypeLabel(result?.dominantType || '')})`;
  const shareHighlights = useMemo(
    () => [
      typeof result?.dScore === 'number' ? `D: ${result.dScore}` : '',
      typeof result?.iScore === 'number' ? `I: ${result.iScore}` : '',
      typeof result?.sScore === 'number' ? `S: ${result.sScore}` : '',
      typeof result?.cScore === 'number' ? `C: ${result.cScore}` : '',
    ].filter(Boolean),
    [result?.cScore, result?.dScore, result?.iScore, result?.sScore]
  );

  const shareCaption = useMemo(
    () =>
      buildShareCaption({
        type: 'disc',
        userName,
        createdAtISO: new Date().toISOString(),
        primary: sharePrimary,
        secondary: shareSecondary,
        highlights: shareHighlights,
        description: getTypeDescription(result?.dominantType || ''),
      }),
    [shareHighlights, sharePrimary, shareSecondary, userName, result?.dominantType]
  );

  const maxScore = Math.max(1, result?.dScore || 0, result?.iScore || 0, result?.sScore || 0, result?.cScore || 0, 40);

  const ScoreBar = ({ label, score, color }: { label: string; score: number; color: string }) => (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ color: '#334155', fontWeight: '700' }}>{label}</Text>
        <Text style={{ color, fontWeight: '900' }}>{score}</Text>
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${Math.min(100, (score / maxScore) * 100)}%`, backgroundColor: color }]} />
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <LinearGradient colors={['#E0F2FE', '#F1F5F9', '#F8FAFC']} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />

      <ScrollView contentContainerStyle={{ paddingTop: 20, paddingBottom: 40, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIconWrap}>
            <MaterialCommunityIcons name="account-group" size={34} color="#0EA5E9" />
          </View>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            DISC Personality
          </Text>
          <Text variant="bodySmall" style={styles.headerSubtitle}>
            Profil kepribadian dan gaya interaksi Anda
          </Text>
        </View>

        <Surface style={styles.mainCard} elevation={0}>
          <LinearGradient colors={['#0EA5E9', '#38BDF8']} style={styles.mainCardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.whiteLabel}>DOMINANT TYPE</Text>
                <Text style={styles.whitePrimary}>{result?.dominantType}</Text>
                <Text style={styles.whiteSecondary}>{getTypeLabel(result?.dominantType || '')}</Text>
              </View>
              <View style={styles.typeCircle}>
                <Text style={styles.typeText}>{result?.dominantType}</Text>
              </View>
            </View>

            <View style={styles.dividerWhite} />

            <Text style={styles.whiteDesc}>{getTypeDescription(result?.dominantType || '')}</Text>
          </LinearGradient>
        </Surface>

        <Surface style={styles.card} elevation={0}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Feather name="bar-chart-2" size={18} color="#0EA5E9" />
            </View>
            <Text style={styles.cardTitle}>Skor Detail</Text>
          </View>
          <ScoreBar label="Dominance (D)" score={result?.dScore || 0} color="#FB7185" />
          <ScoreBar label="Influence (I)" score={result?.iScore || 0} color="#60A5FA" />
          <ScoreBar label="Steadiness (S)" score={result?.sScore || 0} color="#FBBF24" />
          <ScoreBar label="Compliance (C)" score={result?.cScore || 0} color="#34D399" />
        </Surface>

        {effectiveDiscAiReport && (
          <View style={{ marginTop: 24, marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: '#0F172A', marginBottom: 16 }}>Detail Laporan Assessment</Text>
            
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Ringkasan Profil</Text>
              <Text style={styles.blockBody}>{effectiveDiscAiReport.profile_summary}</Text>
            </View>

            <View style={styles.block}>
              <Text style={styles.blockTitle}>Gaya Komunikasi Utama</Text>
              <Text style={styles.blockBody}>{effectiveDiscAiReport.communication_style}</Text>
            </View>

            {Array.isArray(effectiveDiscAiReport.behavior_traits) && effectiveDiscAiReport.behavior_traits.length > 0 && (
              <View style={styles.block}>
                <Text style={styles.blockTitle}>Karakter Perilaku</Text>
                <View style={{ gap: 8, marginTop: 10 }}>
                  {effectiveDiscAiReport.behavior_traits.map((it: string, idx: number) => (
                    <View key={`trait-${idx}`} style={styles.bulletRow}>
                      <View style={styles.bulletDot} />
                      <Text style={styles.bulletText}>{it}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {Array.isArray(effectiveDiscAiReport.strengths) && effectiveDiscAiReport.strengths.length > 0 && (
              <View style={styles.block}>
                <Text style={styles.blockTitle}>Kekuatan Utama</Text>
                <View style={{ gap: 8, marginTop: 10 }}>
                  {effectiveDiscAiReport.strengths.map((it: string, idx: number) => (
                    <View key={`str-${idx}`} style={styles.bulletRow}>
                      <Feather name="check" size={16} color="#10B981" />
                      <Text style={styles.bulletText}>{it}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {Array.isArray(effectiveDiscAiReport.challenges) && effectiveDiscAiReport.challenges.length > 0 && (
              <View style={styles.block}>
                <Text style={styles.blockTitle}>Titik Buta (Blind Spots)</Text>
                <View style={{ gap: 8, marginTop: 10 }}>
                  {effectiveDiscAiReport.challenges.map((it: string, idx: number) => (
                    <View key={`chal-${idx}`} style={styles.bulletRow}>
                      <Feather name="alert-triangle" size={16} color="#F59E0B" />
                      <Text style={styles.bulletText}>{it}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.block}>
              <Text style={styles.blockTitle}>Lingkungan Kerja Ideal</Text>
              <Text style={styles.blockBody}>{effectiveDiscAiReport.work_environment}</Text>
            </View>

            {Array.isArray(effectiveDiscAiReport.career_recommendations) && effectiveDiscAiReport.career_recommendations.length > 0 && (
              <View style={styles.block}>
                <Text style={styles.blockTitle}>Rekomendasi Karir Digital</Text>
                <View style={{ gap: 8, marginTop: 10 }}>
                  {effectiveDiscAiReport.career_recommendations.map((it: string, idx: number) => (
                    <View key={`car-${idx}`} style={styles.bulletRow}>
                      <MaterialCommunityIcons name="briefcase-outline" size={16} color="#0EA5E9" />
                      <Text style={styles.bulletText}>{it}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <Surface style={styles.footer} elevation={5}>
        <Button
          mode="contained-tonal"
          onPress={() => setShareOpen(true)}
          style={styles.shareBtn}
          labelStyle={styles.shareBtnText}
          textColor="#0EA5E9"
        >
          Bagikan Hasil
        </Button>
        <Button mode="contained" onPress={() => navigation.navigate('Dashboard')} style={styles.doneBtn} labelStyle={styles.doneBtnText} buttonColor="#0EA5E9">
          Selesai & Kembali ke Dashboard
        </Button>
      </Surface>

      <ShareResultModal
        visible={shareOpen}
        onClose={() => setShareOpen(false)}
        title="DISC Personality"
        subtitle="Profil Kepribadian"
        primary={sharePrimary}
        secondary={shareSecondary}
        theme={shareTheme}
        caption={shareCaption}
        onSharePoster={() =>
          shareResultPosterPDF({
            type: 'disc',
            userName,
            createdAtISO: new Date().toISOString(),
            primary: sharePrimary,
            secondary: shareSecondary,
            highlights: shareHighlights,
            description: getTypeDescription(result?.dominantType || ''),
          })
        }
        onShareText={() =>
          shareResultText({
            type: 'disc',
            userName,
            createdAtISO: new Date().toISOString(),
            primary: sharePrimary,
            secondary: shareSecondary,
            highlights: shareHighlights,
            description: getTypeDescription(result?.dominantType || ''),
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginTop: 10, marginBottom: 24 },
  headerIconWrap: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center', marginBottom: 14, borderWidth: 1, borderColor: '#BAE6FD' },
  headerTitle: { fontWeight: '900', color: '#0F172A', marginBottom: 6 },
  headerSubtitle: { color: '#64748B', textAlign: 'center' },

  mainCard: { borderRadius: 24, overflow: 'hidden', marginBottom: 18, shadowColor: '#0EA5E9', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.18, shadowRadius: 20, elevation: 8 },
  mainCardGradient: { padding: 22 },
  whiteLabel: { color: 'rgba(255,255,255,0.85)', fontWeight: '900', letterSpacing: 1.6, fontSize: 12 },
  whitePrimary: { color: '#FFFFFF', fontWeight: '900', fontSize: 44, lineHeight: 48, marginTop: 6 },
  whiteSecondary: { color: 'rgba(255,255,255,0.92)', fontWeight: '800', fontSize: 14, marginTop: 4 },
  whiteDesc: { color: 'rgba(255,255,255,0.92)', fontSize: 14, lineHeight: 22, marginTop: 6 },
  dividerWhite: { height: 1, backgroundColor: 'rgba(255,255,255,0.22)', marginVertical: 16 },
  typeCircle: { width: 96, height: 96, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.20)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', alignItems: 'center', justifyContent: 'center' },
  typeText: { color: '#FFFFFF', fontWeight: '900', fontSize: 44 },

  card: { borderRadius: 24, padding: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  cardIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#BAE6FD' },
  cardTitle: { fontWeight: '900', color: '#0F172A', fontSize: 16 },

  barBg: { height: 10, borderRadius: 999, backgroundColor: '#EEF2FF', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999 },

  footer: { padding: 24, paddingBottom: Platform.OS === 'ios' ? 34 : 24, backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, gap: 10 },
  shareBtn: { borderRadius: 16, height: 52, justifyContent: 'center', backgroundColor: '#E0F2FE' },
  shareBtnText: { fontSize: 15, fontWeight: 'bold', letterSpacing: 0.2 },
  doneBtn: { borderRadius: 16, height: 56, justifyContent: 'center' },
  doneBtnText: { fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },

  block: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 2 },
  blockTitle: { fontWeight: '800', color: '#0F172A', fontSize: 15, marginBottom: 8 },
  blockBody: { color: '#475569', fontSize: 14, lineHeight: 24 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0EA5E9', marginTop: 8, marginRight: 10 },
  bulletText: { flex: 1, color: '#475569', fontSize: 14, lineHeight: 22 },
});
