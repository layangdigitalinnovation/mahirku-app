import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ArrowRight, ClipboardList, User } from 'lucide-react';

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

const QUESTIONS_EARLY_CHILDHOOD: Question[] = [
  { id: 1, text: 'Anak memperhatikan detail saat bermain atau belajar.' },
  { id: 2, text: 'Anak memperhatikan perubahan kecil di sekitarnya.' },
  { id: 3, text: 'Anak mengamati sebelum bertindak.' },
  { id: 4, text: 'Anak memperhatikan ekspresi orang lain.' },
  { id: 5, text: 'Anak suka mengamati teman sebelum ikut bermain.' },
  { id: 6, text: 'Anak mengingat detail kejadian.' },
  { id: 7, text: 'Anak berpikir sebelum menjawab pertanyaan.' },
  { id: 8, text: 'Anak bertanya untuk memahami sesuatu.' },
  { id: 9, text: 'Anak menyusun mainan secara teratur.' },
  { id: 10, text: 'Anak mengikuti aturan permainan.' },
  { id: 11, text: 'Anak mencoba memecahkan masalah sendiri.' },
  { id: 12, text: 'Anak menyukai aktivitas logika sederhana.' },
  { id: 13, text: 'Anak peduli perasaan teman.' },
  { id: 14, text: 'Anak membantu teman yang kesulitan.' },
  { id: 15, text: 'Anak menunjukkan rasa sayang.' },
  { id: 16, text: 'Anak merasa sedih saat temannya sedih.' },
  { id: 17, text: 'Anak mudah memaafkan.' },
  { id: 18, text: 'Anak suka berbagi.' },
  { id: 19, text: 'Anak memiliki ide bermain sendiri.' },
  { id: 20, text: 'Anak suka berimajinasi.' },
  { id: 21, text: 'Anak membuat cerita sendiri.' },
  { id: 22, text: 'Anak mencoba cara baru.' },
  { id: 23, text: 'Anak tertarik hal baru.' },
  { id: 24, text: 'Anak kreatif dalam bermain.' },
  { id: 25, text: 'Anak cepat bereaksi.' },
  { id: 26, text: 'Anak berani mencoba.' },
  { id: 27, text: 'Anak tidak mudah takut.' },
  { id: 28, text: 'Anak sigap membantu.' },
  { id: 29, text: 'Anak aktif bergerak.' },
  { id: 30, text: 'Anak tanggap situasi.' },
  { id: 31, text: 'Anak senang bermain dengan banyak teman.' },
  { id: 32, text: 'Anak nyaman tampil di depan.' },
  { id: 33, text: 'Anak mudah beradaptasi.' },
  { id: 34, text: 'Anak suka berbicara.' },
  { id: 35, text: 'Anak percaya diri.' },
  { id: 36, text: 'Anak aktif dalam kelompok.' },
];

const calculateAge = (dobString: string): number => {
  const parts = dobString.split('-');
  if (parts.length !== 3) return 99;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
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

const isEarlyChildhood = (dobString: string): boolean => {
  const age = calculateAge(dobString);
  return age >= 0 && age <= 6;
};

export const CognitiveQuestionnaire: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dob = location.state?.dob as string | undefined;

  useEffect(() => {
    if (!dob) {
      navigate('/customer/dashboard/cognitive-data-entry');
    }
  }, [dob, navigate]);

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

  const eiType = useMemo(() => {
    if (isChildQuestionnaire) return '';
    return eScore > iScore ? 'Ekstrovert' : 'Introvert';
  }, [eScore, iScore, isChildQuestionnaire]);

  const finalType = useMemo(() => {
    if (isChildQuestionnaire) return tipeUtama;
    return tipeUtama === 'Navigator' ? 'Navigator' : `${tipeUtama} ${eiType}`;
  }, [tipeUtama, eiType, isChildQuestionnaire]);
  
  const questionnairePercent = useMemo(() => Math.round((answers.reduce((a, b) => a + b, 0) / (36 * 5)) * 100), [answers]);

  const proceed = async () => {
    if (!dob) return;
    if (answers.includes(0)) {
      alert('Mohon isi semua pertanyaan kuesioner sebelum melanjutkan.');
      return;
    }
    const payload = {
      savedAt: new Date().toISOString(),
      dob,
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
      localStorage.setItem('cst:lastQuestionnaire', JSON.stringify(payload));
    } catch { }
    
    navigate('/customer/dashboard/cognitive-test-intro', {
      state: {
        fromQuestionnaire: true,
        dob,
        questionnaire: payload,
      }
    });
  };

  if (!dob) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8 pb-32">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isChildQuestionnaire ? 'Kuesioner Cognitive Style Anak Usia Dini' : 'Kuesioner Cognitive Style'}
            </h1>
            <p className="text-sm text-gray-500">
              {isChildQuestionnaire 
                ? 'Kuesioner diisi oleh guru/orang tua berdasarkan pengamatan terhadap anak.' 
                : 'Isi kuesioner untuk mengetahui gaya berpikir Anda.'}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Data Diri</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-600">Tanggal Lahir: <span className="font-semibold">{dob}</span></p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <ClipboardList className="h-5 w-5 text-indigo-600" />
              </div>
              <CardTitle className="text-lg">Pertanyaan</CardTitle>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {isChildQuestionnaire
                ? 'Skala 1–5 (1 = Sangat Tidak Sesuai, 5 = Sangat Sesuai)'
                : 'Skala Likert 1–5 (1 = Sangat Tidak Setuju, 5 = Sangat Setuju)'}
            </p>
          </CardHeader>
          <CardContent className="pt-4 space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                <p className="text-sm font-medium text-gray-800 mb-3 leading-relaxed">
                  {q.id}. {q.text}
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(v => (
                    <button
                      key={v}
                      onClick={() => setAnswer(idx, v)}
                      className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg border font-semibold transition-all duration-200 
                        ${answers[idx] === v 
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                          : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-300 hover:bg-indigo-50/50'}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button onClick={proceed} className="w-full h-12 text-lg gap-2 shadow-md">
          Simpan & Lihat Hasil <ArrowRight className="h-5 w-5" />
        </Button>

      </div>
    </div>
  );
};
