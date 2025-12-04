import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Card from '../components/basic/Card';
import TextField from '../components/basic/TextField';
import PrimaryButton from '../components/basic/PrimaryButton';

export default function CognitiveDataEntryScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [dob, setDob] = useState('');
  const [bloodType, setBloodType] = useState('');

  const next = () => {
    if (!dob || !bloodType) return;
    navigation.navigate('CognitiveQuestionnaire', { dob, bloodType });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 48 }}>
        <Text style={styles.pageTitle}>Data Diri</Text>
        <Text style={styles.pageSubtitle}>Isi data Anda untuk memulai kuesioner Cognitive Style.</Text>

        <Card style={{ marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={styles.iconWrap}><Feather name="user" size={18} color="#4F46E5" /></View>
            <Text style={styles.sectionTitle}>Informasi Wajib</Text>
          </View>
          <View style={{ gap: 12 }}>
            <TextField label="Tanggal Lahir" placeholder="DD-MM-YYYY" value={dob} onChangeText={setDob} startIcon={<Feather name="calendar" size={18} color="#64748B" />} />
            <TextField label="Golongan Darah" placeholder="A / B / AB / O" value={bloodType} onChangeText={setBloodType} startIcon={<Feather name="droplet" size={18} color="#64748B" />} />
          </View>
          <PrimaryButton title="Lanjutkan" onPress={next} style={{ marginTop: 16 }} leftIcon={<Feather name="arrow-right" size={18} color="#FFFFFF" />} />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageTitle: { color: '#0F172A', fontWeight: '700', fontSize: 22, letterSpacing: -0.5 },
  pageSubtitle: { color: '#64748B', fontSize: 13, marginTop: 4 },
  iconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  sectionTitle: { color: '#1E293B', fontWeight: '700', fontSize: 16 },
});

