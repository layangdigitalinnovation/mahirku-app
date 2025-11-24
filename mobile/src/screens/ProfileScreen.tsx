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
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={[styles.topBar, { paddingTop: insets.top + 16 }]}>
        <Pressable style={styles.backBtn} android_ripple={{ color: '#EAF4FF' }} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color="#334155" />
        </Pressable>
        <Text style={styles.topTitle}>Profile Setting</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: insets.bottom + 48 }}>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: 'https://i.pravatar.cc/120' }} style={styles.avatar} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.name}>{data?.user?.fullname || 'Akun'}</Text>
              <Text style={styles.email}>{data?.user?.email || 'you@mail.com'}</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>General</Text>
        <Card>
          <Pressable style={styles.item} android_ripple={{ color: '#EAF4FF' }} onPress={goEdit}>
            <Feather name="user" size={18} color="#334155" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.itemTitle}>Edit Profile</Text>
              <Text style={styles.itemSubtitle}>Ubah foto, nama, nomor, email</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.item} android_ripple={{ color: '#EAF4FF' }}>
            <Feather name="lock" size={18} color="#334155" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.itemTitle}>Change Password</Text>
              <Text style={styles.itemSubtitle}>Perbarui keamanan akun</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.item} android_ripple={{ color: '#EAF4FF' }}>
            <Feather name="shield" size={18} color="#334155" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.itemTitle}>Terms of Use</Text>
              <Text style={styles.itemSubtitle}>Pelajari syarat penggunaan</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.item} android_ripple={{ color: '#EAF4FF' }} onPress={() => navigation.navigate('InvoiceHistory')}>
            <Feather name="shopping-bag" size={18} color="#334155" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.itemTitle}>Invoice History</Text>
              <Text style={styles.itemSubtitle}>Lacak semua transaksi pembelian token Anda</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </Pressable>
          
        </Card>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <Card>
          <View style={styles.item}>
            <Feather name="bell" size={18} color="#334155" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.itemTitle}>Notification</Text>
              <Text style={styles.itemSubtitle}>Atur preferensi notifikasi</Text>
            </View>
            <Switch value={notif} onValueChange={setNotif} />
          </View>
          <View style={styles.divider} />
          <Pressable style={styles.item} android_ripple={{ color: '#EAF4FF' }}>
            <Feather name="help-circle" size={18} color="#334155" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.itemTitle}>FAQ</Text>
              <Text style={styles.itemSubtitle}>Bantuan dan pertanyaan umum</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={[styles.item]} android_ripple={{ color: '#FFE4E6' }} onPress={logout}>
            <Feather name="log-out" size={18} color="#ef4444" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.itemTitle, { color: '#ef4444' }]}>Log Out</Text>
              <Text style={[styles.itemSubtitle, { color: '#ef4444' }]}>Keluar dari akun</Text>
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
          if (key !== 'profile') navigation.replace('Dashboard');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 8, backgroundColor: '#FFFFFF' },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9' },
  topTitle: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  name: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
  email: { color: '#64748B', marginTop: 4 },
  sectionTitle: { color: '#0F172A', fontWeight: '800', fontSize: 14, marginTop: 16, marginBottom: 8 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  itemTitle: { color: '#0F172A', fontWeight: '700' },
  itemSubtitle: { color: '#64748B' },
  divider: { height: 1, backgroundColor: '#E2E8F0' },
});
