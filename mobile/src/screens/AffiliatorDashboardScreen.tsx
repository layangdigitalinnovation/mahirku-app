import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated, Alert, Share, Modal, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AxiosError } from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meApi } from '../api/auth';
import { getReferralLink, getAffiliateStats, requestWithdraw, type AffiliateStats } from '../api/affiliate';
import { clearToken } from '../store/auth';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';

import Card from '../components/basic/Card';
import PrimaryButton from '../components/basic/PrimaryButton';
import TextField from '../components/basic/TextField';
import BottomTabs from '../components/navigation/BottomTabs';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function AffiliatorDashboardScreen({ navigation }: any) {
    type Me = { user?: { fullname?: string; role?: { name?: string } | null; tokens?: number; affiliateBalance?: number } };
    const { data, isLoading, isError, error, refetch } = useQuery<Me, AxiosError>({
        queryKey: ['me'],
        queryFn: async () => (await meApi()).data,
        retry: false,
    });

    const { data: statsData, refetch: refetchStats } = useQuery<AffiliateStats, AxiosError>({
        queryKey: ['affiliateStats'],
        queryFn: async () => (await getAffiliateStats()).data,
        retry: false,
    });

    const { data: referralData, refetch: refetchReferral } = useQuery({
        queryKey: ['referralLink'],
        queryFn: async () => (await getReferralLink()).data,
        retry: false,
    });

    useFocusEffect(
        useCallback(() => {
            refetch();
            refetchStats();
            refetchReferral();
        }, [])
    );

    const [active, setActive] = useState(0);
    const [withdrawModal, setWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');

    const fadeIn = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();
    const queryClient = useQueryClient();

    useEffect(() => {
        Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, []);

    useEffect(() => {
        if (isError) {
            const status = error?.response?.status;
            if (status === 401 || status === 403) {
                clearToken();
                navigation.replace('Login');
            }
        }
    }, [isError, error, navigation]);

    const withdrawMutation = useMutation({
        mutationFn: requestWithdraw,
        onSuccess: () => {
            Alert.alert('Berhasil', 'Permintaan penarikan berhasil diajukan');
            setWithdrawModal(false);
            setWithdrawAmount('');
            setBankName('');
            setAccountNumber('');
            setAccountName('');
            queryClient.invalidateQueries({ queryKey: ['affiliateStats'] });
        },
        onError: (error: any) => {
            Alert.alert('Gagal', error?.response?.data?.message || 'Terjadi kesalahan');
        },
    });

    const handleWithdraw = () => {
        const amount = parseInt(withdrawAmount);
        const available = statsData?.balance?.available ?? 0;

        if (!withdrawAmount || amount <= 0) {
            Alert.alert('Error', 'Masukkan jumlah penarikan yang valid');
            return;
        }

        if (amount < 100000) {
            Alert.alert('Error', 'Minimum penarikan adalah Rp 100.000');
            return;
        }

        if (amount > available) {
            Alert.alert('Error', 'Saldo tidak mencukupi');
            return;
        }

        if (!bankName || !accountNumber || !accountName) {
            Alert.alert('Error', 'Mohon lengkapi data rekening bank');
            return;
        }

        withdrawMutation.mutate({ amount, bankName, accountNumber, accountName });
    };

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

    const getInitials = (name: string) => {
        return String(name).split(' ').slice(0, 2).map(s => s[0]?.toUpperCase() || '').join('');
    };

    const formatCurrency = (amount: number) => {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            <LinearGradient
                colors={['#EEF2FF', '#F1F5F9', '#F8FAFC']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <Animated.View style={{ flex: 1, opacity: fadeIn }}>
                <ScrollView
                    contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{ paddingHorizontal: 24, paddingTop: insets.top + 20, paddingBottom: 24 }}>

                        {/* Header Section */}
                        <View style={styles.headerRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.greetingText}>Selamat Datang,</Text>
                                <Text style={styles.headerName} numberOfLines={1}>
                                    {data?.user?.fullname || 'Affiliator'}
                                </Text>
                                <View style={styles.roleBadge}>
                                    <Text style={styles.roleText}>{data?.user?.role?.name ?? 'Affiliator'}</Text>
                                </View>
                            </View>

                            <Pressable onPress={() => navigation.navigate('Profile')} style={styles.avatarContainer}>
                                {data?.user?.fullname ? (
                                    <LinearGradient
                                        colors={['#10B981', '#059669']}
                                        style={styles.avatarGradient}
                                    >
                                        <Text style={styles.avatarText}>{getInitials(data?.user?.fullname)}</Text>
                                    </LinearGradient>
                                ) : (
                                    <View style={[styles.avatarGradient, { backgroundColor: '#D1FAE5' }]}>
                                        <Feather name="user" size={24} color="#059669" />
                                    </View>
                                )}
                                <View style={styles.onlineIndicator} />
                            </Pressable>
                        </View>

                        {/* Balance Cards Row */}
                        <View style={{ flexDirection: 'row', gap: 14, marginBottom: 28 }}>
                            {/* Total Earnings */}
                            <View style={[styles.balanceCard, { flex: 1 }]}>
                                <LinearGradient
                                    colors={['#10B981', '#059669', '#047857']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.balanceCardGradient}
                                >
                                    <View style={styles.balanceIconContainer}>
                                        <MaterialCommunityIcons name="cash-multiple" size={22} color="#FFFFFF" style={{ opacity: 0.95 }} />
                                    </View>
                                    <Text style={styles.balanceLabel}>Total Penghasilan</Text>
                                    <Text style={styles.balanceValue}>{formatCurrency(statsData?.balance?.totalEarned ?? 0)}</Text>
                                </LinearGradient>
                            </View>

                            {/* Available Balance */}
                            <View style={[styles.balanceCard, { flex: 1 }]}>
                                <LinearGradient
                                    colors={['#3B82F6', '#2563EB', '#1D4ED8']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.balanceCardGradient}
                                >
                                    <View style={styles.balanceIconContainer}>
                                        <MaterialCommunityIcons name="wallet" size={22} color="#FFFFFF" style={{ opacity: 0.95 }} />
                                    </View>
                                    <Text style={styles.balanceLabel}>Saldo Tersedia</Text>
                                    <Text style={styles.balanceValue}>{formatCurrency(statsData?.balance?.available ?? 0)}</Text>
                                </LinearGradient>
                            </View>
                        </View>

                        {/* Stats Cards */}
                        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                            <View style={[styles.statCard, { flex: 1 }]}>
                                <View style={[styles.statIconBox, { backgroundColor: '#DBEAFE' }]}>
                                    <Feather name="check-circle" size={20} color="#3B82F6" />
                                </View>
                                <Text style={styles.statValue}>{statsData?.statistics?.totalTests ?? 0}</Text>
                                <Text style={styles.statLabel}>Test Selesai</Text>
                            </View>
                            <View style={[styles.statCard, { flex: 1 }]}>
                                <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
                                    <Feather name="shopping-cart" size={20} color="#F59E0B" />
                                </View>
                                <Text style={styles.statValue}>{statsData?.statistics?.totalTokenPurchaseCommissions ?? 0}</Text>
                                <Text style={styles.statLabel}>Pembelian Token</Text>
                            </View>
                        </View>

                        {/* Referral Link Section */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Tautan Referral Anda</Text>
                        </View>

                        <Card style={{ padding: 20, borderRadius: 20, marginBottom: 24 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                <View style={[styles.statIconBox, { backgroundColor: '#EEF2FF', marginRight: 12 }]}>
                                    <Feather name="link" size={20} color="#6366F1" />
                                </View>
                                <Text style={{ color: '#1E293B', fontSize: 15, fontWeight: '700', flex: 1 }}>Link Referral</Text>
                            </View>
                            <Text style={{ color: '#64748B', fontSize: 13, marginBottom: 12 }}>
                                Bagikan link ini untuk mendapatkan komisi dari setiap pembelian token
                            </Text>

                            {/* Link Display */}
                            <Pressable
                                onPress={handleCopyLink}
                                style={{
                                    backgroundColor: '#F1F5F9',
                                    padding: 12,
                                    borderRadius: 12,
                                    marginBottom: 12,
                                    borderWidth: 1,
                                    borderColor: '#E2E8F0',
                                }}
                            >
                                <Text style={{ color: '#6366F1', fontSize: 12, fontFamily: 'monospace' }} numberOfLines={1}>
                                    {referralData?.referralLink || 'Loading...'}
                                </Text>
                            </Pressable>

                            {/* Action Buttons */}
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <PrimaryButton
                                    title="Salin Link"
                                    leftIcon={<Feather name="copy" size={16} color="#FFFFFF" />}
                                    onPress={handleCopyLink}
                                    style={{ flex: 1, backgroundColor: '#6366F1', height: 44 }}
                                    textStyle={{ fontSize: 14 }}
                                />
                                <PrimaryButton
                                    title="Bagikan"
                                    leftIcon={<Feather name="share-2" size={16} color="#FFFFFF" />}
                                    onPress={handleShareLink}
                                    style={{ flex: 1, backgroundColor: '#10B981', height: 44 }}
                                    textStyle={{ fontSize: 14 }}
                                />
                            </View>
                        </Card>

                        {/* Withdraw Section */}
                        <PrimaryButton
                            title="Tarik Saldo"
                            leftIcon={<Feather name="arrow-up-circle" size={18} color="#FFFFFF" />}
                            onPress={() => setWithdrawModal(true)}
                            style={{ backgroundColor: '#059669', height: 52, borderRadius: 16, marginBottom: 24 }}
                        />

                        {/* Recent Commissions */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Riwayat Komisi Terbaru</Text>
                        </View>

                        <View style={{ gap: 12 }}>
                            {(statsData?.recentCommissions ?? []).length > 0 ? (
                                statsData?.recentCommissions?.slice(0, 5).map((commission) => (
                                    <Card key={commission.id} style={styles.commissionCard}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                            <View style={[styles.commissionIcon, { backgroundColor: commission.source === 'token_purchase' ? '#FEF3C7' : '#DBEAFE' }]}>
                                                <MaterialCommunityIcons
                                                    name={commission.source === 'token_purchase' ? 'ticket-percent' : 'file-document-outline'}
                                                    size={16}
                                                    color={commission.source === 'token_purchase' ? '#F59E0B' : '#3B82F6'}
                                                />
                                            </View>
                                            <View style={{ flex: 1, marginLeft: 10 }}>
                                                <Text style={{ color: '#1E293B', fontSize: 14, fontWeight: '600' }}>
                                                    {commission.referredUser?.fullname || 'User'}
                                                </Text>
                                                <Text style={{ color: '#64748B', fontSize: 12 }}>
                                                    {commission.source === 'token_purchase' ? 'Pembelian Token' : 'Test Selesai'}
                                                </Text>
                                            </View>
                                            <Text style={{ color: '#10B981', fontSize: 15, fontWeight: '700' }}>
                                                {formatCurrency(commission.amount)}
                                            </Text>
                                        </View>
                                        <Text style={{ color: '#94A3B8', fontSize: 11 }}>
                                            {new Date(commission.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </Text>
                                    </Card>
                                ))
                            ) : (
                                <View style={styles.emptyState}>
                                    <View style={styles.emptyIconBg}>
                                        <Feather name="inbox" size={24} color="#94A3B8" />
                                    </View>
                                    <Text style={styles.emptyText}>Belum ada komisi terbaru</Text>
                                </View>
                            )}
                        </View>

                    </View>
                </ScrollView>

                <BottomTabs
                    tabs={[
                        { key: 'home', label: 'Home', icon: 'home' },
                        { key: 'reports', label: 'Reports', icon: 'file-text' },
                        { key: 'profile', label: 'Profile', icon: 'user' },
                    ]}
                    activeIndex={active}
                    onChange={(i) => {
                        setActive(i);
                        const keys = ['home', 'reports', 'profile'];
                        const key = keys[i];
                        if (key === 'profile') navigation.navigate('Profile');
                        if (key === 'reports') navigation.navigate('Reports');
                    }}
                />
            </Animated.View>

            {/* Withdraw Modal */}
            <Modal
                visible={withdrawModal}
                transparent
                animationType="fade"
                onRequestClose={() => setWithdrawModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <Pressable style={styles.modalBackground} onPress={() => setWithdrawModal(false)} />
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.modalContent}>
                            {/* Header */}
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Ajukan Penarikan</Text>
                                <Pressable onPress={() => setWithdrawModal(false)} style={styles.modalCloseBtn}>
                                    <Feather name="x" size={20} color="#64748B" />
                                </Pressable>
                            </View>

                            {/* Balance Info */}
                            <View style={styles.balanceInfo}>
                                <Text style={styles.balanceInfoLabel}>Saldo Tersedia:</Text>
                                <Text style={styles.balanceInfoValue}>{formatCurrency(statsData?.balance?.available ?? 0)}</Text>
                            </View>

                            {/* Form */}
                            <View style={{ gap: 12 }}>
                                <TextField
                                    label="Jumlah Penarikan"
                                    placeholder="100000"
                                    value={withdrawAmount}
                                    onChangeText={setWithdrawAmount}
                                    keyboardType="numeric"
                                />
                                <TextField
                                    label="Nama Bank"
                                    placeholder="Contoh: BCA, Mandiri, BNI"
                                    value={bankName}
                                    onChangeText={setBankName}
                                />
                                <TextField
                                    label="Nomor Rekening"
                                    placeholder="1234567890"
                                    value={accountNumber}
                                    onChangeText={setAccountNumber}
                                    keyboardType="numeric"
                                />
                                <TextField
                                    label="Nama Pemilik Rekening"
                                    placeholder="Sesuai buku rekening"
                                    value={accountName}
                                    onChangeText={setAccountName}
                                />
                            </View>

                            {/* Important Info */}
                            <View style={styles.infoBox}>
                                <Text style={styles.infoTitle}>Informasi Penting:</Text>
                                <Text style={styles.infoText}>• Minimum penarikan adalah Rp 100.000</Text>
                                <Text style={styles.infoText}>• Penarikan akan diproses dalam 1-3 hari kerja</Text>
                                <Text style={styles.infoText}>• Pastikan data rekening bank sudah benar</Text>
                                <Text style={styles.infoText}>• Penarikan hanya bisa dilakukan ke rekening atas nama yang sama dengan akun affiliator</Text>
                            </View>

                            {/* Actions */}
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <PrimaryButton
                                    title="Batal"
                                    onPress={() => setWithdrawModal(false)}
                                    style={[styles.modalBtn, styles.cancelBtn]}
                                    textStyle={{ color: '#64748B' }}
                                />
                                <PrimaryButton
                                    title="Ajukan"
                                    onPress={handleWithdraw}
                                    loading={withdrawMutation.isPending}
                                    leftIcon={<Feather name="check" size={16} color="#FFFFFF" />}
                                    style={[styles.modalBtn, styles.confirmBtn]}
                                />
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    greetingText: { color: '#64748B', fontSize: 14, fontWeight: '500', marginBottom: 4 },
    headerName: { color: '#1E293B', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
    roleBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        marginTop: 8,
        borderWidth: 0,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 1,
    },
    roleText: { color: '#059669', fontSize: 12, fontWeight: '600' },

    avatarContainer: { position: 'relative' },
    avatarGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    avatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
    onlineIndicator: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#FFFFFF' },

    balanceCard: {
        borderRadius: 24,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 4,
        overflow: 'hidden',
    },
    balanceCardGradient: { borderRadius: 24, padding: 20, gap: 6 },
    balanceIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    balanceLabel: { color: '#FFFFFF', fontSize: 11, fontWeight: '600', opacity: 0.85, letterSpacing: 0.5, textTransform: 'uppercase' as 'uppercase' },
    balanceValue: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', letterSpacing: -0.8, marginTop: 2 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { color: '#1E293B', fontSize: 18, fontWeight: '700', letterSpacing: -0.5 },

    statCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 18,
        borderWidth: 0,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    statIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    statValue: { color: '#1E293B', fontSize: 20, fontWeight: '800', marginBottom: 4 },
    statLabel: { color: '#64748B', fontSize: 12, fontWeight: '500' },

    commissionCard: {
        padding: 18,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        borderWidth: 0,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    commissionIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

    emptyState: {
        padding: 40,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        borderWidth: 0,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 1,
    },
    emptyIconBg: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyText: { color: '#94A3B8', fontSize: 14, fontWeight: '500' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalBackground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        padding: 28,
        marginHorizontal: 24,
        maxWidth: 500,
        alignSelf: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.25,
        shadowRadius: 30,
        elevation: 10,
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
    modalCloseBtn: { padding: 4 },

    balanceInfo: { backgroundColor: '#EEF2FF', padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E0E7FF' },
    balanceInfoLabel: { color: '#64748B', fontSize: 13, marginBottom: 4 },
    balanceInfoValue: { color: '#4F46E5', fontSize: 24, fontWeight: '800' },

    infoBox: { backgroundColor: '#FEF3C7', padding: 16, borderRadius: 16, marginTop: 16, marginBottom: 20, borderWidth: 1, borderColor: '#FDE68A' },
    infoTitle: { color: '#92400E', fontSize: 14, fontWeight: '700', marginBottom: 8 },
    infoText: { color: '#78350F', fontSize: 12, marginBottom: 4, lineHeight: 18 },

    modalBtn: { flex: 1, height: 48, borderRadius: 12 },
    cancelBtn: { backgroundColor: '#F1F5F9' },
    confirmBtn: { backgroundColor: '#059669' },
});
