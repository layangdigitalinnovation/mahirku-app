import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated, Image, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { meApi } from '../api/auth';
import { clearToken } from '../store/auth';
import { getHistory } from '../api/thinkingStyle';
import { getChildrenUsers, transferTokenToChild, type ChildUser } from '../api/childUser';
import { LinearGradient } from 'expo-linear-gradient';

import Card from '../components/basic/Card';
import PrimaryButton from '../components/basic/PrimaryButton';
import BottomTabs from '../components/navigation/BottomTabs';
import FlatItemList from '../components/list/FlatItemList';
import TextField from '../components/basic/TextField';
import { AntDesign, Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

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
      membersRefetch();
    }, [])
  );

  // Fetch recent activity
  const { data: activityData, refetch: activityRefetch } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: async () => {
      const response = await getHistory();
      return response.data.data.slice(0, 3); // Get latest 3
    },
  });

  // Fetch members
  const { data: membersData, refetch: membersRefetch } = useQuery<ChildUser[]>({
    queryKey: ['childrenUsers'],
    queryFn: getChildrenUsers,
    retry: false,
  });



  const [active, setActive] = useState(0);
  const fadeIn = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (isError) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        clearToken();
        navigation.replace('Auth');
      }
    }
  }, [isError, error, navigation]);

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
      navigation.navigate('CognitiveDataEntry');
    } else if (testKey === 'disc') {
      navigation.navigate('DiscTest');
    }
  };
  const tests = useMemo(() => [
    { key: 'cst', title: 'Cognitive Style', subtitle: 'Analisis Pola Pikir', desc: 'Temukan potensi dan gaya berpikir unik Anda.', icon: 'brain', iconLib: 'MaterialCommunityIcons', color: '#4F46E5', available: true },
    { key: 'disc', title: 'DISC Personality', subtitle: 'Profil Kepribadian', desc: 'Pahami karakter dan cara Anda berinteraksi.', icon: 'account-group', iconLib: 'MaterialCommunityIcons', color: '#0EA5E9', available: true },
    { key: 'grp', title: 'Graphology', subtitle: 'Analisis Tulisan', desc: 'Ungkap karakter tersembunyi dari tulisan tangan.', icon: 'edit-3', iconLib: 'Feather', color: '#8B5CF6', available: false },
  ], []);

  const getInitials = (name: string) => {
    return String(name).split(' ').slice(0, 2).map(s => s[0]?.toUpperCase() || '').join('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <LinearGradient
        colors={['#EEF2FF', '#F1F5F9', '#F8FAFC']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Animated.View style={{ flex: 1, opacity: fadeIn }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ paddingHorizontal: 24, paddingTop: insets.top + 20, paddingBottom: 24 }}>

            {/* Header Section */}
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.greetingText}>Selamat Datang,</Text>
                <Text style={styles.headerName} numberOfLines={1}>
                  {data?.user?.fullname || 'Pengguna'}
                </Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{data?.user?.role?.name ?? 'Member'}</Text>
                </View>
              </View>

              <Pressable onPress={() => navigation.navigate('Profile')} style={styles.avatarContainer}>
                {data?.user?.fullname ? (
                  <LinearGradient
                    colors={['#6366F1', '#4F46E5']}
                    style={styles.avatarGradient}
                  >
                    <Text style={styles.avatarText}>{getInitials(data?.user?.fullname)}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.avatarGradient, { backgroundColor: '#E0E7FF' }]}>
                    <Feather name="user" size={24} color="#4F46E5" />
                  </View>
                )}
                <View style={styles.onlineIndicator} />
              </Pressable>
            </View>

            {/* Token Card */}
            <View style={styles.tokenCardWrapper}>
              <LinearGradient
                colors={['#4F46E5', '#4338CA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tokenCardGradient}
              >
                <View style={styles.tokenCardContent}>
                  <View>
                    <Text style={styles.tokenLabel}>Saldo Token</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                      <Text style={styles.tokenValue}>{data?.user?.tokens ?? 0}</Text>
                      <Text style={styles.tokenUnit}>Token</Text>
                    </View>
                  </View>
                  <View style={styles.tokenIconContainer}>
                    <MaterialCommunityIcons name="ticket-percent-outline" size={32} color="#FFFFFF" />
                  </View>
                </View>

                <View style={styles.actionButtonsRow}>
                  <PrimaryButton
                    title="Top Up"
                    leftIcon={<Feather name="plus-circle" size={18} color="#4F46E5" />}
                    onPress={() => navigation.navigate('TokenPackages')}
                    style={styles.topUpBtn}
                    textStyle={{ color: '#4F46E5', fontSize: 14 }}
                  />
                  <PrimaryButton
                    title="Add Member"
                    leftIcon={<Feather name="user-plus" size={18} color="#FFFFFF" />}
                    onPress={() => navigation.navigate('AddMember')}
                    disabled={(data?.user?.tokens ?? 0) <= 1}
                    style={styles.addMemberBtn}
                    textStyle={{ color: '#FFFFFF', fontSize: 14 }}
                  />
                </View>
              </LinearGradient>
            </View>

            {/* Tests Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tes Tersedia</Text>
              <Pressable onPress={() => navigation.navigate('Tests')}>
                <Text style={styles.seeAllText}>Lihat Semua</Text>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 24, paddingBottom: 24, gap: 16 }}
              style={{ marginHorizontal: -24, paddingHorizontal: 24 }}
            >
              {tests.map((t) => (
                <Pressable
                  key={t.key}
                  onPress={() => t.available && startTest(t.key)}
                  style={({ pressed }) => [
                    styles.testCard,
                    pressed && { transform: [{ scale: 0.98 }] }
                  ]}
                >
                  <View style={[styles.testIconBox, { backgroundColor: `${t.color}15` }]}>
                    {t.iconLib === 'MaterialCommunityIcons' ? (
                      <MaterialCommunityIcons name={t.icon as any} size={24} color={t.color} />
                    ) : (
                      <Feather name={t.icon as any} size={24} color={t.color} />
                    )}
                  </View>
                  <View style={{ marginTop: 16, flex: 1 }}>
                    <Text style={styles.testCardTitle}>{t.title}</Text>
                    <Text style={styles.testCardSubtitle}>{t.subtitle}</Text>
                    <Text style={styles.testCardDesc} numberOfLines={2}>{t.desc}</Text>
                  </View>

                  <View style={styles.testCardFooter}>
                    {t.available ? (
                      <View style={[styles.playBtn, { backgroundColor: t.color }]}>
                        <Text style={styles.playBtnText}>Mulai Tes</Text>
                        <Feather name="arrow-right" size={16} color="#FFF" />
                      </View>
                    ) : (
                      <View style={styles.soonBtn}>
                        <Text style={styles.soonBtnText}>Segera Hadir</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              ))}
            </ScrollView>

            {/* Recent Activity */}
            <View style={[styles.sectionHeader, { marginTop: 32 }]}>
              <Text style={styles.sectionTitle}>Aktivitas Terakhir</Text>
            </View>

            <View style={styles.activityCard}>
              {activityData && activityData.length > 0 ? (
                <FlatItemList
                  data={activityData}
                  scrollEnabled={false}
                  renderItem={({ item, index }) => {
                    const date = new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                    const isLast = index === activityData.length - 1;
                    return (
                      <View style={[styles.activityItem, !isLast && styles.activityDivider]}>
                        <View style={styles.activityIconBox}>
                          <Feather name="check-circle" size={20} color="#10B981" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 16 }}>
                          <Text style={styles.activityName}>
                            {item.testType === 'DISC' ? 'DISC Test' : 'Cognitive Style Test'}
                          </Text>
                          <Text style={styles.activityResult}>
                            Hasil: <Text style={{ fontWeight: '600', color: '#4F46E5' }}>
                              {item.testType === 'DISC'
                                ? `${item.thinkingStyle?.type || ''} (${item.thinkingStyle?.code || ''})`
                                : (item.thinkingStyle?.type || 'Unknown')}
                            </Text>
                          </Text>
                        </View>
                        <Text style={styles.activityDate}>{date}</Text>
                      </View>
                    );
                  }}
                />
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconBg}>
                    <Feather name="clock" size={24} color="#94A3B8" />
                  </View>
                  <Text style={styles.emptyText}>Belum ada aktivitas terbaru</Text>
                </View>
              )}
            </View>

            {/* Member List */}
            {membersData && membersData.length > 0 && (
              <>
                <View style={[styles.sectionHeader, { marginTop: 32 }]}>
                  <Text style={styles.sectionTitle}>Member</Text>
                  <Pressable onPress={() => navigation.navigate('MemberList')}>
                    <Text style={styles.seeAllText}>Lihat Semua</Text>
                  </Pressable>
                </View>

                <View style={{ gap: 12 }}>
                  {(membersData ?? []).slice(0, 3).map((member) => (
                    <Card key={member.id} style={styles.memberCard}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <View style={styles.memberAvatar}>
                          <Text style={styles.memberInitials}>
                            {member.fullname?.split(' ').slice(0, 2).map(s => s[0]?.toUpperCase() || '').join('')}
                          </Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={styles.memberName}>{member.fullname || member.username}</Text>
                          <Text style={styles.memberEmail}>{member.email}</Text>
                        </View>
                        <View style={styles.memberTokenBadge}>
                          <MaterialCommunityIcons name="ticket-percent-outline" size={14} color="#7C3AED" />
                          <Text style={styles.memberTokenText}>{member.tokens}</Text>
                        </View>
                      </View>

                      <PrimaryButton
                        title="Transfer Token"
                        leftIcon={<Feather name="send" size={16} color="#FFFFFF" />}
                        onPress={() => navigation.navigate('TransferToken', { member })}
                        style={styles.transferBtn}
                        textStyle={{ fontSize: 14, fontWeight: '600' }}
                      />
                    </Card>
                  ))}
                </View>
              </>
            )}

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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greetingText: { color: '#64748B', fontSize: 14, fontWeight: '500', marginBottom: 4 },
  headerName: { color: '#1E293B', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  roleBadge: { alignSelf: 'flex-start', backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 8, borderWidth: 1, borderColor: '#DBEAFE' },
  roleText: { color: '#3B82F6', fontSize: 12, fontWeight: '600' },

  avatarContainer: { position: 'relative' },
  avatarGradient: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  avatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  onlineIndicator: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#FFFFFF' },

  tokenCardWrapper: { borderRadius: 24, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 8, marginBottom: 32 },
  tokenCardGradient: { borderRadius: 24, padding: 24 },
  tokenCardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  tokenLabel: { color: '#E0E7FF', fontSize: 14, fontWeight: '500', marginBottom: 4 },
  tokenValue: { color: '#FFFFFF', fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  tokenUnit: { color: '#E0E7FF', fontSize: 16, fontWeight: '600' },
  tokenIconContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },

  actionButtonsRow: { flexDirection: 'row', gap: 12 },
  topUpBtn: { flex: 1, backgroundColor: '#FFFFFF', height: 44, borderRadius: 12 },
  addMemberBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', height: 44, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: '#1E293B', fontSize: 18, fontWeight: '700', letterSpacing: -0.5 },
  seeAllText: { color: '#4F46E5', fontSize: 14, fontWeight: '600' },

  testCard: { width: 260, minHeight: 180, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  testIconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  testCardTitle: { color: '#1E293B', fontSize: 16, fontWeight: '700', marginBottom: 2 },
  testCardSubtitle: { color: '#64748B', fontSize: 12, fontWeight: '500', marginBottom: 8 },
  testCardDesc: { color: '#94A3B8', fontSize: 12, lineHeight: 18 },
  testCardFooter: { marginTop: 20 },
  playBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12, gap: 6 },
  playBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  soonBtn: { backgroundColor: '#F1F5F9', paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  soonBtnText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },

  activityCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 8, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  activityItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  activityDivider: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  activityIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' },
  activityName: { color: '#1E293B', fontSize: 15, fontWeight: '600', marginBottom: 2 },
  activityResult: { color: '#64748B', fontSize: 13 },
  activityDate: { color: '#94A3B8', fontSize: 12, fontWeight: '500' },
  emptyState: { padding: 32, alignItems: 'center' },
  emptyIconBg: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyText: { color: '#94A3B8', fontSize: 14, fontWeight: '500' },

  // Member List Styles
  memberCard: { padding: 20, borderRadius: 24, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  memberAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#E0E7FF' },
  memberInitials: { color: '#4F46E5', fontSize: 16, fontWeight: '700' },
  memberName: { color: '#1E293B', fontSize: 15, fontWeight: '700', marginBottom: 2 },
  memberEmail: { color: '#64748B', fontSize: 13 },
  memberTokenBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F5F3FF', borderWidth: 1, borderColor: '#EDE9FE' },
  memberTokenText: { color: '#7C3AED', fontWeight: '600', fontSize: 12 },
  transferBtn: { backgroundColor: '#4F46E5', height: 44, borderRadius: 12 },

});
