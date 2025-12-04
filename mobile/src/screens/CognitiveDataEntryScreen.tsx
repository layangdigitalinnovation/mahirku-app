import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import Card from '../components/basic/Card';
import TextField from '../components/basic/TextField';
import PrimaryButton from '../components/basic/PrimaryButton';
import DatePicker from 'react-native-date-picker';

export default function CognitiveDataEntryScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [dob, setDob] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [dobDate, setDobDate] = useState<Date | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const formatDate = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const next = () => {
    const effectiveDob = dobDate ? formatDate(dobDate) : dob;
    if (!effectiveDob || !bloodType) return;
    navigation.navigate('CognitiveQuestionnaire', { dob: effectiveDob, bloodType });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 48 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Pressable style={styles.backBtn} android_ripple={{ color: '#E2E8F0' }} onPress={() => navigation.replace('Dashboard')}>
            <Ionicons name="chevron-back" size={20} color="#475569" />
          </Pressable>
          <Text style={styles.pageTitle}>Data Diri</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.pageSubtitle}>Isi data Anda untuk memulai kuesioner Cognitive Style.</Text>

        <Card style={{ marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={styles.iconWrap}><Feather name="user" size={18} color="#4F46E5" /></View>
            <Text style={styles.sectionTitle}>Informasi Wajib</Text>
          </View>
          <View style={{ gap: 12 }}>
            <TextField label="Tanggal Lahir" placeholder="DD-MM-YYYY" value={dobDate ? formatDate(dobDate) : dob} onChangeText={setDob} startIcon={<Feather name="calendar" size={18} color="#64748B" />} editable={false} onPress={() => setPickerOpen(s => !s)} />
            {pickerOpen ? (
              <View style={{ paddingHorizontal: 4 }}>
                <DatePicker
                  date={dobDate || new Date(2000, 0, 1)}
                  mode="date"
                  onDateChange={(d) => { setDobDate(d); setDob(formatDate(d)); }}
                />
              </View>
            ) : null}
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
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
});
