import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Eye, 

} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { useMeQuery } from '@/hooks/useAuthQuery';
import { DashboardQuickActions } from '@/components/ui/DashboardQuickAction';
import { useGetAllTest } from '@/hooks/useThinkingStyleTest';
import ErrorFetch from '@/components/ui/Error';


interface TestResult {
   id: number;
  userId: number;
  fullname: string;
  birthdate: string;
  resultDigit: number;
  resultType: string;
  resultCode: string;
  description: string;
  theory: string;
  fingerprintId: string;
  referrerId: number | null;
  createdAt: string;
  updatedAt: string;
}


export const UserDashboard: React.FC = () => {
  const { data } = useMeQuery();
  const { user } = data || {};
  const [searchQuery, setSearchQuery] = useState('');

  const { data: numerologyResults, isLoading, isError  } = useGetAllTest()




  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <p>Loading...</p>
      </div>
    );
  }

  if(isError){
    return <ErrorFetch/>
  }

    const filteredResults = numerologyResults.filter((result : TestResult) => 
    result.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    result.birthdate.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-24 pb-12">
      <div className="container max-w-scren-lg mx-auto px-4">
        <DashboardQuickActions results={numerologyResults} user={user}/>
        <Card className='bg-white'>
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <h2 className="font-heading text-xl font-semibold flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary-600" />
                Riwayat Test
              </h2>
              <input
                type="text"
                placeholder="Cari nama atau tanggal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredResults.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500">Belum ada hasil analisis</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredResults.map((result : TestResult) => {
                  const birthDate = new Date(result.birthdate);
                  const createdAt = new Date(result.createdAt);

                  return (
                    <div key={result.id} className="p-6 rounded hover:bg-gray-50 transition">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="font-heading text-lg font-semibold text-gray-900">
                            {result.fullname}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Lahir: {birthDate.toLocaleDateString("id-ID")}
                          </p>
                          <p className="text-sm text-gray-600">
                            Analisis: {createdAt.toLocaleDateString("id-ID")}
                          </p>

                          <div className="mt-3">
                            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                              {result.resultType}
                            </span>
                            <p className="mt-2 text-gray-700 text-sm">{result.description}</p>
                            <p className="mt-1 text-gray-500 text-xs italic">Teori: {result.theory}</p>
                          </div>
                        </div>

                        <Link to={`/numerology/detail/${result.id}`} className="mt-4 md:mt-0">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Detail
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};