import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import Card from '../components/basic/Card';
import PrimaryButton from '../components/basic/PrimaryButton';
import BottomTabs from '../components/navigation/BottomTabs';
import { Feather, Ionicons } from '@expo/vector-icons';
import { getPackages } from '../api/package';

type Pkg = { id: number; name?: string; tokens?: number; price?: number; description?: string };

export default function TokenPackagesScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { data } = useQuery<Pkg[]>({ queryKey: ['packages'], queryFn: getPackages, retry: false });

  const handleReviewPurchase = (pkg: Pkg) => {
    navigation.navigate('PurchaseConfirmation', { package: pkg });
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

              <Text style={styles.priceHeadline}>Rp {(p.price ?? 0).toLocaleString('id-ID')}</Text>


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
