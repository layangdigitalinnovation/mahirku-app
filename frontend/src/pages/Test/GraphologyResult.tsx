import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { graphologyService, GraphologyResultData } from '../../services/graphology.service';
import { BrainCircuit, CheckCircle, Quote, Briefcase, AlertTriangle, MessageSquare, Share2, Brain, Zap, TrendingUp, Shield } from 'lucide-react';
import { useGraphologyAiReport } from '../../hooks/useAiReports';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

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

    const location = useLocation();
    const fullname = location.state?.fullname;

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Graphology Personality Report {fullname && fullname !== 'Pengguna' ? fullname : 'Anda'}</h1>
                    <p className="text-gray-500 text-lg">Analisis kepribadian dari tulisan tangan dan tanda tangan {fullname && fullname !== 'Pengguna' ? fullname : 'Anda'}</p>
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

            <Tabs defaultValue="overview" className="w-full mt-8">
                <TabsList className="flex flex-wrap sm:flex-nowrap w-full gap-2 mb-6 h-auto p-1.5 bg-slate-100 rounded-xl overflow-x-auto">
                    <TabsTrigger value="overview" className="flex-1 min-w-[140px] py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg flex justify-center items-center gap-2 text-sm font-medium">
                        <Brain className="w-4 h-4" /> <span>Ringkasan</span>
                    </TabsTrigger>
                    <TabsTrigger value="character" className="flex-1 min-w-[140px] py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg flex justify-center items-center gap-2 text-sm font-medium">
                        <Zap className="w-4 h-4" /> <span>Karakter</span>
                    </TabsTrigger>
                    <TabsTrigger value="career" className="flex-1 min-w-[140px] py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg flex justify-center items-center gap-2 text-sm font-medium">
                        <Briefcase className="w-4 h-4" /> <span>Karir & Kerja</span>
                    </TabsTrigger>
                    <TabsTrigger value="development" className="flex-1 min-w-[140px] py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg flex justify-center items-center gap-2 text-sm font-medium">
                        <TrendingUp className="w-4 h-4" /> <span>Pengembangan</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-0 animate-in fade-in-50 duration-500">
                    {result.summary && (
                        <Card className="border-l-4 border-l-blue-500 bg-slate-50 shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <h4 className="font-bold text-slate-900 mb-2">Ringkasan Profil</h4>
                                <p className="text-slate-700 leading-relaxed text-sm">{result.summary}</p>
                            </CardContent>
                        </Card>
                    )}

                    <div className="space-y-6">
                        {result.brain_process && (
                            <Card className="border-l-4 border-l-indigo-500 bg-indigo-50/50 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <h4 className="font-bold text-indigo-900 mb-2">Cara Otak Memproses Informasi</h4>
                                    <p className="text-indigo-800 leading-relaxed text-sm">{result.brain_process}</p>
                                </CardContent>
                            </Card>
                        )}

                        {result.traits && result.traits.length > 0 && (
                            <Card className="border-l-4 border-l-teal-500 bg-teal-50/50 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <h4 className="font-bold text-teal-900 mb-2">Sifat / Karakter (Traits)</h4>
                                    <div className="text-sm">
                                        {renderList(result.traits)}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="character" className="space-y-6 mt-0 animate-in fade-in-50 duration-500">
                    <div className="space-y-6">
                        {result.strengths && result.strengths.length > 0 && (
                            <Card className="border-l-4 border-l-emerald-500 bg-emerald-50/50 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                                        <h4 className="font-bold text-emerald-900">Kekuatan Utama</h4>
                                    </div>
                                    <div className="text-sm">
                                        {renderList(result.strengths)}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        
                        {result.challenges && result.challenges.length > 0 && (
                            <Card className="border-l-4 border-l-amber-500 bg-amber-50/50 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Shield className="w-5 h-5 text-amber-600" />
                                        <h4 className="font-bold text-amber-900">Tantangan & Titik Buta</h4>
                                    </div>
                                    <div className="text-sm">
                                        {renderList(result.challenges)}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {result.conflict_risks && result.conflict_risks.length > 0 && (
                        <Card className="border-l-4 border-l-rose-500 bg-rose-50/50 shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <h4 className="font-bold text-rose-900 mb-2">Potensi Konflik</h4>
                                <div className="text-sm">
                                    {renderList(result.conflict_risks)}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="career" className="space-y-6 mt-0 animate-in fade-in-50 duration-500">
                    {result.work_environment && (
                        <Card className="border-l-4 border-l-sky-500 bg-sky-50/50 shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <h4 className="font-bold text-sky-900 mb-2">Lingkungan Kerja Ideal</h4>
                                <p className="text-sky-800 leading-relaxed text-sm">{result.work_environment}</p>
                            </CardContent>
                        </Card>
                    )}

                    <div className="space-y-6">
                        {result.careers && result.careers.length > 0 && (
                            <Card className="border-l-4 border-l-blue-600 bg-blue-50/50 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <h4 className="font-bold text-blue-900 mb-2">Rekomendasi Karir</h4>
                                    <div className="text-sm">
                                        {renderList(result.careers)}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {result.collab_tips && result.collab_tips.length > 0 && (
                            <Card className="border-l-4 border-l-fuchsia-500 bg-fuchsia-50/50 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <h4 className="font-bold text-fuchsia-900 mb-2">Tips Kolaborasi</h4>
                                    <div className="text-sm">
                                        {renderList(result.collab_tips)}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="development" className="space-y-6 mt-0 animate-in fade-in-50 duration-500">
                    {result.dev_tips && result.dev_tips.length > 0 && (
                        <Card className="border-l-4 border-l-purple-500 bg-purple-50 shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <h4 className="font-bold text-purple-900 mb-2">Tips Pengembangan Diri</h4>
                                <div className="text-sm">
                                    {renderList(result.dev_tips)}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>

        </div>
    );
};
