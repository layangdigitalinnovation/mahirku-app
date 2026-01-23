import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getAffiliateStats, requestWithdraw, type AffiliateStats } from '../api/affiliate';
import Card from '../components/basic/Card';
import PrimaryButton from '../components/basic/PrimaryButton';
import TextField from '../components/basic/TextField';
import { useFocusEffect } from '@react-navigation/native';

export default function AffiliatorWithdrawScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const queryClient = useQueryClient();
    const [withdrawModal, setWithdrawModal] = useState(false);

    // Form State
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');

    const { data: statsData, refetch } = useQuery<AffiliateStats>({
        queryKey: ['affiliateStats'],
        queryFn: async () => (await getAffiliateStats()).data,
        retry: false,
    });

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [])
    );

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

    // Calculate "Dalam Proses" from recent withdrawals
    const pendingAmount = statsData?.recentWithdraws?.filter(w => w.status === 'pending')
        .reduce((sum, w) => sum + w.amount, 0) || 0;

    const handleWithdraw = () => {
        const amount = parseInt(withdrawAmount.replace(/\D/g, '')); // Robust cleanup
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

    const formatCurrency = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#1E293B" />
                </Pressable>
                <View>
                    <Text style={styles.headerTitle}>Tarik Saldo</Text>
                    <Text style={styles.headerSubtitle}>Kelola penarikan komisi Anda</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                {/* Hero Wallet Card */}
                <View style={styles.walletCardWrapper}>
                    <LinearGradient
                        colors={['#10B981', '#059669']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.walletCardGradient}
                    >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                            <View>
                                <Text style={styles.walletLabel}>Saldo Tersedia</Text>
                                <Text style={styles.walletBalance}>{formatCurrency(statsData?.balance?.available || 0)}</Text>
                            </View>
                            <View style={styles.walletIconBox}>
                                <MaterialCommunityIcons name="wallet-outline" size={24} color="#FFFFFF" />
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                            <Text style={styles.pendingLabel}>Dalam Proses</Text>
                            <View style={styles.pendingBadge}>
                                <Text style={styles.pendingValue}>{formatCurrency(pendingAmount)}</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* Important Info - Combined Clean Look */}
                <View style={styles.infoContainer}>
                    <View style={styles.infoItem}>
                        <View style={styles.infoBullet} />
                        <Text style={styles.infoText}>Min. penarikan Rp 100.000</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <View style={styles.infoBullet} />
                        <Text style={styles.infoText}>Proses 1-3 hari kerja</Text>
                    </View>
                </View>

                {/* Withdrawal History */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Riwayat Penarikan</Text>
                    {(statsData?.recentWithdraws?.length ?? 0) > 0 && <Text style={styles.sectionCount}>({statsData?.recentWithdraws?.length})</Text>}
                </View>

                <View style={{ gap: 12 }}>
                    {(statsData?.recentWithdraws ?? []).length > 0 ? (
                        statsData?.recentWithdraws?.map((w) => (
                            <Card key={w.id} style={styles.historyCard}>
                                <View style={styles.historyTop}>
                                    <View style={styles.historyIconBg}>
                                        <MaterialCommunityIcons name="bank-outline" size={20} color="#64748B" />
                                    </View>
                                    <View style={{ flex: 1, marginHorizontal: 12 }}>
                                        <Text style={styles.historyAmount}>{formatCurrency(w.amount)}</Text>
                                        <Text style={styles.historyBank}>{w.bankName} • {w.accountNumber}</Text>
                                    </View>
                                    <View style={[styles.statusBadge,
                                    w.status === 'approved' ? styles.statusSuccess :
                                        w.status === 'rejected' ? styles.statusError :
                                            styles.statusWarning
                                    ]}>
                                        <Text style={[styles.statusText,
                                        w.status === 'approved' ? { color: '#059669' } :
                                            w.status === 'rejected' ? { color: '#DC2626' } :
                                                { color: '#D97706' }
                                        ]}>
                                            {w.status === 'approved' ? 'Berhasil' : w.status === 'rejected' ? 'Ditolak' : 'Proses'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.historyBottom}>
                                    <Text style={styles.historyDate}>{new Date(w.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                                </View>
                            </Card>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconBg}>
                                <Feather name="clock" size={32} color="#CBD5E1" />
                            </View>
                            <Text style={styles.emptyText}>Belum ada riwayat penarikan</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Floating Action Button for Withdraw */}
            <View style={[styles.fabContainer, { paddingBottom: insets.bottom + 16 }]}>
                <PrimaryButton
                    title="Ajukan Penarikan"
                    leftIcon={<Feather name="plus-circle" size={20} color="#FFFFFF" />}
                    onPress={() => setWithdrawModal(true)}
                    style={styles.fabButton}
                    textStyle={{ fontSize: 16, fontWeight: '600' }}
                />
            </View>

            {/* Withdrawal Modal */}
            <Modal visible={withdrawModal} transparent animationType="slide" onRequestClose={() => setWithdrawModal(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                    <View style={styles.modalOverlay}>
                        <Pressable style={styles.modalBackdrop} onPress={() => setWithdrawModal(false)} />
                        <View style={[styles.modalContent, { paddingBottom: insets.bottom + 24 }]}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Ajukan Penarikan</Text>
                                <Pressable onPress={() => setWithdrawModal(false)} style={styles.closeBtn}>
                                    <Feather name="x" size={20} color="#64748B" />
                                </Pressable>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                                <View style={styles.balanceHighlight}>
                                    <Text style={styles.balanceHighlightLabel}>Saldo Tersedia</Text>
                                    <Text style={styles.balanceHighlightValue}>{formatCurrency(statsData?.balance?.available || 0)}</Text>
                                </View>

                                <Text style={styles.formSectionTitle}>Informasi Penarikan</Text>
                                <View style={{ gap: 16, marginBottom: 24 }}>
                                    <TextField
                                        label="Jumlah Penarikan (Rp)"
                                        placeholder="Min. 100.000"
                                        value={withdrawAmount}
                                        onChangeText={setWithdrawAmount}
                                        keyboardType="numeric"
                                    />
                                    <Text style={styles.formSectionTitle}>Rekening Tujuan</Text>
                                    <TextField
                                        label="Nama Bank"
                                        placeholder="Contoh: BCA, Mandiri"
                                        value={bankName}
                                        onChangeText={setBankName}
                                    />
                                    <TextField
                                        label="Nomor Rekening"
                                        placeholder="1234xxxx"
                                        value={accountNumber}
                                        onChangeText={setAccountNumber}
                                        keyboardType="numeric"
                                    />
                                    <TextField
                                        label="Atas Nama"
                                        placeholder="Sesuai buku tabungan"
                                        value={accountName}
                                        onChangeText={setAccountName}
                                    />
                                </View>

                                <PrimaryButton
                                    title="Kirim Pengajuan"
                                    onPress={handleWithdraw}
                                    loading={withdrawMutation.isPending}
                                    style={styles.submitBtn}
                                />
                            </ScrollView>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    header: { paddingHorizontal: 24, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center', gap: 16 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B', letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },

    // Wallet
    walletCardWrapper: { borderRadius: 24, shadowColor: '#059669', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 6, marginBottom: 24 },
    walletCardGradient: { borderRadius: 24, padding: 24 },
    walletLabel: { color: '#D1FAE5', fontSize: 13, fontWeight: '600', marginBottom: 4 },
    walletBalance: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', letterSpacing: -1 },
    walletIconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
    pendingLabel: { color: '#D1FAE5', fontSize: 13, fontWeight: '500' },
    pendingBadge: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    pendingValue: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

    infoContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32, paddingHorizontal: 8 },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    infoBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#64748B' },
    infoText: { color: '#64748B', fontSize: 12, fontWeight: '500' },

    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
    sectionCount: { fontSize: 14, color: '#64748B', fontWeight: '600' },

    historyCard: { padding: 16, borderRadius: 20, backgroundColor: '#FFFFFF', marginBottom: 6, borderWidth: 1, borderColor: '#F1F5F9' },
    historyTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
    historyIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
    historyAmount: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
    historyBank: { fontSize: 12, color: '#64748B' },

    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    statusSuccess: { backgroundColor: '#DCFCE7' },
    statusError: { backgroundColor: '#FEE2E2' },
    statusWarning: { backgroundColor: '#FEF3C7' },
    statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

    historyBottom: { borderTopWidth: 1, borderTopColor: '#F8FAFC', paddingTop: 12 },
    historyDate: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },

    emptyState: { alignItems: 'center', padding: 40, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9', borderStyle: 'dashed' },
    emptyIconBg: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyText: { color: '#94A3B8', fontSize: 14, fontWeight: '500' },

    fabContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, backgroundColor: 'rgba(248, 250, 252, 0.9)', borderTopWidth: 1, borderTopColor: 'rgba(226, 232, 240, 0.5)' },
    fabButton: { backgroundColor: '#059669', borderRadius: 16, height: 52, shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },

    // Modal
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.6)' },
    modalBackdrop: { ...StyleSheet.absoluteFillObject },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B', letterSpacing: -0.5 },
    closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },

    balanceHighlight: { backgroundColor: '#ECFDF5', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#A7F3D0', marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    balanceHighlightLabel: { color: '#047857', fontSize: 13, fontWeight: '600' },
    balanceHighlightValue: { color: '#059669', fontSize: 18, fontWeight: '800' },

    formSectionTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 12, marginTop: 4 },
    submitBtn: { backgroundColor: '#059669', height: 48, borderRadius: 14 },
});
