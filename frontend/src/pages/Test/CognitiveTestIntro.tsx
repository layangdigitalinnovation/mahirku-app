import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSubmitTest } from '@/hooks/useThinkingStyleTest';
import { useMeQuery } from '@/hooks/useAuthQuery';
import { ArrowRight, Activity, AlertCircle } from 'lucide-react';

export const CognitiveTestIntro: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as any;
  const dob = state?.dob;
  const questionnaire = state?.questionnaire;
  const fromQuestionnaire = state?.fromQuestionnaire;

  const { data: userData } = useMeQuery();
  const userFullname = userData?.user?.fullname || 'Pengguna';
  
  const { mutateAsync: submitTest, isPending } = useSubmitTest();
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const resultPrimary = useMemo(() => {
    const t = String(questionnaire?.finalType || questionnaire?.tipeUtama || '').trim();
    return t || 'Cognitive Style';
  }, [questionnaire]);

  const questionnairePercent = useMemo(() => {
    const n = Number(questionnaire?.percent ?? 0);
    return Math.max(0, Math.min(100, Math.round(n)));
  }, [questionnaire]);

  const handleSubmit = async () => {
    if (!dob || !questionnaire) {
      alert('Data Tidak Lengkap. Silakan ulangi dari awal.');
      return;
    }

    let formattedDate = dob;
    const dobParts = dob.split('-');
    if (dobParts.length === 3 && dobParts[0].length !== 4) {
      formattedDate = `${dobParts[2]}-${dobParts[1]}-${dobParts[0]}`;
    }

    try {
      const response = await submitTest({
        fullname: userFullname,
        birthdate: formattedDate,
        questionnaire,
      });

      const testResult = response?.data;
      if (!testResult) throw new Error("Invalid response");

      navigate('/customer/dashboard/test/result', {
        state: {
          testResult: testResult,
          fromFingerprint: true,
        }
      });
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 403) {
        if (window.confirm('Token Anda tidak mencukupi untuk melakukan tes. Beli token sekarang?')) {
          navigate('/customer/dashboard/test');
        }
      } else {
        alert(error?.response?.data?.message || 'Terjadi kesalahan saat submit tes.');
      }
    }
  };

  useEffect(() => {
    if (!fromQuestionnaire || !dob || !questionnaire || autoSubmitted) return;
    setAutoSubmitted(true);
    handleSubmit();
  }, [fromQuestionnaire, dob, questionnaire, autoSubmitted]);

  if (!fromQuestionnaire) {
    navigate('/customer/dashboard/cognitive-data-entry');
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <div className="flex flex-col items-center mb-8 pt-8">
          <div className="p-6 bg-linear-to-br from-indigo-500 to-indigo-600 rounded-3xl shadow-lg mb-6 transform -rotate-6">
            <Activity className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Cognitive Style Test</h1>
          <p className="text-gray-500 text-center max-w-sm">
            Hasil tes dihitung dari kuesioner yang Anda isi.
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2 border-b border-gray-100">
            <CardTitle className="text-lg">Data Diri</CardTitle>
            <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">Wajib</span>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <AlertCircle className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">Tanggal Lahir: <span className="font-bold text-gray-900">{dob}</span></p>
                <p className="text-sm font-medium text-gray-700">Hasil Kuesioner: <span className="font-bold text-gray-900">{resultPrimary}</span></p>
                <p className="text-sm font-medium text-gray-700">Skor: <span className="font-bold text-gray-900">{questionnairePercent}%</span></p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          onClick={handleSubmit} 
          disabled={isPending || !questionnaire}
          className="w-full h-14 text-lg gap-2 shadow-lg"
        >
          {isPending ? 'Memproses...' : 'Kirim & Lihat Hasil'} {!isPending && <ArrowRight className="h-5 w-5" />}
        </Button>

      </div>
    </div>
  );
};
