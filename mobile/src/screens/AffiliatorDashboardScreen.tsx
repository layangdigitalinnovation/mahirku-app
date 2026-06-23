import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated, Alert, Share, Linking, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { meApi } from '../api/auth';
import { getReferralLink, getAffiliateStats, type AffiliateStats } from '../api/affiliate';
import { clearToken } from '../store/auth';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';

import Card from '../components/basic/Card';
import PrimaryButton from '../components/basic/PrimaryButton';
import { Feather, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';

import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function AffiliatorDashboardScreen({ navigation }: any) {
    type Me = { user?: { fullname?: string; role?: { name?: string } | null; tokens?: number; affiliateBalance?: number } };

    // Auth & User Data
    const { data: userData, isError, error, refetch: refetchUser } = useQuery<Me, AxiosError>({
        queryKey: ['me'],
        queryFn: async () => (await meApi()).data,
        retry: false,
    });

    // Affiliate Stats
    const { data: statsData, refetch: refetchStats, isLoading: statsLoading } = useQuery<AffiliateStats, AxiosError>({
        queryKey: ['affiliateStats'],
        queryFn: async () => (await getAffiliateStats()).data,
        retry: false,
    });

    // Referral Link
    const { data: referralData, refetch: refetchReferral } = useQuery({
        queryKey: ['referralLink'],
        queryFn: async () => (await getReferralLink()).data,
        retry: false,
    });

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([refetchUser(), refetchStats(), refetchReferral()]);
        setRefreshing(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            refetchUser();
            refetchStats();
            refetchReferral();
        }, [])
    );

    const fadeIn = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();

    useEffect(() => {
        Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, []);

    useEffect(() => {
        if (isError) {
            const status = error?.response?.status;
            if (status === 401 || status === 403) {
                clearToken();
                navigation.replace('Auth');
            }
        }
    }, [isError, error, navigation]);

    const handleShareLink = async () => {
        const link = referralData?.referralLink || '';
        if (!link) {
            Alert.alert('Error', 'Link referral belum tersedia');
            return;
        }
        try {
            await Share.share({
                message: `Bergabunglah dengan Mahirku dan dapatkan tes kepribadian gratis! Daftar melalui link ini: ${link}`,
                url: link,
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const handleCopyLink = async () => {
        const link = referralData?.referralLink || '';
        if (!link) {
            Alert.alert('Error', 'Link referral belum tersedia');
            return;
        }
        await Clipboard.setStringAsync(link);
        Alert.alert('Berhasil', 'Link berhasil disalin');
    };

    const handleJoinWA = () => {
        Linking.openURL('https://chat.whatsapp.com/Eceagjt11Il9dFcDndtWiQ?mode=r_c');
    };

    const getInitials = (name: string) => {
        return String(name).split(' ').slice(0, 2).map(s => s[0]?.toUpperCase() || '').join('');
    };

    const formatCurrency = (amount: number) => {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Background Gradient */}
            <LinearGradient
                colors={['#F5F3FF', '#EEF2FF', '#F8FAFC']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0.4 }}
            />

            <Animated.View style={{ flex: 1, opacity: fadeIn }}>
                <ScrollView
                    contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} />
                    }
                >
                    <View style={{ paddingHorizontal: 24, paddingTop: insets.top + 20, paddingBottom: 24 }}>

                        {/* TikTok Style Header */}
                        <View style={{ marginBottom: 24 }}>
                            <Pressable 
                                onPress={() => navigation.goBack()} 
                                style={({ pressed }) => [
                                    { alignSelf: 'flex-start', padding: 8, marginLeft: -8, marginBottom: 16 },
                                    pressed && { opacity: 0.7 }
                                ]}
                            >
                                <Feather name="x" size={28} color="#1E293B" />
                            </Pressable>
                            
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontSize: 24, fontWeight: '800', color: '#1E293B', letterSpacing: -0.5 }}>
                                    Affiliate Center
                                </Text>
                                <View style={{ backgroundColor: '#1E293B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}>
                                    <Feather name="award" size={14} color="#FBBF24" style={{ marginRight: 6 }} />
                                    <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>
                                        {userData?.user?.role?.name ?? 'Affiliator'}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Hero Card: Digital Wallet Style */}
                        <View style={styles.walletCardWrapper}>
                            <LinearGradient
                                colors={['#8B5CF6', '#6366F1', '#4F46E5']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.walletCardGradient}
                            >
                                <View style={styles.walletCardTop}>
                                    <View>
                                        <Text style={styles.walletLabel}>Komisi Affiliator</Text>
                                        <Text style={styles.walletTitle}>Total Penghasilan</Text>
                                    </View>
                                    <View style={styles.walletIconBg}>
                                        <MaterialCommunityIcons name="wallet-outline" size={24} color="#FFFFFF" />
                                    </View>
                                </View>

                                <Text style={styles.walletBalance}>
                                    {formatCurrency(statsData?.balance?.totalEarned ?? 0)}
                                </Text>

                                <View style={styles.walletDivider} />

                                <View style={styles.walletFooter}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={styles.walletFooterLabel}>Diperbarui:</Text>
                                        <Text style={styles.walletFooterValue}> Baru saja</Text>
                                    </View>
                                </View>
                            </LinearGradient>
                        </View>

                        {/* Stats Grid */}
                        <View style={styles.statsContainer}>
                            {/* Saldo Tersedia */}
                            <Card style={styles.statCard}>
                                <View style={[styles.statIconBox, { backgroundColor: '#F5F3FF' }]}>
                                    <MaterialCommunityIcons name="cash-fast" size={20} color="#6366F1" />
                                </View>
                                <View>
                                    <Text style={styles.statValue}>{formatCurrency(statsData?.balance?.available ?? 0)}</Text>
                                    <Text style={styles.statLabel}>Saldo Tersedia</Text>
                                </View>
                            </Card>

                            {/* Row for Test & Pembelian Token */}
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <Card style={[styles.statCard, { flex: 1 }]}>
                                    <View style={[styles.statIconBox, { backgroundColor: '#EFF6FF' }]}>
                                        <Feather name="check-circle" size={20} color="#3B82F6" />
                                    </View>
                                    <View>
                                        <Text style={styles.statValue}>{statsData?.statistics?.totalTests ?? 0}</Text>
                                        <Text style={styles.statLabel}>Tes Selesai</Text>
                                    </View>
                                </Card>
                                <Card style={[styles.statCard, { flex: 1 }]}>
                                    <View style={[styles.statIconBox, { backgroundColor: '#FFF7ED' }]}>
                                        <Feather name="shopping-cart" size={20} color="#F97316" />
                                    </View>
                                    <View>
                                        <Text style={styles.statValue}>{statsData?.statistics?.totalTokenPurchaseCommissions ?? 0}</Text>
                                        <Text style={styles.statLabel}>Pembelian Token</Text>
                                    </View>
                                </Card>
                            </View>
                        </View>

                        {/* WhatsApp Join */}
                        <Pressable onPress={handleJoinWA} style={{ marginTop: 8, marginBottom: 24 }}>
                            <LinearGradient
                                colors={['#25D366', '#128C7E']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.waCard}
                            >
                                <View style={styles.waIconBox}>
                                    <FontAwesome name="whatsapp" size={28} color="#25D366" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.waTitle}>Dukungan Grup WhatsApp</Text>
                                    <Text style={styles.waSubtitle}>Bergabunglah dengan komunitas affiliator</Text>
                                </View>
                                <View style={styles.waArrow}>
                                    <Feather name="chevron-right" size={20} color="#128C7E" />
                                </View>
                            </LinearGradient>
                        </Pressable>

                        {/* Referral Section */}
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIconBox}>
                                <Feather name="share-2" size={16} color="#6366F1" />
                            </View>
                            <Text style={styles.sectionTitle}>Referral Anda</Text>
                        </View>

                        <Card style={styles.referralCard}>
                            <View style={styles.referralHeader}>
                                <MaterialCommunityIcons name="bullhorn-outline" size={20} color="#64748B" />
                                <Text style={styles.referralDesc}>
                                    Bagikan tautan ini untuk mendapatkan komisi dari setiap transaksi pengguna.
                                </Text>
                            </View>

                            <View style={styles.linkBox}>
                                <Text style={styles.linkText} numberOfLines={1}>
                                    {referralData?.referralLink || 'Memuat tautan...'}
                                </Text>
                            </View>

                            <View style={styles.actionRow}>
                                <PrimaryButton
                                    title="Salin Tautan"
                                    onPress={handleCopyLink}
                                    style={styles.copyBtn}
                                    textStyle={{ fontSize: 13, fontWeight: '600' }}
                                    leftIcon={<Feather name="copy" size={16} color="#FFFFFF" />}
                                />
                                <PrimaryButton
                                    title="Bagikan"
                                    onPress={handleShareLink}
                                    style={styles.shareBtn}
                                    textStyle={{ fontSize: 13, fontWeight: '600', color: '#6366F1' }}
                                    leftIcon={<Feather name="share" size={16} color="#6366F1" />}
                                />
                            </View>
                        </Card>

                        {/* Recent History */}
                        <View style={styles.sectionHeader}>
                            <View style={[styles.sectionIconBox, { backgroundColor: '#EFF6FF' }]}>
                                <Feather name="clock" size={16} color="#3B82F6" />
                            </View>
                            <Text style={styles.sectionTitle}>Riwayat Komisi Terbaru</Text>
                        </View>

                        <View style={{ gap: 12 }}>
                            {(statsData?.recentCommissions ?? []).length > 0 ? (
                                statsData?.recentCommissions?.slice(0, 5).map((commission) => (
                                    <Card key={commission.id} style={styles.historyCard}>
                                        <View style={[
                                            styles.historyIcon,
                                            { backgroundColor: commission.source === 'token_purchase' ? '#FFF7ED' : '#EFF6FF' }
                                        ]}>
                                            <MaterialCommunityIcons
                                                name={commission.source === 'token_purchase' ? 'ticket-percent-outline' : 'file-document-outline'}
                                                size={20}
                                                color={commission.source === 'token_purchase' ? '#F97316' : '#3B82F6'}
                                            />
                                        </View>
                                        <View style={{ flex: 1, marginHorizontal: 12 }}>
                                            <Text style={styles.historyTitle}>
                                                {commission.source === 'token_purchase' ? 'Pembelian Token' : 'Tes Selesai'}
                                            </Text>
                                            <Text style={styles.historyUser}>
                                                dari {commission.referredUser?.fullname || 'Pengguna'}
                                            </Text>
                                            <Text style={styles.historyDate}>
                                                {new Date(commission.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </View>
                                        <Text style={styles.historyAmount}>
                                            +{formatCurrency(commission.amount)}
                                        </Text>
                                    </Card>
                                ))
                            ) : (
                                <View style={styles.emptyState}>
                                    <View style={styles.emptyIconBg}>
                                        <Feather name="inbox" size={24} color="#94A3B8" />
                                    </View>
                                    <Text style={styles.emptyText}>Belum ada riwayat komisi</Text>
                                </View>
                            )}
                        </View>

                    </View>
                </ScrollView>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    greetingText: { color: '#64748B', fontSize: 13, fontWeight: '500', marginBottom: 4 },
    headerName: { color: '#1E293B', fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        marginTop: 8,
    },
    roleText: { color: '#059669', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

    avatarContainer: { position: 'relative' },
    avatarGradient: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#10B981', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 4 } },
    avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
    onlineIndicator: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#FFFFFF' },

    // Wallet Card
    walletCardWrapper: { borderRadius: 24, shadowColor: '#6366F1', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8, marginBottom: 24 },
    walletCardGradient: { borderRadius: 24, padding: 24 },
    walletCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    walletLabel: { color: '#C4B5FD', fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase' },
    walletTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    walletIconBg: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    walletBalance: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', letterSpacing: -1, marginBottom: 20 },
    walletDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 12 },
    walletFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    walletFooterLabel: { color: '#E0E7FF', fontSize: 12 },
    walletFooterValue: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },

    // Stats Grid
    statsContainer: { gap: 12, marginBottom: 24 },
    statCard: { padding: 16, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center', gap: 16, shadowColor: '#64748B', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    statIconBox: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    statValue: { color: '#1E293B', fontSize: 18, fontWeight: '800', marginBottom: 2 },
    statLabel: { color: '#64748B', fontSize: 12, fontWeight: '500' },

    // WhatsApp
    waCard: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingRight: 20, borderRadius: 20, shadowColor: '#25D366', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
    waIconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    waTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginBottom: 2 },
    waSubtitle: { color: '#E8F5E9', fontSize: 12 },
    waArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },

    // Sections
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, marginTop: 12 },
    sectionIconBox: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' },
    sectionTitle: { color: '#1E293B', fontSize: 16, fontWeight: '700' },

    // Referral
    referralCard: { padding: 20, borderRadius: 24, marginBottom: 24, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9' },
    referralHeader: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    referralDesc: { flex: 1, color: '#64748B', fontSize: 13, lineHeight: 20 },
    linkBox: { backgroundColor: '#F8FAFC', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16, borderStyle: 'dashed' },
    linkText: { color: '#1E293B', fontSize: 14, fontFamily: 'monospace', fontWeight: '500' },
    actionRow: { flexDirection: 'row', gap: 12 },
    copyBtn: { flex: 2, height: 46, borderRadius: 12, backgroundColor: '#6366F1', elevation: 2 },
    shareBtn: { flex: 1, height: 46, borderRadius: 12, backgroundColor: '#F5F3FF', borderWidth: 1, borderColor: '#EDE9FE', elevation: 0 },

    // History
    historyCard: { padding: 16, flexDirection: 'row', alignItems: 'center', borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F8FAFC', shadowColor: '#64748B', shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
    historyIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    historyTitle: { color: '#1E293B', fontSize: 14, fontWeight: '600', marginBottom: 2 },
    historyUser: { color: '#64748B', fontSize: 12, marginBottom: 4 },
    historyDate: { color: '#94A3B8', fontSize: 10, fontWeight: '500' },
    historyAmount: { color: '#6366F1', fontSize: 14, fontWeight: '700' },

    emptyState: { padding: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9', borderStyle: 'dashed' },
    emptyIconBg: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    emptyText: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },
});
