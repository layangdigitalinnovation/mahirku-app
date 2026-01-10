import React, { useEffect, useState, useRef } from 'react';
import { View, Text, KeyboardAvoidingView, ScrollView, Platform, Image, useWindowDimensions, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { saveToken, loadToken, clearToken } from '../store/auth';
import { loginApi, meApi, registerUserApi } from '../api/auth';
import { resolvedBaseURL } from '../api/client';
import { getReferralCode, clearReferralCode } from '../store/referral';
import GradientBackground from '../components/ui/GradientBackground';
import Card from '../components/basic/Card';
import TextField from '../components/basic/TextField';
import PrimaryButton from '../components/basic/PrimaryButton';
import SegmentedTabs from '../components/ui/SegmentedTabs';
import Checkbox from '../components/ui/Checkbox';
import SocialAuthRow from '../components/ui/SocialAuthRow';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { googleLogin } from '../api/googleAuth';

// Enable warming of the browser for better UX
WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen({ navigation, route }: any) {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const scrollViewRef = useRef<ScrollView>(null);

    // Tab state
    const [activeTab, setActiveTab] = useState(0);

    // Login form states
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [remember, setRemember] = useState(false);

    // Register form states
    const [username, setUsername] = useState('');
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [address, setAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [registerLoading, setRegisterLoading] = useState(false);
    const [registerError, setRegisterError] = useState('');
    const [referralCode, setReferralCode] = useState<string | undefined>(route?.params?.referralCode || route?.params?.ref);

    // Google OAuth
    const googleWebClientId = (require('expo-constants').default?.expoConfig?.extra as any)?.GOOGLE_WEB_CLIENT_ID as string | undefined;
    const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');
    const redirectUri = AuthSession.makeRedirectUri();

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId: googleWebClientId || '',
            redirectUri,
            scopes: ['openid', 'profile', 'email'],
            responseType: AuthSession.ResponseType.IdToken,
            usePKCE: false,
        },
        discovery
    );

    useEffect(() => {
        const init = async () => {
            const token = await loadToken();
            if (token) {
                try {
                    const response = await meApi();
                    const userRole = response?.data?.user?.role?.name;
                    navigateBasedOnRole(userRole);
                } catch {
                    await clearToken();
                }
            }
            console.log('🔗 Add this redirect URI to Google Cloud Console:', redirectUri);
        };
        init();
    }, [navigation, redirectUri]);

    useEffect(() => {
        if (!referralCode) {
            getReferralCode().then(code => {
                if (code) setReferralCode(code);
            });
        }
    }, []);

    // Handle OAuth response
    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            handleGoogleLogin(id_token);
        } else if (response?.type === 'error') {
            setLoginError('Google login gagal: ' + (response.error?.message || 'Unknown error'));
            setLoginLoading(false);
        } else if (response?.type === 'dismiss' || response?.type === 'cancel') {
            setLoginLoading(false);
        }
    }, [response]);

    const navigateBasedOnRole = (userRole: string) => {
        console.log('🔍 [AUTH] Navigating based on role:', userRole);
        if (userRole === 'Affiliator') {
            console.log('✅ [AUTH] Navigating to: AffiliatorDashboard');
            navigation.replace('AffiliatorDashboard');
        } else if (userRole === 'Mitra') {
            console.log('✅ [AUTH] Navigating to: MitraDashboard');
            navigation.replace('MitraDashboard');
        } else {
            console.log('✅ [AUTH] Navigating to: Dashboard (User role:', userRole, ')');
            navigation.replace('Dashboard');
        }
    };

    const handleGoogleLogin = async (idToken: string) => {
        try {
            const res = await googleLogin(idToken);
            await saveToken(res.token);
            const meResponse = await meApi();
            const userRole = meResponse?.data?.user?.role?.name;
            navigateBasedOnRole(userRole);
        } catch (e: any) {
            const msg = e?.response?.data?.message || e?.message || 'Login Google gagal';
            setLoginError(msg);
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogin = async () => {
        setLoginLoading(true);
        setLoginError('');
        try {
            const res = await loginApi(loginEmail, loginPassword);
            await saveToken(res.data.token);
            const meResponse = await meApi();
            const userRole = meResponse?.data?.user?.role?.name;
            navigateBasedOnRole(userRole);
        } catch (e) {
            const hasResponse = (e as any)?.response;
            if (!hasResponse) {
                setLoginError(`Tidak bisa terhubung ke server: ${resolvedBaseURL}`);
            } else {
                const status = (e as any)?.response?.status;
                const msg = (e as any)?.response?.data?.message || 'Login gagal';
                setLoginError(`${msg} (${status})`);
            }
        } finally {
            setLoginLoading(false);
        }
    };

    const handleRegister = async () => {
        setRegisterLoading(true);
        setRegisterError('');
        try {
            if (!username || !email || !password || !fullname || !address || !phoneNumber) {
                setRegisterError('Mohon lengkapi semua field');
                setRegisterLoading(false);
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
            const meResponse = await meApi();
            const userRole = meResponse?.data?.user?.role?.name;
            navigateBasedOnRole(userRole);
        } catch (e) {
            const hasResponse = (e as any)?.response;
            if (!hasResponse) {
                setRegisterError(`Tidak bisa terhubung ke server: ${resolvedBaseURL}`);
            } else {
                const status = (e as any)?.response?.status;
                const dataMsg = (e as any)?.response?.data?.message || (e as any)?.response?.data?.error;
                setRegisterError(dataMsg || `Registrasi gagal (${status})`);
            }
        } finally {
            setRegisterLoading(false);
        }
    };

    const loginWithGoogle = async () => {
        setLoginError('');
        setLoginLoading(true);
        try {
            await promptAsync();
        } catch (e: any) {
            setLoginError('Gagal membuka Google Sign-In: ' + e.message);
            setLoginLoading(false);
        }
    };

    // Handle tab change
    const handleTabChange = (index: number) => {
        setActiveTab(index);
        scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
    };

    // Handle scroll event
    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(scrollPosition / width);
        if (newIndex !== activeTab) {
            setActiveTab(newIndex);
        }
    };

    return (
        <GradientBackground>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
            >
                {/* Header */}
                <LinearGradient
                    colors={["#0F172A", "#183048"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        paddingHorizontal: 24,
                        paddingTop: insets.top + 20,
                        paddingBottom: 40,
                        borderBottomLeftRadius: 24,
                        borderBottomRightRadius: 24
                    }}
                >
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={require('../../assets/logo-mahirku-no-bg.png')} style={{ width: 72, height: 72 }} />
                        <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginTop: 6, textAlign: 'center' }}>Mahirku</Text>
                    </View>
                    <View style={{ marginTop: 16 }}>
                        <SegmentedTabs items={["Login", "Register"]} activeIndex={activeTab} onChange={handleTabChange} />
                    </View>
                </LinearGradient>

                {/* Swipeable Content */}
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    pagingEnabled
                    scrollEventThrottle={16}
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    style={{ flex: 1 }}
                    scrollEnabled={true}
                >
                    {/* Login Page */}
                    <ScrollView
                        style={{ width }}
                        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: insets.bottom + 24 }}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled
                    >
                        <Card>
                            <TextField
                                label="Email"
                                value={loginEmail}
                                onChangeText={setLoginEmail}
                                placeholder="nama@domain.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                textContentType="emailAddress"
                                startIcon={<Feather name="mail" size={18} color="#64748B" />}
                                inputStyle={{ borderRadius: 28, height: 54 }}
                            />
                            <View style={{ height: 12 }} />
                            <TextField
                                label="Password"
                                value={loginPassword}
                                onChangeText={setLoginPassword}
                                placeholder="********"
                                secureTextEntry
                                secureToggle
                                textContentType="password"
                                startIcon={<Feather name="lock" size={18} color="#64748B" />}
                                inputStyle={{ borderRadius: 28, height: 54 }}
                            />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                                <Checkbox checked={remember} onChange={setRemember} label="Remember Me" />
                                <Text style={{ color: '#3B82F6', fontWeight: '600' }}>Forgot Password?</Text>
                            </View>
                            {loginError ? <Text style={{ color: '#ef4444', marginTop: 8, fontSize: 13 }}>{loginError}</Text> : null}
                            <PrimaryButton
                                title="Login"
                                onPress={handleLogin}
                                loading={loginLoading}
                                style={{ marginTop: 16, backgroundColor: '#2563EB', borderRadius: 24, height: 52 }}
                            />
                            <View style={{ alignItems: 'center', marginTop: 16 }}>
                                <Text style={{ color: '#64748B' }}>Or login with</Text>
                            </View>
                            <SocialAuthRow onGooglePress={loginWithGoogle} />
                        </Card>
                    </ScrollView>

                    {/* Register Page */}
                    <ScrollView
                        style={{ width }}
                        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: insets.bottom + 24 }}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled
                    >
                        <Card>
                            <View style={{ gap: 12 }}>
                                <TextField
                                    label="Nama Lengkap"
                                    value={fullname}
                                    onChangeText={setFullname}
                                    containerStyle={{ width: '100%' }}
                                    startIcon={<Feather name="user" size={18} color="#64748B" />}
                                    inputStyle={{ borderRadius: 28, height: 54 }}
                                />
                                <TextField
                                    label="Email"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    textContentType="emailAddress"
                                    containerStyle={{ width: '100%' }}
                                    startIcon={<Feather name="mail" size={18} color="#64748B" />}
                                    inputStyle={{ borderRadius: 28, height: 54 }}
                                />
                                <TextField
                                    label="Username"
                                    value={username}
                                    onChangeText={setUsername}
                                    containerStyle={{ width: '100%' }}
                                    startIcon={<Feather name="at-sign" size={18} color="#64748B" />}
                                    inputStyle={{ borderRadius: 28, height: 54 }}
                                />
                                <TextField
                                    label="No. HP"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="phone-pad"
                                    containerStyle={{ width: '100%' }}
                                    startIcon={<Feather name="phone" size={18} color="#64748B" />}
                                    inputStyle={{ borderRadius: 28, height: 54 }}
                                />
                                <TextField
                                    label="Alamat"
                                    value={address}
                                    onChangeText={setAddress}
                                    containerStyle={{ width: '100%' }}
                                    startIcon={<Feather name="map-pin" size={18} color="#64748B" />}
                                    inputStyle={{ borderRadius: 28, height: 54 }}
                                />
                                <TextField
                                    label="Password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    secureToggle
                                    textContentType="password"
                                    containerStyle={{ width: '100%' }}
                                    startIcon={<Feather name="lock" size={18} color="#64748B" />}
                                    inputStyle={{ borderRadius: 28, height: 54 }}
                                />
                            </View>
                            {registerError ? <Text style={{ color: '#ef4444', marginTop: 8, fontSize: 13 }}>{registerError}</Text> : null}
                            <PrimaryButton
                                title="Register"
                                onPress={handleRegister}
                                loading={registerLoading}
                                style={{ marginTop: 16, backgroundColor: '#2563EB', borderRadius: 24, height: 52 }}
                            />
                        </Card>
                    </ScrollView>
                </ScrollView>
            </KeyboardAvoidingView>
        </GradientBackground>
    );
}
