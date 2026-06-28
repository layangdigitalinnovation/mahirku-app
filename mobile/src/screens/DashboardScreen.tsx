import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated, Image, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { meApi } from '../api/auth';
import { clearToken } from '../store/auth';
import { getHistory } from '../api/thinkingStyle';
import { getChildrenUsers, transferTokenToChild, type ChildUser } from '../api/childUser';
import { getDiscQuestions } from '../api/disc';
import { LinearGradient } from 'expo-linear-gradient';

import Card from '../components/basic/Card';
import PrimaryButton from '../components/basic/PrimaryButton';
import BottomTabs from '../components/navigation/BottomTabs';
import FlatItemList from '../components/list/FlatItemList';
import TextField from '../components/basic/TextField';
import TestPrepSheet, { type TestPrepChip } from '../components/ui/TestPrepSheet';
import { AntDesign, Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function DashboardScreen({ navigation }: any) {
  type Me = { user?: { fullname?: string; role?: { name?: string } | null; roleId?: number; tokens?: number } };
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
  const [prepKey, setPrepKey] = useState<'cst' | 'disc' | null>(null);
  const [discQCount, setDiscQCount] = useState<number | null>(null);
  const [discQLoading, setDiscQLoading] = useState(false);
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
    const isFree = testKey === 'disc';
    const userTokens = data?.user?.tokens ?? 0;

    // Only check tokens if the test is NOT free
    if (!isFree && userTokens <= 0) {
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

    if (testKey === 'cst') setPrepKey('cst');
    else if (testKey === 'disc') setPrepKey('disc');
    else if (testKey === 'grp') navigation.navigate('GraphologyIntro');
  };

  useEffect(() => {
    if (prepKey !== 'disc') return;
    if (discQLoading) return;
    if (discQCount !== null) return;
    setDiscQLoading(true);
    getDiscQuestions()
      .then((qs) => setDiscQCount(qs.length))
      .catch(() => setDiscQCount(null))
      .finally(() => setDiscQLoading(false));
  }, [discQCount, discQLoading, prepKey]);

  const closePrep = () => setPrepKey(null);
  const startFromPrep = () => {
    const key = prepKey;
    closePrep();
    if (key === 'cst') navigation.navigate('CognitiveDataEntry');
    if (key === 'disc') navigation.navigate('DiscTest');
  };

  const prepTheme = prepKey === 'disc' ? { a: '#0EA5E9', b: '#38BDF8' } : { a: '#4F46E5', b: '#818CF8' };
  const prepTitle = prepKey === 'disc' ? 'DISC Personality' : 'Cognitive Style';
  const prepSubtitle = prepKey === 'disc' ? 'Profil Kepribadian' : 'Analisis Pola Pikir';
  const prepChips: TestPrepChip[] = useMemo(() => {
    if (!prepKey) return [];
    if (prepKey === 'disc') {
      return [
        { value: discQLoading ? '...' : discQCount !== null ? String(discQCount) : '—', label: 'Soal', tone: 'primary' },
        { value: '±5', label: 'menit', tone: 'warning' },
        { value: 'Free', label: 'Access', tone: 'success' },
      ];
    }
    return [
      { value: '36', label: 'Soal', tone: 'primary' },
      { value: '±7', label: 'menit', tone: 'warning' },
      { value: '1', label: 'Token', tone: 'neutral' },
    ];
  }, [discQCount, discQLoading, prepKey]);

  const prepAboutTitle = 'Tentang Assessment';
  const prepAboutBody = prepKey === 'disc'
    ? 'DISC Personality membantu Anda memahami kecenderungan perilaku dan cara berinteraksi (Dominance, Influence, Steadiness, Compliance). Hasil bersifat informatif untuk pengembangan diri.'
    : 'Cognitive Style membantu Anda memahami pola berpikir dominan, cara memproses informasi, serta strategi belajar dan bekerja yang paling cocok untuk Anda.';

  const prepInstructions = prepKey === 'disc'
    ? [
      'Tidak ada jawaban benar atau salah. Pilih opsi yang paling menggambarkan diri Anda.',
      'Jawab sesuai kondisi Anda saat ini, bukan versi ideal.',
      'Pastikan Anda berada di kondisi yang kondusif agar bisa fokus.',
      'Selesaikan semua soal untuk mendapatkan hasil yang akurat.',
    ]
    : [
      'Tidak ada jawaban benar atau salah. Pilih jawaban yang paling sesuai dengan diri Anda.',
      'Jawab apa adanya dan konsisten untuk hasil yang lebih relevan.',
      'Pastikan Anda berada di kondisi yang kondusif agar bisa fokus.',
      'Tes biasanya dapat diselesaikan dalam beberapa menit.',
    ];
  const tests = useMemo(() => [
    { key: 'cst', title: 'Cognitive Style', subtitle: 'Analisis Pola Pikir', desc: 'Temukan potensi dan gaya berpikir unik Anda.', icon: 'brain', iconLib: 'MaterialCommunityIcons', color: '#4F46E5', available: true, isFree: false },
    { key: 'disc', title: 'DISC Personality', subtitle: 'Profil Kepribadian', desc: 'Pahami karakter dan cara Anda berinteraksi.', icon: 'account-group', iconLib: 'MaterialCommunityIcons', color: '#0EA5E9', available: true, isFree: true },
    { key: 'grp', title: 'Graphology', subtitle: 'Analisis Tulisan', desc: 'Ungkap karakter tersembunyi dari tulisan tangan.', icon: 'edit-3', iconLib: 'Feather', color: '#8B5CF6', available: true, isFree: false },
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

            {/* Token Card - Modern E-Wallet Design */}
            <View style={styles.tokenCardWrapper}>
              <LinearGradient
                colors={['#6366F1', '#8B5CF6', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tokenCardGradient}
              >
                {/* Decorative Background Elements */}
                <View style={styles.decorativeCircle1} />
                <View style={styles.decorativeCircle2} />
                <View style={styles.decorativeCircle3} />

                {/* Glassmorphism Overlay */}
                <View style={styles.glassOverlay}>
                  <View style={styles.tokenCardContent}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tokenLabel}>Saldo Token</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                        <Text style={styles.tokenValue}>{data?.user?.tokens ?? 0}</Text>
                        <Text style={styles.tokenUnit}>Token</Text>
                      </View>
                      <Text style={styles.tokenSubtext}>Tersedia untuk digunakan</Text>
                    </View>

                    <LinearGradient
                      colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
                      style={styles.tokenIconContainer}
                    >
                      <View style={styles.iconGlow} />
                      <MaterialCommunityIcons name="wallet" size={28} color="#FFFFFF" />
                    </LinearGradient>
                  </View>

                  <View style={styles.actionButtonsRow}>
                    <Pressable
                      onPress={() => navigation.navigate('TokenPackages')}
                      style={({ pressed }) => [
                        styles.topUpBtn,
                        pressed && { transform: [{ scale: 0.98 }], opacity: 0.95 }
                      ]}
                    >
                      <LinearGradient
                        colors={['#FFFFFF', '#F8FAFC']}
                        style={styles.buttonGradient}
                      >
                        <Feather name="plus-circle" size={18} color="#6366F1" />
                        <Text style={styles.topUpBtnText}>Top Up</Text>
                      </LinearGradient>
                    </Pressable>

                    <Pressable
                      onPress={() => navigation.navigate('AddMember')}
                      disabled={(data?.user?.tokens ?? 0) <= 1}
                      style={({ pressed }) => [
                        styles.addMemberBtnOuter,
                        (data?.user?.tokens ?? 0) <= 1 && styles.addMemberBtnDisabled,
                        pressed && !((data?.user?.tokens ?? 0) <= 1) && { transform: [{ scale: 0.97 }], opacity: 0.92 }
                      ]}
                    >
                      <LinearGradient
                        colors={(data?.user?.tokens ?? 0) <= 1
                          ? ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.08)']
                          : ['#FFFFFF', '#FDF2F8']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.addMemberBtnGradient}
                      >
                        <View style={[
                          styles.addMemberIconBadge,
                          (data?.user?.tokens ?? 0) <= 1 && { backgroundColor: 'rgba(148,163,184,0.15)' }
                        ]}>
                          <Feather
                            name="user-plus"
                            size={16}
                            color={(data?.user?.tokens ?? 0) <= 1 ? '#94A3B8' : '#EC4899'}
                          />
                        </View>
                        <Text style={[
                          styles.addMemberBtnText,
                          (data?.user?.tokens ?? 0) <= 1 && styles.addMemberBtnTextDisabled
                        ]}>Add Member</Text>
                      </LinearGradient>
                    </Pressable>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Affiliate Center Banner (For Users who have completed a test) */}
            {data?.user?.roleId === 3 && activityData && activityData.length > 0 && (
              <Pressable 
                onPress={() => navigation.navigate('AffiliatorDashboard')}
                style={({ pressed }) => [
                  { 
                    marginTop: 0,
                    marginBottom: 32,
                    borderRadius: 16, 
                    overflow: 'hidden',
                    shadowColor: '#6366F1',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    elevation: 4
                  },
                  pressed && { transform: [{ scale: 0.98 }], opacity: 0.95 }
                ]}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#6366F1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}
                >
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                    <MaterialCommunityIcons name="storefront-outline" size={24} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 4 }}>Affiliate Center</Text>
                    <Text style={{ color: '#D1FAE5', fontSize: 13, lineHeight: 18 }}>Bagikan link Anda dan dapatkan komisi</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color="#FFFFFF" />
                </LinearGradient>
              </Pressable>
            )}

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
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        {t.isFree ? (
                          <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                            <Text style={{ color: '#166534', fontSize: 12, fontWeight: '700' }}>Free Access</Text>
                          </View>
                        ) : null}
                        <View style={[styles.playBtn, { backgroundColor: t.color, flex: 1 }]}>
                          <Text style={styles.playBtnText}>Mulai Tes</Text>
                          <Feather name="arrow-right" size={16} color="#FFF" />
                        </View>
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
                    const isDisc = item.testType === 'DISC';
                    const rawDate = new Date(item.createdAt);
                    const isValidDate = !isNaN(rawDate.getTime());
                    const date = isValidDate
                      ? rawDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                      : null;
                    const discNameMap: Record<string, string> = {
                      D: 'Dominance',
                      I: 'Influence',
                      S: 'Steadiness',
                      C: 'Compliance',
                    };
                    const isLast = index === activityData.length - 1;
                    return (
                      <View style={[styles.activityItem, !isLast && styles.activityDivider]}>
                        <View style={styles.activityIconBox}>
                          <Feather name="check-circle" size={20} color="#10B981" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 16 }}>
                          <Text style={styles.activityName}>
                            {item.testType === 'DISC' ? 'DISC Test' : item.testType === 'Graphology' ? 'Graphology Test' : 'Cognitive Style Test'}
                          </Text>
                          <Text style={styles.activityResult}>
                            Hasil: <Text style={{ fontWeight: '600', color: '#4F46E5' }}>
                              {item.testType === 'DISC'
                                ? (() => {
                                  const code = item.thinkingStyle?.code || '';
                                  const name = discNameMap[code] || item.thinkingStyle?.type || code;
                                  return `${code} (${name})`;
                                })()
                                : item.testType === 'Graphology'
                                  ? (item.thinkingStyle?.type || 'Proses Analisis')
                                  : (item.thinkingStyle?.type || 'Unknown')}
                            </Text>
                          </Text>
                        </View>
                        {/* Only show date when valid */}
                        {date && (
                          <Text style={styles.activityDate}>{date}</Text>
                        )}
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
      <TestPrepSheet
        visible={prepKey !== null}
        onClose={closePrep}
        title={prepTitle}
        subtitle={prepSubtitle}
        theme={prepTheme}
        chips={prepChips}
        aboutTitle={prepAboutTitle}
        aboutBody={prepAboutBody}
        instructions={prepInstructions}
        startLabel="Mulai Tes"
        onStart={startFromPrep}
        startDisabled={prepKey === 'disc' && discQLoading}
      />
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

  // Enhanced Token Card Styles - Modern E-Wallet Design
  tokenCardWrapper: {
    borderRadius: 28,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
    marginBottom: 32,
    overflow: 'hidden'
  },
  tokenCardGradient: {
    borderRadius: 28,
    padding: 0,
    position: 'relative',
    overflow: 'hidden'
  },

  // Decorative Elements
  decorativeCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -60,
    right: -40,
    opacity: 0.6
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: -20,
    left: -30,
    opacity: 0.5
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: 100,
    left: 30,
    opacity: 0.4
  },

  // Glassmorphism Overlay
  glassOverlay: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)'
  },

  tokenCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28
  },
  tokenLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  },
  tokenValue: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1.5,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  tokenUnit: {
    color: 'rgba(255,255,255,0.90)',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2
  },
  tokenSubtext: {
    color: 'rgba(255,255,255,0.70)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2
  },
  tokenIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    position: 'relative',
    overflow: 'hidden'
  },
  iconGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    top: 12,
    left: 12,
    opacity: 0.6
  },

  // Enhanced Button Styles
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12
  },
  topUpBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14
  },
  topUpBtnText: {
    color: '#6366F1',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3
  },
  addMemberBtnOuter: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  addMemberBtnGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  addMemberIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: 'rgba(236,72,153,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMemberBtnDisabled: {
    opacity: 0.55,
  },
  addMemberBtnText: {
    color: '#EC4899',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  addMemberBtnTextDisabled: {
    color: '#94A3B8',
  },

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
