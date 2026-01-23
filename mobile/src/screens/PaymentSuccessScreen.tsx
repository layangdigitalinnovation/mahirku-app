import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../components/basic/Card';
import PrimaryButton from '../components/basic/PrimaryButton';
import { Feather } from '@expo/vector-icons';

export default function PaymentSuccessScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { invoiceId } = route?.params || {};
  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: insets.top + 32, paddingBottom: insets.bottom + 48, alignItems: 'center' }}>
        <View style={styles.stepBar}>
          <View style={[styles.stepItem, styles.stepActive]}><View style={[styles.stepDot, styles.stepDotActive]} /><Text style={[styles.stepLabel, styles.stepLabelActive]}>Booking</Text></View>
          <View style={styles.stepConnector} />
          <View style={[styles.stepItem, styles.stepActive]}><View style={[styles.stepDot, styles.stepDotActive]} /><Text style={[styles.stepLabel, styles.stepLabelActive]}>Payment</Text></View>
          <View style={styles.stepConnector} />
          <View style={[styles.stepItem, styles.stepActive]}><View style={[styles.stepDot, styles.stepDotActive]} /><Text style={[styles.stepLabel, styles.stepLabelActive]}>Finish</Text></View>
        </View>
        <View style={styles.iconBig}><Feather name="check-circle" size={48} color="#16A34A" /></View>
        <Text style={styles.title}>Pembayaran Berhasil</Text>
        <Text style={styles.subtitle}>Invoice #{invoiceId}</Text>
        <Card style={{ marginTop: 16, width: '100%' }}>
          <Text style={{ color: '#64748B' }}>Terima kasih! Token Anda akan segera ditambahkan ke akun.</Text>
        </Card>
        <PrimaryButton title="Kembali ke Dashboard" leftIcon={<Feather name="home" size={18} color="#FFFFFF" />} onPress={() => navigation.replace('Dashboard')} style={{ marginTop: 16 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  iconBig: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EAF6FF', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#0F172A', fontWeight: '800', fontSize: 20, marginTop: 12 },
  subtitle: { color: '#64748B', marginTop: 4 },
  stepBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  stepItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E2E8F0' },
  stepLabel: { color: '#94A3B8', fontWeight: '700' },
  stepConnector: { width: 28, height: 3, borderRadius: 2, backgroundColor: '#E2E8F0', marginHorizontal: 8 },
  stepActive: {},
  stepDotActive: { backgroundColor: '#4F46E5' },
  stepLabelActive: { color: '#4F46E5' },
});
