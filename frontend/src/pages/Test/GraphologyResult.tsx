import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { graphologyService, GraphologyResultData } from '../../services/graphology.service';
import { BrainCircuit, CheckCircle, Quote, Briefcase, AlertTriangle, MessageSquare, Share2 } from 'lucide-react';
import { useGraphologyAiReport } from '../../hooks/useAiReports';

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

    if (!result) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <AlertTriangle className="w-16 h-16 text-yellow-500" />
                <h2 className="text-2xl font-bold text-gray-800">Hasil Tidak Ditemukan</h2>
                <p className="text-gray-500">Hasil analisis tidak tersedia atau belum ada.</p>
                <Link to="/customer/dashboard/graphology-test" className="text-blue-600 hover:underline">Coba Lagi</Link>
            </div>
        );
    }

    if (result.status === 'processing' || result.status === 'pending') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <h2 className="text-2xl font-bold text-gray-800">Sedang Memproses Laporan</h2>
                <p className="text-gray-500">AI sedang memproses hasil tes Graphology Anda...</p>
                <button onClick={() => window.location.reload()} className="mt-4 text-blue-600 hover:underline border border-blue-600 px-4 py-2 rounded-lg">Refresh Status</button>
            </div>
        );
    }

    if (result.status === 'failed') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <AlertTriangle className="w-16 h-16 text-red-500" />
                <h2 className="text-2xl font-bold text-gray-800">Proses Gagal</h2>
                <p className="text-gray-500">Terjadi kesalahan saat AI memproses hasil tes.</p>
                <Link to="/customer/dashboard/graphology-test" className="text-blue-600 hover:underline">Coba Lagi</Link>
            </div>
        );
    }

    const renderList = (items?: string[]) => {
        if (!items || !Array.isArray(items)) return null;
        return (
            <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                {items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                ))}
            </ul>
        );
    };

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
                <div className="md:col-span-2 bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 opacity-10">
                        <BrainCircuit className="w-64 h-64 -mr-16 -mt-16" />
                    </div>
                    <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-blue-200 font-medium uppercase tracking-wider text-sm mb-1">Tipe Kepribadian</p>
                                <h2 className="text-4xl font-bold leading-tight">{result.title || 'Unknown'}</h2>
                                <h3 className="text-2xl text-blue-100 mt-1">{result.subtitle || ''}</h3>
                            </div>
                            {result.match_score && (
                                <div className="bg-white/20 px-3 py-1.5 rounded-lg border border-white/30 backdrop-blur-sm">
                                    <span className="font-bold">{result.match_score} Match</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Extracted Text */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-4 text-gray-700">
                        <Quote className="w-5 h-5 text-gray-400" />
                        <h3 className="font-semibold">Teks Terdeteksi</h3>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 flex-1 text-gray-600 italic text-sm leading-relaxed overflow-y-auto max-h-48 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent">
                        {result.extracted_text ? `"${result.extracted_text}"` : 'Tidak dapat membaca teks secara spesifik.'}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {result.summary && (
                    <div className="bg-slate-50 rounded-2xl p-6 border-l-4 border-l-blue-500 shadow-sm">
                        <h4 className="font-bold text-slate-900 mb-2">Ringkasan Profil</h4>
                        <p className="text-slate-700 leading-relaxed">{result.summary}</p>
                    </div>
                )}

                {result.brain_process && (
                    <div className="bg-indigo-50 rounded-2xl p-6 border-l-4 border-l-indigo-500 shadow-sm">
                        <h4 className="font-bold text-indigo-900 mb-2">Cara Otak Memproses Informasi</h4>
                        <p className="text-indigo-800 leading-relaxed">{result.brain_process}</p>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    {result.strengths && result.strengths.length > 0 && (
                        <div className="bg-green-50 rounded-2xl p-6 border border-green-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <h4 className="font-bold text-green-900">Kekuatan Utama</h4>
                            </div>
                            {renderList(result.strengths)}
                        </div>
                    )}
                    
                    {result.challenges && result.challenges.length > 0 && (
                        <div className="bg-red-50 rounded-2xl p-6 border border-red-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                <h4 className="font-bold text-red-900">Tantangan & Titik Buta</h4>
                            </div>
                            {renderList(result.challenges)}
                        </div>
                    )}
                </div>

                {result.work_environment && (
                    <div className="bg-orange-50 rounded-2xl p-6 border-l-4 border-l-orange-500 shadow-sm">
                        <h4 className="font-bold text-orange-900 mb-2">Lingkungan Kerja Ideal</h4>
                        <p className="text-orange-800 leading-relaxed">{result.work_environment}</p>
                    </div>
                )}

                {result.careers && result.careers.length > 0 && (
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
                            {result.careers.map((career, i) => (
                                <span key={i} className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg font-medium">
                                    {career}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {result.traits && result.traits.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <h4 className="font-bold text-slate-900 mb-2">Sifat / Karakter (Traits)</h4>
                        {renderList(result.traits)}
                    </div>
                )}

                {result.collab_tips && result.collab_tips.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <h4 className="font-bold text-slate-900 mb-2">Tips Kolaborasi</h4>
                        {renderList(result.collab_tips)}
                    </div>
                )}

                {result.conflict_risks && result.conflict_risks.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <h4 className="font-bold text-slate-900 mb-2">Potensi Konflik</h4>
                        {renderList(result.conflict_risks)}
                    </div>
                )}

                {result.dev_tips && result.dev_tips.length > 0 && (
                    <div className="bg-purple-50 rounded-2xl p-6 border-l-4 border-l-purple-500 shadow-sm">
                        <h4 className="font-bold text-purple-900 mb-2">Tips Pengembangan Diri</h4>
                        {renderList(result.dev_tips)}
                    </div>
                )}
            </div>

        </div>
    );
};
