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
  const startCognitive = () => navigation.navigate('TestStart');
  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 48 }}>
        <Text style={styles.pageTitle}>Tes Tersedia</Text>

        <View style={{ marginTop: 12 }} />

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.testIconWrap}><Feather name="activity" size={18} color="#0F172A" /></View>
            <Text style={styles.testTitle}>Cognitive Style Test</Text>
          </View>
          <Text style={styles.testDesc}>Temukan pola berpikir unik Anda dan bagaimana hal itu memengaruhi keputusan serta karier Anda.</Text>
          <Text style={styles.testMeta}>Total Token: {tokens}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <PrimaryButton title="Mulai Test" leftIcon={<Feather name="play-circle" size={18} color="#FFFFFF" />} onPress={startCognitive} style={{ flex: 1, backgroundColor: '#06B6D4' }} />
          </View>
        </Card>

        <View style={{ height: 12 }} />

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.testIconWrap}><Feather name="users" size={18} color="#0F172A" /></View>
            <Text style={styles.testTitle}>DISC Test</Text>
          </View>
          <Text style={styles.testDesc}>Tes DISC (Four Personality Types) adalah tes yang mengetahui tiga aspek utama dalam interaksi manusia.</Text>
          <Text style={[styles.testMeta, { color: '#16A34A' }]}>Free</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <PrimaryButton title="Mulai Test" leftIcon={<Feather name="play-circle" size={18} color="#FFFFFF" />} onPress={() => {}} style={{ flex: 1 }} />
          </View>
        </Card>

        <View style={{ height: 12 }} />

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.testIconWrap}><Feather name="edit-3" size={18} color="#0F172A" /></View>
            <Text style={styles.testTitle}>Graphology Test</Text>
          </View>
          <Text style={styles.testDesc}>Tes Graphology (Pengetahuan Tangan) menganalisis tangan untuk mengidentifikasi sifat psikologis.</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <PrimaryButton title="Coming Soon" variant="secondary" leftIcon={<Feather name="clock" size={18} color="#0F172A" />} disabled onPress={() => {}} style={{ flex: 1 }} />
          </View>
        </Card>
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
  pageTitle: { color: '#0F172A', fontWeight: '800', fontSize: 18 },
  testIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  testTitle: { color: '#0F172A', fontWeight: '800' },
  testDesc: { color: '#64748B', marginTop: 6 },
  testMeta: { color: '#64748B', marginTop: 4 },
});
