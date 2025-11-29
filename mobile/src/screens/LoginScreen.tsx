import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { saveToken, loadToken, clearToken } from '../store/auth';
import { loginApi, meApi } from '../api/auth';
import { resolvedBaseURL } from '../api/client';
import GradientBackground from '../components/ui/GradientBackground';
import Card from '../components/basic/Card';
import TextField from '../components/basic/TextField';
import PrimaryButton from '../components/basic/PrimaryButton';
import SegmentedTabs from '../components/ui/SegmentedTabs';
import Checkbox from '../components/ui/Checkbox';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    const init = async () => {
      const token = await loadToken();
      if (token) {
        try {
          await meApi();
          navigation.replace('Dashboard');
        } catch {
          await clearToken();
        }
      }
    };
    init();
  }, [navigation]);
  const login = async () => {
    setLoading(true);
    try {
      const res = await loginApi(email, password);
      await saveToken(res.data.token);
      navigation.replace('Dashboard');
    } catch (e) {
      const hasResponse = (e as any)?.response;
      if (!hasResponse) {
        setError(`Tidak bisa terhubung ke server: ${resolvedBaseURL}`);
      } else {
        const status = (e as any)?.response?.status;
        const msg = (e as any)?.response?.data?.message || 'Login gagal';
        setError(`${msg} (${status})`);
      }
    } finally {
      setLoading(false);
    }
  };

  
  const goRegister = () => navigation.navigate('Register');
  return (
    <GradientBackground>
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ color: '#0F172A', fontSize: 32, fontWeight: '800', letterSpacing: 0.5 }}>Mahirku</Text>
          <Text style={{ color: '#64748B', fontSize: 15, marginTop: 6, fontWeight: '500' }}>Sign in to your account</Text>
        </View>
        <SegmentedTabs items={["Login", "Register"]} activeIndex={0} onChange={(i) => (i === 1 ? goRegister() : null)} />
        <View style={{ height: 16 }} />
        <Card>
          <TextField label="Email" value={email} onChangeText={setEmail} placeholder="nama@domain.com" />
          <View style={{ height: 12 }} />
          <TextField label="Password" value={password} onChangeText={setPassword} placeholder="********" secureTextEntry secureToggle />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <Checkbox checked={remember} onChange={setRemember} label="Remember Me" />
            <Text style={{ color: '#5A6B85' }}>Forgot Password</Text>
          </View>
          {error ? <Text style={{ color: '#ef4444', marginTop: 8 }}>{error}</Text> : null}
          <PrimaryButton title="Login" onPress={login} loading={loading} style={{ marginTop: 16, backgroundColor: '#3B82F6' }} />

        </Card>
      </View>
    </GradientBackground>
  );
}
