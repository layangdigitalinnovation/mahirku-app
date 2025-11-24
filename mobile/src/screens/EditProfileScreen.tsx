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
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={[styles.topBar, { paddingTop: insets.top + 16 }]}>
        <Pressable style={styles.backBtn} android_ripple={{ color: '#EAF4FF' }} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color="#334155" />
        </Pressable>
        <Text style={styles.topTitle}>Edit Profile</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: insets.bottom + 48 }}>
        <Card>
          <View style={{ alignItems: 'center' }}>
            <View style={styles.avatarWrap}>
              <Image source={{ uri: 'https://i.pravatar.cc/120' }} style={styles.avatar} />
              <View style={styles.camBtn}><Feather name="camera" size={16} color="#0F172A" /></View>
            </View>
          </View>
          <View style={{ marginTop: 12 }} />
          <TextField label="Fullname" value={name} onChangeText={setName} />
          <View style={{ height: 12 }} />
          <TextField label="Username" value={username} onChangeText={setUsername} />
          <View style={{ height: 12 }} />
          <TextField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <View style={{ height: 12 }} />
          <TextField label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <PrimaryButton title="Save" onPress={save} style={{ marginTop: 16, backgroundColor: '#4F46E5' }} />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 8, backgroundColor: '#FFFFFF' },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9' },
  topTitle: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
  avatarWrap: { position: 'relative' },
  avatar: { width: 92, height: 92, borderRadius: 46, backgroundColor: '#F1F5F9' },
  camBtn: { position: 'absolute', right: -4, bottom: -4, width: 28, height: 28, borderRadius: 14, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
});
