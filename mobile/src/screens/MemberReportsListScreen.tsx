import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, Pressable, TextInput, Alert, Modal, TouchableOpacity } from 'react-native';
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

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { data: response, isLoading } = useQuery({
    queryKey: ['memberReports'],
    queryFn: async () => await getMemberReports(),
    retry: false,
  });

  const reports = response?.data || [];

  const filteredReports = useMemo(() => {
    if (!search) return reports;
    const lowerSearch = search.toLowerCase();
    return reports.filter((r: any) => 
      r.member.fullname.toLowerCase().includes(lowerSearch) || 
      r.member.email.toLowerCase().includes(lowerSearch)
    );
  }, [reports, search]);

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  
  const paginatedReports = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredReports.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredReports, page, itemsPerPage]);

  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const getDiscTypeName = (code: string) => {
    const typeMap: { [key: string]: string } = {
      'D': 'D - Dominance',
      'I': 'I - Influence',
      'S': 'S - Steadiness',
      'C': 'C - Compliance'
    };
    return typeMap[code] || code;
  };

  const handlePressDetail = (memberReport: any) => {
    if (!memberReport.tests || memberReport.tests.length === 0) {
      Alert.alert('Info', 'Member belum menyelesaikan tes apa pun.');
      return;
    }
    setSelectedMember(memberReport);
    setModalVisible(true);
  };

  const handleSelectTest = (test: any, memberName: string) => {
    setModalVisible(false);
    const item = test.rawResult;
    
    if (test.testType === 'Graphology') {
      navigation.navigate('GraphologyResult', {
        result: item.aiResult,
        memberName: memberName
      });
      return;
    }
    
    if (test.testType === 'DISC') {
      navigation.navigate('DiscResult', {
        result: {
          id: item.id,
          dScore: item.dScore ?? item.d_score,
          iScore: item.iScore ?? item.i_score,
          sScore: item.sScore ?? item.s_score,
          cScore: item.cScore ?? item.c_score,
          dominantType: item.dominantType ?? item.dominant_type,
        }
      });
      return;
    }

    navigation.navigate('ReportDetail', {
        report: {
          id: item.id.toString(),
          title: test.testType === 'DISC' ? 'DISC Test' : 'Cognitive Style Test',
          date: new Date(item.createdAt || item.created_at).toLocaleDateString('id-ID'),
          summary: test.testType === 'DISC'
            ? getDiscTypeName(item.thinkingStyle?.code || item.dominant_type || '')
            : `${item.thinkingStyle?.type} (${item.thinkingStyle?.code})`,
          type: test.testType === 'DISC' ? 'disc' : 'cst',
          fullData: {
            ...item,
            dScore: item.dScore ?? item.d_score,
            iScore: item.iScore ?? item.i_score,
            sScore: item.sScore ?? item.s_score,
            cScore: item.cScore ?? item.c_score,
          },
          fullname: memberName,
        },
      });
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

      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama atau email..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            setPage(1); // Reset page on search
          }}
        />
        {search.length > 0 && (
          <Pressable onPress={() => { setSearch(''); setPage(1); }} style={styles.clearIcon}>
            <Feather name="x" size={18} color="#94A3B8" />
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.centerBox}>
            <Text style={{ color: '#64748B' }}>Memuat data...</Text>
          </View>
        ) : filteredReports.length === 0 ? (
          <View style={styles.centerBox}>
            <View style={styles.iconBigWrap}>
              <Feather name="users" size={32} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Data</Text>
            <Text style={styles.emptySubtitle}>Tidak ditemukan data member sesuai kriteria.</Text>
          </View>
        ) : (
          <>
            {paginatedReports.map((report: any) => (
              <Surface key={report.member.id} style={styles.memberCard} elevation={2}>
                <View style={styles.memberHeader}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>{report.member.fullname.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName} numberOfLines={1}>{report.member.fullname}</Text>
                    <Text style={styles.memberEmail} numberOfLines={1}>{report.member.email}</Text>
                  </View>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.cardFooter}>
                  <Pressable 
                    style={({ pressed }) => [
                      styles.detailBtn,
                      (!report.tests || report.tests.length === 0) && styles.detailBtnDisabled,
                      pressed && !(!report.tests || report.tests.length === 0) && { opacity: 0.8 }
                    ]}
                    onPress={() => handlePressDetail(report)}
                    disabled={!report.tests || report.tests.length === 0}
                  >
                    <Text style={[
                      styles.detailBtnText,
                      (!report.tests || report.tests.length === 0) && styles.detailBtnTextDisabled
                    ]}>
                      {(!report.tests || report.tests.length === 0) ? 'Belum Ada Test' : 'Lihat Detail'}
                    </Text>
                    {report.tests && report.tests.length > 0 && (
                      <Feather name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                    )}
                  </Pressable>
                </View>
              </Surface>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <View style={styles.paginationContainer}>
                <Pressable 
                  style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
                  onPress={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <Feather name="chevron-left" size={20} color={page === 1 ? "#94A3B8" : "#4F46E5"} />
                </Pressable>
                
                <Text style={styles.pageIndicator}>
                  Page <Text style={{ fontWeight: '700' }}>{page}</Text> of {totalPages}
                </Text>

                <Pressable 
                  style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
                  onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <Feather name="chevron-right" size={20} color={page === totalPages ? "#94A3B8" : "#4F46E5"} />
                </Pressable>
              </View>
            )}
          </>
        )}
      <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Riwayat Test Member</Text>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeModalBtn}>
                <Feather name="x" size={24} color="#64748B" />
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {selectedMember?.tests?.map((test: any, index: number) => {
                const dateStr = new Date(test.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                return (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.testItemCard}
                    onPress={() => handleSelectTest(test, selectedMember.member.fullname)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.testItemHeader}>
                      <View style={styles.testItemIcon}>
                        <MaterialCommunityIcons name={test.testType === 'Graphology' ? "fountain-pen-tip" : "brain"} size={20} color="#4F46E5" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.testItemTitle}>
                           {test.testType === 'DISC' ? 'DISC Test' : test.testType === 'Graphology' ? 'Graphology Test' : 'Cognitive Style Test'}
                        </Text>
                        <Text style={styles.testItemDate}>{dateStr}</Text>
                      </View>
                      <Feather name="chevron-right" size={20} color="#94A3B8" />
                    </View>
                    <Text style={styles.testItemSubtitle}>
                      {test.testType === 'DISC' 
                        ? getDiscTypeName(test.result?.type || test.rawResult?.dominant_type || '') 
                        : test.testType === 'Graphology'
                          ? test.result?.type
                          : `${test.result?.type || test.rawResult?.thinkingStyle?.type} (${test.result?.code || test.rawResult?.thinkingStyle?.code})`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 52,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#1E293B',
    fontSize: 15,
  },
  clearIcon: {
    padding: 16,
  },

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
  cardFooter: {
    padding: 20,
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  detailBtnDisabled: {
    backgroundColor: '#F1F5F9',
  },
  detailBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  detailBtnTextDisabled: {
    color: '#94A3B8',
  },

  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  pageBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pageBtnDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
    shadowOpacity: 0,
    elevation: 0,
  },
  pageIndicator: {
    fontSize: 14,
    color: '#64748B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: '40%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeModalBtn: {
    padding: 4,
  },
  modalScroll: {
    padding: 20,
  },
  testItemCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  testItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  testItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  testItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  testItemDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  testItemSubtitle: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
    marginLeft: 52,
  },
});
