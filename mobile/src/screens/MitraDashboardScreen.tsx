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
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

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

    const getInitials = (name: string) => {
        return String(name).split(' ').slice(0, 2).map(s => s[0]?.toUpperCase() || '').join('');
    };

    const formatCurrency = (amount: number) => {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    const handleWithdraw = () => {
        navigation.navigate('MitraWithdraw');
    };

    const WalletCard = () => (
        <View style={styles.walletCardWrapper}>
            <LinearGradient
                colors={['#6366F1', '#8B5CF6', '#D946EF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.walletCard}
            >
                {/* Background Decoration */}
                <View style={styles.walletDecoration1} />
                <View style={styles.walletDecoration2} />

                {/* Content */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, zIndex: 10 }}>
                    <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                            <View style={styles.walletIconBg}>
                                <Ionicons name="wallet-outline" size={16} color="#FFFFFF" />
                            </View>
                            <Text style={styles.walletLabel}>Total Komisi</Text>
                        </View>
                        <Text style={styles.walletAmount}>
                            {formatCurrency(statsData?.totalCommission ?? 0)}
                        </Text>
                    </View>
                    <Pressable style={styles.historyBtn} onPress={() => navigation.navigate('MitraCommissionHistory')}>
                        <MaterialCommunityIcons name="history" size={20} color="#FFFFFF" />
                        <Text style={styles.historyText}>Riwayat</Text>
                    </Pressable>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 10 }}>
                    <View>
                        <Text style={styles.cardNumber}>**** **** **** {data?.user?.fullname?.substring(0, 4).toUpperCase() || 'USER'}</Text>
                        <Text style={styles.cardHolder}>{data?.user?.fullname || 'Mitra Mahirku'}</Text>
                    </View>
                    <Pressable
                        style={styles.withdrawBtn}
                        onPress={handleWithdraw}
                    >
                        <Text style={styles.withdrawText}>Withdraw</Text>
                        <Feather name="arrow-up-right" size={18} color="#6366F1" />
                    </Pressable>
                </View>
            </LinearGradient>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            <LinearGradient
                colors={['#EEF2FF', '#F8FAFC', '#FFFFFF']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0.5 }}
            />

            <Animated.View style={{ flex: 1, opacity: fadeIn }}>
                <ScrollView
                    contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{ paddingHorizontal: 24, paddingTop: insets.top + 20 }}>

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
                                        colors={['#6366F1', '#8B5CF6']}
                                        style={styles.avatarGradient}
                                    >
                                        <Text style={styles.avatarText}>{getInitials(data?.user?.fullname)}</Text>
                                    </LinearGradient>
                                ) : (
                                    <View style={[styles.avatarGradient, { backgroundColor: '#EDE9FE' }]}>
                                        <Feather name="user" size={24} color="#7C3AED" />
                                    </View>
                                )}

                            </Pressable>
                        </View>

                        {/* Wallet Card */}
                        <WalletCard />

                        {/* Stats Cards Row */}
                        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 32 }}>
                            {/* Total Anggota */}
                            <View style={[styles.statCard, { flex: 1 }]}>
                                <View style={[styles.statIconBox, { backgroundColor: '#EEF2FF' }]}>
                                    <Feather name="users" size={20} color="#6366F1" />
                                </View>
                                <Text style={styles.statValue}>{statsData?.totalMembers ?? 0}</Text>
                                <Text style={styles.statLabel}>Total Anggota</Text>
                            </View>

                            {/* Total Affiliator */}
                            <View style={[styles.statCard, { flex: 1 }]}>
                                <View style={[styles.statIconBox, { backgroundColor: '#F0F9FF' }]}>
                                    <MaterialCommunityIcons name="account-group-outline" size={22} color="#0EA5E9" />
                                </View>
                                <Text style={styles.statValue}>{statsData?.totalAffiliators ?? 0}</Text>
                                <Text style={styles.statLabel}>Total Affiliator</Text>
                            </View>
                        </View>

                        {/* Referral Link Section */}
                        <View style={styles.referralContainer}>
                            <View style={styles.referralHeader}>
                                <View style={styles.referralIcon}>
                                    <Feather name="share-2" size={18} color="#FFFFFF" />
                                </View>
                                <View>
                                    <Text style={styles.referralTitle}>Tautan Referral Anda</Text>
                                    <Text style={styles.referralSubtitle}>Bagikan untuk tambah anggota</Text>
                                </View>
                            </View>

                            <View style={styles.linkBox}>
                                <Text style={styles.linkText} numberOfLines={1}>
                                    {referralData?.referralLink || 'Memuat link...'}
                                </Text>
                                <Pressable onPress={handleCopyLink} style={styles.copyBtn}>
                                    <Feather name="copy" size={16} color="#6366F1" />
                                </Pressable>
                            </View>

                            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                                <Pressable style={[styles.actionBtn, styles.primaryActionBtn]} onPress={handleCopyLink}>
                                    <Text style={styles.primaryActionText}>Salin Link</Text>
                                </Pressable>
                                <Pressable style={[styles.actionBtn, styles.secondaryActionBtn]} onPress={handleShareLink}>
                                    <Text style={styles.secondaryActionText}>Bagikan</Text>
                                </Pressable>
                            </View>
                        </View>

                        {/* Members Section */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Text style={styles.sectionTitle}>Anggota Terbaru</Text>
                            {(membersData?.length ?? 0) > 0 && (
                                <Pressable onPress={() => navigation.navigate('MemberList')}>
                                    <Text style={{ color: '#6366F1', fontSize: 13, fontWeight: '600' }}>Lihat Semua</Text>
                                </Pressable>
                            )}
                        </View>

                        {(membersData?.length ?? 0) > 0 ? (
                            <View style={{ gap: 12, marginBottom: 24 }}>
                                {(membersData ?? []).slice(0, 3).map((member) => (
                                    <View key={member.id} style={styles.memberRow}>
                                        <View style={styles.memberAvatar}>
                                            <Text style={styles.memberInitials}>
                                                {member.fullname?.split(' ').slice(0, 2).map(s => s[0]?.toUpperCase() || '').join('')}
                                            </Text>
                                        </View>
                                        <View style={{ flex: 1, paddingHorizontal: 12 }}>
                                            <Text style={styles.memberName}>{member.fullname || member.username}</Text>
                                            <Text style={styles.memberEmail}>{member.email}</Text>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={styles.joinedDate}>Joined</Text>
                                            <Text style={styles.joinedDateVal}>Now</Text>
                                        </View>
                                    </View>
                                ))}
                                <Pressable
                                    style={styles.addMemberBtn}
                                    onPress={() => navigation.navigate('AddMember')}
                                >
                                    <Feather name="plus" size={16} color="#6366F1" />
                                    <Text style={{ color: '#6366F1', fontSize: 14, fontWeight: '600' }}>Tambah Anggota Manual</Text>
                                </Pressable>
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Feather name="users" size={32} color="#CBD5E1" />
                                <Text style={styles.emptyText}>Belum ada anggota yang bergabung</Text>
                                <PrimaryButton
                                    title="Tambah Anggota"
                                    leftIcon={<Feather name="user-plus" size={16} color="#FFFFFF" />}
                                    onPress={() => navigation.navigate('AddMember')}
                                    style={{ marginTop: 16, backgroundColor: '#6366F1', borderRadius: 12, height: 44 }}
                                />
                            </View>
                        )}
                    </View>
                </ScrollView>
            </Animated.View>
        </View >
    );
}

const styles = StyleSheet.create({
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
    greetingText: { color: '#64748B', fontSize: 14, fontWeight: '500', marginBottom: 2 },
    headerName: { color: '#0F172A', fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },

    avatarContainer: { position: 'relative', alignItems: 'flex-end' },
    avatarGradient: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        // Removed negative margin since badge is no longer overlapping
        zIndex: 10,
        // Removed border since it's no longer overlapping
    },
    avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#0F172A',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20, // Increased border radius for pill shape
        marginTop: 6, // Added margin top
        // Removed positioning and z-index props
    },
    roleText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

    walletCardWrapper: {
        borderRadius: 24,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 8,
        marginBottom: 32,
    },
    walletCard: {
        borderRadius: 24,
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
        height: 200, // Fixed height for consistency
        justifyContent: 'space-between'
    },
    walletDecoration1: {
        position: 'absolute',
        top: -20,
        right: -20,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    walletDecoration2: {
        position: 'absolute',
        bottom: -40,
        left: -20,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    walletIconBg: {
        width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center'
    },
    walletLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '500', opacity: 0.9 },
    walletAmount: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', letterSpacing: -1 },

    historyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 12 },
    historyText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },

    cardNumber: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600', marginBottom: 4, fontFamily: 'monospace' },
    cardHolder: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', textTransform: 'uppercase' },

    withdrawBtn: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    withdrawText: { color: '#6366F1', fontSize: 14, fontWeight: '700' },

    statCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#94A3B8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        alignItems: 'flex-start'
    },
    statIconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    statValue: { color: '#0F172A', fontSize: 24, fontWeight: '800', marginBottom: 2 },
    statLabel: { color: '#64748B', fontSize: 13, fontWeight: '500' },

    referralContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#94A3B8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    referralHeader: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    referralIcon: {
        width: 36, height: 36, borderRadius: 10, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center'
    },
    referralTitle: { color: '#0F172A', fontSize: 15, fontWeight: '700' },
    referralSubtitle: { color: '#64748B', fontSize: 13 },

    linkBox: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        padding: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
    },
    linkText: { flex: 1, paddingHorizontal: 12, color: '#64748B', fontSize: 13, fontFamily: 'monospace' },
    copyBtn: {
        width: 40, height: 40, backgroundColor: '#FFFFFF', borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0'
    },

    actionBtn: { flex: 1, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
    primaryActionBtn: { backgroundColor: '#6366F1' },
    primaryActionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    secondaryActionBtn: { backgroundColor: '#EEF2FF' },
    secondaryActionText: { color: '#6366F1', fontSize: 14, fontWeight: '600' },

    sectionTitle: { color: '#0F172A', fontSize: 16, fontWeight: '700' },

    memberRow: {
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 1,
    },
    memberAvatar: {
        width: 42, height: 42, borderRadius: 21, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E0E7FF'
    },
    memberInitials: { color: '#6366F1', fontSize: 14, fontWeight: '700' },
    memberName: { color: '#0F172A', fontSize: 14, fontWeight: '600', marginBottom: 2 },
    memberEmail: { color: '#64748B', fontSize: 12 },
    joinedDate: { color: '#94A3B8', fontSize: 10, textAlign: 'right' },
    joinedDateVal: { color: '#64748B', fontSize: 12, fontWeight: '600', textAlign: 'right' },

    addMemberBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14,
        backgroundColor: '#EEF2FF', borderRadius: 14, borderStyle: 'dashed', borderWidth: 1, borderColor: '#6366F1', gap: 8
    },

    emptyState: { alignItems: 'center', padding: 32, backgroundColor: '#F8FAFC', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' },
    emptyText: { color: '#94A3B8', fontSize: 14, marginVertical: 8 },
});
