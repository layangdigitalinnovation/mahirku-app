import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
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

// Kuesioner untuk Anak Usia Dini (0-6 tahun) - Diisi oleh observer (guru/orang tua)
const QUESTIONS_EARLY_CHILDHOOD: Question[] = [
  // Observer (1-6)
  { id: 1, text: 'Anak memperhatikan detail saat bermain atau belajar.' },
  { id: 2, text: 'Anak memperhatikan perubahan kecil di sekitarnya.' },
  { id: 3, text: 'Anak mengamati sebelum bertindak.' },
  { id: 4, text: 'Anak memperhatikan ekspresi orang lain.' },
  { id: 5, text: 'Anak suka mengamati teman sebelum ikut bermain.' },
  { id: 6, text: 'Anak mengingat detail kejadian.' },
  // Analyzer (7-12)
  { id: 7, text: 'Anak berpikir sebelum menjawab pertanyaan.' },
  { id: 8, text: 'Anak bertanya untuk memahami sesuatu.' },
  { id: 9, text: 'Anak menyusun mainan secara teratur.' },
  { id: 10, text: 'Anak mengikuti aturan permainan.' },
  { id: 11, text: 'Anak mencoba memecahkan masalah sendiri.' },
  { id: 12, text: 'Anak menyukai aktivitas logika sederhana.' },
  // Empath (13-18)
  { id: 13, text: 'Anak peduli perasaan teman.' },
  { id: 14, text: 'Anak membantu teman yang kesulitan.' },
  { id: 15, text: 'Anak menunjukkan rasa sayang.' },
  { id: 16, text: 'Anak merasa sedih saat temannya sedih.' },
  { id: 17, text: 'Anak mudah memaafkan.' },
  { id: 18, text: 'Anak suka berbagi.' },
  // Visionary (19-24)
  { id: 19, text: 'Anak memiliki ide bermain sendiri.' },
  { id: 20, text: 'Anak suka berimajinasi.' },
  { id: 21, text: 'Anak membuat cerita sendiri.' },
  { id: 22, text: 'Anak mencoba cara baru.' },
  { id: 23, text: 'Anak tertarik hal baru.' },
  { id: 24, text: 'Anak kreatif dalam bermain.' },
  // Navigator (25-30)
  { id: 25, text: 'Anak cepat bereaksi.' },
  { id: 26, text: 'Anak berani mencoba.' },
  { id: 27, text: 'Anak tidak mudah takut.' },
  { id: 28, text: 'Anak sigap membantu.' },
  { id: 29, text: 'Anak aktif bergerak.' },
  { id: 30, text: 'Anak tanggap situasi.' },
  // Sosial (31-36)
  { id: 31, text: 'Anak senang bermain dengan banyak teman.' },
  { id: 32, text: 'Anak nyaman tampil di depan.' },
  { id: 33, text: 'Anak mudah beradaptasi.' },
  { id: 34, text: 'Anak suka berbicara.' },
  { id: 35, text: 'Anak percaya diri.' },
  { id: 36, text: 'Anak aktif dalam kelompok.' },
];

// Helper: Calculate age from birthdate (DD-MM-YYYY format)
const calculateAge = (dobString: string): number => {
  const parts = dobString.split('-');
  if (parts.length !== 3) return 99; // fallback for invalid format
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // month is 0-indexed
  const year = parseInt(parts[2], 10);
  const birthDate = new Date(year, month, day);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Helper: Check if user is in early childhood range (0-6 years)
const isEarlyChildhood = (dobString: string): boolean => {
  const age = calculateAge(dobString);
  return age >= 0 && age <= 6;
};

export default function CognitiveQuestionnaireScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const dob = route?.params?.dob as string | undefined;
  const bloodType = route?.params?.bloodType as string | undefined;

  // Determine questionnaire type based on age
  const isChildQuestionnaire = dob ? isEarlyChildhood(dob) : false;
  const questions = isChildQuestionnaire ? QUESTIONS_EARLY_CHILDHOOD : QUESTIONS;

  const [answers, setAnswers] = useState<number[]>(Array(36).fill(0));
  const setAnswer = (index: number, val: number) => {
    setAnswers(prev => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const domainScores = useMemo(() => {
    const sum = (idxs: number[]) => idxs.reduce((acc, i) => acc + answers[i - 1], 0);
    const baseScores = {
      Observer: sum([1, 2, 3, 4, 5, 6]),
      Analyzer: sum([7, 8, 9, 10, 11, 12]),
      Empath: sum([13, 14, 15, 16, 17, 18]),
      Visionary: sum([19, 20, 21, 22, 23, 24]),
      Navigator: sum([25, 26, 27, 28, 29, 30]),
    };
    // Add Sosial domain for early childhood questionnaire
    if (isChildQuestionnaire) {
      return {
        ...baseScores,
        Sosial: sum([31, 32, 33, 34, 35, 36]),
      };
    }
    return baseScores;
  }, [answers, isChildQuestionnaire]);

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

  // E/I type only for regular questionnaire (not early childhood)
  const eiType = useMemo(() => {
    if (isChildQuestionnaire) return ''; // No E/I scoring for early childhood
    return eScore > iScore ? 'Ekstrovert' : 'Introvert';
  }, [eScore, iScore, isChildQuestionnaire]);

  const finalType = useMemo(() => {
    if (isChildQuestionnaire) return tipeUtama; // No E/I suffix for early childhood
    return tipeUtama === 'Navigator' ? 'Navigator' : `${tipeUtama} ${eiType}`;
  }, [tipeUtama, eiType, isChildQuestionnaire]);
  const questionnairePercent = useMemo(() => Math.round((answers.reduce((a, b) => a + b, 0) / (36 * 5)) * 100), [answers]);

  const proceed = async () => {
    if (!dob || !bloodType) return;
    if (answers.includes(0)) {
      Alert.alert('Belum Lengkap', 'Mohon isi semua pertanyaan kuesioner sebelum melanjutkan.');
      return;
    }
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
    } catch { }
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
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Pressable style={styles.backBtn} android_ripple={{ color: '#E2E8F0' }} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color="#475569" />
          </Pressable>
          <Text style={styles.pageTitle}>
            {isChildQuestionnaire ? 'Kuesioner Cognitive Style Anak Usia Dini' : 'Kuesioner Cognitive Style'}
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.pageSubtitle}>
          {isChildQuestionnaire
            ? 'Kuesioner diisi oleh guru/orang tua berdasarkan pengamatan terhadap anak.'
            : 'Isi data diri dan jawaban Anda sebelum verifikasi sidik jari.'}
        </Text>

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
          <Text style={styles.helper}>
            {isChildQuestionnaire
              ? 'Skala 1–5 (1 = Sangat Tidak Sesuai, 5 = Sangat Sesuai)'
              : 'Skala Likert 1–5 (1 = Sangat Tidak Setuju, 5 = Sangat Setuju)'}
          </Text>
          <View style={{ marginTop: 8, gap: 16 }}>
            {questions.map((q, idx) => (
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

        <View style={{ marginTop: 16 }}>
          <PrimaryButton title="Simpan Kuesioner & Verifikasi" onPress={proceed} style={{ marginTop: 12 }} leftIcon={<Feather name="arrow-right" size={18} color="#FFFFFF" />} />
        </View>
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
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
});

