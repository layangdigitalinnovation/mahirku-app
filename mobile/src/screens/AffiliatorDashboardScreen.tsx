import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated, Alert, Share, Linking } from 'react-native';
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
    const { data, isError, error, refetch } = useQuery<Me, AxiosError>({
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
            <LinearGradient
                colors={['#ECFDF5', '#F0FDF4', '#F8FAFC']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <Animated.View style={{ flex: 1, opacity: fadeIn }}>
                <ScrollView
                    contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
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

                        {/* Stats Grid */}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                            {/* Tes Selesai */}
                            <View style={styles.gridItem}>
                                <Card style={styles.gridCard}>
                                    <View style={[styles.gridIcon, { backgroundColor: '#DBEAFE' }]}>
                                        <Feather name="check-circle" size={18} color="#3B82F6" />
                                    </View>
                                    <View>
                                        <Text style={styles.gridValue}>{statsData?.statistics?.totalTests ?? 0}</Text>
                                        <Text style={styles.gridLabel}>Tes Selesai</Text>
                                    </View>
                                </Card>
                            </View>

                            {/* Total Penghasilan */}
                            <View style={styles.gridItem}>
                                <Card style={styles.gridCard}>
                                    <View style={[styles.gridIcon, { backgroundColor: '#D1FAE5' }]}>
                                        <MaterialCommunityIcons name="cash-multiple" size={18} color="#10B981" />
                                    </View>
                                    <View>
                                        <Text style={[styles.gridValue, { color: '#059669' }]}>{formatCurrency(statsData?.balance?.totalEarned ?? 0)}</Text>
                                        <Text style={styles.gridLabel}>Total Penghasilan</Text>
                                    </View>
                                </Card>
                            </View>

                            {/* Saldo Tersedia */}
                            <View style={styles.gridItem}>
                                <Card style={styles.gridCard}>
                                    <View style={[styles.gridIcon, { backgroundColor: '#FEF3C7' }]}>
                                        <MaterialCommunityIcons name="wallet" size={18} color="#D97706" />
                                    </View>
                                    <View>
                                        <Text style={[styles.gridValue, { color: '#D97706' }]}>{formatCurrency(statsData?.balance?.available ?? 0)}</Text>
                                        <Text style={styles.gridLabel}>Saldo Tersedia</Text>
                                    </View>
                                </Card>
                            </View>

                            {/* Pembelian Token (Commission) */}
                            <View style={styles.gridItem}>
                                <Card style={styles.gridCard}>
                                    <View style={[styles.gridIcon, { backgroundColor: '#EDE9FE' }]}>
                                        <Feather name="shopping-cart" size={18} color="#8B5CF6" />
                                    </View>
                                    <View>
                                        <Text style={styles.gridValue}>{statsData?.statistics?.totalTokenPurchaseCommissions ?? 0}</Text>
                                        <Text style={styles.gridLabel}>Pembelian Token</Text>
                                    </View>
                                </Card>
                            </View>
                        </View>

                        {/* WhatsApp Group */}
                        <Pressable onPress={handleJoinWA}>
                            <LinearGradient
                                colors={['#25D366', '#128C7E']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.waCard}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <FontAwesome name="whatsapp" size={32} color="#FFFFFF" style={{ marginRight: 16 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.waTitle}>Gabung Group WhatsApp</Text>
                                        <Text style={styles.waSubtitle}>Komunitas resmi Affiliator Mahirku</Text>
                                    </View>
                                    <Feather name="chevron-right" size={24} color="#FFFFFF" style={{ opacity: 0.8 }} />
                                </View>
                            </LinearGradient>
                        </Pressable>

                        {/* Referral Link Section */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Tautan Referral Anda</Text>
                        </View>

                        <Card style={{ padding: 20, borderRadius: 20, marginBottom: 24 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                    <Feather name="link" size={20} color="#059669" />
                                </View>
                                <Text style={{ color: '#1E293B', fontSize: 15, fontWeight: '700', flex: 1 }}>Link Referral</Text>
                            </View>
                            <Text style={{ color: '#64748B', fontSize: 13, marginBottom: 12 }}>
                                Bagikan link ini untuk mendapatkan komisi dari setiap pembelian token
                            </Text>

                            <Pressable
                                onPress={handleCopyLink}
                                style={{
                                    backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, marginBottom: 16,
                                    borderWidth: 1, borderColor: '#E2E8F0',
                                }}
                            >
                                <Text style={{ color: '#059669', fontSize: 12, fontFamily: 'monospace' }} numberOfLines={1}>
                                    {referralData?.referralLink || 'Loading...'}
                                </Text>
                            </Pressable>

                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <PrimaryButton
                                    title="Salin Tautan"
                                    leftIcon={<Feather name="copy" size={16} color="#FFFFFF" />}
                                    onPress={handleCopyLink}
                                    style={{ flex: 1, backgroundColor: '#059669', height: 44 }}
                                    textStyle={{ fontSize: 13 }}
                                />
                                <PrimaryButton
                                    title="Bagikan Tautan"
                                    leftIcon={<Feather name="share-2" size={16} color="#059669" />}
                                    onPress={handleShareLink}
                                    style={{ flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#059669', height: 44 }}
                                    textStyle={{ fontSize: 13, color: '#059669' }}
                                />
                            </View>
                        </Card>

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
                                    <Feather name="inbox" size={32} color="#CBD5E1" />
                                    <Text style={styles.emptyText}>Belum ada komisi terbaru</Text>
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
    greetingText: { color: '#64748B', fontSize: 14, fontWeight: '500', marginBottom: 4 },
    headerName: { color: '#1E293B', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
    roleBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        marginTop: 8,
    },
    roleText: { color: '#059669', fontSize: 12, fontWeight: '600' },

    avatarContainer: { position: 'relative' },
    avatarGradient: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#10B981', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 } },
    avatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
    onlineIndicator: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#FFFFFF' },

    gridItem: { width: '48%', marginBottom: 12 }, // Approx for 2 col
    gridCard: { padding: 16, borderRadius: 16, height: '100%', justifyContent: 'center' },
    gridIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    gridValue: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
    gridLabel: { fontSize: 12, color: '#64748B', fontWeight: '500' },

    waCard: { flexDirection: 'row', padding: 20, borderRadius: 20, marginBottom: 24, alignItems: 'center', shadowColor: '#25D366', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
    waTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 2 },
    waSubtitle: { color: '#FFFFFF', fontSize: 12, opacity: 0.9 },

    sectionHeader: { marginBottom: 16, marginTop: 8 },
    sectionTitle: { color: '#1E293B', fontSize: 18, fontWeight: '700', letterSpacing: -0.5 },

    commissionCard: { padding: 16, borderRadius: 16, marginBottom: 0 },
    commissionIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

    emptyState: { padding: 40, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9' },
    emptyText: { color: '#94A3B8', fontSize: 14, fontWeight: '500', marginTop: 12, marginBottom: 4 },
});
