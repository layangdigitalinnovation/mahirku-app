import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import Card from '../components/basic/Card';
import PrimaryButton from '../components/basic/PrimaryButton';
import TextField from '../components/basic/TextField';
import { Feather, Ionicons } from '@expo/vector-icons';
import { purchaseToken, validateVoucher } from '../api/token';

type Package = {
    id: number;
    name?: string;
    tokens?: number;
    price?: number;
    description?: string;
};

export default function PurchaseConfirmationScreen({ navigation, route }: any) {
    const insets = useSafeAreaInsets();
    const selectedPackage = route?.params?.package as Package;

    const [voucherCode, setVoucherCode] = useState('');
    const [voucherData, setVoucherData] = useState<any>(null);
    const [voucherError, setVoucherError] = useState('');
    const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

    // Manual voucher validation handler
    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) {
            setVoucherError('Kode voucher tidak boleh kosong');
            return;
        }

        setIsApplyingVoucher(true);
        setVoucherError('');

        try {
            const res = await validateVoucher(voucherCode);
            if (res.data) {
                setVoucherData(res.data);
                setVoucherError('');
            } else {
                setVoucherError('Voucher tidak valid');
                setVoucherData(null);
            }
        } catch (err: any) {
            setVoucherError(err.response?.data?.message || 'Voucher tidak ditemukan');
            setVoucherData(null);
        } finally {
            setIsApplyingVoucher(false);
        }
    };

    const handleRemoveVoucher = () => {
        setVoucherData(null);
        setVoucherCode('');
        setVoucherError('');
    };

    const getDiscountedPrice = (price: number) => {
        if (!voucherData) return price;
        if (voucherData.type === 'percentage') {
            return price - (price * voucherData.value / 100);
        } else {
            return Math.max(0, price - voucherData.value);
        }
    };

    const getDiscountAmount = (price: number) => {
        if (!voucherData) return 0;
        if (voucherData.type === 'percentage') {
            return price * voucherData.value / 100;
        } else {
            return Math.min(voucherData.value, price);
        }
    };

    const mut = useMutation({
        mutationFn: () => purchaseToken({
            packageId: selectedPackage.id,
            voucherCode: voucherData?.code
        }),
        onSuccess: async (res) => {
            navigation.navigate('PaymentWebView', {
                invoiceId: res.invoiceId,
                paymentUrl: res.paymentUrl
            });
        }
    });

    const handleConfirmPurchase = () => {
        mut.mutate();
    };

    if (!selectedPackage) {
        return null;
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Header */}
            <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
                <Pressable
                    style={styles.backBtn}
                    android_ripple={{ color: '#E2E8F0' }}
                    onPress={() => navigation.goBack()}
                    disabled={mut.isPending}
                >
                    <Ionicons name="chevron-back" size={20} color="#475569" />
                </Pressable>
                <Text style={styles.topTitle}>Konfirmasi Pembelian</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 20,
                    paddingBottom: insets.bottom + 24
                }}
            >
                {/* Package Details Card */}
                <Card style={styles.packageCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <View style={styles.packageIcon}>
                            <Feather name="credit-card" size={24} color="#4F46E5" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.packageName}>{selectedPackage.name}</Text>
                            <Text style={styles.packageTokens}>{selectedPackage.tokens} Token</Text>
                        </View>
                    </View>
                    <Text style={styles.packageDesc}>{selectedPackage.description}</Text>
                </Card>

                {/* Voucher Input Section */}
                <Card style={styles.voucherCard}>
                    <Text style={styles.sectionTitle}>Punya Kode Voucher?</Text>
                    <Text style={styles.sectionSubtitle}>Masukkan kode voucher untuk mendapatkan diskon</Text>

                    <View style={styles.voucherInputRow}>
                        <TextField
                            placeholder="Masukkan kode voucher"
                            value={voucherCode}
                            onChangeText={(text) => setVoucherCode(text.toUpperCase())}
                            startIcon={<Feather name="tag" size={18} color="#64748B" />}
                            containerStyle={{ flex: 1 }}
                            editable={!voucherData && !mut.isPending}
                        />
                        {!voucherData && (
                            <PrimaryButton
                                title={isApplyingVoucher ? '' : 'Gunakan'}
                                onPress={handleApplyVoucher}
                                disabled={isApplyingVoucher || !voucherCode.trim() || mut.isPending}
                                loading={isApplyingVoucher}
                                style={styles.applyBtn}
                                textStyle={{ fontSize: 14, fontWeight: '600' }}
                            />
                        )}
                    </View>

                    {voucherData && (
                        <View style={styles.voucherSuccess}>
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Feather name="check-circle" size={16} color="#10B981" />
                                <Text style={styles.voucherSuccessText}>
                                    Voucher aktif! Hemat {voucherData.type === 'percentage' ? `${voucherData.value}%` : `Rp ${voucherData.value.toLocaleString('id-ID')}`}
                                </Text>
                            </View>
                            <Pressable onPress={handleRemoveVoucher} disabled={mut.isPending}>
                                <Text style={styles.removeVoucherText}>Hapus</Text>
                            </Pressable>
                        </View>
                    )}

                    {voucherError && !voucherData && (
                        <View style={styles.voucherError}>
                            <Feather name="alert-circle" size={16} color="#EF4444" />
                            <Text style={styles.voucherErrorText}>{voucherError}</Text>
                        </View>
                    )}
                </Card>

                {/* Price Breakdown */}
                <Card style={styles.priceCard}>
                    <Text style={styles.sectionTitle}>Rincian Pembayaran</Text>

                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Harga Paket</Text>
                        <Text style={styles.priceValue}>Rp {(selectedPackage.price ?? 0).toLocaleString('id-ID')}</Text>
                    </View>

                    {voucherData && (
                        <>
                            <View style={styles.priceRow}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <Feather name="tag" size={14} color="#10B981" />
                                    <Text style={[styles.priceLabel, { color: '#10B981' }]}>
                                        Voucher ({voucherData.code})
                                    </Text>
                                </View>
                                <Text style={[styles.priceValue, { color: '#10B981' }]}>
                                    - Rp {getDiscountAmount(selectedPackage.price ?? 0).toLocaleString('id-ID')}
                                </Text>
                            </View>
                            <View style={styles.priceDivider} />
                        </>
                    )}

                    <View style={[styles.priceRow, { marginTop: 12 }]}>
                        <Text style={styles.totalLabel}>Total Pembayaran</Text>
                        <Text style={styles.totalValue}>
                            Rp {getDiscountedPrice(selectedPackage.price ?? 0).toLocaleString('id-ID')}
                        </Text>
                    </View>
                </Card>

                {/* Info Box */}
                <View style={styles.infoBox}>
                    <Feather name="info" size={16} color="#3B82F6" />
                    <Text style={styles.infoText}>
                        Setelah konfirmasi, Anda akan diarahkan ke halaman pembayaran Xendit
                    </Text>
                </View>

                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                    <PrimaryButton
                        title="Batal"
                        onPress={() => navigation.goBack()}
                        disabled={mut.isPending}
                        style={[styles.button, { backgroundColor: '#F1F5F9', flex: 1 }]}
                        textStyle={{ color: '#64748B' }}
                    />
                    <PrimaryButton
                        title={mut.isPending ? "Memproses..." : "Konfirmasi & Bayar"}
                        leftIcon={!mut.isPending ? <Feather name="check" size={16} color="#FFFFFF" /> : undefined}
                        onPress={handleConfirmPurchase}
                        loading={mut.isPending}
                        style={[styles.button, { backgroundColor: '#4F46E5', flex: 1.5 }]}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 12,
        backgroundColor: '#F8FAFC',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    topTitle: {
        color: '#1E293B',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    packageCard: {
        padding: 20,
        marginBottom: 16,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    packageIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    packageName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    packageTokens: {
        fontSize: 14,
        color: '#4F46E5',
        fontWeight: '600',
        marginTop: 2,
    },
    packageDesc: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 20,
    },

    voucherCard: {
        padding: 20,
        marginBottom: 16,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 4,
    },
    voucherInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
    },
    applyBtn: {
        height: 48,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: '#4F46E5',
        minWidth: 100,
    },
    voucherSuccess: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
        backgroundColor: '#ECFDF5',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D1FAE5',
    },
    voucherSuccessText: {
        color: '#10B981',
        fontSize: 13,
        fontWeight: '500',
    },
    removeVoucherText: {
        color: '#EF4444',
        fontSize: 13,
        fontWeight: '600',
        paddingHorizontal: 8,
    },
    voucherError: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 6,
        backgroundColor: '#FEF2F2',
        padding: 12,
        borderRadius: 12,
    },
    voucherErrorText: {
        color: '#EF4444',
        fontSize: 13,
        fontWeight: '500',
        flex: 1,
    },

    priceCard: {
        padding: 20,
        marginBottom: 16,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    priceLabel: {
        fontSize: 14,
        color: '#64748B',
    },
    priceValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },
    priceDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#4F46E5',
    },

    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#EFF6FF',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#1E40AF',
        lineHeight: 20,
    },

    button: {
        height: 52,
        borderRadius: 16,
    },
});
