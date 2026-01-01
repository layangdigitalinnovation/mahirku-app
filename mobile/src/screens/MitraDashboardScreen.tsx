import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated, Alert, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { meApi } from '../api/auth';
import { getChildrenUsers, type ChildUser } from '../api/childUser';
import { getMitraDashboardStats, getMitraReferralLink, type MitraDashboardStats } from '../api/mitra';
import { clearToken } from '../store/auth';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';

import Card from '../components/basic/Card';
import PrimaryButton from '../components/basic/PrimaryButton';
import BottomTabs from '../components/navigation/BottomTabs';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function MitraDashboardScreen({ navigation }: any) {
    type Me = { user?: { fullname?: string; role?: { name?: string } | null; tokens?: number } };
    const { data, isLoading, isError, error, refetch } = useQuery<Me, AxiosError>({
        queryKey: ['me'],
        queryFn: async () => (await meApi()).data,
        retry: false,
    });

    const { data: statsData, refetch: refetchStats } = useQuery<MitraDashboardStats, AxiosError>({
        queryKey: ['mitraStats'],
        queryFn: async () => (await getMitraDashboardStats()).data,
        retry: false,
    });

    const { data: referralData, refetch: refetchReferral } = useQuery({
        queryKey: ['mitraReferralLink'],
        queryFn: async () => (await getMitraReferralLink()).data,
        retry: false,
    });

    const { data: membersData, refetch: membersRefetch } = useQuery<ChildUser[]>({
        queryKey: ['childrenUsers'],
        queryFn: getChildrenUsers,
        retry: false,
    });

    useFocusEffect(
        useCallback(() => {
            refetch();
            refetchStats();
            refetchReferral();
            membersRefetch();
        }, [])
    );

    const [active, setActive] = useState(0);
    const fadeIn = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();

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
                                    {data?.user?.fullname || 'Mitra'}
                                </Text>
                                <View style={styles.roleBadge}>
                                    <Text style={styles.roleText}>{data?.user?.role?.name ?? 'Mitra'}</Text>
                                </View>
                            </View>

                            <Pressable onPress={() => navigation.navigate('Profile')} style={styles.avatarContainer}>
                                {data?.user?.fullname ? (
                                    <LinearGradient
                                        colors={['#8B5CF6', '#7C3AED']}
                                        style={styles.avatarGradient}
                                    >
                                        <Text style={styles.avatarText}>{getInitials(data?.user?.fullname)}</Text>
                                    </LinearGradient>
                                ) : (
                                    <View style={[styles.avatarGradient, { backgroundColor: '#EDE9FE' }]}>
                                        <Feather name="user" size={24} color="#7C3AED" />
                                    </View>
                                )}
                                <View style={styles.onlineIndicator} />
                            </Pressable>
                        </View>

                        {/* Token Balance Card */}
                        <View style={styles.balanceCardWrapper}>
                            <LinearGradient
                                colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.balanceCardGradient}
                            >
                                <View style={styles.balanceIconContainer}>
                                    <MaterialCommunityIcons name="ticket-percent-outline" size={22} color="#FFFFFF" style={{ opacity: 0.95 }} />
                                </View>
                                <Text style={styles.balanceLabel}>Saldo Token</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                                    <Text style={styles.balanceValue}>{data?.user?.tokens ?? 0}</Text>
                                    <Text style={{ color: '#EDE9FE', fontSize: 16, fontWeight: '600', opacity: 0.85 }}>Token</Text>
                                </View>

                                <View style={styles.actionButtonsRow}>
                                    <Pressable
                                        onPress={() => navigation.navigate('TokenPackages')}
                                        style={[styles.actionBtn, { backgroundColor: '#FFFFFF' }]}
                                    >
                                        <Feather name="plus-circle" size={16} color="#7C3AED" />
                                        <Text style={{ color: '#7C3AED', fontSize: 14, fontWeight: '600', marginLeft: 6 }}>Beli Token</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => navigation.navigate('InvoiceHistory')}
                                        style={[styles.actionBtn, { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }]}
                                    >
                                        <Feather name="file-text" size={16} color="#FFFFFF" />
                                        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginLeft: 6 }}>Invoice</Text>
                                    </Pressable>
                                </View>
                            </LinearGradient>
                        </View>

                        {/* Stats Cards Row */}
                        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                            {/* Total Anggota */}
                            <View style={[styles.statCard, { flex: 1 }]}>
                                <View style={[styles.statIconBox, { backgroundColor: '#EDE9FE' }]}>
                                    <Feather name="users" size={20} color="#8B5CF6" />
                                </View>
                                <Text style={styles.statValue}>{statsData?.totalMembers ?? 0}</Text>
                                <Text style={styles.statLabel}>Total Anggota</Text>
                            </View>

                            {/* Total Affiliator */}
                            <View style={[styles.statCard, { flex: 1 }]}>
                                <View style={[styles.statIconBox, { backgroundColor: '#DBEAFE' }]}>
                                    <MaterialCommunityIcons name="account-star" size={20} color="#3B82F6" />
                                </View>
                                <Text style={styles.statValue}>{statsData?.totalAffiliators ?? 0}</Text>
                                <Text style={styles.statLabel}>Total Affiliator</Text>
                            </View>
                        </View>

                        {/* Total Komisi Card */}
                        <Card style={{ padding: 20, borderRadius: 24, marginBottom: 24, borderWidth: 0, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                <View style={[styles.statIconBox, { backgroundColor: '#D1FAE5', marginRight: 12, marginBottom: 0 }]}>
                                    <MaterialCommunityIcons name="cash-multiple" size={20} color="#10B981" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' as 'uppercase' }}>Total Komisi</Text>
                                    <Text style={{ color: '#10B981', fontSize: 24, fontWeight: '800', letterSpacing: -0.8 }}>
                                        {formatCurrency(statsData?.totalCommission ?? 0)}
                                    </Text>
                                </View>
                            </View>
                            <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 4 }}>
                                Total komisi yang diperoleh dari semua anggota
                            </Text>
                        </Card>

                        {/* Referral Link Section */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Tautan Referral Anda</Text>
                        </View>

                        <Card style={{ padding: 20, borderRadius: 20, marginBottom: 24 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                <View style={[styles.statIconBox, { backgroundColor: '#EEF2FF', marginRight: 12, marginBottom: 0 }]}>
                                    <Feather name="link" size={20} color="#6366F1" />
                                </View>
                                <Text style={{ color: '#1E293B', fontSize: 15, fontWeight: '700', flex: 1 }}>Link Referral</Text>
                            </View>
                            <Text style={{ color: '#64748B', fontSize: 13, marginBottom: 12 }}>
                                Bagikan link ini untuk merekrut anggota baru
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
                                    style={{ flex: 1, backgroundColor: '#8B5CF6', height: 44 }}
                                    textStyle={{ fontSize: 14 }}
                                />
                            </View>
                        </Card>

                        {/* Recent Commission Activity */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Aktivitas Komisi Terbaru</Text>
                        </View>

                        <View style={{ gap: 12, marginBottom: 28 }}>
                            {(statsData?.recentCommissions ?? []).length > 0 ? (
                                statsData?.recentCommissions?.map((commission) => (
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
                                    <Text style={styles.emptyText}>Belum ada aktivitas komisi</Text>
                                </View>
                            )}
                        </View>

                        {/* Members Section */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Anggota</Text>
                            {(membersData?.length ?? 0) > 0 && (
                                <Pressable onPress={() => navigation.navigate('MemberList')}>
                                    <Text style={{ color: '#8B5CF6', fontSize: 14, fontWeight: '600' }}>Lihat Semua</Text>
                                </Pressable>
                            )}
                        </View>

                        {(membersData?.length ?? 0) > 0 ? (
                            <>
                                <View style={{ gap: 12, marginBottom: 16 }}>
                                    {(membersData ?? []).slice(0, 3).map((member) => (
                                        <Card key={member.id} style={styles.memberCard}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <View style={styles.memberAvatar}>
                                                    <Text style={styles.memberInitials}>
                                                        {member.fullname?.split(' ').slice(0, 2).map(s => s[0]?.toUpperCase() || '').join('')}
                                                    </Text>
                                                </View>

                                                <View style={{ flex: 1, marginLeft: 12 }}>
                                                    <Text style={styles.memberName}>{member.fullname || member.username}</Text>
                                                    <Text style={styles.memberEmail}>{member.email}</Text>
                                                </View>

                                                <View style={styles.memberTokenBadge}>
                                                    <MaterialCommunityIcons name="ticket-percent-outline" size={14} color="#8B5CF6" />
                                                    <Text style={styles.memberTokenText}>{member.tokens}</Text>
                                                </View>
                                            </View>
                                        </Card>
                                    ))}
                                </View>
                                <PrimaryButton
                                    title="Tambah Anggota"
                                    leftIcon={<Feather name="user-plus" size={18} color="#FFFFFF" />}
                                    onPress={() => navigation.navigate('AddMember')}
                                    style={{ backgroundColor: '#8B5CF6', height: 52, borderRadius: 16 }}
                                />
                            </>
                        ) : (
                            <View style={styles.emptyState}>
                                <View style={styles.emptyIconBg}>
                                    <Feather name="users" size={24} color="#94A3B8" />
                                </View>
                                <Text style={styles.emptyText}>Belum ada anggota</Text>
                                <PrimaryButton
                                    title="Tambah Anggota"
                                    leftIcon={<Feather name="user-plus" size={16} color="#FFFFFF" />}
                                    onPress={() => navigation.navigate('AddMember')}
                                    style={{ marginTop: 16, backgroundColor: '#8B5CF6' }}
                                />
                            </View>
                        )}

                    </View>
                </ScrollView>

                <BottomTabs
                    tabs={[
                        { key: 'home', label: 'Home', icon: 'home' },
                        { key: 'members', label: 'Member', icon: 'users' },
                        { key: 'profile', label: 'Profile', icon: 'user' },
                    ]}
                    activeIndex={active}
                    onChange={(i) => {
                        setActive(i);
                        const keys = ['home', 'members', 'profile'];
                        const key = keys[i];
                        if (key === 'profile') navigation.navigate('Profile');
                        if (key === 'members') navigation.navigate('MemberList');
                    }}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    greetingText: { color: '#64748B', fontSize: 14, fontWeight: '500', marginBottom: 4 },
    headerName: { color: '#1E293B', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
    roleBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#EDE9FE',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        marginTop: 8,
        borderWidth: 0,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 1,
    },
    roleText: { color: '#7C3AED', fontSize: 12, fontWeight: '600' },

    avatarContainer: { position: 'relative' },
    avatarGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    avatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
    onlineIndicator: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#FFFFFF' },

    balanceCardWrapper: {
        borderRadius: 24,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 4,
        overflow: 'hidden',
        marginBottom: 28,
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
    balanceValue: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', letterSpacing: -1.2 },

    actionButtonsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 42, borderRadius: 12 },

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

    memberCard: {
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
    memberAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#DDD6FE' },
    memberInitials: { color: '#7C3AED', fontSize: 16, fontWeight: '700' },
    memberName: { color: '#1E293B', fontSize: 15, fontWeight: '700', marginBottom: 2 },
    memberEmail: { color: '#64748B', fontSize: 13 },
    memberTokenBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: '#EDE9FE', borderWidth: 1, borderColor: '#DDD6FE' },
    memberTokenText: { color: '#7C3AED', fontWeight: '600', fontSize: 12 },

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
});
