import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, useWindowDimensions, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { registerUserApi, loginApi, meApi } from '../api/auth';
import { resolvedBaseURL } from '../api/client';
import { saveToken } from '../store/auth';
import { getReferralCode, clearReferralCode } from '../store/referral';
import GradientBackground from '../components/ui/GradientBackground';
import Card from '../components/basic/Card';
import TextField from '../components/basic/TextField';
import PrimaryButton from '../components/basic/PrimaryButton';
import SegmentedTabs from '../components/ui/SegmentedTabs';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function RegisterScreen({ navigation, route }: any) {
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [referralCode, setReferralCode] = useState<string | undefined>(route?.params?.referralCode || route?.params?.ref);

  const { width } = useWindowDimensions();
  const isWide = width >= 600;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!referralCode) {
      getReferralCode().then(code => {
        if (code) setReferralCode(code);
      });
    }
  }, []);

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
      await registerUserApi({
        username,
        email,
        password,
        fullname,
        address,
        phoneNumber: sanitizedPhone,
        roleId: 3,
        referralCode
      });
      const res = await loginApi(email, password);
      await saveToken(res.data.token);
      await clearReferralCode();

      // Get user role after registration
      const meResponse = await meApi();
      const userRole = meResponse?.data?.user?.role?.name;

      if (userRole === 'Affiliator') {
        navigation.replace('AffiliatorDashboard');
      } else if (userRole === 'Mitra') {
        navigation.replace('MitraDashboard');
      } else {
        navigation.replace('Dashboard');
      }
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 24 }} keyboardShouldPersistTaps="handled">
          <LinearGradient colors={["#0F172A", "#183048"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingHorizontal: 24, paddingTop: insets.top + 20, paddingBottom: 40, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Image source={require('../../assets/logo-mahirku-no-bg.png')} style={{ width: 72, height: 72 }} />
              <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginTop: 6, textAlign: 'center' }}>Mahirku</Text>
            </View>
            <View style={{ marginTop: 16 }}>
              <SegmentedTabs items={["Login", "Register"]} activeIndex={1} onChange={(i) => (i === 0 ? navigation.replace('Login') : null)} />
            </View>
          </LinearGradient>
          <View style={{ paddingHorizontal: 24, marginTop: -24 }}>
            <Card>
              <View style={{ gap: 12 }}>
                <TextField label="Nama Lengkap" value={fullname} onChangeText={setFullname} containerStyle={{ width: '100%' }} startIcon={<Feather name="user" size={18} color="#64748B" />} inputStyle={{ borderRadius: 28, height: 54 }} />
                <TextField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" textContentType="emailAddress" containerStyle={{ width: '100%' }} startIcon={<Feather name="mail" size={18} color="#64748B" />} inputStyle={{ borderRadius: 28, height: 54 }} />
                <TextField label="Username" value={username} onChangeText={setUsername} containerStyle={{ width: '100%' }} startIcon={<Feather name="at-sign" size={18} color="#64748B" />} inputStyle={{ borderRadius: 28, height: 54 }} />
                <TextField label="No. HP" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" containerStyle={{ width: '100%' }} startIcon={<Feather name="phone" size={18} color="#64748B" />} inputStyle={{ borderRadius: 28, height: 54 }} />
                <TextField label="Alamat" value={address} onChangeText={setAddress} containerStyle={{ width: '100%' }} startIcon={<Feather name="map-pin" size={18} color="#64748B" />} inputStyle={{ borderRadius: 28, height: 54 }} />
                <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry secureToggle textContentType="password" containerStyle={{ width: '100%' }} startIcon={<Feather name="lock" size={18} color="#64748B" />} inputStyle={{ borderRadius: 28, height: 54 }} />
              </View>
              {error ? <Text style={{ color: '#ef4444', marginTop: 8, fontSize: 13 }}>{error}</Text> : null}
              <PrimaryButton title="Register" onPress={register} loading={loading} style={{ marginTop: 16, backgroundColor: '#2563EB', borderRadius: 24, height: 52 }} />
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
