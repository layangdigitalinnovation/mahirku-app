import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const data = useMemo<Report[]>(() => [
    { id: '1', title: 'Cognitive Style Test', date: '2025-11-20', summary: 'Dominant: Analytical', type: 'cst' },
    { id: '2', title: 'DISC Test', date: '2025-11-18', summary: 'Profile: D/I', type: 'disc' },
    { id: '3', title: 'Cognitive Style Test', date: '2025-11-12', summary: 'Dominant: Practical', type: 'cst' },
  ], []);
  const filtered = useMemo(() => {
    const byQ = q.trim().toLowerCase();
    const s = start ? new Date(start).getTime() : 0;
    const e = end ? new Date(end).getTime() : Number.MAX_SAFE_INTEGER;
    return data.filter(d => {
      const matchQ = !byQ || d.title.toLowerCase().includes(byQ) || d.summary.toLowerCase().includes(byQ);
      const t = new Date(d.date).getTime();
      const matchDate = (!start && !end) || (t >= s && t <= e);
      return matchQ && matchDate;
    });
  }, [data, q, start, end]);
  const goDetail = (r: Report) => navigation.navigate('ReportDetail', { report: r });
  const dlCert = (r: Report) => {};
  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 48 }}>
        <Text style={styles.pageTitle}>Reports</Text>

        <Card style={{ marginTop: 12 }}>
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

        {filtered.map((r) => (
          <Card key={r.id} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.testIconWrap}><Feather name={r.type === 'cst' ? 'activity' : r.type === 'disc' ? 'users' : 'edit-3'} size={18} color="#0F172A" /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{r.title}</Text>
                <Text style={styles.itemSubtitle}>{r.summary}</Text>
              </View>
              <Text style={styles.itemDate}>{r.date}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <PrimaryButton title="Detail" leftIcon={<Feather name="file-text" size={18} color="#FFFFFF" />} onPress={() => goDetail(r)} style={{ flex: 1 }} textStyle={{ fontSize: 14 }} />
              <PrimaryButton title="Sertifikat" leftIcon={<Feather name="download" size={18} color="#FFFFFF" />} onPress={() => dlCert(r)} style={{ flex: 1, backgroundColor: '#4F46E5' }} textStyle={{ fontSize: 14 }} />
            </View>
          </Card>
        ))}
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
  pageTitle: { color: '#0F172A', fontWeight: '800', fontSize: 18 },
  filterTitle: { color: '#0F172A', fontWeight: '700' },
  testIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  itemTitle: { color: '#0F172A', fontWeight: '800' },
  itemSubtitle: { color: '#64748B', marginTop: 4 },
  itemDate: { color: '#64748B' },
});
