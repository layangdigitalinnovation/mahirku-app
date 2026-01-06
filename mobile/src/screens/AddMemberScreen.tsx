import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Feather, Ionicons } from '@expo/vector-icons';
import Card from '../components/basic/Card';
import PrimaryButton from '../components/basic/PrimaryButton';
import TextField from '../components/basic/TextField';
import { addChildUser, type AddChildPayload } from '../api/childUser';
import { meApi } from '../api/auth';

export default function AddMemberScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: async () => (await meApi()).data,
    retry: false,
  });

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullname, setFullname] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const addMut = useMutation({
    mutationFn: async () => {
      const payload: AddChildPayload = {
        username: username.trim(),
        email: email.trim(),
        fullname: fullname.trim(),
        address: address.trim(),
        phoneNumber: String(phoneNumber).replace(/\D/g, ''),
        password,
      };
      return addChildUser(payload);
    },
    onSuccess: async () => {
      Alert.alert('Berhasil', 'Member berhasil ditambahkan.');
      setUsername(''); setEmail(''); setFullname(''); setAddress(''); setPhoneNumber(''); setPassword('');
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message || e?.message || 'Gagal menambah member.';
      setError(msg);
      Alert.alert('Gagal', msg);
    }
  });

  const canAddMember = (me?.user?.tokens ?? 0) > 1;
  const allFilled = username && email && fullname && address && phoneNumber && password;

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Pressable style={styles.backBtn} android_ripple={{ color: '#E2E8F0' }} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color="#475569" />
        </Pressable>
        <Text style={styles.topTitle}>Tambah Member</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: insets.bottom + 48 }}>
        <Text style={styles.pageTitle}>Tambah Member</Text>
        <Text style={styles.pageSubtitle}>Tambah akun member baru untuk menggunakan platform Mahirku.</Text>

        <Card style={{ borderRadius: 24, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={styles.iconWrap}><Feather name="users" size={20} color="#4F46E5" /></View>
            <Text style={styles.sectionHeader}>Tambah Member</Text>
          </View>

          <View style={{ gap: 12 }}>
            <TextField label="Username" value={username} onChangeText={setUsername} placeholder="mis. anak1" autoCapitalize="none" startIcon={<Feather name="user" size={18} color="#7F8EA3" />} />
            <TextField label="Email" value={email} onChangeText={setEmail} placeholder="email@domain.com" keyboardType="email-address" autoCapitalize="none" textContentType="emailAddress" startIcon={<Feather name="mail" size={18} color="#7F8EA3" />} />
            <TextField label="Nama Lengkap" value={fullname} onChangeText={setFullname} placeholder="Nama lengkap" startIcon={<Feather name="type" size={18} color="#7F8EA3" />} />
            <TextField label="Nomor HP" value={phoneNumber} onChangeText={setPhoneNumber} placeholder="08xxxxxxxxxx" keyboardType="phone-pad" startIcon={<Feather name="phone" size={18} color="#7F8EA3" />} />
            <TextField label="Alamat" value={address} onChangeText={setAddress} placeholder="Alamat rumah" multiline startIcon={<Feather name="map-pin" size={18} color="#7F8EA3" />} />
            <TextField label="Password" value={password} onChangeText={setPassword} placeholder="Password sementara" secureTextEntry secureToggle startIcon={<Feather name="lock" size={18} color="#7F8EA3" />} />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={{ color: '#64748B', fontSize: 13 }}>Token Anda: <Text style={{ color: '#0F172A', fontWeight: '700' }}>{me?.user?.tokens ?? 0}</Text></Text>
              <PrimaryButton
                title="Tambah"
                leftIcon={<Feather name="user-plus" size={18} color="#FFFFFF" />}
                onPress={() => addMut.mutate()}
                disabled={!canAddMember || !allFilled}
                loading={addMut.isPending}
                style={{ height: 44, borderRadius: 12 }}
              />
            </View>

            {!canAddMember ? (
              <Text style={{ color: '#EF4444', fontSize: 12 }}>Anda memerlukan lebih dari 1 token untuk menambah member.</Text>
            ) : null}
            {error ? (<Text style={{ color: '#EF4444', fontSize: 12 }}>{error}</Text>) : null}
          </View>
        </Card>
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
  iconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E0E7FF' },
  sectionHeader: { color: '#1E293B', fontSize: 16, fontWeight: '700', marginLeft: 12 },
  avatarSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E0E7FF' },
  memberName: { color: '#0F172A', fontWeight: '700', fontSize: 14 },
  memberMeta: { color: '#64748B', fontSize: 12 },
  tokenBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F5F3FF', borderWidth: 1, borderColor: '#EDE9FE' },
  tokenBadgeText: { color: '#7C3AED', fontWeight: '600', fontSize: 12 },
})

