import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../components/basic/Card';
import PrimaryButton from '../components/basic/PrimaryButton';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { generateCertificatePDF } from '../utils/certificateGenerator';
import { meApi } from '../api/auth';
import { useQuery } from '@tanstack/react-query';


export default function ReportDetailScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const r = route?.params?.report as { title: string; date: string; summary: string; type: string; fullData?: any } | undefined;
  const thinkingStyle = r?.fullData?.thinkingStyle;
  const combine = (route?.params?.report as any)?.combine as { finalPercent: number; fingerprintPercent?: number; questionnairePercent?: number; questionnaire?: any } | undefined;
  const fromFingerprint = route?.params?.fromFingerprint as boolean | undefined;
  const fpType = thinkingStyle?.type as string | undefined;
  const q = combine?.questionnaire as any;
  const eLetter = q?.eiType === 'Ekstrovert' ? 'E' : 'I';
  const qLabel = q ? `${q.tipeUtama}${q.tipeUtama === 'Navigator' ? '' : `-${eLetter}`}` : '';
  const sameType = Boolean(fpType && q?.tipeUtama && fpType === q.tipeUtama);
  const [downloading, setDownloading] = useState(false);

  // Helper function to get full DISC type name
  const getDiscFullName = (code: string): string => {
    const typeMap: { [key: string]: string } = {
      'D': 'Dominance',
      'I': 'Influence',
      'S': 'Steadiness',
      'C': 'Compliance'
    };
    return typeMap[code] || code;
  };

  // Helper function to get DISC type description
  const getDiscDescription = (code: string): string => {
    const descMap: { [key: string]: string } = {
      'D': 'Direct, results-oriented, firm, strong-willed, forceful.',
      'I': 'Outgoing, enthusiastic, optimistic, high-spirited, lively.',
      'S': 'Even-tempered, accommodating, patient, humble, tactful.',
      'C': 'Analytical, reserved, precise, private, systematic.'
    };
    return descMap[code] || '';
  };

  const { data: userData } = useQuery({
    queryKey: ['me'],
    queryFn: async () => (await meApi()).data,
    enabled: false, // Lazy load manually if needed, or rely on cache
  });

  const dlCert = async () => {
    try {
      if (!r?.fullData) {
        Alert.alert('Gagal', 'Data laporan tidak lengkap');
        return;
      }

      setDownloading(true);

      const isDisc = r.type === 'disc';
      const courseName = isDisc ? 'DISC Personality Test' : 'Cognitive Style Test';

      // Try to get fullname from params/data first
      let studentName = (r as any).fullname || r.fullData.fullname;

      // If missing, check if it's "Student" or empty, and try to fetch current user
      if (!studentName || studentName === 'Student') {
        try {
          // Use cached data if available or fetch fresh
          const meRes = await meApi();
          if (meRes.data?.user?.fullname) {
            studentName = meRes.data.user.fullname;
          }
        } catch (e) {
          console.log('Failed to fetch me fallback', e);
        }
      }

      // Fallback only if absolutely everything fails
      studentName = studentName || 'Student';

      const certId = `${isDisc ? 'DISC' : 'CST'}-${r.fullData.id}-${new Date().getFullYear()}`;

      // Get result title
      let resultTitle = '';
      if (isDisc) {
        const code = r.fullData.thinkingStyle?.code || '';
        const fullName = getDiscFullName(code);
        resultTitle = `${code} (${fullName})`;
      } else {
        resultTitle = `${r.fullData.thinkingStyle?.type || ''} (${r.fullData.thinkingStyle?.code || ''})`;
      }

      // Format the date properly for the certificate
      const dateObj = new Date(r.fullData.createdAt || r.fullData.created_at);
      const formattedDate = isDisc ? '' : dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      await generateCertificatePDF({
        studentName,
        courseName,
        completionDate: formattedDate,
        certificateId: certId,
        resultTitle
      });

    } catch (error: any) {
      Alert.alert('Gagal', error?.message || 'Gagal membuat sertifikat');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <LinearGradient
        colors={['#EEF2FF', '#F1F5F9', '#F8FAFC']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Pressable style={styles.backBtn} android_ripple={{ color: '#E2E8F0' }} onPress={() => (fromFingerprint ? navigation.replace('Dashboard') : navigation.goBack())}>
          <Ionicons name="chevron-back" size={22} color="#1E293B" />
        </Pressable>
        <Text style={styles.topTitle}>Detail Laporan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: insets.bottom + 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.detailCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <View style={styles.testIconWrap}>
              <MaterialCommunityIcons name="brain" size={28} color="#4F46E5" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{r?.title || 'Test Result'}</Text>
              {r?.type !== 'disc' && <Text style={styles.itemDate}>{r?.date || ''}</Text>}
            </View>
          </View>

          <View style={styles.divider} />

          {/* DISC Test Specific Display */}
          {r?.type === 'disc' && r?.fullData && (
            <>
              {/* DISC Dominant Type Circle */}
              <View style={{ alignItems: 'center', marginVertical: 24 }}>
                <Text style={styles.discSectionLabel}>DOMINANT TYPE</Text>
                <View style={styles.discCircle}>
                  <Text style={styles.discCircleText}>{r.fullData.thinkingStyle?.code || 'I'}</Text>
                </View>
                <Text style={styles.discTypeName}>
                  {getDiscFullName(r.fullData.thinkingStyle?.code || 'I')}: {getDiscDescription(r.fullData.thinkingStyle?.code || 'I')}
                </Text>
              </View>

              {/* DISC Detailed Scores */}
              <Text style={[styles.sectionHeader, { marginTop: 12, marginBottom: 16 }]}>Detailed Scores</Text>

              {/* Dominance */}
              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={styles.discScoreLabel}>Dominance (D)</Text>
                  <Text style={[styles.discScoreValue, { color: '#EF4444' }]}>{r.fullData.dScore || 0}</Text>
                </View>
                <View style={styles.scoreBarBg}>
                  <View style={[styles.scoreBar, { width: `${Math.min((r.fullData.dScore || 0) / 20 * 100, 100)}%`, backgroundColor: '#EF4444' }]} />
                </View>
              </View>

              {/* Influence */}
              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={styles.discScoreLabel}>Influence (I)</Text>
                  <Text style={[styles.discScoreValue, { color: '#3B82F6' }]}>{r.fullData.iScore || 0}</Text>
                </View>
                <View style={styles.scoreBarBg}>
                  <View style={[styles.scoreBar, { width: `${Math.min((r.fullData.iScore || 0) / 20 * 100, 100)}%`, backgroundColor: '#3B82F6' }]} />
                </View>
              </View>

              {/* Steadiness */}
              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={styles.discScoreLabel}>Steadiness (S)</Text>
                  <Text style={[styles.discScoreValue, { color: '#F59E0B' }]}>{r.fullData.sScore || 0}</Text>
                </View>
                <View style={styles.scoreBarBg}>
                  <View style={[styles.scoreBar, { width: `${Math.min((r.fullData.sScore || 0) / 20 * 100, 100)}%`, backgroundColor: '#F59E0B' }]} />
                </View>
              </View>

              {/* Compliance */}
              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={styles.discScoreLabel}>Compliance (C)</Text>
                  <Text style={[styles.discScoreValue, { color: '#10B981' }]}>{r.fullData.cScore || 0}</Text>
                </View>
                <View style={styles.scoreBarBg}>
                  <View style={[styles.scoreBar, { width: `${Math.min((r.fullData.cScore || 0) / 20 * 100, 100)}%`, backgroundColor: '#10B981' }]} />
                </View>
              </View>
            </>
          )}

          {/* Thinking Style Type (for CST) */}
          {r?.type !== 'disc' && thinkingStyle?.type && (
            <>
              <Text style={styles.sectionHeader}>Tipe Gaya Berpikir</Text>
              <LinearGradient
                colors={['#4F46E5', '#4338CA']}
                style={styles.typeCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.typeText}>{thinkingStyle.type}</Text>
                <Text style={styles.codeText}>({thinkingStyle.code})</Text>
              </LinearGradient>
            </>
          )}

          {/* Description (Only for non-DISC tests) */}
          {r?.type !== 'disc' && thinkingStyle?.description && (
            <>
              <Text style={[styles.sectionHeader, { marginTop: 28 }]}>Deskripsi</Text>
              <View style={styles.descCard}>
                <Text style={styles.descriptionText}>{thinkingStyle.description}</Text>
              </View>
            </>
          )}

          {/* Theory (Only for non-DISC tests) */}
          {r?.type !== 'disc' && thinkingStyle?.theory && (
            <>
              <Text style={[styles.sectionHeader, { marginTop: 28 }]}>Landasan Teori</Text>
              <View style={styles.theoryCard}>
                <Feather name="book-open" size={18} color="#64748B" style={{ marginBottom: 8 }} />
                <Text style={styles.theoryText}>{thinkingStyle.theory}</Text>
              </View>
            </>
          )}

          {/* Final Result (Only for non-DISC tests) */}
          {r?.type !== 'disc' && combine && (
            <>
              <Text style={[styles.sectionHeader, { marginTop: 28 }]}>Hasil Akhir</Text>
              <View style={styles.scoreCard}>
                <View style={{ marginTop: 4 }}>
                  {sameType ? (
                    <>
                      <Text style={styles.finalTypeLabel}>Tipe Gaya Berpikir Anda:</Text>
                      <Text style={styles.finalTypeValue}>{fpType}</Text>
                      <View style={styles.consistencyBadge}>
                        <Feather name="check-circle" size={14} color="#10B981" />
                        <Text style={styles.consistencyText}>Confidence</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.finalTypeLabel}>Tipe Gaya Berpikir Anda:</Text>
                      <Text style={styles.finalTypeValue}>{fpType}</Text>
                      <View style={styles.combinedNote}>
                        <Feather name="info" size={14} color="#64748B" />
                        <Text style={styles.combinedNoteText}>
                          Hasil dari kombinasi sidik jari dan kuesioner
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              </View>
            </>
          )}

          <PrimaryButton
            title="Download Sertifikat"
            leftIcon={<Feather name="download" size={18} color="#FFFFFF" />}
            onPress={dlCert}
            style={styles.downloadBtn}
            loading={downloading}
          />
        </Card>
      </ScrollView >
    </View >
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: 'transparent'
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2
  },
  topTitle: { color: '#1E293B', fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  detailCard: {
    padding: 28,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6
  },
  testIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#E0E7FF'
  },
  itemTitle: { color: '#1E293B', fontWeight: '700', fontSize: 20 },
  itemDate: { color: '#64748B', fontSize: 14, marginTop: 4, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 24 },
  sectionHeader: { color: '#1E293B', fontWeight: '700', fontSize: 17, marginBottom: 12 },
  itemSubtitle: { color: '#64748B', fontSize: 15, lineHeight: 24 },
  typeCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center'
  },
  codeText: {
    color: '#E0E7FF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 6
  },
  descCard: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  descriptionText: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 26,
    textAlign: 'justify'
  },
  theoryCard: {
    backgroundColor: '#FFFBEB',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7'
  },
  theoryText: {
    color: '#78350F',
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'justify',
    fontStyle: 'italic'
  },
  scoreCard: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  scoreLabel: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500'
  },
  finalTypeLabel: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8
  },
  finalTypeValue: {
    color: '#4F46E5',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12
  },
  consistencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#D1FAE5'
  },
  consistencyText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600'
  },
  combinedNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  combinedNoteText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500'
  },
  metric: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  metricLabel: { color: '#64748B', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  metricValue: { color: '#4F46E5', fontWeight: '800', fontSize: 20, marginTop: 8 },
  summaryCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    gap: 4
  },
  downloadBtn: {
    marginTop: 32,
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    height: 52,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4
  },
  // DISC Test Styles
  discSectionLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 16,
    textTransform: 'uppercase'
  },
  discCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#22D3EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#22D3EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6
  },
  discCircleText: {
    fontSize: 56,
    fontWeight: '800',
    color: '#22D3EE'
  },
  discTypeName: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 24
  },
  discScoreLabel: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '600'
  },
  discScoreValue: {
    fontSize: 16,
    fontWeight: '800'
  },
  scoreBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden'
  },
  scoreBar: {
    height: '100%',
    borderRadius: 4
  },
});
