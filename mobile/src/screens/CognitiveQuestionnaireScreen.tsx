import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Card from '../components/basic/Card';
import PrimaryButton from '../components/basic/PrimaryButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Question = { id: number; text: string };

const QUESTIONS: Question[] = [
  { id: 1, text: 'Saya mudah memperhatikan detail kecil yang orang lain lewatkan.' },
  { id: 2, text: 'Saya merasa nyaman mengamati situasi sebelum mengambil tindakan.' },
  { id: 3, text: 'Saya lebih suka bergerak cepat dan langsung terjun ke lapangan.' },
  { id: 4, text: 'Saya lebih suka bekerja diam-diam di belakang layar.' },
  { id: 5, text: 'Saya sering mengandalkan data dan fakta dalam memahami lingkungan.' },
  { id: 6, text: 'Saya cepat tanggap ketika melihat sesuatu yang tidak biasa.' },
  { id: 7, text: 'Saya sering berpikir mendalam sebelum mengambil keputusan.' },
  { id: 8, text: 'Saya lebih suka sistem yang rapi, terstruktur, dan logis.' },
  { id: 9, text: 'Saat ada masalah, saya menganalisis penyebabnya secara sistematis.' },
  { id: 10, text: 'Saya dapat membuat keputusan cepat berbasis logika.' },
  { id: 11, text: 'Saya lebih objektif daripada emosional dalam menilai sesuatu.' },
  { id: 12, text: 'Saya menikmati pekerjaan yang membutuhkan pemikiran kritis.' },
  { id: 13, text: 'Saya sangat peka terhadap suasana hati orang lain.' },
  { id: 14, text: 'Saya mudah merasakan emosi orang di sekitar saya.' },
  { id: 15, text: 'Saya lebih memilih ruang tenang untuk menyeimbangkan perasaan saya.' },
  { id: 16, text: 'Saya suka membangun hubungan sosial dan membuat orang merasa nyaman.' },
  { id: 17, text: 'Saya senang membantu orang menemukan solusi emosional.' },
  { id: 18, text: 'Saya cepat merasakan ketika seseorang membutuhkan dukungan.' },
  { id: 19, text: 'Saya sering memiliki ide-ide baru yang muncul tiba-tiba.' },
  { id: 20, text: 'Saya menikmati mengembangkan konsep kreatif atau inovatif.' },
  { id: 21, text: 'Saya lebih suka berpikir jauh ke depan daripada fokus pada hari ini.' },
  { id: 22, text: 'Saya merasa lebih nyaman bekerja sendiri saat memunculkan ide.' },
  { id: 23, text: 'Saya senang mengeksplor hal baru dan mencoba banyak eksperimen.' },
  { id: 24, text: 'Saya cepat menghubungkan berbagai konsep yang awalnya tidak berhubungan.' },
  { id: 25, text: 'Saya dapat membuat keputusan penting secara cepat dalam situasi mendesak.' },
  { id: 26, text: 'Saya mengandalkan insting ketika waktu sangat terbatas.' },
  { id: 27, text: 'Saya suka tantangan yang membutuhkan respons spontan.' },
  { id: 28, text: 'Saya merasa nyaman berada di situasi lapangan yang dinamis.' },
  { id: 29, text: 'Saya mampu tetap tenang saat harus bertindak cepat.' },
  { id: 30, text: 'Saya jarang ragu ketika sudah merasakan sesuatu harus dilakukan.' },
  { id: 31, text: 'Saya mendapatkan energi ketika berinteraksi dengan banyak orang.' },
  { id: 32, text: 'Saya lebih nyaman bekerja sendirian atau dengan sedikit orang.' },
  { id: 33, text: 'Saya spontan dan mudah beradaptasi dengan perubahan.' },
  { id: 34, text: 'Saya butuh waktu untuk memproses sebelum berbicara.' },
  { id: 35, text: 'Saya suka aktivitas yang cepat dan penuh tantangan.' },
  { id: 36, text: 'Saya lebih suka aktivitas yang tenang dan terstruktur.' },
];

export default function CognitiveQuestionnaireScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const dob = route?.params?.dob as string | undefined;
  const bloodType = route?.params?.bloodType as string | undefined;
  const [answers, setAnswers] = useState<number[]>(Array(36).fill(3));
  const setAnswer = (index: number, val: number) => {
    setAnswers(prev => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const domainScores = useMemo(() => {
    const sum = (idxs: number[]) => idxs.reduce((acc, i) => acc + answers[i - 1], 0);
    return {
      Observer: sum([1, 2, 3, 4, 5, 6]),
      Analyzer: sum([7, 8, 9, 10, 11, 12]),
      Empath: sum([13, 14, 15, 16, 17, 18]),
      Visionary: sum([19, 20, 21, 22, 23, 24]),
      Navigator: sum([25, 26, 27, 28, 29, 30]),
    };
  }, [answers]);

  const eScore = useMemo(() => {
    const idxs = [3, 10, 16, 23, 31, 33, 35];
    return idxs.reduce((acc, i) => acc + answers[i - 1], 0);
  }, [answers]);

  const iScore = useMemo(() => {
    const idxs = [4, 7, 15, 22, 32, 34, 36];
    return idxs.reduce((acc, i) => acc + answers[i - 1], 0);
  }, [answers]);

  const tipeUtama = useMemo(() => {
    const entries = Object.entries(domainScores);
    const max = entries.reduce((acc, cur) => (cur[1] > acc[1] ? cur : acc));
    return max[0];
  }, [domainScores]);

  const eiType = useMemo(() => (eScore > iScore ? 'Ekstrovert' : 'Introvert'), [eScore, iScore]);
  const finalType = useMemo(() => (tipeUtama === 'Navigator' ? 'Navigator' : `${tipeUtama} ${eiType}`), [tipeUtama, eiType]);
  const questionnairePercent = useMemo(() => Math.round((answers.reduce((a, b) => a + b, 0) / (36 * 5)) * 100), [answers]);

  const proceed = async () => {
    if (!dob || !bloodType) return;
    const payload = {
      savedAt: new Date().toISOString(),
      dob,
      bloodType,
      answers,
      domainScores,
      eScore,
      iScore,
      eiType,
      tipeUtama,
      finalType,
      percent: questionnairePercent,
    };
    try {
      await AsyncStorage.setItem('cst:lastQuestionnaire', JSON.stringify(payload));
    } catch {}
    navigation.navigate('CognitiveTestIntro', {
      fromQuestionnaire: true,
      dob,
      bloodType,
      questionnaire: payload,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 48 }}>
        <Text style={styles.pageTitle}>Kuesioner Cognitive Style</Text>
        <Text style={styles.pageSubtitle}>Isi data diri dan jawaban Anda sebelum verifikasi sidik jari.</Text>

        <Card style={{ marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={styles.iconWrap}><Feather name="user" size={18} color="#4F46E5" /></View>
            <Text style={styles.sectionTitle}>Data Diri</Text>
          </View>
          <Text style={styles.helper}>Konfirmasi data yang akan digunakan untuk verifikasi.</Text>
          <View style={{ gap: 8, marginTop: 8 }}>
            <Text style={styles.summaryText}>Tanggal Lahir: {dob}</Text>
            <Text style={styles.summaryText}>Golongan Darah: {bloodType}</Text>
          </View>
        </Card>

        <Card style={{ marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={styles.iconWrap}><Feather name="clipboard" size={18} color="#4F46E5" /></View>
            <Text style={styles.sectionTitle}>Pertanyaan</Text>
          </View>
          <Text style={styles.helper}>Skala Likert 1–5 (1 = Sangat Tidak Setuju, 5 = Sangat Setuju)</Text>
          <View style={{ marginTop: 8, gap: 16 }}>
            {QUESTIONS.map((q, idx) => (
              <View key={q.id} style={styles.qItem}>
                <Text style={styles.qText}>{q.id}. {q.text}</Text>
                <View style={styles.scaleRow}>
                  {[1, 2, 3, 4, 5].map(v => (
                    <Pressable key={v} onPress={() => setAnswer(idx, v)} style={[styles.scaleBtn, answers[idx] === v && styles.scaleBtnActive]} android_ripple={{ color: '#E2E8F0' }}>
                      <Text style={[styles.scaleText, answers[idx] === v && styles.scaleTextActive]}>{v}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </Card>

        <Card style={{ marginTop: 16 }}>
          <Text style={styles.sectionTitle}>Ringkasan Sementara</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <View style={styles.metric}><Text style={styles.metricLabel}>Observer</Text><Text style={styles.metricValue}>{domainScores.Observer}</Text></View>
            <View style={styles.metric}><Text style={styles.metricLabel}>Analyzer</Text><Text style={styles.metricValue}>{domainScores.Analyzer}</Text></View>
            <View style={styles.metric}><Text style={styles.metricLabel}>Empath</Text><Text style={styles.metricValue}>{domainScores.Empath}</Text></View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <View style={styles.metric}><Text style={styles.metricLabel}>Visionary</Text><Text style={styles.metricValue}>{domainScores.Visionary}</Text></View>
            <View style={styles.metric}><Text style={styles.metricLabel}>Navigator</Text><Text style={styles.metricValue}>{domainScores.Navigator}</Text></View>
            <View style={styles.metric}><Text style={styles.metricLabel}>{eiType}</Text><Text style={styles.metricValue}>{eiType === 'Ekstrovert' ? eScore : iScore}</Text></View>
          </View>
          <View style={{ marginTop: 12 }}>
            <Text style={styles.summaryText}>Tipe Utama: {tipeUtama}</Text>
            <Text style={styles.summaryText}>Final Type: {finalType}</Text>
            <Text style={styles.summaryText}>Persentase Kuesioner: {questionnairePercent}%</Text>
          </View>
          <PrimaryButton title="Simpan Kuesioner & Verifikasi" onPress={proceed} style={{ marginTop: 12 }} leftIcon={<Feather name="arrow-right" size={18} color="#FFFFFF" />} />
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
  helper: { color: '#64748B', fontSize: 12 },
  qItem: { paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  qText: { color: '#0F172A', fontSize: 14, lineHeight: 22 },
  scaleRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  scaleBtn: { height: 36, minWidth: 36, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  scaleBtnActive: { backgroundColor: '#EEF2FF', borderColor: '#4F46E5' },
  scaleText: { color: '#64748B', fontSize: 14, fontWeight: '600' },
  scaleTextActive: { color: '#4F46E5' },
  metric: { flex: 1, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingVertical: 10, alignItems: 'center', backgroundColor: '#F8FAFC' },
  metricLabel: { color: '#64748B', fontSize: 12, fontWeight: '500' },
  metricValue: { color: '#4F46E5', fontWeight: '800', fontSize: 16, marginTop: 4 },
  summaryText: { color: '#475569', fontSize: 13, marginTop: 4 },
});

