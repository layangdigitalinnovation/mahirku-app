import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import Card from '../components/basic/Card';
import PrimaryButton from '../components/basic/PrimaryButton';
import TextField from '../components/basic/TextField';
import { addChildUser, type AddChildPayload } from '../api/childUser';
import { addMember as addMitraMember, type AddMemberPayload } from '../api/mitra';
import { meApi } from '../api/auth';

export default function AddMemberScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: async () => (await meApi()).data,
    retry: false,
  });

  const isMitra = me?.user?.role?.name?.toLowerCase() === 'mitra';
  const userTokens = me?.user?.tokens ?? 0;

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullname, setFullname] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const addMut = useMutation({
    mutationFn: async () => {
      const payload = {
        username: username.trim(),
        email: email.trim(),
        fullname: fullname.trim(),
        address: address.trim(),
        phoneNumber: String(phoneNumber).replace(/\D/g, ''),
        password,
      };

      if (isMitra) {
        return addMitraMember(payload as AddMemberPayload);
      } else {
        return addChildUser(payload as AddChildPayload);
      }
    },
    onSuccess: async () => {
      Alert.alert('Berhasil', 'Member berhasil ditambahkan.');
      setUsername(''); setEmail(''); setFullname(''); setAddress(''); setPhoneNumber(''); setPassword('');
      navigation.goBack();
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message || e?.message || 'Gagal menambah member.';
      setError(msg);
      Alert.alert('Gagal', msg);
    }
  });

  // Mitra does not need tokens. Regular users need > 1 token.
  const canAddMember = isMitra || userTokens > 1;
  const allFilled = username && email && fullname && address && phoneNumber && password;

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <LinearGradient
        colors={['#EEF2FF', '#F1F5F9', '#F8FAFC']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.3 }}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Pressable style={styles.backBtn} android_ripple={{ color: '#E2E8F0' }} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.topTitle}>Tambah Member</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: insets.bottom + 48 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <View style={styles.iconBigWrap}>
              <Feather name="user-plus" size={28} color="#6366F1" />
            </View>
            <View>
              <Text style={styles.pageTitle}>Data Member Baru</Text>
              <Text style={styles.pageSubtitle}>Lengkapi data di bawah untuk menambahkan.</Text>
            </View>
          </View>

          <Card style={styles.formCard}>
            <View style={{ gap: 16 }}>
              <TextField
                label="Username"
                value={username}
                onChangeText={setUsername}
                placeholder="Buat username unik"
                autoCapitalize="none"
                startIcon={<Feather name="user" size={18} color="#94A3B8" />}
              />
              <TextField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Contoh: member@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                textContentType="emailAddress"
                startIcon={<Feather name="mail" size={18} color="#94A3B8" />}
              />
              <TextField
                label="Nama Lengkap"
                value={fullname}
                onChangeText={setFullname}
                placeholder="Nama sesuai KTP"
                startIcon={<Feather name="type" size={18} color="#94A3B8" />}
              />
              <TextField
                label="Nomor HP"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Contoh: 08123456789"
                keyboardType="phone-pad"
                startIcon={<Feather name="phone" size={18} color="#94A3B8" />}
              />
              <TextField
                label="Alamat"
                value={address}
                onChangeText={setAddress}
                placeholder="Alamat lengkap domisili"
                multiline
                startIcon={<Feather name="map-pin" size={18} color="#94A3B8" />}
              />
              <TextField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Buat password sementara"
                secureTextEntry
                secureToggle
                startIcon={<Feather name="lock" size={18} color="#94A3B8" />}
              />

              {/* Token Info / Action Section */}
              <View style={styles.actionSection}>
                {!isMitra ? (
                  <View style={styles.tokenInfo}>
                    <MaterialCommunityIcons name="ticket-percent-outline" size={16} color="#64748B" />
                    <Text style={{ color: '#64748B', fontSize: 13 }}>Token Anda: <Text style={{ color: '#0F172A', fontWeight: '700' }}>{userTokens}</Text></Text>
                  </View>
                ) : (
                  <View style={styles.tokenInfo}>
                    <MaterialCommunityIcons name="check-decagram" size={16} color="#10B981" />
                    <Text style={{ color: '#10B981', fontSize: 13, fontWeight: '600' }}>Mitra Access: Gratis</Text>
                  </View>
                )}

                <PrimaryButton
                  title="Simpan Member"
                  onPress={() => addMut.mutate()}
                  disabled={!canAddMember || !allFilled}
                  loading={addMut.isPending}
                  style={[styles.submitBtn, (!canAddMember || !allFilled) && styles.disabledBtn]}
                  textStyle={{ fontWeight: '600', fontSize: 15 }}
                />
              </View>

              {!canAddMember && !isMitra ? (
                <View style={styles.errorBox}>
                  <Feather name="alert-circle" size={16} color="#EF4444" />
                  <Text style={{ color: '#EF4444', fontSize: 12, flex: 1 }}>Saldo token tidak mencukupi untuk menambah member baru.</Text>
                </View>
              ) : null}

              {error ? (
                <View style={styles.errorBox}>
                  <Feather name="alert-circle" size={16} color="#EF4444" />
                  <Text style={{ color: '#EF4444', fontSize: 12, flex: 1 }}>{error}</Text>
                </View>
              ) : null}
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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

  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
    paddingHorizontal: 4
  },
  iconBigWrap: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF'
  },
  pageTitle: { color: '#0F172A', fontWeight: '800', fontSize: 20, marginBottom: 4 },
  pageSubtitle: { color: '#64748B', fontSize: 13 },

  formCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3
  },

  actionSection: { marginTop: 12, gap: 16 },
  tokenInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', paddingVertical: 4 },
  submitBtn: { height: 50, borderRadius: 14, backgroundColor: '#6366F1', shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 },
  disabledBtn: { backgroundColor: '#CBD5E1', shadowOpacity: 0 },

  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#FEE2E2', marginTop: 8 }
});

