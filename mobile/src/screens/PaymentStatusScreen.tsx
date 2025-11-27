import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Linking, AppState } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../components/basic/Card';
import PrimaryButton from '../components/basic/PrimaryButton';
import { Feather, Ionicons } from '@expo/vector-icons';
import { getInvoiceById } from '../api/invoice';

export default function PaymentStatusScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { invoiceId, paymentUrl } = route?.params || {};
  const [status, setStatus] = useState<'PENDING' | 'PAID' | 'FAILED' | 'UNKNOWN'>('UNKNOWN');
  const timer = useRef<any>(null);

  useEffect(() => {
    let active = true;
    const check = async () => {
      if (!invoiceId) return;
      try {
        console.log('Checking invoice status for:', invoiceId);
        const inv = await getInvoiceById(Number(invoiceId));
        console.log('Invoice status:', inv?.status);
        if (active) {
          setStatus(inv?.status || 'UNKNOWN');
          if (inv?.status === 'PAID') {
            clearInterval(timer.current);
            navigation.replace('PaymentSuccess', { invoiceId });
          }
        }
      } catch (e) {
        console.log('Error checking invoice status:', e);
      }
    };
    check();
    timer.current = setInterval(check, 5000); // Poll every 5 seconds
    const sub = AppState.addEventListener('change', (st) => { if (st === 'active') check(); });
    return () => { active = false; clearInterval(timer.current); sub.remove(); };
  }, [invoiceId, navigation]);

  const openPayment = () => {
    if (paymentUrl) navigation.navigate('PaymentWebView', { invoiceId, paymentUrl });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={[styles.topBar, { paddingTop: insets.top + 16 }]}>
        <Pressable style={styles.backBtn} android_ripple={{ color: '#EAF4FF' }} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color="#334155" />
        </Pressable>
        <Text style={styles.topTitle}>Status Pembayaran</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: insets.bottom + 48 }}>
        <View style={styles.stepBar}>
          <View style={styles.stepItem}><View style={styles.stepDot} /><Text style={styles.stepLabel}>Choose</Text></View>
          <View style={styles.stepConnector} />
          <View style={[styles.stepItem, styles.stepActive]}><View style={[styles.stepDot, styles.stepDotActive]} /><Text style={[styles.stepLabel, styles.stepLabelActive]}>Payment</Text></View>
          <View style={styles.stepConnector} />
          <View style={styles.stepItem}><View style={styles.stepDot} /><Text style={styles.stepLabel}>Finish</Text></View>
        </View>
        <Card style={{ marginTop: 12 }}>
          <Text style={styles.title}>Invoice #{invoiceId}</Text>
          <Text style={styles.subtitle}>Status saat ini: {status}</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <PrimaryButton title="Buka Pembayaran" leftIcon={<Feather name="external-link" size={18} color="#FFFFFF" />} onPress={openPayment} />
            <PrimaryButton title="Refresh" variant="secondary" onPress={() => { }} />
          </View>
          <View style={{ height: 12 }} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={styles.step}><Feather name="shopping-cart" size={16} color="#4F46E5" /><Text style={styles.stepText}>Pilih paket</Text></View>
            <View style={styles.step}><Feather name="credit-card" size={16} color="#4F46E5" /><Text style={styles.stepText}>Bayar</Text></View>
            <View style={styles.step}><Feather name="check-circle" size={16} color="#4F46E5" /><Text style={styles.stepText}>Sukses</Text></View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 8, backgroundColor: '#FFFFFF' },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9' },
  topTitle: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
  title: { color: '#0F172A', fontWeight: '800', fontSize: 16 },
  subtitle: { color: '#64748B', marginTop: 4 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#EEF2FF', borderRadius: 12 },
  stepText: { color: '#4F46E5', fontWeight: '700' },
  stepBar: { flexDirection: 'row', alignItems: 'center' },
  stepItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E2E8F0' },
  stepLabel: { color: '#94A3B8', fontWeight: '700' },
  stepConnector: { width: 28, height: 3, borderRadius: 2, backgroundColor: '#E2E8F0', marginHorizontal: 8 },
  stepActive: {},
  stepDotActive: { backgroundColor: '#4F46E5' },
  stepLabelActive: { color: '#4F46E5' },
});
