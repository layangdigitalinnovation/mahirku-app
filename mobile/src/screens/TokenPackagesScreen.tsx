import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Modal, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import Card from '../components/basic/Card';
import PrimaryButton from '../components/basic/PrimaryButton';
import TextField from '../components/basic/TextField';
import BottomTabs from '../components/navigation/BottomTabs';
import { Feather, Ionicons } from '@expo/vector-icons';
import { getPackages } from '../api/package';
import { purchaseToken, validateVoucher } from '../api/token';

type Pkg = { id: number; name?: string; tokens?: number; price?: number; description?: string };

export default function TokenPackagesScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { data } = useQuery<Pkg[]>({ queryKey: ['packages'], queryFn: getPackages, retry: false });

  const [voucherCode, setVoucherCode] = useState('');
  const [voucherData, setVoucherData] = useState<any>(null);
  const [voucherError, setVoucherError] = useState('');
  const [checkingVoucher, setCheckingVoucher] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Pkg | null>(null);

  // Auto-validate voucher when code changes (debounced)
  useEffect(() => {
    if (!voucherCode.trim()) {
      setVoucherData(null);
      setVoucherError('');
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingVoucher(true);
      setVoucherError('');
      setVoucherData(null);
      try {
        const res = await validateVoucher(voucherCode);
        setVoucherData(res.data);
      } catch (err: any) {
        setVoucherError(err.response?.data?.message || 'Voucher tidak valid');
      } finally {
        setCheckingVoucher(false);
      }
    }, 800); // Debounce 800ms

    return () => clearTimeout(timer);
  }, [voucherCode]);

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

  const handleReviewPurchase = (pkg: Pkg) => {
    setSelectedPackage(pkg);
    setShowConfirmModal(true);
  };

  const mut = useMutation({
    mutationFn: (id: number) => purchaseToken({ packageId: id, voucherCode: voucherData?.code }),
    onSuccess: async (res) => {
      setShowConfirmModal(false);
      // Navigate to WebView instead of opening external browser
      navigation.navigate('PaymentWebView', { invoiceId: res.invoiceId, paymentUrl: res.paymentUrl });
    }
  });

  const handleConfirmPurchase = () => {
    if (selectedPackage) {
      mut.mutate(selectedPackage.id);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Pressable style={styles.backBtn} android_ripple={{ color: '#E2E8F0' }} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color="#475569" />
        </Pressable>
        <Text style={styles.topTitle}>Pilih Paket</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: insets.bottom + 48 }}>
        <Text style={styles.pageTitle}>Paket Token</Text>
        <Text style={styles.pageSubtitle}>Pilih paket token untuk melakukan Cognitive Style Test</Text>

        {/* Voucher Input Section - No "Cek" button, auto-validate */}
        <View style={styles.voucherSection}>
          <TextField
            label="Kode Voucher (Opsional)"
            placeholder="Masukkan kode voucher"
            value={voucherCode}
            onChangeText={(text) => {
              setVoucherCode(text.toUpperCase());
            }}
            startIcon={<Feather name="tag" size={18} color="#64748B" />}
          />

          {checkingVoucher && voucherCode && (
            <View style={styles.voucherChecking}>
              <ActivityIndicator size="small" color="#4F46E5" />
              <Text style={styles.voucherCheckingText}>Memvalidasi voucher...</Text>
            </View>
          )}

          {voucherData && (
            <View style={styles.voucherSuccess}>
              <Feather name="check-circle" size={16} color="#10B981" />
              <Text style={styles.voucherSuccessText}>
                Voucher aktif! Hemat {voucherData.type === 'percentage' ? `${voucherData.value}%` : `Rp ${voucherData.value.toLocaleString('id-ID')}`}
              </Text>
            </View>
          )}

          {voucherError && voucherCode && !checkingVoucher ? (
            <View style={styles.voucherError}>
              <Feather name="alert-circle" size={16} color="#EF4444" />
              <Text style={styles.voucherErrorText}>{voucherError}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.stepBar}>
          <View style={[styles.stepItem, styles.stepActive]}>
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <Text style={[styles.stepLabel, styles.stepLabelActive]}>Choose</Text>
          </View>
          <View style={styles.stepConnector} />
          <View style={styles.stepItem}>
            <View style={styles.stepDot} />
            <Text style={styles.stepLabel}>Payment</Text>
          </View>
          <View style={styles.stepConnector} />
          <View style={styles.stepItem}>
            <View style={styles.stepDot} />
            <Text style={styles.stepLabel}>Finish</Text>
          </View>
        </View>

        {(data ?? []).map((p) => (
          <View key={p.id} style={[styles.ticketCard, { width: '100%', marginBottom: 20 }]}>
            <View style={styles.ticketNotchLeft} />
            <View style={styles.ticketNotchRight} />
            <View style={{ alignItems: 'center', paddingHorizontal: 12 }}>
              <View style={[styles.iconWrap, { marginBottom: 12 }]}><Feather name="credit-card" size={24} color="#4F46E5" /></View>
              <Text style={styles.pkgTitle}>{p.name || 'Paket'}</Text>

              {voucherData ? (
                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.priceHeadline, { textDecorationLine: 'line-through', color: '#94A3B8', fontSize: 16, marginBottom: -4 }]}>
                    Rp {(p.price ?? 0).toLocaleString('id-ID')}
                  </Text>
                  <Text style={styles.priceHeadline}>
                    Rp {getDiscountedPrice(p.price ?? 0).toLocaleString('id-ID')}
                  </Text>
                </View>
              ) : (
                <Text style={styles.priceHeadline}>Rp {(p.price ?? 0).toLocaleString('id-ID')}</Text>
              )}

              {(p.tokens ?? 0) > 0 ? (
                <View style={[styles.tokenBadge, { marginTop: 8 }]}><Text style={styles.tokenBadgeText}>{p.tokens} Token</Text></View>
              ) : null}
              <Text style={styles.pkgDesc}>{p.description || ''}</Text>
            </View>
            <View style={styles.ticketDivider} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <PrimaryButton
                title="Review Pembelian"
                leftIcon={<Feather name="check-square" size={18} color="#FFFFFF" />}
                onPress={() => handleReviewPurchase(p)}
                style={{ width: '100%', height: 48, borderRadius: 12 }}
              />
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedPackage && (
        <Modal
          visible={showConfirmModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowConfirmModal(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalBackground} onPress={() => !mut.isPending && setShowConfirmModal(false)} />
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Konfirmasi Pembelian</Text>
                <Pressable onPress={() => !mut.isPending && setShowConfirmModal(false)} disabled={mut.isPending}>
                  <Feather name="x" size={20} color="#64748B" />
                </Pressable>
              </View>

              {/* Package Details */}
              <View style={styles.packageInfoCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View style={styles.packageIcon}>
                    <Feather name="credit-card" size={20} color="#4F46E5" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.packageName}>{selectedPackage.name}</Text>
                    <Text style={styles.packageTokens}>{selectedPackage.tokens} Token</Text>
                  </View>
                </View>
                <Text style={styles.packageDesc}>{selectedPackage.description}</Text>
              </View>

              {/* Price Breakdown */}
              <View style={styles.priceBreakdown}>
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

                <View style={[styles.priceRow, { marginTop: voucherData ? 8 : 12 }]}>
                  <Text style={styles.totalLabel}>Total Pembayaran</Text>
                  <Text style={styles.totalValue}>
                    Rp {getDiscountedPrice(selectedPackage.price ?? 0).toLocaleString('id-ID')}
                  </Text>
                </View>
              </View>

              {/* Information Box */}
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
                  onPress={() => setShowConfirmModal(false)}
                  disabled={mut.isPending}
                  style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]}
                  textStyle={{ color: '#64748B' }}
                />
                <PrimaryButton
                  title={mut.isPending ? "Memproses..." : "Konfirmasi & Bayar"}
                  leftIcon={!mut.isPending ? <Feather name="check" size={16} color="#FFFFFF" /> : undefined}
                  onPress={handleConfirmPurchase}
                  loading={mut.isPending}
                  style={[styles.modalBtn, { backgroundColor: '#4F46E5', flex: 1.5 }]}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

      <BottomTabs
        tabs={[
          { key: 'home', label: 'Home', icon: 'home' },
          { key: 'tests', label: 'Tests', icon: 'grid' },
          { key: 'reports', label: 'Reports', icon: 'file-text' },
          { key: 'profile', label: 'Profile', icon: 'user' },
        ]}
        activeIndex={0}
        onChange={(i) => {
          const keys = ['home', 'tests', 'reports', 'profile'];
          const key = keys[i];
          if (key === 'tests') navigation.replace('Tests');
          if (key === 'reports') navigation.replace('Reports');
          if (key === 'profile') navigation.replace('Profile');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#F8FAFC' },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  topTitle: { color: '#1E293B', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  pageTitle: { color: '#0F172A', fontWeight: '700', fontSize: 24, marginBottom: 6, letterSpacing: -0.5 },
  pageSubtitle: { color: '#64748B', fontSize: 15, lineHeight: 22, marginBottom: 24 },
  iconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E0E7FF' },
  pkgTitle: { color: '#1E293B', fontWeight: '700', fontSize: 20, textAlign: 'center', marginBottom: 4 },
  priceHeadline: { color: '#4F46E5', fontWeight: '700', fontSize: 24, marginTop: 4, textAlign: 'center' },
  pkgDesc: { color: '#64748B', marginTop: 12, fontSize: 14, lineHeight: 20, textAlign: 'center', paddingHorizontal: 16 },
  tokenBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F5F3FF', borderWidth: 1, borderColor: '#EDE9FE' },
  tokenBadgeText: { color: '#7C3AED', fontWeight: '600', fontSize: 13 },
  stepBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 28, paddingHorizontal: 4 },
  stepItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#CBD5E1' },
  stepLabel: { color: '#94A3B8', fontWeight: '600', fontSize: 13 },
  stepConnector: { flex: 1, height: 2, borderRadius: 1, backgroundColor: '#E2E8F0', marginHorizontal: 12 },
  stepActive: {},
  stepDotActive: { backgroundColor: '#4F46E5', borderWidth: 3, borderColor: '#E0E7FF' },
  stepLabelActive: { color: '#4F46E5', fontWeight: '700' },
  ticketCard: { backgroundColor: '#FFFFFF', borderRadius: 24, paddingTop: 24, paddingBottom: 20, paddingHorizontal: 20, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4, position: 'relative' },
  ticketNotchLeft: { position: 'absolute', left: -12, top: '68%', marginTop: -12, width: 24, height: 24, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9', zIndex: 10 },
  ticketNotchRight: { position: 'absolute', right: -12, top: '68%', marginTop: -12, width: 24, height: 24, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9', zIndex: 10 },
  ticketDivider: { marginTop: 24, marginBottom: 20, height: 1, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: '#E2E8F0', marginHorizontal: -20 },

  voucherSection: { marginBottom: 24 },
  voucherChecking: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  voucherCheckingText: { color: '#4F46E5', fontSize: 13, fontWeight: '500' },
  voucherSuccess: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  voucherSuccessText: { color: '#10B981', fontSize: 13, fontWeight: '500' },
  voucherError: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  voucherErrorText: { color: '#EF4444', fontSize: 13, fontWeight: '500' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalBackground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    margin: 20,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 10,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },

  packageInfoCard: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  packageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  packageName: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  packageTokens: { fontSize: 13, color: '#4F46E5', fontWeight: '600', marginTop: 2 },
  packageDesc: { fontSize: 13, color: '#64748B', lineHeight: 18 },

  priceBreakdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  priceLabel: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  priceValue: { fontSize: 14, color: '#1E293B', fontWeight: '600' },
  priceDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 8 },
  totalLabel: { fontSize: 16, color: '#1E293B', fontWeight: '700' },
  totalValue: { fontSize: 20, color: '#4F46E5', fontWeight: '800' },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoText: { flex: 1, fontSize: 12, color: '#1E40AF', lineHeight: 16 },

  modalBtn: { flex: 1, height: 48, borderRadius: 12 },
});
