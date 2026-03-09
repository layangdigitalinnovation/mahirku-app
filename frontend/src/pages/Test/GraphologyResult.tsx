import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { graphologyService, GraphologyResultData } from '../../services/graphology.service';
import { BrainCircuit, CheckCircle, Quote, Briefcase, AlertTriangle, MessageSquare, Share2 } from 'lucide-react';

export const GraphologyResult: React.FC = () => {
    const { test_id } = useParams<{ test_id: string }>();
    const [result, setResult] = useState<GraphologyResultData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                if (!test_id) return;
                const data = await graphologyService.getResult(test_id);
                setResult(data);
            } catch (error) {
                console.error('Error fetching result:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [test_id]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
                <p className="text-gray-500">Memuat hasil analisis...</p>
            </div>
        );
    }

    if (!result || result.status !== 'completed') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <AlertTriangle className="w-16 h-16 text-yellow-500" />
                <h2 className="text-2xl font-bold text-gray-800">Hasil Tidak Ditemukan</h2>
                <p className="text-gray-500">Hasil analisis belum tersedia atau terjadi kesalahan.</p>
                <Link to="/customer/dashboard/graphology-test" className="text-blue-600 hover:underline">Coba Lagi</Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Graphology Personality Report</h1>
                    <p className="text-gray-500 text-lg">Analisis kepribadian dari tulisan tangan dan tanda tangan Anda</p>
                </div>
                <div className="hidden gap-3 sm:flex">
                    <button className="flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium transition-colors">
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
                {/* Core Personality Card */}
                <div className="md:col-span-2 bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10">
                        <BrainCircuit className="w-64 h-64 -mr-16 -mt-16" />
                    </div>
                    <div className="relative z-10 space-y-6">
                        <div>
                            <p className="text-blue-200 font-medium uppercase tracking-wider text-sm mb-1">Tipe Kepribadian</p>
                            <h2 className="text-4xl font-bold">{result.personality_type || 'Unknown'}</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-blue-400/30">
                            <div>
                                <p className="text-blue-200 text-sm mb-1 line-clamp-1">Gaya Berpikir</p>
                                <p className="text-xl font-semibold">{result.thinking_style || '-'}</p>
                            </div>
                            <div>
                                <p className="text-blue-200 text-sm mb-1 line-clamp-1">Kecenderungan Emosi</p>
                                <p className="text-xl font-semibold">{result.emotional_tendency || '-'}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-blue-200 text-sm mb-1 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" /> Gaya Komunikasi
                            </p>
                            <p className="text-lg font-medium">{result.communication_style || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* Extracted Text */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-4 text-gray-700">
                        <Quote className="w-5 h-5 text-gray-400" />
                        <h3 className="font-semibold">Teks Terdeteksi</h3>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 flex-1 text-gray-600 italic text-sm leading-relaxed overflow-y-auto max-h-48">
                        {result.extracted_text ? `"${result.extracted_text}"` : 'Tidak dapat membaca teks secara spesifik.'}
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Strengths */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Kekuatan (Strengths)</h3>
                    </div>
                    <ul className="space-y-3">
                        {result.strengths && result.strengths.length > 0 ? (
                            result.strengths.map((str, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-700 bg-green-50/50 p-3 rounded-lg">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"></span>
                                    <span>{str}</span>
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">-</p>
                        )}
                    </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Area Pengembangan (Weaknesses)</h3>
                    </div>
                    <ul className="space-y-3">
                        {result.weaknesses && result.weaknesses.length > 0 ? (
                            result.weaknesses.map((wk, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-700 bg-orange-50/50 p-3 rounded-lg">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0"></span>
                                    <span>{wk}</span>
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">-</p>
                        )}
                    </ul>
                </div>
            </div>

            {/* Recommended Career */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-5">
                    <Briefcase className="w-48 h-48 -mr-12 -mb-12" />
                </div>
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Pekerjaan yang Direkomendasikan</h3>
                </div>
                <div className="flex flex-wrap gap-3 relative z-10">
                    {result.career_recommendations && result.career_recommendations.length > 0 ? (
                        result.career_recommendations.map((career, i) => (
                            <span key={i} className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg font-medium">
                                {career}
                            </span>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm">-</p>
                    )}
                </div>
            </div>

        </div>
    );
};
