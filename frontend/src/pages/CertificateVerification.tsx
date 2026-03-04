import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, XCircle, Clock, Award, User, Calendar, FileCheck } from 'lucide-react';

interface VerificationData {
    isValid: boolean;
    userName?: string;
    testDate?: string;
    thinkingStyleType?: string;
    thinkingStyleCode?: string;
    certificateId?: string;
    message?: string;
}

export default function CertificateVerificationPage() {
    const { certificateId } = useParams<{ certificateId: string }>();
    const [loading, setLoading] = useState(true);
    const [verificationData, setVerificationData] = useState<VerificationData | null>(null);

    useEffect(() => {
        const verifyCertificate = async () => {
            if (!certificateId) return;

            setLoading(true);
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL || 'https://api.mahirku.com'}/api/certificates/verify/${certificateId}`
                );
                const data = await response.json();
                setVerificationData(data);
            } catch (error) {
                console.error('Verification error:', error);
                setVerificationData({
                    isValid: false,
                    message: 'Failed to verify certificate. Please try again later.'
                });
            } finally {
                setLoading(false);
            }
        };

        verifyCertificate();
    }, [certificateId]);

    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-3">
                        <Shield className="h-8 w-8 text-indigo-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Certificate Verification</h1>
                            <p className="text-sm text-gray-600">Mahirku Platform</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {loading ? (
                    <LoadingState />
                ) : verificationData?.isValid ? (
                    <ValidCertificate data={verificationData} />
                ) : (
                    <InvalidCertificate message={verificationData?.message} />
                )}

                {/* Information Section */}
                <InfoSection />
            </main>

            {/* Footer */}
            <footer className="mt-24 border-t border-gray-200 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <p className="text-gray-600">
                            © 2025 Mahirku Platform. All rights reserved.
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Professional Cognitive & Personality Assessment Platform
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function LoadingState() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12"
        >
            <div className="flex flex-col items-center justify-center space-y-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                    <Clock className="h-16 w-16 text-indigo-600" />
                </motion.div>
                <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Verifying Certificate</h3>
                    <p className="text-gray-600">Please wait while we verify the authenticity...</p>
                </div>
            </div>
        </motion.div>
    );
}

function ValidCertificate({ data }: { data: VerificationData }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Status Card */}
            <div className="bg-linear-to-r from-green-50 to-emerald-50 rounded-2xl shadow-xl border-2 border-green-200 p-8">
                <div className="flex items-start gap-4">
                    <div className="shrink-0">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-green-900 mb-2">Certificate Verified</h2>
                        <p className="text-green-700 text-lg">
                            This certificate is authentic and has been issued by Mahirku Platform.
                        </p>
                    </div>
                </div>
            </div>

            {/* Certificate Details */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-8 py-6">
                    <div className="flex items-center gap-3 text-white">
                        <Award className="h-8 w-8" />
                        <h3 className="text-2xl font-bold">Certificate Details</h3>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    {/* Recipient */}
                    <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
                        <div className="shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 mb-1">Awarded To</p>
                            <p className="text-2xl font-bold text-gray-900">{data.userName}</p>
                        </div>
                    </div>

                    {/* Assessment Result */}
                    <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
                        <div className="shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <FileCheck className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 mb-2">Assessment Result</p>
                            <div className="bg-linear-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
                                <p className="text-xl font-bold text-indigo-900">{data.thinkingStyleType}</p>
                                <p className="text-sm text-indigo-600 mt-1">({data.thinkingStyleCode})</p>
                            </div>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
                        <div className="shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 mb-1">Date of Completion</p>
                            <p className="text-lg font-semibold text-gray-900">{data.testDate}</p>
                        </div>
                    </div>

                    {/* Certificate ID */}
                    <div className="flex items-start gap-4">
                        <div className="shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                            <Shield className="h-6 w-6 text-amber-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 mb-1">Certificate ID</p>
                            <p className="text-lg font-mono font-semibold text-gray-900 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                                {data.certificateId}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid md:grid-cols-3 gap-4">
                <TrustBadge icon={Shield} title="Verified" description="Authentic certificate" color="green" />
                <TrustBadge icon={CheckCircle2} title="Validated" description="Official assessment" color="blue" />
                <TrustBadge icon={Award} title="Certified" description="Mahirku Platform" color="purple" />
            </div>
        </motion.div>
    );
}

function InvalidCertificate({ message }: { message?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-linear-to-r from-red-50 to-orange-50 rounded-2xl shadow-xl border-2 border-red-200 p-12"
        >
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center">
                    <XCircle className="h-12 w-12 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-red-900 mb-2">Certificate Not Found</h2>
                    <p className="text-red-700 text-lg max-w-md mx-auto">
                        {message || 'This certificate could not be verified. Please check the certificate ID and try again.'}
                    </p>
                </div>
                <div className="mt-6 p-4 bg-white rounded-xl border border-red-200">
                    <p className="text-sm text-gray-700">
                        <strong>Note:</strong> Only certificates issued by Mahirku Platform can be verified through this system.
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

function TrustBadge({ icon: Icon, title, description, color }: {
    icon: any;
    title: string;
    description: string;
    color: 'green' | 'blue' | 'purple'
}) {
    const colors = {
        green: 'from-green-50 to-emerald-50 border-green-200 text-green-700',
        blue: 'from-blue-50 to-cyan-50 border-blue-200 text-blue-700',
        purple: 'from-purple-50 to-pink-50 border-purple-200 text-purple-700'
    };

    return (
        <div className={`bg-linear-to-br ${colors[color]} rounded-xl border p-6 text-center`}>
            <Icon className="h-8 w-8 mx-auto mb-2" />
            <h4 className="font-bold text-lg mb-1">{title}</h4>
            <p className="text-sm opacity-75">{description}</p>
        </div>
    );
}

function InfoSection() {
    return (
        <div className="mt-16 bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">About Certificate Verification</h3>
            <div className="space-y-4 text-gray-700">
                <p>
                    Certificate verification ensures the authenticity and validity of assessment results issued by Mahirku Platform.
                    Each certificate contains a unique QR code that links to this verification page.
                </p>
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                    <div className="flex gap-3">
                        <div className="shrink-0">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Instant Verification</h4>
                            <p className="text-sm text-gray-600">
                                Scan the QR code on any certificate to instantly verify its authenticity.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="shrink-0">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <Shield className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Secure & Reliable</h4>
                            <p className="text-sm text-gray-600">
                                All certificates are cryptographically secured and stored in our database.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
