import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Feather, Ionicons } from '@expo/vector-icons';
import Card from '../components/basic/Card';
import { getChildrenUsers, type ChildUser } from '../api/childUser';

export default function MemberListScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { data, isFetching } = useQuery<ChildUser[]>({ queryKey: ['childrenUsers'], queryFn: getChildrenUsers, retry: false });

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Pressable style={styles.backBtn} android_ripple={{ color: '#E2E8F0' }} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color="#475569" />
        </Pressable>
        <Text style={styles.topTitle}>Daftar Member</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: insets.bottom + 48 }}>
        <Text style={styles.pageTitle}>Member</Text>
        <Text style={styles.pageSubtitle}>Lihat semua member yang sudah ditambahkan.</Text>

        {isFetching ? (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ color: '#94A3B8', fontSize: 14 }}>Memuat...</Text>
          </View>
        ) : (data ?? []).length === 0 ? (
          <Card style={{ padding: 16, borderRadius: 16, marginTop: 12 }}>
            <Text style={{ color: '#64748B' }}>Belum ada member. Tekan tombol di atas untuk menambah.</Text>
          </Card>
        ) : (
          <View style={{ gap: 12, marginTop: 12 }}>
            {(data ?? []).map((c) => (
              <Card key={c.id} style={{ padding: 16, borderRadius: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.avatarSmall}><Feather name="user" size={16} color="#4F46E5" /></View>
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.memberName}>{c.fullname || c.username}</Text>
                    <Text style={styles.memberMeta}>{c.email}</Text>
                    <Text style={styles.memberMeta}>Ditambahkan: {new Date(c.createdAt).toLocaleDateString('id-ID')}</Text>
                  </View>
                  <View style={styles.tokenBadge}><Text style={styles.tokenBadgeText}>{c.tokens} Token</Text></View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#F8FAFC' },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  topTitle: { color: '#1E293B', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  pageTitle: { color: '#0F172A', fontWeight: '700', fontSize: 20, marginBottom: 6, letterSpacing: -0.5 },
  pageSubtitle: { color: '#64748B', fontSize: 14, lineHeight: 20, marginBottom: 16 },
  avatarSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E0E7FF' },
  memberName: { color: '#0F172A', fontWeight: '700', fontSize: 14 },
  memberMeta: { color: '#64748B', fontSize: 12 },
  tokenBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F5F3FF', borderWidth: 1, borderColor: '#EDE9FE' },
  tokenBadgeText: { color: '#7C3AED', fontWeight: '600', fontSize: 12 },
});

