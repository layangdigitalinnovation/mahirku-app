import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Calendar, History, Plus, Eye } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTestResults();
    }
  }, [user]);

  const fetchTestResults = async () => {
    if (!user) return;
    
    try {
      // Get test results from localStorage (mock database)
      const allResults = JSON.parse(localStorage.getItem('neuroscan-test-results') || '[]');
      const userResults = allResults.filter((result: any) => result.userId === user.uid);
      
      // Sort by timestamp (newest first)
      userResults.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setTestResults(userResults);
    } catch (error) {
      console.error('Error fetching test results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
          <p className="text-gray-600">Track your cognitive assessments and insights</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Brain className="h-10 w-10 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Tests</p>
                  <p className="text-2xl font-bold text-gray-900">{testResults.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-10 w-10 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Last Test</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {testResults.length > 0 
                      ? new Date(testResults[0].timestamp).toLocaleDateString()
                      : 'None'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <History className="h-10 w-10 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Most Recent Style</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {testResults.length > 0 ? testResults[0].cognitiveStyle : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mb-8">
          <Link to="/test">
            <Button size="lg" icon={Plus}>
              Take New Test
            </Button>
          </Link>
        </div>

        {/* Test History */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Test History</h2>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tests yet</h3>
                <p className="text-gray-600 mb-4">Take your first cognitive style assessment</p>
                <Link to="/test">
                  <Button icon={Plus}>Take Your First Test</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {testResults.map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Brain className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{result.cognitiveStyle}</p>
                        <p className="text-sm text-gray-600">
                          Tested on {new Date(result.timestamp).toLocaleDateString()} • 
                          Birth Date: {result.birthDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {result.fingerprintId && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Verified
                        </span>
                      )}
                      <Button variant="ghost" size="sm" icon={Eye}>
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};