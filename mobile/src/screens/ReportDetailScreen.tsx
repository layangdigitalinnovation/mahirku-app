import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Card from '../components/basic/Card';
import PrimaryButton from '../components/basic/PrimaryButton';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { generateCertificatePDF } from '../utils/certificateGenerator';
import { generateCSTCertificatePDF } from '../utils/cstCertificateGenerator';
import { generateDISCCertificatePDF } from '../utils/discCertificateGenerator';
import { meApi } from '../api/auth';
import { useQuery } from '@tanstack/react-query';
import ShareResultModal from '../components/ui/ShareResultModal';
import { buildShareCaption, shareResultPosterPDF, shareResultText, type ShareTestType } from '../utils/testResultShare';
import { getAiReport } from '../api/thinkingStyle';
import { getDiscAiReport } from '../api/disc';


export default function ReportDetailScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const r = route?.params?.report as { title: string; date: string; summary: string; type: string; fullData?: any } | undefined;
  const thinkingStyle = r?.fullData?.thinkingStyle;
  const combine = (route?.params?.report as any)?.combine as { finalPercent?: number; questionnairePercent?: number; questionnaire?: any } | undefined;
  const fromFingerprint = route?.params?.fromFingerprint as boolean | undefined;
  const [downloading, setDownloading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const reportId = (r as any)?.id as string | undefined;
  const reportIdNum = reportId ? Number(reportId) : NaN;
  const [questionnaire, setQuestionnaire] = useState<any | undefined>(combine?.questionnaire ?? r?.fullData?.questionnaire);

  useEffect(() => {
    if (r?.type !== 'cst') return;
    if (questionnaire) return;
    if (!reportId) return;
    AsyncStorage.getItem(`cst:questionnaireByTestId:${reportId}`)
      .then((s) => {
        if (!s) return;
        setQuestionnaire(JSON.parse(s));
      })
      .catch(() => { });
  }, [questionnaire, r?.type, reportId]);

  const questionnairePercent = useMemo(() => {
    const v = Number(r?.fullData?.questionnairePercent ?? questionnaire?.percent ?? combine?.questionnairePercent ?? combine?.finalPercent ?? 0);
    return Math.max(0, Math.min(100, Math.round(v)));
  }, [r?.fullData?.questionnairePercent, combine?.finalPercent, combine?.questionnairePercent, questionnaire?.percent]);

  const questionnaireType = useMemo(() => {
    const t = String(questionnaire?.finalType || questionnaire?.tipeUtama || '').trim();
    return t || '';
  }, [questionnaire?.finalType, questionnaire?.tipeUtama]);

  const cstDomain = useMemo(() => {
    const v = String(questionnaire?.tipeUtama || questionnaireType.split(' ')[0] || '').trim();
    return v || '';
  }, [questionnaire?.tipeUtama, questionnaireType]);

  const cstEiType = useMemo(() => {
    const v = String(questionnaire?.eiType || '').trim();
    return v;
  }, [questionnaire?.eiType]);

  const cstAge = useMemo(() => {
    const dob = String(questionnaire?.dob || r?.fullData?.birthdate || '').trim();
    if (!dob) return undefined;
    const parts = dob.includes('-') ? dob.split('-') : [];
    let date: Date | null = null;
    if (parts.length === 3 && parts[0].length === 2) {
      date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    } else {
      const d = new Date(dob);
      date = Number.isNaN(d.getTime()) ? null : d;
    }
    if (!date) return undefined;
    const now = new Date();
    let age = now.getFullYear() - date.getFullYear();
    const m = now.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < date.getDate())) age -= 1;
    return age;
  }, [questionnaire?.dob, r?.fullData?.birthdate]);

  const visualDimensions = useMemo(() => {
    const ds = questionnaire?.domainScores || {};
    const max = 30;
    const toPct = (v: any) => Math.max(0, Math.min(100, Math.round((Number(v || 0) / max) * 100)));
    const list: { label: string; percent: number; key: string }[] = [];
    if (typeof ds.Observer !== 'undefined') list.push({ key: 'Observer', label: 'Observation', percent: toPct(ds.Observer) });
    if (typeof ds.Navigator !== 'undefined') list.push({ key: 'Navigator', label: 'Action Thinking', percent: toPct(ds.Navigator) });
    if (typeof ds.Analyzer !== 'undefined') list.push({ key: 'Analyzer', label: 'Analytical', percent: toPct(ds.Analyzer) });
    if (typeof ds.Visionary !== 'undefined') list.push({ key: 'Visionary', label: 'Intuitive', percent: toPct(ds.Visionary) });
    if (typeof ds.Empath !== 'undefined') list.push({ key: 'Empath', label: 'Empathy', percent: toPct(ds.Empath) });
    if (typeof ds.Social !== 'undefined') list.push({ key: 'Social', label: 'Social', percent: toPct(ds.Social) });
    return list;
  }, [questionnaire?.domainScores]);

  const fallbackReport = useMemo(() => {
    const score = questionnairePercent;
    const domain = cstDomain || 'Cognitive Style';
    const ei = cstEiType;

    const base = domain.toLowerCase();
    const intro = ei === 'Introvert';
    const extro = ei === 'Ekstrovert';

    const summaryTraits = (() => {
      if (base === 'observer') return ['reflektif', 'observasional', 'memproses informasi secara mendalam', intro ? 'lebih nyaman berpikir sebelum berbicara' : 'cepat menangkap detail di lapangan'];
      if (base === 'analyzer') return ['logis', 'analitis', 'sistematis', intro ? 'mendalam dan terstruktur' : 'cepat dan objektif'];
      if (base === 'empath') return ['peka', 'hangat', 'berorientasi relasi', intro ? 'menjaga harmoni secara halus' : 'mudah membangun koneksi sosial'];
      if (base === 'visionary') return ['imajinatif', 'melihat peluang', 'berpikir masa depan', intro ? 'ide-ide filosofis dan personal' : 'antusias mengeksplorasi hal baru'];
      if (base === 'navigator') return ['tanggap', 'praktis', 'berani bertindak', 'nyaman di situasi dinamis'];
      return ['adaptif', 'memproses informasi sesuai konteks', 'punya preferensi tertentu dalam berpikir', 'bisa berkembang melalui latihan'];
    })();

    const strengths = (() => {
      if (base === 'observer') return ['kemampuan observasi tinggi', 'fokus pada detail', 'berpikir sebelum bertindak', 'konsentrasi kuat', 'lebih akurat saat punya waktu menganalisis'];
      if (base === 'analyzer') return ['analisis tajam', 'pengambilan keputusan berbasis data', 'membangun sistem yang rapi', 'konsisten pada standar', 'mampu memecah masalah kompleks'];
      if (base === 'empath') return ['membaca kebutuhan orang', 'menciptakan rasa aman', 'empati dan kepedulian', 'membangun kepercayaan', 'menjaga kerja tim tetap harmonis'];
      if (base === 'visionary') return ['ide kreatif', 'melihat gambaran besar', 'menghubungkan konsep berbeda', 'mencari peluang', 'berani mencoba pendekatan baru'];
      if (base === 'navigator') return ['cepat bertindak', 'sigap di situasi mendesak', 'adaptif di lapangan', 'tegas saat perlu', 'menggerakkan orang menuju aksi'];
      return ['mau belajar', 'mampu menyesuaikan diri', 'punya pola berpikir yang dapat dikembangkan', 'bisa membangun strategi yang lebih baik', 'berpotensi meningkatkan performa melalui kebiasaan'];
    })();

    const challenges = (() => {
      if (base === 'observer') return ['terlalu lama mempertimbangkan', 'cenderung overthinking', 'lebih lambat saat harus spontan', 'menahan ide terlalu lama sebelum dibagikan'];
      if (base === 'analyzer') return ['perfeksionis', 'terlalu kritis pada detail', 'sulit menerima ketidakpastian', 'terkesan dingin saat komunikasi'];
      if (base === 'empath') return ['mudah terbebani emosi orang lain', 'sulit berkata tidak', 'menghindari konflik', 'terlalu mempertimbangkan perasaan hingga menunda keputusan'];
      if (base === 'visionary') return ['mudah terdistraksi ide baru', 'kurang menuntaskan eksekusi', 'melompat terlalu cepat tanpa validasi', 'terasa kurang realistis bagi orang lain'];
      if (base === 'navigator') return ['terburu-buru', 'kurang sabar pada proses', 'kurang mempertimbangkan detail', 'rawan salah langkah jika data minim'];
      return ['membutuhkan struktur yang konsisten', 'perlu melatih komunikasi', 'membuat keputusan lebih jelas', 'meningkatkan disiplin eksekusi'];
    })();

    const decision = (() => {
      if (base === 'observer') return 'Anda cenderung mengamati situasi, mengumpulkan informasi, menganalisis secara internal, lalu menyampaikan keputusan ketika sudah yakin.';
      if (base === 'analyzer') return 'Anda mengambil keputusan melalui data, logika, dan struktur. Anda nyaman ketika parameter jelas dan bisa diukur.';
      if (base === 'empath') return 'Anda mempertimbangkan dampak keputusan pada orang lain, menjaga harmoni, dan memilih opsi yang paling manusiawi sekaligus realistis.';
      if (base === 'visionary') return 'Anda melihat pola besar dan kemungkinan masa depan, lalu memilih keputusan yang terasa paling menjanjikan dalam jangka panjang.';
      if (base === 'navigator') return 'Anda cenderung cepat memutuskan berdasarkan situasi saat ini, pengalaman, dan insting lapangan. Cocok untuk kondisi dinamis.';
      return 'Anda mengambil keputusan dengan kombinasi observasi, logika, intuisi, dan pertimbangan sosial sesuai konteks.';
    })();

    const learning = (() => {
      if (base === 'observer') return 'Belajar paling efektif melalui membaca, analisis, refleksi pribadi, dan eksplorasi mandiri di lingkungan yang tenang.';
      if (base === 'analyzer') return 'Belajar paling efektif melalui struktur: modul terurut, latihan bertahap, studi kasus, dan catatan yang rapi.';
      if (base === 'empath') return 'Belajar paling efektif melalui contoh nyata, diskusi terarah, mentoring, dan latihan yang relevan dengan interaksi manusia.';
      if (base === 'visionary') return 'Belajar paling efektif melalui eksplorasi konsep, proyek kreatif, koneksi lintas topik, dan ruang untuk bertanya “bagaimana jika”.';
      if (base === 'navigator') return 'Belajar paling efektif lewat praktik langsung, simulasi, tantangan, dan feedback cepat.';
      return 'Belajar paling efektif saat Anda menyesuaikan metode dengan tujuan dan lingkungan belajar yang mendukung.';
    })();

    const careers = (() => {
      if (base === 'observer') return ['research', 'data analyst', 'software engineering', 'UX research', 'writing'];
      if (base === 'analyzer') return ['data analyst', 'software engineering', 'quality assurance', 'finance', 'process improvement'];
      if (base === 'empath') return ['HR/People', 'customer success', 'counseling', 'teacher/mentor', 'community'];
      if (base === 'visionary') return ['product', 'strategy', 'design', 'entrepreneurship', 'creative tech'];
      if (base === 'navigator') return ['operations', 'sales field', 'project execution', 'incident response', 'event management'];
      return ['role yang sesuai minat', 'role yang mendukung pola kerja Anda', 'role dengan feedback yang sehat', 'role yang memberi ruang berkembang', 'role yang sejalan nilai pribadi'];
    })();

    const collab = (() => {
      if (base === 'observer') return ['beri waktu untuk berpikir', 'gunakan tulisan untuk menyampaikan ide', 'minta agenda/tujuan rapat yang jelas', 'komunikasikan keputusan setelah analisis'];
      if (base === 'analyzer') return ['sepakati definisi sukses dan metrik', 'pecah tugas jadi langkah kecil', 'jelaskan alasan logis di balik keputusan', 'hindari asumsi tanpa data'];
      if (base === 'empath') return ['bangun komunikasi yang hangat', 'validasi perasaan anggota tim', 'buat aturan diskusi yang aman', 'tetapkan batas agar tidak burnout'];
      if (base === 'visionary') return ['mulai dari visi dan tujuan besar', 'validasi ide lewat eksperimen kecil', 'pasangkan dengan eksekutor yang kuat', 'catat ide supaya tidak tercecer'];
      if (base === 'navigator') return ['buat rencana aksi singkat', 'tetapkan prioritas harian', 'minta data minimum sebelum bergerak', 'gunakan feedback cepat untuk koreksi'];
      return ['komunikasikan kebutuhan kerja Anda', 'sepakati ritme kerja tim', 'gunakan alat kolaborasi yang jelas', 'buat umpan balik rutin'];
    })();

    const conflict = (() => {
      if (base === 'observer') return ['benturan dengan tim yang serba cepat', 'disalahpahami sebagai pasif', 'friksi saat diskusi berjalan terlalu spontan'];
      if (base === 'analyzer') return ['friksi dengan gaya kerja yang tidak terstruktur', 'dipersepsikan terlalu kritis', 'konflik saat keputusan diambil tanpa data'];
      if (base === 'empath') return ['konflik saat harus tegas dan menolak', 'mudah terbawa emosi lingkungan', 'menghindari konflik hingga masalah menumpuk'];
      if (base === 'visionary') return ['konflik saat ide dianggap terlalu jauh', 'friksi dengan tim yang fokus detail semata', 'ketegangan jika eksekusi lambat'];
      if (base === 'navigator') return ['konflik jika dianggap terburu-buru', 'friksi dengan perfeksionis', 'ketegangan saat aturan terlalu ketat'];
      return ['konflik muncul jika kebutuhan komunikasi dan ritme kerja tidak selaras', 'perbedaan prioritas', 'ekspektasi yang tidak dibicarakan'];
    })();

    const selfDev = (() => {
      if (base === 'observer') return ['latih komunikasi ide lebih cepat', 'buat batas waktu untuk mengambil keputusan', 'latihan presentasi singkat', 'ikut diskusi kelompok secara terstruktur'];
      if (base === 'analyzer') return ['latih toleransi pada ketidakpastian', 'gunakan prinsip 80/20', 'fokus pada output bukan perfeksi', 'latih empati komunikasi'];
      if (base === 'empath') return ['latih batas sehat (saying no)', 'kelola energi emosional', 'belajar menyampaikan kebutuhan dengan tegas', 'latih pengambilan keputusan berbasis fakta'];
      if (base === 'visionary') return ['buat sistem eksekusi (kanban/checklist)', 'validasi ide lewat data', 'latih fokus dan prioritas', 'tuntaskan 1-2 proyek sebelum mulai yang baru'];
      if (base === 'navigator') return ['tunda 5 menit sebelum keputusan besar', 'cek detail minimum sebelum eksekusi', 'bangun kebiasaan review', 'latih komunikasi rencana agar tim selaras'];
      return ['tetapkan tujuan kecil mingguan', 'minta feedback berkala', 'latih komunikasi', 'bangun kebiasaan refleksi'];
    })();

    const summary = `Skor ${score}% menunjukkan kecenderungan kuat pada gaya ${domain}${ei ? ` (${ei})` : ''}. Anda cenderung ${summaryTraits.join(', ')}.`;

    return {
      profile_summary: summary,
      thinking_process: decision,
      cognitive_characteristics: summaryTraits,
      strengths,
      challenges,
      decision_making: decision,
      learning_style: learning,
      career_recommendations: careers,
      collaboration_tips: collab,
      conflict_potential: conflict,
      self_development_tips: selfDev,
      disclaimer: 'Hasil ini bersifat informatif untuk pengembangan diri dan bukan diagnosis klinis. Jika Anda membutuhkan bantuan profesional, pertimbangkan untuk berkonsultasi dengan psikolog.',
    };
  }, [cstDomain, cstEiType, questionnairePercent, questionnaireType]);

  const { data: aiReportRes } = useQuery({
    queryKey: ['cstAiReport', reportIdNum],
    queryFn: async () => (await getAiReport(reportIdNum)).data.data,
    enabled: r?.type === 'cst' && Number.isFinite(reportIdNum),
    refetchInterval: (q) => {
      const status = (q.state.data as any)?.status;
      return status === 'processing' ? 2000 : false;
    }
  });

  const { data: discAiReportRes } = useQuery({
    queryKey: ['discAiReport', reportIdNum],
    queryFn: async () => (await getDiscAiReport(reportIdNum)).data.data,
    enabled: r?.type === 'disc' && Number.isFinite(reportIdNum),
    refetchInterval: (q) => {
      const status = (q.state.data as any)?.status;
      return status === 'processing' ? 2000 : false;
    }
  });

  const effectiveAiReport = (aiReportRes as any)?.report || null;
  const effectiveReport = effectiveAiReport || fallbackReport;
  const aiStatus = (aiReportRes as any)?.status as string | undefined;

  const effectiveDiscAiReport = (discAiReportRes as any)?.report || null;
  const discAiStatus = (discAiReportRes as any)?.status as string | undefined;

  // Helper function to get full DISC type name
  const getDiscFullName = (code: string): string => {
    const typeMap: { [key: string]: string } = {
      'D': 'Dominance',
      'I': 'Influence',
      'S': 'Steadiness',
      'C': 'Compliance'
    };
    return typeMap[code] || code;
  };

  // Helper function to get DISC type description
  const getDiscDescription = (code: string): string => {
    const descMap: { [key: string]: string } = {
      'D': 'Direct, results-oriented, firm, strong-willed, forceful.',
      'I': 'Outgoing, enthusiastic, optimistic, high-spirited, lively.',
      'S': 'Even-tempered, accommodating, patient, humble, tactful.',
      'C': 'Analytical, reserved, precise, private, systematic.'
    };
    return descMap[code] || '';
  };

  const { data: userData } = useQuery({
    queryKey: ['me'],
    queryFn: async () => (await meApi()).data,
    enabled: false, // Lazy load manually if needed, or rely on cache
  });

  const shareType = (r?.type === 'disc' ? 'disc' : 'cst') as ShareTestType;
  const shareTheme = useMemo(() => {
    if (shareType === 'disc') return { a: '#0EA5E9', b: '#38BDF8' };
    return { a: '#4F46E5', b: '#818CF8' };
  }, [shareType]);

  const shareUserName = useMemo(() => {
    const fromParam = (r as any)?.fullname;
    const fromData = r?.fullData?.fullname;
    const fromMe = (userData as any)?.user?.fullname;
    return fromParam || fromData || fromMe || 'Pengguna';
  }, [r, userData]);

  const discCode = r?.fullData?.thinkingStyle?.code || r?.fullData?.dominantType || '';
  const sharePrimary = shareType === 'disc'
    ? (discCode || 'DISC')
    : (r?.fullData?.thinkingStyle?.code ? `${r.fullData.thinkingStyle.type} (${r.fullData.thinkingStyle.code})` : (r?.fullData?.thinkingStyle?.type || questionnaireType || 'Cognitive Style'));
  const shareSecondary = useMemo(() => {
    if (shareType === 'disc') {
      const fullName = getDiscFullName(discCode);
      return discCode ? `${discCode} (${fullName})` : '';
    }
    const suffix = (r?.fullData?.thinkingStyle?.type || questionnaireType) ? `Skor ${questionnairePercent}%` : '';
    return suffix || r?.summary || '';
  }, [discCode, questionnairePercent, questionnaireType, r?.summary, shareType]);

  const shareHighlights = useMemo(() => {
    if (shareType === 'disc') {
      const d = r?.fullData?.dScore;
      const i = r?.fullData?.iScore;
      const s = r?.fullData?.sScore;
      const c = r?.fullData?.cScore;
      return [
        typeof d === 'number' ? `D: ${d}` : '',
        typeof i === 'number' ? `I: ${i}` : '',
        typeof s === 'number' ? `S: ${s}` : '',
        typeof c === 'number' ? `C: ${c}` : '',
      ].filter(Boolean);
    }

    return [
      `Skor: ${questionnairePercent}%`,
      questionnaire?.tipeUtama ? `Domain Utama: ${questionnaire.tipeUtama}` : '',
      questionnaire?.eiType ? `E/I: ${questionnaire.eiType}` : '',
    ].filter(Boolean);
  }, [questionnaire?.eiType, questionnaire?.tipeUtama, questionnairePercent, r?.fullData?.cScore, r?.fullData?.dScore, r?.fullData?.iScore, r?.fullData?.sScore, shareType]);

  const shareDescription = useMemo(() => {
    if (shareType === 'disc') {
      return getDiscDescription(discCode);
    }
    return effectiveReport.profile_summary || '';
  }, [discCode, effectiveReport.profile_summary, shareType]);

  const shareCaption = useMemo(
    () =>
      buildShareCaption({
        type: shareType,
        userName: shareUserName,
        createdAtISO: r?.fullData?.createdAt || r?.fullData?.created_at || new Date().toISOString(),
        primary: sharePrimary,
        secondary: shareSecondary,
        highlights: shareHighlights,
        description: shareDescription,
      }),
    [r?.fullData?.createdAt, r?.fullData?.created_at, shareHighlights, sharePrimary, shareSecondary, shareType, shareUserName, shareDescription]
  );

  const dlCert = async () => {
    try {
      if (!r?.fullData) {
        Alert.alert('Gagal', 'Data laporan tidak lengkap');
        return;
      }

      setDownloading(true);

      const isDisc = r.type === 'disc';
      const courseName = isDisc ? 'DISC Personality Test' : 'Cognitive Style Test';

      // Try to get fullname from params/data first
      let studentName = route?.params?.memberName || (r as any).fullname || r.fullData.fullname;

      // If missing, check if it's "Student" or "Pengguna" or empty, and try to fetch current user
      if (!studentName || studentName === 'Student' || studentName === 'Pengguna') {
        try {
          // Use cached data if available or fetch fresh
          const meRes = await meApi();
          if (meRes.data?.user?.fullname) {
            studentName = meRes.data.user.fullname;
          }
        } catch (e) {
          console.log('Failed to fetch me fallback', e);
        }
      }

      // Fallback only if absolutely everything fails
      studentName = studentName || 'Student';

      const certId = `${isDisc ? 'DISC' : 'CST'}-${r.fullData.id}-${new Date().getFullYear()}`;

      // Get result title
      let resultTitle = '';
      if (isDisc) {
        const code = r.fullData.thinkingStyle?.code || '';
        const fullName = getDiscFullName(code);
        resultTitle = `${code} (${fullName})`;
      } else {
        resultTitle = r.fullData.thinkingStyle?.code 
          ? `${r.fullData.thinkingStyle.type} (${r.fullData.thinkingStyle.code})`
          : (questionnaireType || `${r.fullData.thinkingStyle?.type || ''}`);
      }

      // Format the date properly for the certificate
      const dateObj = new Date(r.fullData.createdAt || r.fullData.created_at);
      const formattedDate = isDisc ? '' : dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      if (isDisc) {
        await generateDISCCertificatePDF({
          studentName,
          completionDate: formattedDate,
          certificateId: certId,
          resultTitle: resultTitle,
          resultSubtitle: getDiscFullName(r.fullData.thinkingStyle?.code || r.fullData.dominantType || ''),
          score: '96%', // Can be dynamic if we have a way to measure
          code: r.fullData.thinkingStyle?.code || r.fullData.dominantType || 'D',
          summary: effectiveDiscAiReport?.profile_summary || '',
          commStyle: effectiveDiscAiReport?.communication_style || '',
          traits: effectiveDiscAiReport?.behavior_traits || [],
          strengths: effectiveDiscAiReport?.strengths || [],
          challenges: effectiveDiscAiReport?.challenges || [],
          workEnv: effectiveDiscAiReport?.work_environment || '',
          careers: effectiveDiscAiReport?.career_recommendations || [],
          collabTips: effectiveDiscAiReport?.collaboration_tips || [],
          conflictRisks: effectiveDiscAiReport?.conflict_risks || [],
          devTips: effectiveDiscAiReport?.dev_tips || []
        });
      } else {
        await generateCSTCertificatePDF({
          studentName,
          completionDate: formattedDate,
          certificateId: certId,
          resultTitle: r.fullData.thinkingStyle?.type || questionnaireType || 'Cognitive Style',
          resultSubtitle: r.fullData.thinkingStyle?.code || 'Analyzer-I',
          score: `${questionnairePercent}%`,
          summary: effectiveReport.profile_summary || '',
          brainProcess: effectiveReport.thinking_process || '',
          traits: effectiveReport.cognitive_characteristics || [],
          strengths: effectiveReport.strengths || [],
          challenges: effectiveReport.challenges || [],
          workEnv: effectiveReport.learning_style || '',
          careers: effectiveReport.career_recommendations || [],
          collabTips: effectiveReport.collaboration_tips || [],
          conflictRisks: effectiveReport.conflict_potential || [],
          devTips: effectiveReport.self_development_tips || []
        });
      }

    } catch (error: any) {
      Alert.alert('Gagal', error?.message || 'Gagal membuat sertifikat');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <LinearGradient
        colors={['#EEF2FF', '#F1F5F9', '#F8FAFC']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Pressable style={styles.backBtn} android_ripple={{ color: '#E2E8F0' }} onPress={() => (fromFingerprint ? navigation.replace('Dashboard') : navigation.goBack())}>
          <Ionicons name="chevron-back" size={22} color="#1E293B" />
        </Pressable>
        <Text style={styles.topTitle}>Detail Laporan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: insets.bottom + 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.detailCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <View style={styles.testIconWrap}>
              <MaterialCommunityIcons name="brain" size={28} color="#4F46E5" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{r?.title || 'Test Result'}</Text>
              {r?.type !== 'disc' && <Text style={styles.itemDate}>{r?.date || ''}</Text>}
            </View>
          </View>

          <View style={styles.divider} />

          {/* DISC Test Specific Display */}
          {r?.type === 'disc' && r?.fullData && (
            <>
              {/* DISC Detailed Scores */}
              <Text style={[styles.sectionHeader, { marginTop: 12, marginBottom: 16 }]}>Detailed Scores</Text>

              {/* Dominance */}
              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={styles.discScoreLabel}>Dominance (D)</Text>
                  <Text style={[styles.discScoreValue, { color: '#EF4444' }]}>{r.fullData.dScore || 0}</Text>
                </View>
                <View style={styles.scoreBarBg}>
                  <View style={[styles.scoreBar, { width: `${Math.min((r.fullData.dScore || 0) / 20 * 100, 100)}%`, backgroundColor: '#EF4444' }]} />
                </View>
              </View>

              {/* Influence */}
              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={styles.discScoreLabel}>Influence (I)</Text>
                  <Text style={[styles.discScoreValue, { color: '#3B82F6' }]}>{r.fullData.iScore || 0}</Text>
                </View>
                <View style={styles.scoreBarBg}>
                  <View style={[styles.scoreBar, { width: `${Math.min((r.fullData.iScore || 0) / 20 * 100, 100)}%`, backgroundColor: '#3B82F6' }]} />
                </View>
              </View>

              {/* Steadiness */}
              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={styles.discScoreLabel}>Steadiness (S)</Text>
                  <Text style={[styles.discScoreValue, { color: '#F59E0B' }]}>{r.fullData.sScore || 0}</Text>
                </View>
                <View style={styles.scoreBarBg}>
                  <View style={[styles.scoreBar, { width: `${Math.min((r.fullData.sScore || 0) / 20 * 100, 100)}%`, backgroundColor: '#F59E0B' }]} />
                </View>
              </View>

              {/* Compliance */}
              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={styles.discScoreLabel}>Compliance (C)</Text>
                  <Text style={[styles.discScoreValue, { color: '#10B981' }]}>{r.fullData.cScore || 0}</Text>
                </View>
                <View style={styles.scoreBarBg}>
                  <View style={[styles.scoreBar, { width: `${Math.min((r.fullData.cScore || 0) / 20 * 100, 100)}%`, backgroundColor: '#10B981' }]} />
                </View>
              </View>

              <Text style={[styles.sectionHeader, { marginTop: 28 }]}>
                Detail Laporan Assessment
              </Text>
              <View style={styles.enhancedCard}>
                <View style={styles.enhancedTop}>
                  <View style={styles.enhancedIcon}>
                    <Feather name="user" size={18} color="#7C3AED" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.enhancedTitle}>
                      {r.fullData.thinkingStyle?.code || r.fullData.dominantType || 'DISC'} ({getDiscFullName(r.fullData.thinkingStyle?.code || r.fullData.dominantType || 'DISC')})
                    </Text>
                    <Text style={styles.enhancedSubtitle}>
                      Ringkasan kepribadian dan dinamika kerja
                    </Text>
                  </View>
                </View>

                {effectiveDiscAiReport && (
                  <>
                    <View style={styles.block}>
                      <Text style={styles.blockTitle}>Ringkasan Profil</Text>
                      <Text style={styles.blockBody}>{effectiveDiscAiReport.profile_summary}</Text>
                    </View>

                    <View style={styles.block}>
                      <Text style={styles.blockTitle}>Gaya Komunikasi Utama</Text>
                      <Text style={styles.blockBody}>{effectiveDiscAiReport.communication_style}</Text>
                    </View>

                    {Array.isArray(effectiveDiscAiReport.behavior_traits) && effectiveDiscAiReport.behavior_traits.length ? (
                      <View style={styles.block}>
                        <Text style={styles.blockTitle}>Karakter Perilaku</Text>
                        <View style={{ gap: 8, marginTop: 10 }}>
                          {effectiveDiscAiReport.behavior_traits.map((it: string, idx: number) => (
                            <View key={`trait-${idx}`} style={styles.bulletRow}>
                              <View style={styles.bulletDot} />
                              <Text style={styles.bulletText}>{it}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : null}

                    {Array.isArray(effectiveDiscAiReport.strengths) && effectiveDiscAiReport.strengths.length ? (
                      <View style={styles.block}>
                        <Text style={styles.blockTitle}>Kekuatan Utama</Text>
                        <View style={{ gap: 8, marginTop: 10 }}>
                          {effectiveDiscAiReport.strengths.map((it: string, idx: number) => (
                            <View key={`str-${idx}`} style={styles.bulletRow}>
                              <Feather name="check" size={16} color="#10B981" />
                              <Text style={styles.bulletText}>{it}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : null}

                    {Array.isArray(effectiveDiscAiReport.challenges) && effectiveDiscAiReport.challenges.length ? (
                      <View style={styles.block}>
                        <Text style={styles.blockTitle}>Titik Buta (Blind Spots)</Text>
                        <View style={{ gap: 8, marginTop: 10 }}>
                          {effectiveDiscAiReport.challenges.map((it: string, idx: number) => (
                            <View key={`chal-${idx}`} style={styles.bulletRow}>
                              <Feather name="alert-triangle" size={16} color="#F59E0B" />
                              <Text style={styles.bulletText}>{it}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : null}

                    <View style={styles.block}>
                      <Text style={styles.blockTitle}>Lingkungan Kerja Ideal</Text>
                      <Text style={styles.blockBody}>{effectiveDiscAiReport.work_environment}</Text>
                    </View>

                    {Array.isArray(effectiveDiscAiReport.career_recommendations) && effectiveDiscAiReport.career_recommendations.length ? (
                      <View style={styles.block}>
                        <Text style={styles.blockTitle}>Rekomendasi Karir Digital</Text>
                        <View style={{ gap: 8, marginTop: 10 }}>
                          {effectiveDiscAiReport.career_recommendations.map((it: string, idx: number) => (
                            <View key={`car-${idx}`} style={styles.bulletRow}>
                              <MaterialCommunityIcons name="briefcase-outline" size={16} color="#4F46E5" />
                              <Text style={styles.bulletText}>{it}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : null}

                    {Array.isArray(effectiveDiscAiReport.collaboration_tips) && effectiveDiscAiReport.collaboration_tips.length ? (
                      <View style={styles.block}>
                        <Text style={styles.blockTitle}>Cara Efektif Berkolaborasi</Text>
                        <View style={{ gap: 8, marginTop: 10 }}>
                          {effectiveDiscAiReport.collaboration_tips.map((it: string, idx: number) => (
                            <View key={`col-${idx}`} style={styles.bulletRow}>
                              <Feather name="users" size={16} color="#0EA5E9" />
                              <Text style={styles.bulletText}>{it}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : null}

                    {Array.isArray(effectiveDiscAiReport.conflict_risks) && effectiveDiscAiReport.conflict_risks.length ? (
                      <View style={styles.block}>
                        <Text style={styles.blockTitle}>Potensi Konflik</Text>
                        <View style={{ gap: 8, marginTop: 10 }}>
                          {effectiveDiscAiReport.conflict_risks.map((it: string, idx: number) => (
                            <View key={`con-${idx}`} style={styles.bulletRow}>
                              <Feather name="zap" size={16} color="#EF4444" />
                              <Text style={styles.bulletText}>{it}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : null}

                    {Array.isArray(effectiveDiscAiReport.dev_tips) && effectiveDiscAiReport.dev_tips.length ? (
                      <View style={styles.block}>
                        <Text style={styles.blockTitle}>Tips Pengembangan Diri</Text>
                        <View style={{ gap: 8, marginTop: 10 }}>
                          {effectiveDiscAiReport.dev_tips.map((it: string, idx: number) => (
                            <View key={`dev-${idx}`} style={styles.bulletRow}>
                              <Feather name="trending-up" size={16} color="#10B981" />
                              <Text style={styles.bulletText}>{it}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : null}

                    <View style={styles.disclaimer}>
                      <Feather name="info" size={16} color="#64748B" />
                      <Text style={styles.disclaimerText}>
                        Hasil ini merupakan pemetaan kecenderungan perilaku dan gaya komunikasi berdasarkan metodologi DISC (Dominance, Influence, Steadiness, Compliance). Laporan ini dirancang untuk pemetaan bakat karir digital dan dinamika kolaborasi tim, bukan merupakan diagnosis psikologis klinis.
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </>
          )}

          {/* Thinking Style Type (for CST) */}
          {r?.type === 'cst' && (thinkingStyle?.type || questionnaireType) && (
            <>
              <Text style={styles.sectionHeader}>Tipe Gaya Berpikir</Text>
              <LinearGradient
                colors={['#4F46E5', '#4338CA']}
                style={styles.typeCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.typeText}>{thinkingStyle?.code ? `${thinkingStyle.type} (${thinkingStyle.code})` : (thinkingStyle?.type || questionnaireType)}</Text>
                <Text style={styles.codeText}>{`Skor ${questionnairePercent}%`}</Text>
              </LinearGradient>
            </>
          )}

          {/* Description (Only for non-DISC tests) */}
          {r?.type !== 'disc' && !questionnaireType && thinkingStyle?.description && (
            <>
              <Text style={[styles.sectionHeader, { marginTop: 28 }]}>Deskripsi</Text>
              <View style={styles.descCard}>
                <Text style={styles.descriptionText}>{thinkingStyle.description}</Text>
              </View>
            </>
          )}

          {/* Theory (Only for non-DISC tests) */}
          {r?.type !== 'disc' && !questionnaireType && thinkingStyle?.theory && (
            <>
              <Text style={[styles.sectionHeader, { marginTop: 28 }]}>Landasan Teori</Text>
              <View style={styles.theoryCard}>
                <Feather name="book-open" size={18} color="#64748B" style={{ marginBottom: 8 }} />
                <Text style={styles.theoryText}>{thinkingStyle.theory}</Text>
              </View>
            </>
          )}

          {/* Final Result (Only for non-DISC tests) */}
          {r?.type !== 'disc' && combine && (
            <>
              <Text style={[styles.sectionHeader, { marginTop: 28 }]}>Hasil Akhir</Text>
              <View style={styles.scoreCard}>
                <View style={{ marginTop: 4 }}>
                  <Text style={styles.finalTypeLabel}>Hasil Anda (dari kuesioner):</Text>
                  <Text style={styles.finalTypeValue}>{thinkingStyle?.code ? `${thinkingStyle.type} (${thinkingStyle.code})` : (questionnaireType || thinkingStyle?.type || '-')}</Text>
                  <View style={styles.consistencyBadge}>
                    <Feather name="check-circle" size={14} color="#10B981" />
                    <Text style={styles.consistencyText}>{`Skor ${questionnairePercent}%`}</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {r?.type === 'cst' ? (
            <>
              {visualDimensions.length ? (
                <>
                  <Text style={[styles.sectionHeader, { marginTop: 28 }]}>Visual Insight</Text>
                  <View style={styles.visualCard}>
                    <View style={styles.visualHeader}>
                      <View style={styles.visualIcon}>
                        <Feather name="bar-chart-2" size={18} color="#4F46E5" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.visualTitle}>Cognitive Style Dimensions</Text>
                        <Text style={styles.visualSubtitle}>Ringkasan kecenderungan dari kuesioner</Text>
                      </View>
                    </View>
                    <View style={{ gap: 12, marginTop: 12 }}>
                      {visualDimensions.map((d) => (
                        <View key={d.key}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                            <Text style={styles.visualLabel}>{d.label}</Text>
                            <Text style={styles.visualValue}>{d.percent}%</Text>
                          </View>
                          <View style={styles.visualBarBg}>
                            <View style={[styles.visualBarFill, { width: `${d.percent}%` }]} />
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                </>
              ) : null}

              <Text style={[styles.sectionHeader, { marginTop: 28 }]}>
                Detail Laporan Assessment
              </Text>
              <View style={styles.enhancedCard}>
                <View style={styles.enhancedTop}>
                  <View style={styles.enhancedIcon}>
                    <Feather name="star" size={18} color="#7C3AED" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.enhancedTitle}>
                      {thinkingStyle?.code ? `${thinkingStyle.type} (${thinkingStyle.code})` : (thinkingStyle?.type || questionnaireType || 'Cognitive Style')}
                    </Text>
                    <Text style={styles.enhancedSubtitle}>
                      {cstAge
                        ? `Dipersonalisasi dengan usia ${cstAge} tahun`
                        : 'Ringkasan psikologi kognitif untuk pengembangan diri'}
                    </Text>
                  </View>
                  <View style={styles.enhancedBadge}>
                    <Text style={styles.enhancedBadgeText}>{`${questionnairePercent}%`}</Text>
                  </View>
                </View>

                <View style={styles.block}>
                  <Text style={styles.blockTitle}>Ringkasan Profil</Text>
                  <Text style={styles.blockBody}>{effectiveReport.profile_summary}</Text>
                </View>

                <View style={styles.block}>
                  <Text style={styles.blockTitle}>Cara Otak Memproses Informasi</Text>
                  <Text style={styles.blockBody}>{effectiveReport.thinking_process}</Text>
                </View>

                {Array.isArray(effectiveReport.cognitive_characteristics) && effectiveReport.cognitive_characteristics.length ? (
                  <View style={styles.block}>
                    <Text style={styles.blockTitle}>Karakteristik Dominan</Text>
                    <View style={{ gap: 8, marginTop: 10 }}>
                      {effectiveReport.cognitive_characteristics.map((it: string, idx: number) => (
                        <View key={`${idx}-${it}`} style={styles.bulletRow}>
                          <View style={styles.bulletDot} />
                          <Text style={styles.bulletText}>{it}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}

                {Array.isArray(effectiveReport.strengths) && effectiveReport.strengths.length ? (
                  <View style={styles.block}>
                    <Text style={styles.blockTitle}>Kekuatan Utama</Text>
                    <View style={{ gap: 8, marginTop: 10 }}>
                      {effectiveReport.strengths.map((it: string, idx: number) => (
                        <View key={`${idx}-${it}`} style={styles.bulletRow}>
                          <Feather name="check" size={16} color="#10B981" />
                          <Text style={styles.bulletText}>{it}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}

                {Array.isArray(effectiveReport.challenges) && effectiveReport.challenges.length ? (
                  <View style={styles.block}>
                    <Text style={styles.blockTitle}>Titik Buta (Blind Spots)</Text>
                    <View style={{ gap: 8, marginTop: 10 }}>
                      {effectiveReport.challenges.map((it: string, idx: number) => (
                        <View key={`${idx}-${it}`} style={styles.bulletRow}>
                          <Feather name="alert-triangle" size={16} color="#F59E0B" />
                          <Text style={styles.bulletText}>{it}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}

                <View style={styles.block}>
                  <Text style={styles.blockTitle}>Lingkungan Belajar & Kerja Ideal</Text>
                  <Text style={styles.blockBody}>{effectiveReport.learning_style}</Text>
                </View>

                {Array.isArray(effectiveReport.career_recommendations) && effectiveReport.career_recommendations.length ? (
                  <View style={styles.block}>
                    <Text style={styles.blockTitle}>Rekomendasi Karir Digital</Text>
                    <View style={{ gap: 8, marginTop: 10 }}>
                      {effectiveReport.career_recommendations.map((it: string, idx: number) => (
                        <View key={`${idx}-${it}`} style={styles.bulletRow}>
                          <MaterialCommunityIcons name="briefcase-outline" size={16} color="#4F46E5" />
                          <Text style={styles.bulletText}>{it}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}

                {Array.isArray(effectiveReport.collaboration_tips) && effectiveReport.collaboration_tips.length ? (
                  <View style={styles.block}>
                    <Text style={styles.blockTitle}>Cara Efektif Berkolaborasi</Text>
                    <View style={{ gap: 8, marginTop: 10 }}>
                      {effectiveReport.collaboration_tips.map((it: string, idx: number) => (
                        <View key={`${idx}-${it}`} style={styles.bulletRow}>
                          <Feather name="users" size={16} color="#0EA5E9" />
                          <Text style={styles.bulletText}>{it}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}

                {Array.isArray(effectiveReport.conflict_potential) && effectiveReport.conflict_potential.length ? (
                  <View style={styles.block}>
                    <Text style={styles.blockTitle}>Potensi Friksi / Konflik</Text>
                    <View style={{ gap: 8, marginTop: 10 }}>
                      {effectiveReport.conflict_potential.map((it: string, idx: number) => (
                        <View key={`${idx}-${it}`} style={styles.bulletRow}>
                          <Feather name="zap" size={16} color="#EF4444" />
                          <Text style={styles.bulletText}>{it}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}

                {Array.isArray(effectiveReport.self_development_tips) && effectiveReport.self_development_tips.length ? (
                  <View style={styles.block}>
                    <Text style={styles.blockTitle}>Tips Pengembangan Diri</Text>
                    <View style={{ gap: 8, marginTop: 10 }}>
                      {effectiveReport.self_development_tips.map((it: string, idx: number) => (
                        <View key={`${idx}-${it}`} style={styles.bulletRow}>
                          <Feather name="trending-up" size={16} color="#10B981" />
                          <Text style={styles.bulletText}>{it}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}

                {effectiveReport.disclaimer ? (
                  <View style={styles.disclaimer}>
                    <Feather name="info" size={16} color="#64748B" />
                    <Text style={styles.disclaimerText}>{effectiveReport.disclaimer}</Text>
                  </View>
                ) : null}
              </View>
            </>
          ) : null}

          <PrimaryButton
            title="Bagikan Hasil"
            leftIcon={<Feather name="share-2" size={18} color="#0F172A" />}
            onPress={() => setShareOpen(true)}
            style={{ marginTop: 14 }}
            variant="secondary"
          />

          <PrimaryButton
            title="Download Sertifikat"
            leftIcon={<Feather name="download" size={18} color="#FFFFFF" />}
            onPress={dlCert}
            style={styles.downloadBtn}
            loading={downloading}
          />
        </Card>
      </ScrollView >
      <ShareResultModal
        visible={shareOpen}
        onClose={() => setShareOpen(false)}
        title={shareType === 'disc' ? 'DISC Personality' : 'Cognitive Style'}
        subtitle={shareType === 'disc' ? 'Profil Kepribadian' : 'Analisis Pola Pikir'}
        primary={sharePrimary}
        secondary={shareSecondary}
        theme={shareTheme}
        caption={shareCaption}
        onSharePoster={() =>
          shareResultPosterPDF({
            type: shareType,
            userName: shareUserName,
            createdAtISO: r?.fullData?.createdAt || r?.fullData?.created_at || new Date().toISOString(),
            primary: sharePrimary,
            secondary: shareSecondary,
            highlights: shareHighlights,
            description: shareDescription,
          })
        }
        onShareText={() =>
          shareResultText({
            type: shareType,
            userName: shareUserName,
            createdAtISO: r?.fullData?.createdAt || r?.fullData?.created_at || new Date().toISOString(),
            primary: sharePrimary,
            secondary: shareSecondary,
            highlights: shareHighlights,
            description: shareDescription,
          })
        }
      />
    </View >
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: 'transparent'
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2
  },
  topTitle: { color: '#1E293B', fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  detailCard: {
    padding: 28,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6
  },
  visualCard: {
    marginTop: 10,
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  visualHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  visualIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  visualTitle: { fontSize: 15, fontWeight: '900', color: '#0F172A' },
  visualSubtitle: { fontSize: 12, fontWeight: '700', color: '#64748B', marginTop: 2 },
  visualLabel: { fontSize: 13, fontWeight: '800', color: '#334155' },
  visualValue: { fontSize: 13, fontWeight: '900', color: '#4F46E5' },
  visualBarBg: { height: 10, borderRadius: 999, backgroundColor: '#EEF2FF', overflow: 'hidden' },
  visualBarFill: { height: '100%', borderRadius: 999, backgroundColor: '#4F46E5' },

  enhancedCard: {
    marginTop: 10,
    borderRadius: 22,
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  enhancedTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  enhancedIcon: { width: 36, height: 36, borderRadius: 14, backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center' },
  enhancedTitle: { fontSize: 16, fontWeight: '900', color: '#0F172A' },
  enhancedSubtitle: { fontSize: 12, fontWeight: '700', color: '#64748B', marginTop: 4 },
  enhancedBadge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#E0E7FF' },
  enhancedBadgeText: { fontSize: 12, fontWeight: '900', color: '#4F46E5' },

  block: { marginTop: 14 },
  blockTitle: { fontSize: 14, fontWeight: '900', color: '#0F172A' },
  blockBody: { marginTop: 8, fontSize: 13, lineHeight: 20, color: '#334155', fontWeight: '600' },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bulletDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4F46E5', marginTop: 6 },
  bulletText: { flex: 1, fontSize: 13, lineHeight: 20, color: '#334155', fontWeight: '600' },
  disclaimer: { marginTop: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12, borderRadius: 16, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  disclaimerText: { flex: 1, fontSize: 12, lineHeight: 18, color: '#475569', fontWeight: '600' },
  testIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#E0E7FF'
  },
  itemTitle: { color: '#1E293B', fontWeight: '700', fontSize: 20 },
  itemDate: { color: '#64748B', fontSize: 14, marginTop: 4, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 24 },
  sectionHeader: { color: '#1E293B', fontWeight: '700', fontSize: 17, marginBottom: 12 },
  itemSubtitle: { color: '#64748B', fontSize: 15, lineHeight: 24 },
  typeCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center'
  },
  codeText: {
    color: '#E0E7FF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 6
  },
  descCard: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  descriptionText: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 26,
    textAlign: 'justify'
  },
  theoryCard: {
    backgroundColor: '#FFFBEB',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7'
  },
  theoryText: {
    color: '#78350F',
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'justify',
    fontStyle: 'italic'
  },
  scoreCard: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  scoreLabel: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500'
  },
  finalTypeLabel: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8
  },
  finalTypeValue: {
    color: '#4F46E5',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12
  },
  consistencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#D1FAE5'
  },
  consistencyText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600'
  },
  combinedNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  combinedNoteText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500'
  },
  metric: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  metricLabel: { color: '#64748B', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  metricValue: { color: '#4F46E5', fontWeight: '800', fontSize: 20, marginTop: 8 },
  summaryCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    gap: 4
  },
  downloadBtn: {
    marginTop: 32,
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    height: 52,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4
  },
  // DISC Test Styles
  discSectionLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 16,
    textTransform: 'uppercase'
  },
  discCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#22D3EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#22D3EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6
  },
  discCircleText: {
    fontSize: 56,
    fontWeight: '800',
    color: '#22D3EE'
  },
  discTypeName: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 24
  },
  discScoreLabel: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '600'
  },
  discScoreValue: {
    fontSize: 16,
    fontWeight: '800'
  },
  scoreBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden'
  },
  scoreBar: {
    height: '100%',
    borderRadius: 4
  },
});
