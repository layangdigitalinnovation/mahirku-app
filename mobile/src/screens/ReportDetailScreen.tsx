import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../components/basic/Card';
import PrimaryButton from '../components/basic/PrimaryButton';
import { Feather, Ionicons } from '@expo/vector-icons';
import { downloadCertificate as downloadCertApi } from '../api/certificate';

export default function ReportDetailScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const r = route?.params?.report as { title: string; date: string; summary: string; type: string; fullData?: any } | undefined;
  const thinkingStyle = r?.fullData?.thinkingStyle;
  const [downloading, setDownloading] = useState(false);
  const dlCert = async () => {
    try {
      const testId = r?.fullData?.id;
      if (!testId) {
        Alert.alert('Gagal', 'ID hasil tes tidak ditemukan');
        return;
      }
      setDownloading(true);
      await downloadCertApi(Number(testId));
      Alert.alert('Berhasil', 'Sertifikat berhasil diunduh dan siap dibagikan.');
    } catch (error: any) {
      Alert.alert('Gagal', error?.message || 'Gagal mengunduh sertifikat');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Pressable style={styles.backBtn} android_ripple={{ color: '#E2E8F0' }} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color="#475569" />
        </Pressable>
        <Text style={styles.topTitle}>Detail Laporan</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: insets.bottom + 48 }}>
        <Card style={styles.detailCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <View style={styles.testIconWrap}><Feather name="activity" size={24} color="#4F46E5" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{r?.title || 'Test Result'}</Text>
              <Text style={styles.itemDate}>{r?.date || ''}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Thinking Style Type */}
          {thinkingStyle?.type && (
            <>
              <Text style={styles.sectionHeader}>Tipe Gaya Berpikir</Text>
              <View style={styles.typeCard}>
                <Text style={styles.typeText}>{thinkingStyle.type}</Text>
                <Text style={styles.codeText}>({thinkingStyle.code})</Text>
              </View>
            </>
          )}

          {/* Description */}
          {thinkingStyle?.description && (
            <>
              <Text style={[styles.sectionHeader, { marginTop: 24 }]}>Deskripsi</Text>
              <Text style={styles.descriptionText}>{thinkingStyle.description}</Text>
            </>
          )}

          {/* Theory */}
          {thinkingStyle?.theory && (
            <>
              <Text style={[styles.sectionHeader, { marginTop: 24 }]}>Landasan Teori</Text>
              <Text style={styles.theoryText}>{thinkingStyle.theory}</Text>
            </>
          )}

          {/* Tidak menampilkan breakdown 60/40 ke pengguna, hanya hasil akhir di atas */}

          <PrimaryButton
            title="Download Sertifikat"
            leftIcon={<Feather name="download" size={18} color="#FFFFFF" />}
            onPress={dlCert}
            style={{ marginTop: 32, backgroundColor: '#4F46E5', borderRadius: 12, height: 48 }}
            loading={downloading}
          />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#F8FAFC' },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  topTitle: { color: '#1E293B', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  detailCard: { padding: 24, borderRadius: 24, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  testIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  itemTitle: { color: '#1E293B', fontWeight: '700', fontSize: 18 },
  itemDate: { color: '#64748B', fontSize: 14, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 20 },
  sectionHeader: { color: '#0F172A', fontWeight: '700', fontSize: 16, marginBottom: 12 },
  itemSubtitle: { color: '#64748B', fontSize: 15, lineHeight: 24 },
  typeCard: {
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#4F46E5',
    alignItems: 'center'
  },
  typeText: {
    color: '#4F46E5',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center'
  },
  codeText: {
    color: '#818CF8',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4
  },
  descriptionText: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'justify'
  },
  theoryText: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'justify',
    fontStyle: 'italic'
  },
  metric: { flex: 1, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, paddingVertical: 16, alignItems: 'center', backgroundColor: '#F8FAFC' },
  metricLabel: { color: '#64748B', fontSize: 13, fontWeight: '500' },
  metricValue: { color: '#4F46E5', fontWeight: '800', fontSize: 18, marginTop: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#DCFCE7', borderRadius: 6, marginTop: 4 },
  statusText: { color: '#16A34A', fontWeight: '700', fontSize: 13 },
});
