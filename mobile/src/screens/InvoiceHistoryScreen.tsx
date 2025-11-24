import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const invoices = useMemo<Invoice[]>(() => [
    { id: 'INV-20251120-001', date: '2025-11-20', tokens: 10, amount: 150000, method: 'VA BCA', status: 'paid' },
    { id: 'INV-20251118-002', date: '2025-11-18', tokens: 5, amount: 75000, method: 'QRIS', status: 'paid' },
    { id: 'INV-20251112-003', date: '2025-11-12', tokens: 20, amount: 300000, method: 'VA BNI', status: 'pending' },
  ], []);
  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    const s = start ? new Date(start).getTime() : 0;
    const e = end ? new Date(end).getTime() : Number.MAX_SAFE_INTEGER;
    return invoices.filter(v => {
      const matchQ = !kw || v.id.toLowerCase().includes(kw) || v.method.toLowerCase().includes(kw);
      const t = new Date(v.date).getTime();
      const matchDate = (!start && !end) || (t >= s && t <= e);
      return matchQ && matchDate;
    });
  }, [invoices, q, start, end]);
  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={[styles.topBar, { paddingTop: insets.top + 16 }]}>
        <Pressable style={styles.backBtn} android_ripple={{ color: '#EAF4FF' }} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color="#334155" />
        </Pressable>
        <Text style={styles.topTitle}>Riwayat Invoice</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: insets.bottom + 48 }}>
        <Card>
          <Text style={styles.filterTitle}>Filter</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TextField label="Keyword" value={q} onChangeText={setQ} containerStyle={{ flex: 1 }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TextField label="Start Date" value={start} onChangeText={setStart} placeholder="YYYY-MM-DD" containerStyle={{ flex: 1 }} />
            <TextField label="End Date" value={end} onChangeText={setEnd} placeholder="YYYY-MM-DD" containerStyle={{ flex: 1 }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <PrimaryButton title="Search" leftIcon={<Feather name="search" size={18} color="#FFFFFF" />} onPress={() => {}} style={{ flex: 1 }} />
            <PrimaryButton title="Reset" variant="secondary" onPress={() => { setQ(''); setStart(''); setEnd(''); }} style={{ flex: 1 }} />
          </View>
        </Card>

        <View style={{ height: 12 }} />

        {filtered.map((v) => (
          <Card key={v.id} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.iconWrap}><Feather name="shopping-bag" size={18} color="#0F172A" /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{v.id}</Text>
                <Text style={styles.itemSubtitle}>{v.method} • {v.tokens} Token</Text>
              </View>
              <Text style={[styles.itemStatus, v.status === 'paid' ? styles.statusPaid : v.status === 'pending' ? styles.statusPending : styles.statusFailed]}>{v.status}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.itemDate}>{v.date}</Text>
              <Text style={styles.itemAmount}>Rp {v.amount.toLocaleString('id-ID')}</Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 8, backgroundColor: '#FFFFFF' },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9' },
  topTitle: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
  filterTitle: { color: '#0F172A', fontWeight: '700' },
  iconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  itemTitle: { color: '#0F172A', fontWeight: '800' },
  itemSubtitle: { color: '#64748B', marginTop: 4 },
  itemDate: { color: '#64748B' },
  itemAmount: { color: '#0F172A', fontWeight: '800' },
  itemStatus: { textTransform: 'capitalize' },
  statusPaid: { color: '#16A34A' },
  statusPending: { color: '#F59E0B' },
  statusFailed: { color: '#EF4444' },
});

