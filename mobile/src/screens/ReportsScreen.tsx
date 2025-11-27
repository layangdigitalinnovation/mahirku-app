import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getHistory, downloadPDF, ThinkingStyleResult } from '../api/thinkingStyle';
import Card from '../components/basic/Card';
import TextField from '../components/basic/TextField';
import PrimaryButton from '../components/basic/PrimaryButton';
import BottomTabs from '../components/navigation/BottomTabs';
import { Feather } from '@expo/vector-icons';

type Report = { id: string; title: string; date: string; summary: string; type: 'cst' | 'disc' | 'grp' };

export default function ReportsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  // Fetch test history from API
  const { data: historyData, isLoading, refetch } = useQuery({
    queryKey: ['testHistory'],
    queryFn: async () => {
      const response = await getHistory();
      return response.data.data;
    },
    retry: false,
  });

  const filtered = useMemo(() => {
    if (!historyData) return [];
    const byQ = q.trim().toLowerCase();
    const s = start ? new Date(start).getTime() : 0;
    const e = end ? new Date(end).getTime() : Number.MAX_SAFE_INTEGER;

    return historyData.filter((item: ThinkingStyleResult) => {
      const matchQ = !byQ ||
        item.thinkingStyle?.type.toLowerCase().includes(byQ) ||
        item.thinkingStyle?.code.toLowerCase().includes(byQ);
      const t = new Date(item.createdAt).getTime();
      const matchDate = (!start && !end) || (t >= s && t <= e);
      return matchQ && matchDate;
    });
  }, [historyData, q, start, end]);

  const goDetail = (item: ThinkingStyleResult) => navigation.navigate('ReportDetail', {
    report: {
      id: item.id.toString(),
      title: 'Cognitive Style Test',
      date: new Date(item.createdAt).toLocaleDateString('id-ID'),
      summary: `${item.thinkingStyle?.type} (${item.thinkingStyle?.code})`,
      type: 'cst',
      fullData: item
    }
  });

  const dlCert = async (item: ThinkingStyleResult) => {
    // Implement PDF download
    // Note: downloadPDF returns blob, you'd need to handle file saving on mobile
    console.log('Download PDF for result:', item.id);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 48 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        <Text style={styles.pageTitle}>Reports</Text>
        <Text style={styles.pageSubtitle}>Riwayat hasil tes Anda</Text>

        <View style={{ marginTop: 24, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={styles.searchContainer}>
              <Feather name="search" size={20} color="#94A3B8" style={{ marginLeft: 16 }} />
              <TextField
                value={q}
                onChangeText={setQ}
                placeholder="Cari laporan..."
                containerStyle={{ flex: 1, borderWidth: 0, backgroundColor: 'transparent' }}
                inputStyle={{ height: 52, paddingHorizontal: 12, borderWidth: 0, backgroundColor: 'transparent' }}
              />
            </View>
            <PrimaryButton
              title=""
              leftIcon={<Feather name="filter" size={20} color={showFilter ? "#FFFFFF" : "#4F46E5"} />}
              onPress={() => setShowFilter(!showFilter)}
              style={{ width: 52, height: 52, backgroundColor: showFilter ? '#4F46E5' : '#FFFFFF', borderWidth: 1, borderColor: showFilter ? '#4F46E5' : '#E2E8F0', borderRadius: 16, paddingHorizontal: 0 }}
              variant={showFilter ? 'primary' : 'secondary'}
            />
          </View>

          {showFilter && (
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16, padding: 16, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9' }}>
              <TextField label="Start Date" value={start} onChangeText={setStart} placeholder="YYYY-MM-DD" containerStyle={{ flex: 1 }} />
              <TextField label="End Date" value={end} onChangeText={setEnd} placeholder="YYYY-MM-DD" containerStyle={{ flex: 1 }} />
            </View>
          )}
        </View>

        {isLoading ? (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ color: '#94A3B8', fontSize: 14 }}>Memuat...</Text>
          </View>
        ) : filtered.length > 0 ? (
          filtered.map((item: ThinkingStyleResult) => {
            const date = new Date(item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
            return (
              <Card key={item.id} style={styles.reportCard}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={styles.testIconWrap}>
                    <Feather name="activity" size={20} color="#4F46E5" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 4 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Text style={styles.itemTitle}>Cognitive Style Test</Text>
                      <View style={styles.dateBadge}>
                        <Text style={styles.itemDate}>{date}</Text>
                      </View>
                    </View>
                    <Text style={styles.itemSubtitle}>{item.thinkingStyle?.type} ({item.thinkingStyle?.code})</Text>

                    <View style={styles.actionRow}>
                      <PrimaryButton title="Detail" onPress={() => goDetail(item)} style={styles.actionBtn} textStyle={styles.actionBtnText} variant="secondary" />
                      <PrimaryButton title="Sertifikat" leftIcon={<Feather name="download" size={14} color="#FFFFFF" />} onPress={() => dlCert(item)} style={[styles.actionBtn, { backgroundColor: '#4F46E5', borderColor: '#4F46E5' }]} textStyle={[styles.actionBtnText, { color: '#FFFFFF' }]} />
                    </View>
                  </View>
                </View>
              </Card>
            );
          })
        ) : (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ color: '#94A3B8', fontSize: 14 }}>Belum ada riwayat tes</Text>
          </View>
        )}
      </ScrollView>

      <BottomTabs
        tabs={[
          { key: 'home', label: 'Home', icon: 'home' },
          { key: 'tests', label: 'Tests', icon: 'grid' },
          { key: 'reports', label: 'Reports', icon: 'file-text' },
          { key: 'profile', label: 'Profile', icon: 'user' },
        ]}
        activeIndex={2}
        onChange={(i) => {
          const keys = ['home', 'tests', 'reports', 'profile'];
          const key = keys[i];
          if (key === 'home') navigation.replace('Dashboard');
          if (key === 'tests') navigation.replace('Tests');
          if (key === 'profile') navigation.replace('Profile');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pageTitle: { color: '#0F172A', fontWeight: '700', fontSize: 24, letterSpacing: -0.5 },
  pageSubtitle: { color: '#64748B', fontSize: 15, marginTop: 4 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', height: 52, overflow: 'hidden' },
  reportCard: { padding: 16, marginBottom: 16, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  testIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  itemTitle: { color: '#1E293B', fontWeight: '700', fontSize: 16, flex: 1 },
  itemSubtitle: { color: '#64748B', marginTop: 4, fontSize: 14, lineHeight: 20, marginBottom: 16 },
  dateBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9' },
  itemDate: { color: '#64748B', fontSize: 12, fontWeight: '500' },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, height: 36, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  actionBtnText: { fontSize: 13, fontWeight: '600' },
});
