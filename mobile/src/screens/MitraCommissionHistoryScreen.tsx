import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { getMitraDashboardStats, type MitraDashboardStats } from '../api/mitra';
import { clearToken } from '../store/auth';

export default function MitraCommissionHistoryScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const [refreshing, setRefreshing] = useState(false);

    const { data: statsData, isError, error, refetch } = useQuery<MitraDashboardStats, AxiosError>({
        queryKey: ['mitraStats'],
        queryFn: async () => (await getMitraDashboardStats()).data,
        retry: false,
    });

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    if (isError) {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
            clearToken();
            navigation.replace('Auth');
        }
    }

    const formatCurrency = (amount: number) => {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={24} color="#0F172A" />
                </Pressable>
                <Text style={styles.headerTitle}>Aktivitas Komisi Terbaru</Text>
            </View>

            <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} />}
            >
                {(statsData?.recentCommissions?.length ?? 0) > 0 ? (
                    <View style={{ gap: 12 }}>
                        {statsData?.recentCommissions.map((commission) => (
                            <View key={commission.id} style={styles.card}>
                                <View style={styles.row}>
                                    <View style={styles.iconBox}>
                                        <MaterialCommunityIcons
                                            name={commission.source === 'token_purchase' ? 'ticket-percent-outline' : 'brain'}
                                            size={20}
                                            color="#6366F1"
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.sourceText}>
                                            {commission.source === 'token_purchase' ? 'Pembelian Token' : 'Tes Kognitif'}
                                        </Text>
                                        <Text style={styles.dateText}>{formatDate(commission.createdAt)}</Text>
                                    </View>
                                    <Text style={styles.amountText}>+{formatCurrency(commission.amount)}</Text>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.detailsRow}>
                                    <Text style={styles.label}>Dari Member:</Text>
                                    <Text style={styles.value}>
                                        {commission.referredUser?.fullname || commission.referredUser?.email || '-'}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconBg}>
                            <Feather name="activity" size={32} color="#CBD5E1" />
                        </View>
                        <Text style={styles.emptyText}>Belum ada aktivitas komisi terbaru</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    sourceText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: 2,
    },
    dateText: {
        fontSize: 12,
        color: '#64748B',
    },
    amountText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#10B981', // Green for positive amount
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 12,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 12,
        color: '#64748B',
    },
    value: {
        fontSize: 12,
        fontWeight: '600',
        color: '#334155',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginTop: 40,
    },
    emptyIconBg: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyText: {
        color: '#64748B',
        fontSize: 14,
        textAlign: 'center',
    },
});
