import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useMemberReports } from '@/hooks/useMemberReports';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, Brain, Search, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ErrorFetch from '../ui/Error';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  memberId: number | null;
}

export default function MemberTestHistoryModal({ isOpen, onClose, memberId }: Props) {
  const { data: reports, isLoading, error } = useMemberReports();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const memberReport = reports?.find((r: any) => r.member.id === memberId);
  const tests = memberReport?.tests || [];
  const memberName = memberReport?.member?.fullname || 'Member';

  const handleViewDetail = (test: any) => {
    onClose();
    if (test.testType === 'Graphology') {
      navigate(`/customer/dashboard/graphology-result/${test.id}`);
    } else if (test.testType === 'DISC') {
      const raw = test.rawResult;
      navigate('/customer/dashboard/disc-result', {
        state: {
          result: {
            id: raw.id,
            dScore: raw.d_score,
            iScore: raw.i_score,
            sScore: raw.s_score,
            cScore: raw.c_score,
            dominantType: raw.dominant_type
          }
        }
      });
    } else if (test.testType === 'CST') {
      navigate('/customer/dashboard/test/result', {
        state: {
          testResult: {
            ...test.rawResult,
            fullname: memberName
          }
        }
      });
    }
  };

  const getDiscTypeName = (code: string) => {
    const typeMap: { [key: string]: string } = {
      'D': 'D - Dominance',
      'I': 'I - Influence',
      'S': 'S - Steadiness',
      'C': 'C - Compliance'
    };
    return typeMap[code] || code;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-gray-50/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="text-blue-600" /> Riwayat Test
          </DialogTitle>
          <DialogDescription>
            Menampilkan riwayat test untuk {memberName}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-1 py-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <ErrorFetch error={error as any} />
          ) : tests.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Belum ada riwayat test</p>
              <p className="text-sm text-gray-400">Member ini belum menyelesaikan test apapun.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tests.map((test: any, idx: number) => {
                const dateStr = new Date(test.date).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric'
                });
                
                const typeText = test.testType === 'DISC' 
                  ? getDiscTypeName(test.result?.type || test.rawResult?.dominant_type || '')
                  : test.testType === 'Graphology'
                    ? test.result?.type
                    : `${test.result?.type} (${test.result?.code})`;

                return (
                  <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex gap-4 items-start">
                      <div className={`p-3 rounded-xl ${test.testType === 'DISC' ? 'bg-orange-100 text-orange-600' : test.testType === 'Graphology' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                        <Brain className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg">
                          {test.testType === 'DISC' ? 'DISC Personality Test' : test.testType === 'Graphology' ? 'Graphology Test' : 'Cognitive Style Test'}
                        </h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {dateStr}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Selesai</span>
                        </div>
                        <p className="mt-2 text-indigo-600 font-medium bg-indigo-50 inline-block px-3 py-1 rounded-full text-sm">
                          Hasil: {typeText}
                        </p>
                      </div>
                    </div>
                    <Button onClick={() => handleViewDetail(test)} variant="outline" className="shrink-0 w-full md:w-auto hover:bg-blue-50 hover:text-blue-700">
                      Lihat Detail
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
