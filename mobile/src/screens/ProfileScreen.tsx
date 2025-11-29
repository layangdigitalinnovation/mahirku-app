import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Pressable, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { meApi } from '../api/auth';
import { clearToken } from '../store/auth';
import Card from '../components/basic/Card';
import BottomTabs from '../components/navigation/BottomTabs';
import { Feather, Ionicons } from '@expo/vector-icons';

type Me = { user?: { fullname?: string; email?: string; role?: { name?: string } | null } };

export default function ProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { data } = useQuery<Me>({ queryKey: ['me'], queryFn: async () => (await meApi()).data, retry: false });
  const [notif, setNotif] = useState(true);
  const logout = async () => { await clearToken(); navigation.replace('Login'); };
  const goEdit = () => navigation.navigate('EditProfile');
  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Pressable style={styles.backBtn} android_ripple={{ color: '#E2E8F0' }} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color="#475569" />
        </Pressable>
        <Text style={styles.topTitle}>Profile Setting</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: insets.bottom + 48 }}>
        <Card style={styles.profileCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.avatar, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF2FF' }] }>
              {data?.user?.fullname ? (
                <Text style={styles.avatarText}>
                  {String(data?.user?.fullname).split(' ').slice(0,2).map(s => s[0]?.toUpperCase() || '').join('')}
                </Text>
              ) : (
                <Feather name="user" size={28} color="#4F46E5" />
              )}
            </View>
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={styles.name}>{data?.user?.fullname || 'Akun'}</Text>
              <Text style={styles.email}>{data?.user?.email || 'you@mail.com'}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{data?.user?.role?.name || 'User'}</Text>
              </View>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>General</Text>
        <Card style={styles.menuCard}>
          <Pressable style={styles.item} android_ripple={{ color: '#F1F5F9' }} onPress={goEdit}>
            <View style={styles.iconWrap}><Feather name="user" size={18} color="#4F46E5" /></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.itemTitle}>Edit Profile</Text>
              <Text style={styles.itemSubtitle}>Ubah foto, nama, nomor, email</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.item} android_ripple={{ color: '#F1F5F9' }}>
            <View style={styles.iconWrap}><Feather name="lock" size={18} color="#4F46E5" /></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.itemTitle}>Change Password</Text>
              <Text style={styles.itemSubtitle}>Perbarui keamanan akun</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.item} android_ripple={{ color: '#F1F5F9' }}>
            <View style={styles.iconWrap}><Feather name="shield" size={18} color="#4F46E5" /></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.itemTitle}>Terms of Use</Text>
              <Text style={styles.itemSubtitle}>Pelajari syarat penggunaan</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.item} android_ripple={{ color: '#F1F5F9' }} onPress={() => navigation.navigate('InvoiceHistory')}>
            <View style={styles.iconWrap}><Feather name="shopping-bag" size={18} color="#4F46E5" /></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.itemTitle}>Invoice History</Text>
              <Text style={styles.itemSubtitle}>Lacak semua transaksi pembelian token Anda</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </Pressable>
        </Card>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <Card style={styles.menuCard}>
          <View style={styles.item}>
            <View style={styles.iconWrap}><Feather name="bell" size={18} color="#4F46E5" /></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.itemTitle}>Notification</Text>
              <Text style={styles.itemSubtitle}>Atur preferensi notifikasi</Text>
            </View>
            <Switch value={notif} onValueChange={setNotif} trackColor={{ false: '#E2E8F0', true: '#4F46E5' }} thumbColor={'#FFFFFF'} />
          </View>
          <View style={styles.divider} />
          <Pressable style={styles.item} android_ripple={{ color: '#F1F5F9' }}>
            <View style={styles.iconWrap}><Feather name="help-circle" size={18} color="#4F46E5" /></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.itemTitle}>FAQ</Text>
              <Text style={styles.itemSubtitle}>Bantuan dan pertanyaan umum</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={[styles.item]} android_ripple={{ color: '#FFE4E6' }} onPress={logout}>
            <View style={[styles.iconWrap, { backgroundColor: '#FEF2F2' }]}><Feather name="log-out" size={18} color="#EF4444" /></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.itemTitle, { color: '#EF4444' }]}>Log Out</Text>
              <Text style={[styles.itemSubtitle, { color: '#EF4444' }]}>Keluar dari akun</Text>
            </View>
          </Pressable>
        </Card>
      </ScrollView>

      <BottomTabs
        tabs={[
          { key: 'home', label: 'Home', icon: 'home' },
          { key: 'tests', label: 'Tests', icon: 'grid' },
          { key: 'reports', label: 'Reports', icon: 'file-text' },
          { key: 'profile', label: 'Profile', icon: 'user' },
        ]}
        activeIndex={3}
        onChange={(i) => {
          const keys = ['home', 'tests', 'reports', 'profile'];
          const key = keys[i];
          if (key === 'home') navigation.replace('Dashboard');
          if (key === 'tests') navigation.replace('Tests');
          if (key === 'reports') navigation.replace('Reports');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#F8FAFC' },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  topTitle: { color: '#1E293B', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  profileCard: { padding: 20, borderRadius: 24, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3 },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: '#F1F5F9' },
  avatarText: { color: '#4F46E5', fontSize: 20, fontWeight: '800' },
  name: { color: '#1E293B', fontSize: 18, fontWeight: '700' },
  email: { color: '#64748B', marginTop: 2, fontSize: 14 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, backgroundColor: '#EEF2FF', borderRadius: 6, marginTop: 6 },
  roleText: { color: '#4F46E5', fontSize: 12, fontWeight: '600' },
  sectionTitle: { color: '#0F172A', fontWeight: '700', fontSize: 16, marginTop: 24, marginBottom: 12, marginLeft: 4 },
  menuCard: { padding: 0, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20 },
  iconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  itemTitle: { color: '#1E293B', fontWeight: '600', fontSize: 15 },
  itemSubtitle: { color: '#64748B', fontSize: 13, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 68 },
});
