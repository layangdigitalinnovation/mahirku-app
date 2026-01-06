import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getAffiliateStats, requestWithdraw, type AffiliateStats } from '../api/affiliate';
import Card from '../components/basic/Card';
import PrimaryButton from '../components/basic/PrimaryButton';
import TextField from '../components/basic/TextField';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function AffiliatorWithdrawScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const queryClient = useQueryClient();
    const [withdrawModal, setWithdrawModal] = useState(false);

    // Form State
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');

    const { data: statsData, refetch, isLoading } = useQuery<AffiliateStats>({
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

    // Calculate "Dalam Proses" from recent withdrawals (locally for now as per available data)
    const pendingAmount = statsData?.recentWithdraws?.filter(w => w.status === 'pending')
        .reduce((sum, w) => sum + w.amount, 0) || 0;

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

    const formatCurrency = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <Text style={styles.headerTitle}>Tarik Saldo</Text>
                <Text style={styles.headerSubtitle}>Kelola penarikan komisi affiliate Anda</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <Card style={[styles.statCard, { backgroundColor: '#EEF2FF', borderColor: '#E0E7FF', borderWidth: 1 }]}>
                        <Text style={styles.statLabel}>Total Komisi</Text>
                        <Text style={[styles.statValue, { color: '#4F46E5' }]}>{formatCurrency(statsData?.balance?.totalEarned || 0)}</Text>
                    </Card>
                    <Card style={[styles.statCard, { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7', borderWidth: 1 }]}>
                        <Text style={styles.statLabel}>Saldo Tersedia</Text>
                        <Text style={[styles.statValue, { color: '#059669' }]}>{formatCurrency(statsData?.balance?.available || 0)}</Text>
                    </Card>
                    <Card style={[styles.statCard, { backgroundColor: '#FFFBEB', borderColor: '#FEF3C7', borderWidth: 1 }]}>
                        <Text style={styles.statLabel}>Dalam Proses</Text>
                        <Text style={[styles.statValue, { color: '#D97706' }]}>{formatCurrency(pendingAmount)}</Text>
                    </Card>
                </View>

                {/* Main Action Button */}
                <PrimaryButton
                    title="Ajukan Penarikan"
                    leftIcon={<Feather name="plus-circle" size={18} color="#FFFFFF" />}
                    onPress={() => setWithdrawModal(true)}
                    style={{ backgroundColor: '#059669', marginBottom: 24, height: 52, borderRadius: 16 }}
                />

                {/* Important Info */}
                <View style={styles.infoBox}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <Feather name="info" size={18} color="#92400E" />
                        <Text style={styles.infoTitle}>Informasi Penting</Text>
                    </View>
                    <Text style={styles.infoText}>• Minimum penarikan adalah Rp 100.000</Text>
                    <Text style={styles.infoText}>• Minimal saldo mengendap: Rp 0</Text>
                    <Text style={styles.infoText}>• Penarikan akan diproses dalam 1-3 hari kerja</Text>
                    <Text style={styles.infoText}>• Pastikan data rekening bank sudah benar</Text>
                    <Text style={styles.infoText}>• Rekening harus atas nama yang sama dengan akun</Text>
                </View>

                {/* Withdrawal History */}
                <Text style={styles.sectionTitle}>Riwayat Penarikan</Text>
                <View style={{ gap: 12 }}>
                    {(statsData?.recentWithdraws ?? []).length > 0 ? (
                        statsData?.recentWithdraws?.map((w) => (
                            <Card key={w.id} style={styles.historyCard}>
                                <View style={styles.historyRow}>
                                    <View>
                                        <Text style={styles.historyAmount}>{formatCurrency(w.amount)}</Text>
                                        <Text style={styles.historyDate}>{new Date(w.createdAt).toLocaleDateString('id-ID')}</Text>
                                        <Text style={styles.historyBank}>{w.bankName} - {w.accountNumber}</Text>
                                    </View>
                                    <View style={[styles.statusBadge,
                                    w.status === 'approved' ? { backgroundColor: '#D1FAE5' } :
                                        w.status === 'rejected' ? { backgroundColor: '#FEE2E2' } :
                                            { backgroundColor: '#FEF3C7' }
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
                            </Card>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Feather name="clock" size={32} color="#CBD5E1" />
                            <Text style={styles.emptyText}>Belum ada riwayat penarikan</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Withdrawal Modal */}
            <Modal visible={withdrawModal} transparent animationType="fade" onRequestClose={() => setWithdrawModal(false)}>
                <View style={styles.modalOverlay}>
                    <Pressable style={styles.modalBackdrop} onPress={() => setWithdrawModal(false)} />
                    <View style={[styles.modalContent, { maxHeight: '80%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Ajukan Penarikan</Text>
                            <Pressable onPress={() => setWithdrawModal(false)}>
                                <Feather name="x" size={24} color="#64748B" />
                            </Pressable>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.balanceHighlight}>
                                <Text style={styles.balanceHighlightLabel}>Saldo Tersedia:</Text>
                                <Text style={styles.balanceHighlightValue}>{formatCurrency(statsData?.balance?.available || 0)}</Text>
                            </View>

                            <View style={{ gap: 16, marginBottom: 24 }}>
                                <TextField
                                    label="Jumlah Penarikan *"
                                    placeholder="0"
                                    value={withdrawAmount}
                                    onChangeText={setWithdrawAmount}
                                    keyboardType="numeric"
                                    helperText="Minimum penarikan: Rp 100.000"
                                />
                                <TextField
                                    label="Nama Bank *"
                                    placeholder="Contoh: BCA, Mandiri, BNI"
                                    value={bankName}
                                    onChangeText={setBankName}
                                />
                                <TextField
                                    label="Nomor Rekening *"
                                    placeholder="1234567890"
                                    value={accountNumber}
                                    onChangeText={setAccountNumber}
                                    keyboardType="numeric"
                                />
                                <TextField
                                    label="Nama Pemilik Rekening *"
                                    placeholder="Sesuai buku rekening"
                                    value={accountName}
                                    onChangeText={setAccountName}
                                />
                            </View>

                            <PrimaryButton
                                title="Ajukan Sekarang"
                                onPress={handleWithdraw}
                                loading={withdrawMutation.isPending}
                                style={{ backgroundColor: '#059669', borderRadius: 12 }}
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    header: { paddingHorizontal: 24, paddingBottom: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    headerTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
    headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
    statsRow: { gap: 12, marginBottom: 24 },
    statCard: { padding: 16, borderRadius: 16, width: '100%', marginBottom: 0 },
    statLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', marginBottom: 4 },
    statValue: { fontSize: 20, fontWeight: '800' },

    infoBox: { backgroundColor: '#FEF3C7', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#FDE68A' },
    infoTitle: { color: '#92400E', fontSize: 14, fontWeight: '700', marginLeft: 8 },
    infoText: { color: '#92400E', fontSize: 13, marginLeft: 26, lineHeight: 20 },

    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
    historyCard: { padding: 16, borderRadius: 16, backgroundColor: '#FFFFFF', marginBottom: 8, borderWidth: 1, borderColor: '#F1F5F9' },
    historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    historyAmount: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    historyDate: { fontSize: 12, color: '#64748B', marginTop: 2 },
    historyBank: { fontSize: 12, color: '#64748B' },

    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 12, fontWeight: '600' },

    emptyState: { alignItems: 'center', padding: 32 },
    emptyText: { color: '#94A3B8', marginTop: 8 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
    modalBackdrop: { ...StyleSheet.absoluteFillObject },
    modalContent: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 16, elevation: 10 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B' },

    balanceHighlight: { backgroundColor: '#F0F9FF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#BAE6FD', marginBottom: 20 },
    balanceHighlightLabel: { color: '#64748B', fontSize: 13, marginBottom: 4 },
    balanceHighlightValue: { color: '#0284C7', fontSize: 24, fontWeight: '800' }
});
