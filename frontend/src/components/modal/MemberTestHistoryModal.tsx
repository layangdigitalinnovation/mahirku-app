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
      navigate(`/customer/dashboard/graphology-result/${test.id}`, {
        state: { fullname: memberName }
      });
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
            dominantType: raw.dominant_type,
            fullname: memberName
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
      <DialogContent className="max-w-2xl bg-white border-0 shadow-2xl p-0 overflow-hidden sm:rounded-2xl">
        <DialogHeader className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <FileText className="text-blue-600" /> Riwayat Test
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Menampilkan riwayat test untuk <span className="font-semibold text-gray-700">{memberName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-50 [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <ErrorFetch error={error as any} />
          ) : tests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-700 font-semibold text-lg">Belum ada riwayat test</p>
              <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">Member ini belum menyelesaikan test apapun.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tests.map((test: any, idx: number) => {
                const dateObj = test.date || test.createdAt || test.rawResult?.createdAt;
                const isValidDate = dateObj && !isNaN(new Date(dateObj).getTime());
                const dateStr = isValidDate ? new Date(dateObj).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric'
                }) : '-';
                
                const typeText = test.testType === 'DISC' 
                  ? getDiscTypeName(test.result?.type || test.rawResult?.dominant_type || '')
                  : test.testType === 'Graphology'
                    ? test.result?.type
                    : `${test.result?.type} (${test.result?.code})`;

                const isDisc = test.testType === 'DISC';
                const isGraphology = test.testType === 'Graphology';
                
                const themeColor = isDisc ? 'orange' : isGraphology ? 'purple' : 'blue';
                const bgColors: Record<string, string> = {
                  orange: 'bg-orange-50 hover:border-orange-200 border-orange-100',
                  purple: 'bg-purple-50 hover:border-purple-200 border-purple-100',
                  blue: 'bg-blue-50 hover:border-blue-200 border-blue-100'
                };
                const iconBgColors: Record<string, string> = {
                  orange: 'bg-orange-100 text-orange-600',
                  purple: 'bg-purple-100 text-purple-600',
                  blue: 'bg-blue-100 text-blue-600'
                };
                const badgeBgColors: Record<string, string> = {
                  orange: 'bg-orange-100 text-orange-700',
                  purple: 'bg-purple-100 text-purple-700',
                  blue: 'bg-blue-100 text-blue-700'
                };

                return (
                  <div key={idx} className={`rounded-2xl transition-all duration-200 border ${bgColors[themeColor]} p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 group`}>
                    <div className="flex gap-4 items-start flex-1">
                      <div className={`p-3.5 rounded-2xl ${iconBgColors[themeColor]} shadow-sm`}>
                        <Brain className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 text-lg group-hover:text-gray-900 transition-colors">
                          {isDisc ? 'DISC Personality Test' : isGraphology ? 'Graphology Test' : 'Cognitive Style Test'}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md shadow-sm border border-gray-100">
                            <Calendar className="w-3.5 h-3.5" /> {dateStr}
                          </span>
                          <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-md shadow-sm border border-green-100 font-medium">
                            <Clock className="w-3.5 h-3.5" /> Selesai
                          </span>
                        </div>
                        <div className="mt-3">
                          <span className={`inline-flex font-medium px-3 py-1.5 rounded-lg text-sm ${badgeBgColors[themeColor]}`}>
                            <span className="opacity-75 mr-1">Hasil:</span> {typeText}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleViewDetail(test)} 
                      className="shrink-0 w-full md:w-auto shadow-sm"
                      variant="default"
                    >
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
