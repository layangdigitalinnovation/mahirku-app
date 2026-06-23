import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Platform, Pressable } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { getMemberReports } from '../api/childUser';

export default function MemberReportsListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();

  const { data: response, isLoading } = useQuery({
    queryKey: ['memberReports'],
    queryFn: async () => await getMemberReports(),
    retry: false,
  });

  const reports = response?.data || [];

  const handlePressTest = (test: any, memberName: string) => {
    if (test.testType === 'Graphology') {
      navigation.navigate('GraphologyResult', {
        result: test.rawResult.aiResult,
        memberName: memberName
      });
    } else {
      // For CST or DISC
      navigation.navigate('ReportDetail', {
        item: { ...test.rawResult, testType: test.testType },
        memberName: memberName
      });
    }
  };

  const getTestIcon = (testType: string) => {
    switch (testType) {
      case 'DISC': return <MaterialCommunityIcons name="chart-pie" size={20} color="#059669" />;
      case 'Graphology': return <MaterialCommunityIcons name="draw-pen" size={20} color="#7C3AED" />;
      default: return <MaterialCommunityIcons name="brain" size={20} color="#2563EB" />;
    }
  };

  const getTestBadgeStyle = (testType: string) => {
    switch (testType) {
      case 'DISC': return styles.badgeGreen;
      case 'Graphology': return styles.badgePurple;
      default: return styles.badgeBlue;
    }
  };

  const getTestBadgeTextStyle = (testType: string) => {
    switch (testType) {
      case 'DISC': return styles.badgeTextGreen;
      case 'Graphology': return styles.badgeTextPurple;
      default: return styles.badgeTextBlue;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      <LinearGradient
        colors={['#EEF2FF', '#F1F5F9', '#F8FAFC']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.3 }}
      />
      
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} android_ripple={{ color: '#E2E8F0' }} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.topTitle}>Hasil Test Member</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.centerBox}>
            <Text>Memuat data...</Text>
          </View>
        ) : reports.length === 0 ? (
          <View style={styles.centerBox}>
            <View style={styles.iconBigWrap}>
              <Feather name="users" size={32} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Member</Text>
            <Text style={styles.emptySubtitle}>Anda belum mendaftarkan member atau member Anda belum menyelesaikan test apa pun.</Text>
          </View>
        ) : (
          reports.map((report: any) => (
            <Surface key={report.member.id} style={styles.memberCard} elevation={2}>
              <View style={styles.memberHeader}>
                <View style={styles.avatarBox}>
                  <Text style={styles.avatarText}>{report.member.fullname.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{report.member.fullname}</Text>
                  <Text style={styles.memberEmail}>{report.member.email}</Text>
                </View>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.testList}>
                {report.tests.length === 0 ? (
                  <Text style={styles.noTestText}>Belum ada tes yang diselesaikan.</Text>
                ) : (
                  report.tests.map((test: any) => (
                    <Pressable
                      key={`${test.testType}-${test.id}`}
                      style={styles.testItem}
                      android_ripple={{ color: '#EEF2FF' }}
                      onPress={() => handlePressTest(test, report.member.fullname)}
                    >
                      <View style={styles.testIconBox}>
                        {getTestIcon(test.testType)}
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                          <View style={[styles.badge, getTestBadgeStyle(test.testType)]}>
                            <Text style={[styles.badgeText, getTestBadgeTextStyle(test.testType)]}>
                              {test.testType === 'CST' ? 'Cognitive Style' : test.testType}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.testResultText} numberOfLines={1}>
                          {test.result?.type || test.result?.code || 'Lihat Detail'}
                        </Text>
                        <Text style={styles.testDate}>
                          {new Date(test.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Text>
                      </View>
                      <Feather name="chevron-right" size={20} color="#94A3B8" />
                    </Pressable>
                  ))
                )}
              </View>
            </Surface>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  topTitle: { color: '#1E293B', fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  
  centerBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  iconBigWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#334155', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 },

  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4F46E5',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 13,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 20,
  },
  testList: {
    paddingVertical: 8,
  },
  noTestText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  testItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  testIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badgeBlue: { backgroundColor: '#DBEAFE' },
  badgeTextBlue: { color: '#1D4ED8' },
  badgeGreen: { backgroundColor: '#D1FAE5' },
  badgeTextGreen: { color: '#047857' },
  badgePurple: { backgroundColor: '#EDE9FE' },
  badgeTextPurple: { color: '#6D28D9' },
  
  testResultText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 2,
  },
  testDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
