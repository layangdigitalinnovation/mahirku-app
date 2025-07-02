import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Fingerprint, Brain, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { calculateNumerology, getCognitiveStyle } from '../../utils/cognitiveStyles';
import { scanFingerprint } from '../../utils/fingerprint';
import { getReferralId } from '../../utils/referral';

// Mock storage for test results
const mockTestResults: any[] = JSON.parse(localStorage.getItem('neuroscan-test-results') || '[]');

export const CognitiveTest: React.FC = () => {
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'birthdate' | 'fingerprint' | 'processing'>('birthdate');
  const [testResult, setTestResult] = useState<any>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBirthDateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate) return;

    setLoading(true);
    
    // Calculate numerology and cognitive style
    const numerologyResult = calculateNumerology(birthDate);
    const cognitiveStyle = getCognitiveStyle(numerologyResult);
    
    setTestResult({
      birthDate,
      numerologyResult,
      cognitiveStyle
    });
    
    setStep('fingerprint');
    setLoading(false);
  };

  const handleFingerprintScan = async () => {
    setLoading(true);
    setStep('processing');
    
    try {
      const fingerprintId = await scanFingerprint();
      
      // Save test result to localStorage (mock database)
      const referrerId = getReferralId();
      const testData = {
        id: `test-${Date.now()}`,
        userId: user?.uid || 'anonymous',
        birthDate: testResult.birthDate,
        cognitiveStyle: testResult.cognitiveStyle.name,
        numerologyResult: testResult.numerologyResult,
        fingerprintId: fingerprintId || null,
        timestamp: new Date(),
        referrerId: referrerId || null
      };
      
      mockTestResults.push(testData);
      localStorage.setItem('neuroscan-test-results', JSON.stringify(mockTestResults));
      
      // Process referral commission if applicable
      if (referrerId && user) {
        const mockCommissions = JSON.parse(localStorage.getItem('neuroscan-commissions') || '[]');
        mockCommissions.push({
          id: `commission-${Date.now()}`,
          affiliatorId: referrerId,
          userId: user.uid,
          testId: testData.id,
          amount: 10000, // Rp 10,000
          timestamp: new Date(),
          status: 'pending'
        });
        localStorage.setItem('neuroscan-commissions', JSON.stringify(mockCommissions));
      }
      
      navigate('/test/result', { 
        state: { 
          testResult: { ...testResult, id: testData.id, fingerprintId } 
        } 
      });
    } catch (error) {
      console.error('Error saving test result:', error);
      // Continue to results even if fingerprint fails
      navigate('/test/result', { 
        state: { 
          testResult: { ...testResult, id: 'temp', fingerprintId: null } 
        } 
      });
    } finally {
      setLoading(false);
    }
  };

  const skipFingerprint = () => {
    handleFingerprintScan();
  };

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center p-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Processing Your Results</h3>
            <p className="text-gray-600">Analyzing your cognitive style...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {step === 'birthdate' && (
          <Card>
            <CardHeader className="text-center">
              <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Cognitive Style Test</h1>
              <p className="text-gray-600">
                Discover your unique thinking patterns through our advanced numerology-based assessment
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleBirthDateSubmit} className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Enter your birth date in any format (DD-MM-YYYY, MM/DD/YYYY, etc.)</li>
                    <li>2. Our system calculates your numerological signature</li>
                    <li>3. We map this to one of 5 cognitive styles</li>
                    <li>4. Optional: Verify with biometric fingerprint scan</li>
                  </ol>
                </div>
                
                <Input
                  label="Birth Date"
                  type="text"
                  value={birthDate}
                  onChange={setBirthDate}
                  placeholder="e.g., 24-08-1995 or 08/24/1995"
                  required
                />
                
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading || !birthDate}
                  icon={Calendar}
                >
                  {loading ? 'Processing...' : 'Analyze My Style'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'fingerprint' && testResult && (
          <Card>
            <CardHeader className="text-center">
              <Fingerprint className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Biometric Verification</h2>
              <p className="text-gray-600">
                Secure your test results with fingerprint authentication
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* <div className="bg-green-50 p-4 rounded-lg text-center">
                <h3 className="font-semibold text-green-900 mb-2">Preliminary Result</h3>
                <div className="text-2xl font-bold" style={{ color: testResult.cognitiveStyle.color }}>
                  {testResult.cognitiveStyle.name}
                </div>
                <p className="text-sm text-green-800 mt-1">
                  {testResult.cognitiveStyle.description}
                </p>
              </div> */}
              
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  Would you like to secure your results with biometric verification?
                </p>
                
                <div className="space-y-3">
                  <Button
                    onClick={handleFingerprintScan}
                    className="w-full"
                    size="lg"
                    disabled={loading}
                    icon={Fingerprint}
                  >
                    {loading ? 'Scanning...' : 'Scan Fingerprint'}
                  </Button>
                  
                  <Button
                    onClick={skipFingerprint}
                    variant="outline"
                    className="w-full"
                    disabled={loading}
                    icon={ArrowRight}
                  >
                    Skip & Continue
                  </Button>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 text-center">
                <p>• Fingerprint data is securely processed and not stored as images</p>
                <p>• Only a unique identifier is saved for verification purposes</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};