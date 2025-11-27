import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { meApi } from '../api/auth';
import Card from '../components/basic/Card';
import PrimaryButton from '../components/basic/PrimaryButton';
import TextField from '../components/basic/TextField';
import { Feather, Ionicons } from '@expo/vector-icons';

type Me = { user?: { fullname?: string; username?: string; email?: string; phoneNumber?: string } };

export default function EditProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { data } = useQuery<Me>({ queryKey: ['me'], queryFn: async () => (await meApi()).data, retry: false });
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  useEffect(() => {
    if (data?.user) {
      setName(data.user.fullname || '');
      setUsername(data.user.username || '');
      setEmail(data.user.email || '');
      setPhone(data.user.phoneNumber || '');
    }
  }, [data]);
  const save = () => navigation.goBack();
  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Pressable style={styles.backBtn} android_ripple={{ color: '#E2E8F0' }} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color="#475569" />
        </Pressable>
        <Text style={styles.topTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: insets.bottom + 48 }}>
        <Card style={styles.formCard}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View style={styles.avatarWrap}>
              <Image source={{ uri: 'https://i.pravatar.cc/120' }} style={styles.avatar} />
              <View style={styles.camBtn}><Feather name="camera" size={16} color="#FFFFFF" /></View>
            </View>
          </View>

          <TextField label="Fullname" value={name} onChangeText={setName} inputStyle={styles.input} />
          <View style={{ height: 16 }} />
          <TextField label="Username" value={username} onChangeText={setUsername} inputStyle={styles.input} />
          <View style={{ height: 16 }} />
          <TextField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" inputStyle={styles.input} />
          <View style={{ height: 16 }} />
          <TextField label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" inputStyle={styles.input} />

          <PrimaryButton title="Save Changes" onPress={save} style={{ marginTop: 32, backgroundColor: '#4F46E5', borderRadius: 12, height: 48 }} />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#F8FAFC' },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  topTitle: { color: '#1E293B', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  formCard: { padding: 24, borderRadius: 24, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F1F5F9', borderWidth: 4, borderColor: '#FFFFFF' },
  camBtn: { position: 'absolute', right: 0, bottom: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: '#4F46E5', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  input: { borderRadius: 12, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
});
