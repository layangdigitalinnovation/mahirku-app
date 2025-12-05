import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { meApi } from '../api/auth';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../components/basic/Card';
import PrimaryButton from '../components/basic/PrimaryButton';
import BottomTabs from '../components/navigation/BottomTabs';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

type Me = { user?: { tokens?: number } };

export default function TestScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { data } = useQuery<Me>({ queryKey: ['me'], queryFn: async () => (await meApi()).data, retry: false });
  const tokens = data?.user?.tokens ?? 0;
  const startCognitive = () => navigation.navigate('CognitiveDataEntry');
  const startDisc = () => navigation.navigate('DiscTest');

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
      onPress: startDisc
    },
    {
      key: 'grp',
      title: 'Graphology',
      subtitle: 'Analisis Tulisan',
      desc: 'Ungkap karakter tersembunyi dari tulisan tangan.',
      icon: 'edit-3',
      iconLib: 'Feather',
      color: '#8B5CF6',
      available: false,
      onPress: () => { }
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
