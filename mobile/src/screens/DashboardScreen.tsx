import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { meApi } from '../api/auth';
import { clearToken } from '../store/auth';
 
import Card from '../components/basic/Card';
import PrimaryButton from '../components/basic/PrimaryButton';
import BottomTabs from '../components/navigation/BottomTabs';
import FlatItemList from '../components/list/FlatItemList';
import { AntDesign, Ionicons, Feather } from '@expo/vector-icons';

export default function DashboardScreen({ navigation }: any) {
  type Me = { user?: { fullname?: string; role?: { name?: string } | null; tokens?: number } };
  const { data, isLoading, isError, error } = useQuery<Me, AxiosError>({
    queryKey: ['me'],
    queryFn: async () => (await meApi()).data,
    retry: false,
  });
  const [active, setActive] = useState(0);
  const fadeIn = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (isError) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        clearToken();
        navigation.replace('Login');
      }
    }
  }, [isError, error, navigation]);

  const logout = async () => {
    await clearToken();
    navigation.replace('Login');
  };

  const startTest = () => navigation.navigate('TestStart');
  const tests = useMemo(() => [
    { key: 'cst', title: 'Cognitive Style Test', desc: 'Temukan pola berpikir unik Anda dan bagaimana hal itu memengaruhi keputusan serta karier Anda.', icon: 'activity', available: true, progress: 0.3 },
    { key: 'disc', title: 'DISC Test', desc: 'Tes DISC (Four Personality Types) adalah tes yang mengetahui tiga aspek utama dalam interaksi manusia.', icon: 'users', available: true, progress: 0.6 },
    { key: 'grp', title: 'Graphology Test', desc: 'Tes Graphology (Pengetahuan Tangan) menganalisis tangan untuk mengidentifikasi sifat psikologis.', icon: 'edit-3', available: false, progress: 0 },
  ], []);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <Animated.View style={{ flex: 1, opacity: fadeIn }}>
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}>
          <View style={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 }}>
            <View style={styles.headerRow}>
              <View style={styles.headerLeft}>
                <Image source={{ uri: 'https://i.pravatar.cc/120' }} style={styles.avatar} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.headerName}>{data?.user?.fullname || 'Pengguna'}</Text>
                  <Text style={styles.headerTagline}>Member • {data?.user?.role?.name ?? 'User'}</Text>
                </View>
              </View>
              <Pressable onPress={() => navigation.navigate('Profile')} style={styles.iconBtn} android_ripple={{ color: '#EAF4FF' }}>
                <Ionicons name="settings-sharp" size={20} color="#334155" />
              </Pressable>
            </View>

            <Card style={[styles.tokenCard, { marginTop: 16 }] }>
              <View style={styles.tokenRow}>
                <View style={styles.tokenIconWrap}>
                  <AntDesign name="wallet" size={20} color="#4F46E5" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tokenTitle}>Total Token</Text>
                  <Text style={styles.tokenValue}>{data?.user?.tokens ?? 0}</Text>
                </View>
              </View>
              <View style={styles.buttonRow}>
                <PrimaryButton title="Beli Token" leftIcon={<Feather name="shopping-cart" size={18} color="#FFFFFF" />} onPress={() => {}} style={{ flex: 1, backgroundColor: '#4F46E5' }} />
                <PrimaryButton title="Member" leftIcon={<Feather name="user-plus" size={18} color="#0F172A" />} variant="secondary" onPress={() => {}} style={{ flex: 1 }} />
              </View>
            </Card>

            <Text style={styles.sectionTitle}>Tes Tersedia</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
              {tests.map((t) => (
                <Card key={t.key} style={styles.testCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.testIconWrap}>
                      <Feather name={t.icon as any} size={18} color="#0F172A" />
                    </View>
                    <Text style={styles.testTitle}>{t.title}</Text>
                  </View>
                  <Text style={styles.testDesc}>{t.desc}</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    {t.available ? (
                      <PrimaryButton title="Mulai Test" leftIcon={<Feather name="play-circle" size={18} color="#FFFFFF" />} onPress={startTest} style={{ flex: 1, backgroundColor: '#06B6D4' }} />
                    ) : (
                      <PrimaryButton title="Coming Soon" variant="secondary" leftIcon={<Feather name="clock" size={18} color="#0F172A" />} disabled onPress={() => {}} style={{ flex: 1 }} />
                    )}
                  </View>
                </Card>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Aktivitas Terakhir</Text>
            <Card>
              <FlatItemList
                data={[{ t: 'Thinking Style', d: '2025-11-20', s: 'Dominant: Analytical' }, { t: 'Cognitive Gauge', d: '2025-11-18', s: 'Speed: High' }, { t: 'Personality Radar', d: '2025-11-12', s: 'Trait: Openness' }]}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={styles.activityRow}>
                    <Feather name="file-text" size={16} color="#334155" />
                    <View style={{ marginLeft: 8, flex: 1 }}>
                      <Text style={styles.activityTitle}>{item.t}</Text>
                      <Text style={styles.activitySubtitle}>{item.s}</Text>
                    </View>
                    <Text style={styles.activityDate}>{item.d}</Text>
                  </View>
                )}
              />
            </Card>

          </View>
        </ScrollView>

        <Pressable style={styles.fab} onPress={startTest} android_ripple={{ color: '#EAF4FF' }}>
          <Ionicons name="flash" size={20} color="#FFFFFF" />
          <Text style={styles.fabText}>Start</Text>
        </Pressable>

        <BottomTabs
          tabs={[
            { key: 'home', label: 'Home', icon: 'home' },
            { key: 'tests', label: 'Tests', icon: 'grid' },
            { key: 'reports', label: 'Reports', icon: 'file-text' },
            { key: 'profile', label: 'Profile', icon: 'user' },
          ]}
          activeIndex={active}
          onChange={(i) => {
            setActive(i);
            const keys = ['home', 'tests', 'reports', 'profile'];
            const key = keys[i];
            if (key === 'profile') navigation.navigate('Profile');
            if (key === 'tests') navigation.navigate('Tests');
            if (key === 'reports') navigation.navigate('Reports');
          }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  headerName: { color: '#0F172A', fontSize: 18, fontWeight: '800' },
  headerTagline: { color: '#64748B', fontWeight: '600' },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },

  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroTitle: { color: '#0F172A', fontSize: 18, fontWeight: '800' },
  heroSubtitle: { color: '#64748B', marginTop: 4 },
  ringOuter: { width: 96, height: 96, borderRadius: 48, borderWidth: 8, borderColor: '#4F46E5', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF2FF' },
  ringInner: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FFFFFF' },
  ringText: { position: 'absolute', color: '#4F46E5', fontWeight: '800' },

  sectionTitle: { color: '#0F172A', fontWeight: '800', fontSize: 16, marginTop: 16 },

  testCard: { width: 240, marginRight: 12 },
  testTitle: { color: '#0F172A', fontWeight: '800' },
  testDesc: { color: '#64748B', marginTop: 6 },
  testMeta: { color: '#64748B', marginTop: 4 },
  progressBarBg: { height: 6, borderRadius: 3, backgroundColor: '#E2E8F0', marginTop: 8, overflow: 'hidden' },
  progressBarFill: { height: 6, backgroundColor: '#06B6D4' },
  testIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginRight: 8 },

  activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  activityTitle: { color: '#0F172A', fontWeight: '700' },
  activitySubtitle: { color: '#64748B' },
  activityDate: { color: '#64748B' },

  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '48%' },
  gridTitle: { color: '#0F172A', fontWeight: '800' },
  gridTag: { color: '#06B6D4', fontWeight: '700', marginTop: 4 },

  statItem: { width: '31.5%', alignItems: 'center', paddingVertical: 16 },
  statValue: { color: '#4F46E5', fontWeight: '800', fontSize: 18 },
  statLabel: { color: '#64748B', marginTop: 4 },

  servicesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  serviceItem: { width: '48%', flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
  serviceLabel: { color: '#0F172A', fontWeight: '700' },

  fab: { position: 'absolute', bottom: 72, alignSelf: 'center', backgroundColor: '#4F46E5', paddingHorizontal: 20, height: 48, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 8, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
  fabText: { color: '#FFFFFF', fontWeight: '800' },
  tokenCard: { backgroundColor: '#EAF6FF', borderColor: '#D7EAFB', borderWidth: 1, shadowColor: '#60A5FA' },
  tokenRow: { flexDirection: 'row', alignItems: 'center' },
  tokenTitle: { color: '#0F172A', fontSize: 14, fontWeight: '700' },
  tokenValue: { color: '#4F46E5', fontSize: 28, fontWeight: '800' },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  tokenIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
});
