import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { meApi } from '../api/auth';
import { clearToken } from '../store/auth';
import { getHistory } from '../api/thinkingStyle';

import Card from '../components/basic/Card';
import PrimaryButton from '../components/basic/PrimaryButton';
import BottomTabs from '../components/navigation/BottomTabs';
import FlatItemList from '../components/list/FlatItemList';
import { AntDesign, Ionicons, Feather } from '@expo/vector-icons';

import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function DashboardScreen({ navigation }: any) {
  type Me = { user?: { fullname?: string; role?: { name?: string } | null; tokens?: number } };
  const { data, isLoading, isError, error, refetch } = useQuery<Me, AxiosError>({
    queryKey: ['me'],
    queryFn: async () => (await meApi()).data,
    retry: false,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
      activityRefetch();
    }, [])
  );

  // Fetch recent activity
  const { data: activityData, refetch: activityRefetch } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: async () => {
      const response = await getHistory();
      return response.data.data.slice(0, 3); // Get latest 3
    },
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

  const startTest = (testKey: string) => {
    const userTokens = data?.user?.tokens ?? 0;
    if (userTokens <= 0) {
      Alert.alert(
        'Token Tidak Cukup',
        'Anda memerlukan minimal 1 token untuk melakukan tes. Silakan beli token terlebih dahulu.',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Beli Token', onPress: () => navigation.navigate('TokenPackages') }
        ]
      );
      return;
    }

    if (testKey === 'cst') {
      navigation.navigate('CognitiveTestIntro');
    } else if (testKey === 'disc') {
      navigation.navigate('DiscTest');
    }
  };
  const tests = useMemo(() => [
    { key: 'cst', title: 'Cognitive Style Test', desc: 'Temukan pola berpikir unik Anda dan bagaimana hal itu memengaruhi keputusan serta karier Anda.', icon: 'activity', available: true, progress: 0.3 },
    { key: 'disc', title: 'DISC Test', desc: 'Tes DISC (Four Personality Types) adalah tes yang mengetahui tiga aspek utama dalam interaksi manusia.', icon: 'users', available: true, progress: 0.6 },
    { key: 'grp', title: 'Graphology Test', desc: 'Tes Graphology (Pengetahuan Tangan) menganalisis tangan untuk mengidentifikasi sifat psikologis.', icon: 'edit-3', available: false, progress: 0 },
  ], []);

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <Animated.View style={{ flex: 1, opacity: fadeIn }}>
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
          <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24 }}>
            <View style={styles.headerRow}>
              <View style={styles.headerLeft}>
                <Image source={{ uri: 'https://i.pravatar.cc/120' }} style={styles.avatar} />
                <View style={{ marginLeft: 16 }}>
                  <Text style={styles.headerName}>{data?.user?.fullname || 'Pengguna'}</Text>
                  <Text style={styles.headerTagline}>Member • {data?.user?.role?.name ?? 'User'}</Text>
                </View>
              </View>
              <Pressable onPress={() => navigation.navigate('Profile')} style={styles.iconBtn} android_ripple={{ color: '#E2E8F0' }}>
                <Ionicons name="settings-outline" size={22} color="#475569" />
              </Pressable>
            </View>

            <Card style={[styles.tokenCard, { marginTop: 24 }]}>
              <View style={styles.tokenRow}>
                <View style={styles.tokenIconWrap}>
                  <AntDesign name="wallet" size={24} color="#4F46E5" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tokenTitle}>Total Token</Text>
                  <Text style={styles.tokenValue}>{data?.user?.tokens ?? 0}</Text>
                </View>
              </View>
              <View style={styles.buttonRow}>
                <PrimaryButton
                  title="Beli Token"
                  leftIcon={<Feather name="shopping-cart" size={18} color="#FFFFFF" />}
                  onPress={() => navigation.navigate('TokenPackages')}
                  style={{ flex: 1, backgroundColor: '#4F46E5', borderRadius: 12, height: 44 }}
                />

              </View>
            </Card>

            <Text style={styles.sectionTitle}>Tes Tersedia</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 4 }}>
              {tests.map((t) => (
                <Card key={t.key} style={styles.testCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <View style={styles.testIconWrap}>
                      <Feather name={t.icon as any} size={20} color="#4F46E5" />
                    </View>
                    <Text style={styles.testTitle}>{t.title}</Text>
                  </View>
                  <Text style={styles.testDesc} numberOfLines={3}>{t.desc}</Text>
                  <View style={{ flex: 1 }} />
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                    {t.available ? (
                      <PrimaryButton title="Mulai" leftIcon={<Feather name="play-circle" size={16} color="#FFFFFF" />} onPress={() => startTest(t.key)} style={{ flex: 1, backgroundColor: '#0EA5E9', height: 40, borderRadius: 10 }} />
                    ) : (
                      <PrimaryButton title="Segera" variant="secondary" leftIcon={<Feather name="clock" size={16} color="#64748B" />} disabled onPress={() => { }} style={{ flex: 1, height: 40, borderRadius: 10 }} />
                    )}
                  </View>
                </Card>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Aktivitas Terakhir</Text>
            <Card style={{ padding: 0, overflow: 'hidden', borderRadius: 20 }}>
              {activityData && activityData.length > 0 ? (
                <FlatItemList
                  data={activityData}
                  scrollEnabled={false}
                  renderItem={({ item, index }) => {
                    const date = new Date(item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
                    return (
                      <View style={[styles.activityRow, index !== activityData.length - 1 && { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }]}>
                        <View style={styles.activityIcon}>
                          <Feather name="activity" size={18} color="#64748B" />
                        </View>
                        <View style={{ marginLeft: 12, flex: 1 }}>
                          <Text style={styles.activityTitle}>Cognitive Style Test</Text>
                          <Text style={styles.activitySubtitle}>{item.thinkingStyle?.type || 'Unknown'} ({item.thinkingStyle?.code || 'N/A'})</Text>
                        </View>
                        <Text style={styles.activityDate}>{date}</Text>
                      </View>
                    );
                  }}
                />
              ) : (
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <Text style={{ color: '#94A3B8', fontSize: 14 }}>Belum ada aktivitas</Text>
                </View>
              )}
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
  avatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: '#FFFFFF' },
  headerName: { color: '#1E293B', fontSize: 18, fontWeight: '700', letterSpacing: 0.3 },
  headerTagline: { color: '#64748B', fontWeight: '500', fontSize: 13, marginTop: 2 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },

  sectionTitle: { color: '#0F172A', fontWeight: '700', fontSize: 18, marginTop: 28, marginBottom: 12, letterSpacing: -0.5 },

  testCard: { width: 260, marginRight: 16, padding: 16, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3, minHeight: 180 },
  testTitle: { color: '#1E293B', fontWeight: '700', fontSize: 16, flex: 1, marginLeft: 12 },
  testDesc: { color: '#64748B', marginTop: 4, fontSize: 13, lineHeight: 20 },
  testIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },

  activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 },
  activityIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  activityTitle: { color: '#1E293B', fontWeight: '600', fontSize: 14 },
  activitySubtitle: { color: '#64748B', fontSize: 12, marginTop: 2 },
  activityDate: { color: '#94A3B8', fontSize: 12, fontWeight: '500' },

  tokenCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  tokenRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  tokenTitle: { color: '#64748B', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  tokenValue: { color: '#1E293B', fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  tokenIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 16, borderWidth: 1, borderColor: '#E0E7FF' },
});
