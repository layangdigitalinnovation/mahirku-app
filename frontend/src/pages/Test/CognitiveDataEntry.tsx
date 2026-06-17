import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ArrowRight, User } from 'lucide-react';

export const CognitiveDataEntry: React.FC = () => {
  const navigate = useNavigate();
  const [dob, setDob] = useState('');

  const handleNext = () => {
    if (!dob) {
      alert('Mohon isi Tanggal Lahir Anda.');
      return;
    }
    
    // Format: YYYY-MM-DD from type="date" input to DD-MM-YYYY
    let formattedDob = dob;
    if (dob.includes('-')) {
      const parts = dob.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        formattedDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    const fnv1a = (str: string) => {
      let h = 0x811c9dc5;
      for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
      }
      return ('0000000' + h.toString(16)).slice(-8);
    };

    const normalizedDob = formattedDob.trim();
    const firstDobHash = localStorage.getItem('cst:firstDobHash');
    if (firstDobHash) {
      const currentDobHash = fnv1a(normalizedDob);
      if (firstDobHash !== currentDobHash) {
        alert('Tanggal lahir tidak sesuai dengan data pertama Anda. Gunakan data asli untuk melanjutkan.');
        return;
      }
    }

    navigate('/customer/dashboard/cognitive-questionnaire', { state: { dob: formattedDob } });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Diri</h1>
            <p className="text-sm text-gray-500">Isi data Anda untuk memulai kuesioner Cognitive Style.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle>Informasi Wajib</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="dob">Tanggal Lahir</Label>
              <Input 
                id="dob" 
                type="date" 
                value={dob} 
                onChange={(e) => setDob(e.target.value)} 
                max={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-gray-500">Tanggal lahir digunakan untuk menentukan jenis kuesioner yang ditampilkan (Dewasa atau Anak).</p>
            </div>

            <Button onClick={handleNext} className="w-full gap-2">
              Lanjutkan <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};
