import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2, Brain, CheckCircle, Shield } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '../../components/ui/Card';

export const TestResult: React.FC = () => {
  const location = useLocation();
  const [showQR, setShowQR] = useState(false);
  const testResult = location.state?.testResult;

  console.log(testResult)

  useEffect(() => {
    if (!testResult) {
      // Redirect if no test result
      window.location.href = '/test';
    }
  }, [testResult]);

  if (!testResult) {
    return <div>Loading...</div>;
  }

  const qrData = JSON.stringify({
    id: testResult.id,
    cognitiveStyle: testResult.resultType,
    birthDate: testResult.birthDate,
    timestamp: new Date().toISOString()
  });

  const downloadQR = () => {
    const svg = document.querySelector('#qr-code') as SVGElement;
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `neuroscan-result-${testResult.id}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const shareResult = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Mahirku Results',
          text: `I discovered my cognitive style: ${testResult.resultType}`,
          url: window.location.origin
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(
        `I just discovered my cognitive style with Mahirku: ${testResult.resultType}. ${testResult.description} Check it out at ${window.location.origin}`
      );
      alert('Result copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Cognitive Style Results</h1>
          <p className="text-gray-600">Discover your unique thinking patterns</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Result Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div 
                className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center"
              >
                <Brain size={48} />
              </div>
              <h2 className="text-3xl font-bold">
                {testResult.resultType}
              </h2>
              <p className="text-gray-600 mt-2">{testResult.description}</p>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Key Traits:</h3>
                  <div className="flex flex-wrap gap-2">
                      <span 

                        className="px-3 py-1 text-sm rounded-full"
                      >
                        {testResult.resultCode}
                      </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Test Details:</h3>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Birth Date:</span> {testResult.birthDate}</p>
                    <p><span className="font-medium">Numerology Result:</span> {testResult.numerologyResult}</p>
                    {testResult.fingerprintId && (
                      <p className="flex items-center">
                        <Shield size={16} className="mr-1 text-green-500" />
                        <span className="font-medium">Biometric Verified</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="space-y-3">
              <Button onClick={shareResult} variant="outline" className="w-full">
                Share Results
              </Button>
              <Button onClick={() => setShowQR(!showQR)} variant="secondary" className="w-full">
                {showQR ? 'Hide QR Code' : 'Show QR Code'}
              </Button>
            </CardFooter>
          </Card>

          {/* QR Code & Actions */}
          <div className="space-y-6">
            {showQR && (
              <Card>
                <CardHeader className="text-center">
                  <h3 className="text-xl font-semibold">QR Code Access</h3>
                  <p className="text-gray-600">Scan to view your results anytime</p>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="bg-white p-4 rounded-lg inline-block">
                    {/* <QRCodeSVG
                      id="qr-code"
                      value={qrData}
                      size={200}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="L"
                      includeMargin={false}
                    /> */}
                  </div>
                  {/* <Button onClick={downloadQR} variant="outline" className="mt-4">
                    Download QR Code
                  </Button> */}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">What's Next?</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Link to="/customer/dashboard" className="block">
                    <Button variant="outline" className="w-full">
                      View Dashboard
                    </Button>
                  </Link>
                  <Link to="/test" className="block">
                    <Button variant="ghost" className="w-full">
                      Take Another Test
                    </Button>
                  </Link>
                </div>
                
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium mb-1">💡 Pro Tip:</p>
                  <p>Understanding your cognitive style can help you make better decisions, communicate more effectively, and optimize your learning approach.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};