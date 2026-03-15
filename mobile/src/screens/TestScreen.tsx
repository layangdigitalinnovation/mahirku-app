import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { meApi } from '../api/auth';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../components/basic/Card';
import PrimaryButton from '../components/basic/PrimaryButton';
import BottomTabs from '../components/navigation/BottomTabs';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import TestPrepSheet, { type TestPrepChip } from '../components/ui/TestPrepSheet';
import { getDiscQuestions } from '../api/disc';

type Me = { user?: { tokens?: number } };

export default function TestScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { data, refetch } = useQuery<Me>({ queryKey: ['me'], queryFn: async () => (await meApi()).data, retry: false });
  const tokens = data?.user?.tokens ?? 0;
  const [prepKey, setPrepKey] = useState<'cst' | 'disc' | null>(null);
  const [discQCount, setDiscQCount] = useState<number | null>(null);
  const [discQLoading, setDiscQLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const startCognitive = () => {
    if (tokens <= 0) {
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
    setPrepKey('cst');
  };

  const startGraphology = () => {
    if (tokens <= 0) {
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
    navigation.navigate('GraphologyIntro');
  };

  const openDiscPrep = () => setPrepKey('disc');

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

  const tests = [
    {
      key: 'cst',
      title: 'Cognitive Style',
      subtitle: 'Analisis Pola Pikir',
      desc: 'Temukan potensi dan gaya berpikir unik Anda.',
      icon: 'brain',
      iconLib: 'MaterialCommunityIcons',
      color: '#4F46E5',
      available: true,
      meta: `${tokens} Token tersedia`,
      metaIcon: 'database' as const,
      onPress: startCognitive
    },
    {
      key: 'disc',
      title: 'DISC Personality',
      subtitle: 'Profil Kepribadian',
      desc: 'Pahami karakter dan cara Anda berinteraksi.',
      icon: 'account-group',
      iconLib: 'MaterialCommunityIcons',
      color: '#0EA5E9',
      available: true,
      meta: 'Free Access',
      metaIcon: 'check-circle' as const,
      metaColor: '#10B981',
      onPress: openDiscPrep
    },
    {
      key: 'grp',
      title: 'Graphology',
      subtitle: 'Analisis Tulisan',
      desc: 'Ungkap karakter tersembunyi dari tulisan tangan.',
      icon: 'edit-3',
      iconLib: 'Feather',
      color: '#8B5CF6',
      available: true,
      meta: `${tokens} Token tersedia`,
      metaIcon: 'database' as const,
      onPress: startGraphology
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <LinearGradient
        colors={['#EEF2FF', '#F1F5F9', '#F8FAFC']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greetingText}>Pilih Tes</Text>
        <Text style={styles.pageTitle}>Tes Tersedia</Text>
        <Text style={styles.pageSubtitle}>Pilih tes yang ingin Anda kerjakan untuk mengungkap potensi diri</Text>

        <View style={{ gap: 20, marginTop: 28 }}>
          {tests.map((test) => (
            <Card key={test.key} style={[styles.testCard, !test.available && { opacity: 0.6 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={[styles.testIconWrap, { backgroundColor: `${test.color}15` }]}>
                  {test.iconLib === 'MaterialCommunityIcons' ? (
                    <MaterialCommunityIcons name={test.icon as any} size={24} color={test.color} />
                  ) : (
                    <Feather name={test.icon as any} size={24} color={test.color} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.testTitle}>{test.title}</Text>
                  <Text style={styles.testSubtitle}>{test.subtitle}</Text>
                </View>
              </View>

              <Text style={styles.testDesc}>{test.desc}</Text>

              {test.meta && (
                <View style={styles.metaRow}>
                  <Feather name={test.metaIcon} size={14} color={test.metaColor || '#64748B'} />
                  <Text style={[styles.testMeta, test.metaColor && { color: test.metaColor, fontWeight: '600' }]}>
                    {test.meta}
                  </Text>
                </View>
              )}

              <View style={{ marginTop: 16 }}>
                {test.available ? (
                  <PrimaryButton
                    title="Mulai Tes"
                    leftIcon={<Feather name="play-circle" size={18} color="#FFFFFF" />}
                    onPress={test.onPress}
                    style={[styles.startBtn, { backgroundColor: test.color }]}
                  />
                ) : (
                  <PrimaryButton
                    title="Segera Hadir"
                    variant="secondary"
                    leftIcon={<Feather name="clock" size={18} color="#64748B" />}
                    disabled
                    onPress={() => { }}
                    style={styles.disabledBtn}
                  />
                )}
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

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
  greetingText: { color: '#64748B', fontSize: 14, fontWeight: '500', marginBottom: 4 },
  pageTitle: { color: '#1E293B', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  pageSubtitle: { color: '#64748B', fontSize: 15, marginTop: 6, lineHeight: 22 },
  testCard: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4
  },
  testIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  testTitle: { color: '#1E293B', fontWeight: '700', fontSize: 18 },
  testSubtitle: { color: '#64748B', fontSize: 13, fontWeight: '500', marginTop: 2 },
  testDesc: { color: '#64748B', fontSize: 14, lineHeight: 22 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#F8FAFC', borderRadius: 12, alignSelf: 'flex-start' },
  testMeta: { color: '#64748B', fontSize: 13, fontWeight: '500' },
  startBtn: { height: 48, borderRadius: 12 },
  disabledBtn: { height: 48, borderRadius: 12 },
});
