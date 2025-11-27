import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { meApi } from '../api/auth';
import Card from '../components/basic/Card';
import PrimaryButton from '../components/basic/PrimaryButton';
import BottomTabs from '../components/navigation/BottomTabs';
import { Feather } from '@expo/vector-icons';

type Me = { user?: { tokens?: number } };

export default function TestScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { data } = useQuery<Me>({ queryKey: ['me'], queryFn: async () => (await meApi()).data, retry: false });
  const tokens = data?.user?.tokens ?? 0;
  const startCognitive = () => navigation.navigate('CognitiveTestIntro');
  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 48 }}>
        <Text style={styles.pageTitle}>Tes Tersedia</Text>
        <Text style={styles.pageSubtitle}>Pilih tes yang ingin Anda kerjakan</Text>

        <View style={{ gap: 20, marginTop: 24 }}>
          <Card style={styles.testCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={styles.testIconWrap}><Feather name="activity" size={20} color="#4F46E5" /></View>
              <Text style={styles.testTitle}>Cognitive Style Test</Text>
            </View>
            <Text style={styles.testDesc}>Temukan pola berpikir unik Anda dan bagaimana hal itu memengaruhi keputusan serta karier Anda.</Text>
            <View style={styles.metaRow}>
              <Feather name="database" size={14} color="#64748B" />
              <Text style={styles.testMeta}>Total Token: {tokens}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <PrimaryButton title="Mulai Test" leftIcon={<Feather name="play-circle" size={18} color="#FFFFFF" />} onPress={startCognitive} style={{ flex: 1, backgroundColor: '#0EA5E9', height: 44, borderRadius: 12 }} />
            </View>
          </Card>

          <Card style={styles.testCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={styles.testIconWrap}><Feather name="users" size={20} color="#4F46E5" /></View>
              <Text style={styles.testTitle}>DISC Test</Text>
            </View>
            <Text style={styles.testDesc}>Tes DISC (Four Personality Types) adalah tes yang mengetahui tiga aspek utama dalam interaksi manusia.</Text>
            <View style={styles.metaRow}>
              <Feather name="check-circle" size={14} color="#16A34A" />
              <Text style={[styles.testMeta, { color: '#16A34A', fontWeight: '600' }]}>Free Access</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <PrimaryButton title="Mulai Test" leftIcon={<Feather name="play-circle" size={18} color="#FFFFFF" />} onPress={() => { }} style={{ flex: 1, backgroundColor: '#0EA5E9', height: 44, borderRadius: 12 }} />
            </View>
          </Card>

          <Card style={styles.testCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={styles.testIconWrap}><Feather name="edit-3" size={20} color="#64748B" /></View>
              <Text style={[styles.testTitle, { color: '#64748B' }]}>Graphology Test</Text>
            </View>
            <Text style={styles.testDesc}>Tes Graphology (Pengetahuan Tangan) menganalisis tangan untuk mengidentifikasi sifat psikologis.</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <PrimaryButton title="Coming Soon" variant="secondary" leftIcon={<Feather name="clock" size={18} color="#64748B" />} disabled onPress={() => { }} style={{ flex: 1, height: 44, borderRadius: 12 }} />
            </View>
          </Card>
        </View>
      </ScrollView>

      <BottomTabs
        tabs={[
          { key: 'home', label: 'Home', icon: 'home' },
          { key: 'tests', label: 'Tests', icon: 'grid' },
          { key: 'reports', label: 'Reports', icon: 'file-text' },
          { key: 'profile', label: 'Profile', icon: 'user' },
        ]}
        activeIndex={1}
        onChange={(i) => {
          const keys = ['home', 'tests', 'reports', 'profile'];
          const key = keys[i];
          if (key === 'home') navigation.replace('Dashboard');
          if (key === 'reports') navigation.replace('Reports');
          if (key === 'profile') navigation.replace('Profile');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pageTitle: { color: '#0F172A', fontWeight: '700', fontSize: 24, letterSpacing: -0.5 },
  pageSubtitle: { color: '#64748B', fontSize: 15, marginTop: 4 },
  testCard: { padding: 20, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  testIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  testTitle: { color: '#1E293B', fontWeight: '700', fontSize: 18 },
  testDesc: { color: '#64748B', fontSize: 14, lineHeight: 22 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  testMeta: { color: '#64748B', fontSize: 13, fontWeight: '500' },
});
