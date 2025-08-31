import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Fingerprint,
  Brain,
  Coins,
  AlertCircle,
  CheckCircle,
  ShoppingCart,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { scanFingerprint } from "@/utils/fingerprint";
import { getReferralId } from "@/utils/referral";
import { useMeQuery } from "@/hooks/useAuthQuery";
import TokenPackages from "@/components/ui/TokenPackage";
import { usePackages } from "@/hooks/usePackage";
import { ThinkingStyleRequest } from "@/services/api";
import { TestForm } from "@/components/form/TestForm";
import { useSubmitTest } from "@/hooks/useThinkingStyleTest";

export const CognitiveTest: React.FC = () => {
  const [birthDate, setBirthDate] = useState("");
  const [fullname, setFullname] = useState("");
  const [step, setStep] = useState<
    "token-check" | "birthdate" | "fingerprint" | "processing"
  >("token-check");
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data } = useMeQuery();

  const token = data?.user?.tokens || 0;
  const { data: tokenPackages } = usePackages();
  const {
    data: testResult,
    isPending: isPendingTest,
    mutateAsync: submitTest,
  } = useSubmitTest();

  const handleStartTest = () => {
    if (!user) {
      alert("Please login to take the test");
      return;
    }

    if (token <= 0) {
      alert("Insufficient tokens. Please purchase tokens to take the test.");
      return;
    }

    setStep("birthdate");
  };

 const handleFingerprintScan = async () => {
  setStep("processing");

  try {
    const fingerprintId = await scanFingerprint();

    const referrerId = getReferralId();
    const testData: ThinkingStyleRequest = {
      fullname,
      birthdate: birthDate,
      fingerPrintId: fingerprintId as string, 
      referrerId,
    };

    // ⬇️ Ambil langsung result dari API
    const result = await submitTest(testData);

    // Simpan referral commission (mock)
    if (referrerId && user) {
      const mockCommissions = JSON.parse(
        localStorage.getItem("neuroscan-commissions") || "[]"
      );
      mockCommissions.push({
        id: `commission-${Date.now()}`,
        affiliatorId: referrerId,
        userId: user.uid,
        amount: 10000,
        timestamp: new Date(),
        status: "pending",
      });
      localStorage.setItem(
        "neuroscan-commissions",
        JSON.stringify(mockCommissions)
      );
    }

    // ⬇️ Arahkan ke result page
    navigate("/customer/dashboard/test/result", {
      state: { testResult: result?.data },
    });
  } catch (error) {
    console.error("Error saving test result:", error);
    navigate("/test/result", {
      state: {
        testResult: { id: "temp", fullname, birthdate: birthDate, fingerprintId: null },
      },
    });
  }
};


  if (step === "processing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center p-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">
              Processing Your Results
            </h3>
            <p className="text-gray-600">Analyzing your cognitive style...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 -mt-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl relative mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Token Display Header */}
            <Card className="w-full left-0 z-[99] max-w-screen mx-auto block top-20 bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Coins className="h-8 w-8 text-yellow-500" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Your Test Tokens
                      </h3>
                      <p className="text-sm text-gray-600">
                        Each test requires 1 token
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-yellow-600">
                      {token}
                    </div>
                    <p className="text-sm text-gray-500">Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {step === "token-check" && (
              <Card className="bg-white">
                <CardHeader className="text-center">
                  <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Cognitive Style Test
                  </h1>
                  <p className="text-gray-600">
                    Discover your unique thinking patterns through our advanced
                    numerology-based assessment
                  </p>
                </CardHeader>

                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">
                        How it works:
                      </h3>
                      <ol className="text-sm text-blue-800 space-y-1">
                        <li>1. One token is required for each test</li>
                        <li>
                          2. Enter your birth date in any format (DD-MM-YYYY,
                          MM/DD/YYYY, etc.)
                        </li>
                        <li>
                          3. Our system calculates your numerological signature
                        </li>
                        <li>4. We map this to one of 5 cognitive styles</li>
                        <li>
                          5. Optional: Verify with biometric fingerprint scan
                        </li>
                      </ol>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <h3 className="font-semibold text-green-900">
                          Test Benefits:
                        </h3>
                      </div>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• Personalized cognitive style analysis</li>
                        <li>• Detailed personality insights</li>
                        <li>• Career and relationship recommendations</li>
                        <li>• Secure biometric verification</li>
                        <li>• Shareable results certificate</li>
                      </ul>
                    </div>

                    <Button
                      onClick={handleStartTest}
                      className="w-full"
                      size="lg"
                      disabled={!user || token <= 0}
                    >
                      {!user
                        ? "Please Login First"
                        : token <= 0
                        ? "Insufficient Tokens"
                        : "Start Test (1 Token)"}
                    </Button>

                    {!user && (
                      <p className="text-center text-sm text-gray-500">
                        Please login to your account to take the test
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {step === "birthdate" && (
              <Card className="bg-white">
                <CardHeader className="text-center">
                  <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Cognitive Style Test
                  </h1>
                  <p className="text-gray-600">
                    Enter your birth date to begin the analysis
                  </p>
                </CardHeader>

                <CardContent>
                  <TestForm
                    onSubmit={(values) => {
                      setFullname(values.fullname);
                      setBirthDate(values.birthdate);
                      setStep("fingerprint");
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {step === "fingerprint" && (
              <Card className="bg-white">
                <CardHeader className="text-center">
                  <Fingerprint className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Biometric Verification
                  </h2>
                  <p className="text-gray-600">
                    Secure your test results with fingerprint authentication
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-semibold text-green-900">
                        Token Used Successfully
                      </span>
                    </div>
                    <p className="text-sm text-green-800">
                      Your test analysis is complete. Remaining tokens: {token}
                    </p>
                  </div>

                  <div className="text-center space-y-4">
                    <p className="text-gray-600">
                      Would you like to secure your results with biometric
                      verification?
                    </p>

                    <div className="space-y-3">
                      <Button
                        onClick={handleFingerprintScan}
                        className="w-full"
                        size="lg"
                      >
                        Scan
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 text-center">
                    <p>
                      • Fingerprint data is securely processed and not stored as
                      images
                    </p>
                    <p>
                      • Only a unique identifier is saved for verification
                      purposes
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Token Purchase Menu */}
          <div className="lg:col-span-1">
            <Card className="top-4 bg-white">
              <CardHeader className="text-center pb-4">
                <ShoppingCart className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <h2 className="text-xl font-bold text-gray-900">
                  Purchase Tokens
                </h2>
                <p className="text-sm text-gray-600">
                  Choose a package that fits your needs
                </p>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                <TokenPackages tokenPackages={tokenPackages} />

                <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <h4 className="font-medium text-blue-900 text-sm">
                      Why buy tokens?
                    </h4>
                  </div>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Take multiple tests anytime</li>
                    <li>• No expiration date</li>
                    <li>• Better value with bundles</li>
                    <li>• Instant activation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
