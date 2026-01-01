import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getHistory, ThinkingStyleResult } from '../api/thinkingStyle';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Card from '../components/basic/Card';
import TextField from '../components/basic/TextField';
import PrimaryButton from '../components/basic/PrimaryButton';
import BottomTabs from '../components/navigation/BottomTabs';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

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

  // Helper function to get full DISC type name
  const getDiscTypeName = (code: string): string => {
    const typeMap: { [key: string]: string } = {
      'D': 'D - Dominance',
      'I': 'I - Influence',
      'S': 'S - Steadiness',
      'C': 'C - Compliance'
    };
    return typeMap[code] || code;
  };

  const goDetail = async (item: ThinkingStyleResult) => {
    let questionnaire: any = undefined;
    try {
      const qStr = await AsyncStorage.getItem('cst:lastQuestionnaire');
      questionnaire = qStr ? JSON.parse(qStr) : undefined;
    } catch { }

    const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
    const fingerprintPercent = clamp(Number(item.resultDigit ?? 0));
    const questionnairePercent = clamp(Number(questionnaire?.percent ?? 0));
    const finalPercent = clamp(0.6 * fingerprintPercent + 0.4 * questionnairePercent);

    navigation.navigate('ReportDetail', {
      report: {
        id: item.id.toString(),
        title: item.testType === 'DISC' ? 'DISC Test' : 'Cognitive Style Test',
        date: new Date(item.createdAt).toLocaleDateString('id-ID'),
        summary: item.testType === 'DISC'
          ? getDiscTypeName(item.thinkingStyle?.code || '')
          : `${item.thinkingStyle?.type} (${item.thinkingStyle?.code})`,
        type: item.testType === 'DISC' ? 'disc' : 'cst',
        fullData: item,
        combine: {
          finalPercent,
          fingerprintPercent,
          questionnairePercent,
          questionnaire,
        },
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <LinearGradient
        colors={['#EEF2FF', '#F1F5F9', '#F8FAFC']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        <Text style={styles.greetingText}>Riwayat</Text>
        <Text style={styles.pageTitle}>Reports</Text>
        <Text style={styles.pageSubtitle}>Lihat dan kelola riwayat hasil tes Anda</Text>

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
            <Pressable
              onPress={() => setShowFilter(!showFilter)}
              style={[styles.filterBtn, showFilter && styles.filterBtnActive]}
            >
              <Feather name="filter" size={20} color={showFilter ? "#FFFFFF" : "#4F46E5"} />
            </Pressable>
          </View>

          {showFilter && (
            <View style={styles.filterPanel}>
              <TextField label="Start Date" value={start} onChangeText={setStart} placeholder="YYYY-MM-DD" containerStyle={{ flex: 1 }} />
              <TextField label="End Date" value={end} onChangeText={setEnd} placeholder="YYYY-MM-DD" containerStyle={{ flex: 1 }} />
            </View>
          )}
        </View>

        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Memuat...</Text>
          </View>
        ) : filtered.length > 0 ? (
          <View style={{ gap: 16 }}>
            {filtered.map((item: ThinkingStyleResult) => {
              const date = new Date(item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
              return (
                <Card key={item.id} style={styles.reportCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <View style={styles.testIconWrap}>
                      <MaterialCommunityIcons name="brain" size={24} color="#4F46E5" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <Text style={styles.itemTitle}>
                          {item.testType === 'DISC' ? 'DISC Test' : 'Cognitive Style Test'}
                        </Text>
                        <View style={styles.dateBadge}>
                          <Text style={styles.itemDate}>{date}</Text>
                        </View>
                      </View>
                      <Text style={styles.itemSubtitle}>
                        {item.testType === 'DISC'
                          ? getDiscTypeName(item.thinkingStyle?.code || '')
                          : `${item.thinkingStyle?.type} (${item.thinkingStyle?.code})`
                        }
                      </Text>

                      <View style={styles.actionRow}>
                        <PrimaryButton
                          title="Lihat Detail"
                          onPress={() => goDetail(item)}
                          style={styles.detailBtn}
                          textStyle={styles.actionBtnText}
                          leftIcon={<Feather name="eye" size={14} color="#4F46E5" />}
                        />
                      </View>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
              <Feather name="inbox" size={32} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Riwayat</Text>
            <Text style={styles.emptyText}>Anda belum memiliki riwayat tes. Mulai tes untuk melihat hasilnya di sini.</Text>
            <PrimaryButton
              title="Mulai Tes"
              leftIcon={<Feather name="play-circle" size={18} color="#FFFFFF" />}
              onPress={() => navigation.navigate('Tests')}
              style={styles.emptyBtn}
            />
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
  greetingText: { color: '#64748B', fontSize: 14, fontWeight: '500', marginBottom: 4 },
  pageTitle: { color: '#1E293B', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  pageSubtitle: { color: '#64748B', fontSize: 15, marginTop: 6, lineHeight: 22 },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 52,
    overflow: 'hidden',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  filterBtn: {
    width: 52,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  filterBtnActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  filterPanel: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2
  },
  reportCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4
  },
  testIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  itemTitle: { color: '#1E293B', fontWeight: '700', fontSize: 17, flex: 1 },
  itemSubtitle: { color: '#64748B', fontSize: 14, lineHeight: 20, marginBottom: 16 },
  dateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  itemDate: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 12 },
  detailBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4F46E5',
    backgroundColor: '#FFFFFF'
  },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: '#4F46E5' },
  emptyState: {
    padding: 48,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginTop: 20
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  emptyTitle: {
    color: '#1E293B',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24
  },
  emptyBtn: {
    backgroundColor: '#4F46E5',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 32
  },
});
