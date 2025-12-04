import React, { useEffect, useState } from 'react';
import { View, Text, KeyboardAvoidingView, ScrollView, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { saveToken, loadToken, clearToken } from '../store/auth';
import { loginApi, meApi } from '../api/auth';
import { resolvedBaseURL } from '../api/client';
import GradientBackground from '../components/ui/GradientBackground';
import Card from '../components/basic/Card';
import TextField from '../components/basic/TextField';
import PrimaryButton from '../components/basic/PrimaryButton';
import SegmentedTabs from '../components/ui/SegmentedTabs';
import Checkbox from '../components/ui/Checkbox';
import SocialAuthRow from '../components/ui/SocialAuthRow';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);
  const insets = useSafeAreaInsets();

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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={["#0F172A", "#183048"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingHorizontal: 24, paddingTop: insets.top + 20, paddingBottom: 40, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Image source={require('../../assets/logo-mahirku-no-bg.png')} style={{ width: 72, height: 72 }} />
            <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginTop: 6, textAlign: 'center' }}>Mahirku</Text>
          </View>
          <View style={{ marginTop: 16 }}>
            <SegmentedTabs items={["Login", "Register"]} activeIndex={0} onChange={(i) => (i === 1 ? goRegister() : null)} />
          </View>
        </LinearGradient>
        <View style={{ paddingHorizontal: 24, marginTop: -24 }}>
        <View style={{ height: 16 }} />
        <Card>
          <TextField label="Email" value={email} onChangeText={setEmail} placeholder="nama@domain.com" keyboardType="email-address" autoCapitalize="none" textContentType="emailAddress" startIcon={<Feather name="mail" size={18} color="#64748B" />} inputStyle={{ borderRadius: 28, height: 54 }} />
          <View style={{ height: 12 }} />
          <TextField label="Password" value={password} onChangeText={setPassword} placeholder="********" secureTextEntry secureToggle textContentType="password" startIcon={<Feather name="lock" size={18} color="#64748B" />} inputStyle={{ borderRadius: 28, height: 54 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <Checkbox checked={remember} onChange={setRemember} label="Remember Me" />
            <Text style={{ color: '#3B82F6', fontWeight: '600' }}>Forgot Password?</Text>
          </View>
          {error ? <Text style={{ color: '#ef4444', marginTop: 8 }}>{error}</Text> : null}
          <PrimaryButton title="Login" onPress={login} loading={loading} style={{ marginTop: 16, backgroundColor: '#2563EB', borderRadius: 24, height: 52 }} />
          <View style={{ alignItems: 'center', marginTop: 16 }}>
            <Text style={{ color: '#64748B' }}>Or login with</Text>
          </View>
          <SocialAuthRow />

        </Card>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
