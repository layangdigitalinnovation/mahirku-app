import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getUserInvoices, Invoice as ApiInvoice } from '../api/invoice';
import Card from '../components/basic/Card';
import TextField from '../components/basic/TextField';
import PrimaryButton from '../components/basic/PrimaryButton';
import { Feather, Ionicons } from '@expo/vector-icons';

type Invoice = { id: string; date: string; tokens: number; amount: number; method: string; status: 'paid' | 'pending' | 'failed' };

export default function InvoiceHistoryScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  // Fetch invoices from API
  const { data: invoicesData, isLoading, refetch } = useQuery({
    queryKey: ['userInvoices'],
    queryFn: async () => {
      const data = await getUserInvoices();
      console.log('Invoice data received:', JSON.stringify(data, null, 2));
      return data;
    },
    retry: false,
  });

  const filtered = useMemo(() => {
    if (!invoicesData) return [];
    const kw = q.trim().toLowerCase();
    const s = start ? new Date(start).getTime() : 0;
    const e = end ? new Date(end).getTime() : Number.MAX_SAFE_INTEGER;

    return invoicesData.filter((invoice: ApiInvoice) => {
      const matchQ = !kw ||
        `INV-${invoice.id}`.toLowerCase().includes(kw) ||
        invoice.status?.toLowerCase().includes(kw) ||
        invoice.Package?.name?.toLowerCase().includes(kw);
      const t = new Date(invoice.createdAt).getTime();
      const matchDate = (!start && !end) || (t >= s && t <= e);
      return matchQ && matchDate;
    });
  }, [invoicesData, q, start, end]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Pressable style={styles.backBtn} android_ripple={{ color: '#E2E8F0' }} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color="#475569" />
        </Pressable>
        <Text style={styles.topTitle}>Riwayat Invoice</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: insets.bottom + 48 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >

        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={styles.searchContainer}>
              <Feather name="search" size={20} color="#94A3B8" style={{ marginLeft: 16 }} />
              <TextField
                value={q}
                onChangeText={setQ}
                placeholder="Cari invoice..."
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
          filtered.map((invoice: ApiInvoice) => {
            const date = new Date(invoice.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
            const status = (invoice.status || 'PENDING').toLowerCase();
            const statusText = status.charAt(0).toUpperCase() + status.slice(1);
            return (
              <Card key={invoice.id} style={styles.invoiceCard}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={styles.iconWrap}><Feather name="file-text" size={20} color="#4F46E5" /></View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Text style={styles.itemTitle}>INV-{invoice.id}</Text>
                      <View style={[styles.statusBadge, status === 'paid' ? styles.badgePaid : status === 'pending' ? styles.badgePending : styles.badgeFailed]}>
                        <Text style={[styles.statusText, status === 'paid' ? styles.textPaid : status === 'pending' ? styles.textPending : styles.textFailed]}>{statusText}</Text>
                      </View>
                    </View>
                    <Text style={styles.itemSubtitle}>{invoice.Package?.name || 'N/A'} • {invoice.Package?.tokens || 0} Token</Text>

                    <View style={styles.divider} />

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                      <Text style={styles.itemDate}>{date}</Text>
                      <Text style={styles.itemAmount}>Rp {((invoice.Package?.price || invoice.tokenAmount) || 0).toLocaleString('id-ID')}</Text>
                    </View>
                  </View>
                </View>
              </Card>
            );
          })
        ) : (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ color: '#94A3B8', fontSize: 14 }}>Belum ada invoice</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#F8FAFC' },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  topTitle: { color: '#1E293B', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', height: 52, overflow: 'hidden' },
  invoiceCard: { padding: 16, marginBottom: 16, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  itemTitle: { color: '#1E293B', fontWeight: '700', fontSize: 15 },
  itemSubtitle: { color: '#64748B', fontSize: 13, marginTop: 4 },
  itemDate: { color: '#94A3B8', fontSize: 12, fontWeight: '500' },
  itemAmount: { color: '#0F172A', fontWeight: '700', fontSize: 15 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginTop: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  badgePaid: { backgroundColor: '#DCFCE7' },
  textPaid: { color: '#16A34A' },
  badgePending: { backgroundColor: '#FEF3C7' },
  textPending: { color: '#D97706' },
  badgeFailed: { backgroundColor: '#FEE2E2' },
  textFailed: { color: '#EF4444' },
});

