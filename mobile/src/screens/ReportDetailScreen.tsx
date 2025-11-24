import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../components/basic/Card';
import PrimaryButton from '../components/basic/PrimaryButton';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function ReportDetailScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const r = route?.params?.report as { title: string; date: string; summary: string; type: string } | undefined;
  const dlCert = () => {};
  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={[styles.topBar, { paddingTop: insets.top + 16 }]}>
        <Pressable style={styles.backBtn} android_ripple={{ color: '#EAF4FF' }} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color="#334155" />
        </Pressable>
        <Text style={styles.topTitle}>Report Detail</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: insets.bottom + 48 }}>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.testIconWrap}><Feather name={r?.type === 'cst' ? 'activity' : r?.type === 'disc' ? 'users' : 'edit-3'} size={18} color="#0F172A" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{r?.title || 'Test Result'}</Text>
              <Text style={styles.itemDate}>{r?.date || ''}</Text>
            </View>
          </View>
          <Text style={styles.itemSubtitle}>{r?.summary || ''}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
            <View style={styles.metric}><Text style={styles.metricLabel}>Score</Text><Text style={styles.metricValue}>A</Text></View>
            <View style={styles.metric}><Text style={styles.metricLabel}>Status</Text><Text style={styles.metricValue}>Completed</Text></View>
            <View style={styles.metric}><Text style={styles.metricLabel}>Level</Text><Text style={styles.metricValue}>High</Text></View>
          </View>
          <PrimaryButton title="Download Sertifikat" leftIcon={<Feather name="download" size={18} color="#FFFFFF" />} onPress={dlCert} style={{ marginTop: 16, backgroundColor: '#4F46E5' }} />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 8, backgroundColor: '#FFFFFF' },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9' },
  topTitle: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
  testIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  itemTitle: { color: '#0F172A', fontWeight: '800' },
  itemSubtitle: { color: '#64748B', marginTop: 6 },
  itemDate: { color: '#64748B' },
  metric: { width: '31%', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  metricLabel: { color: '#64748B' },
  metricValue: { color: '#4F46E5', fontWeight: '800', marginTop: 4 },
});

