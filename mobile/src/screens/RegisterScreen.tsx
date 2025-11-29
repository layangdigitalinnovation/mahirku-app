import React, { useState } from 'react';
import { View, ScrollView, Text, useWindowDimensions } from 'react-native';
import { registerUserApi, loginApi } from '../api/auth';
import { resolvedBaseURL } from '../api/client';
import { saveToken } from '../store/auth';
import GradientBackground from '../components/ui/GradientBackground';
import Card from '../components/basic/Card';
import TextField from '../components/basic/TextField';
import PrimaryButton from '../components/basic/PrimaryButton';
import SegmentedTabs from '../components/ui/SegmentedTabs';
import SocialAuthRow from '../components/ui/SocialAuthRow';

export default function RegisterScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { width } = useWindowDimensions();
  const isWide = width >= 600;

  const register = async () => {
    setLoading(true);
    setError('');
    try {
      if (!username || !email || !password || !fullname || !address || !phoneNumber) {
        setError('Mohon lengkapi semua field');
        setLoading(false);
        return;
      }
      const sanitizedPhone = String(phoneNumber).replace(/\D/g, '');
      await registerUserApi({ username, email, password, fullname, address, phoneNumber: sanitizedPhone, roleId: 3 });
      const res = await loginApi(email, password);
      await saveToken(res.data.token);
      navigation.replace('Dashboard');
    } catch (e) {
      const hasResponse = (e as any)?.response;
      if (!hasResponse) {
        setError(`Tidak bisa terhubung ke server: ${resolvedBaseURL}`);
      } else {
        const status = (e as any)?.response?.status;
        const dataMsg = (e as any)?.response?.data?.message || (e as any)?.response?.data?.error;
        setError(dataMsg || `Registrasi gagal (${status})`);
      }
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <GradientBackground>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingVertical: 24 }}>
          <View style={{ padding: 24 }}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: '#0F172A', fontSize: 28, fontWeight: '800', letterSpacing: 0.3 }}>Create an account</Text>
              <Text style={{ color: '#64748B', marginTop: 8, fontSize: 14 }}>
                Already have an account?{' '}
                <Text
                  style={{ color: '#3B82F6', fontWeight: '700' }}
                  onPress={() => navigation.replace('Login')}
                >
                  Log in
                </Text>
              </Text>
            </View>
            <SegmentedTabs items={["Login", "Register"]} activeIndex={1} onChange={(i) => (i === 0 ? navigation.replace('Login') : null)} />
            <View style={{ height: 16 }} />
            <Card>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
                <TextField label="Nama Lengkap" value={fullname} onChangeText={setFullname} containerStyle={{ width: '48%' }} />
                <TextField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" containerStyle={{ width: '48%' }} />
                <TextField label="Username" value={username} onChangeText={setUsername} containerStyle={{ width: '48%' }} />
                <TextField label="No. HP" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" containerStyle={{ width: '48%' }} />
                <TextField label="Alamat" value={address} onChangeText={setAddress} containerStyle={{ width: '100%' }} />
                <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry secureToggle containerStyle={{ width: '100%' }} />
              </View>
              {error ? <Text style={{ color: '#ef4444', marginTop: 8 }}>{error}</Text> : null}
              <PrimaryButton title="Register" onPress={register} loading={loading} style={{ marginTop: 16, backgroundColor: '#3B82F6' }} />
            </Card>
          </View>
        </ScrollView>
      </View>
    </GradientBackground>
  );
}
