import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { graphologyService } from '../../services/graphology.service';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';

type Step = 'intro' | 'upload' | 'processing';

export const GraphologyTest: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState<Step>('intro');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [testId, setTestId] = useState<string | null>(null);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'image/jpeg': [], 'image/png': [], 'image/jpg': [] },
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024, // 5MB
        onDrop: (acceptedFiles) => {
            setFile(acceptedFiles[0]);
        },
    });

    const handleUpload = async () => {
        if (!file || !user) return;
        setIsUploading(true);
        try {
            const result = await graphologyService.uploadImage(file, user.id);
            if (result.status === 'processing' && result.test_id) {
                setTestId(result.test_id);
                setCurrentStep('processing');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Gagal mengunggah gambar. Silakan coba lagi.');
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (currentStep === 'processing' && testId) {
            interval = setInterval(async () => {
                try {
                    const result = await graphologyService.getResult(testId);
                    if (result.status === 'completed') {
                        navigate(`/customer/dashboard/graphology-result/${testId}`);
                    } else if (result.status === 'failed') {
                        alert('Sistem gagal memproses tulisan Anda. Silakan coba unggah gambar yang lebih jelas.');
                        setCurrentStep('upload');
                    }
                } catch (error) {
                    console.error('Error polling result:', error);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [currentStep, testId, navigate]);

    return (
        <div className="max-w-4xl mx-auto p-6 mt-8">
            {/* Steps Indicator */}
            <div className="flex items-center justify-center mb-10 text-sm font-medium">
                <div className={`flex items-center ${currentStep === 'intro' ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-current">1</div>
                    <span className="ml-2 hidden sm:block">Instruksi</span>
                </div>
                <div className="w-12 h-0.5 bg-gray-200 mx-4"></div>
                <div className={`flex items-center ${currentStep === 'upload' ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-current">2</div>
                    <span className="ml-2 hidden sm:block">Unggah</span>
                </div>
                <div className="w-12 h-0.5 bg-gray-200 mx-4"></div>
                <div className={`flex items-center ${currentStep === 'processing' ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-current shrink-0">3</div>
                    <span className="ml-2 hidden sm:block">Analisis</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                {currentStep === 'intro' && (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">Graphology Test</h1>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-500" />
                                    Instruksi Menulis
                                </h3>
                                <ul className="space-y-3 text-gray-600">
                                    <li className="flex gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                        <span>Siapkan <strong>kertas putih polos</strong> tanpa garis.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                        <span>Gunakan bolpoin bertinta hitam atau biru.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                        <span>Tuliskan <strong>2-3 kalimat bebas</strong> menggunakan tulisan tangan gaya Anda (cetak/tegak bersambung).</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                        <span>Tambahkan <strong>tanda tangan asli Anda</strong> di bagian bawah tulisan tersebut.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                        <span>Foto tulisan tersebut pastikan pencahayaan cukup dan gambar tidak blur.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <h4 className="font-medium text-gray-700 mb-3">Contoh Tulisan:</h4>
                                <div className="font-handwriting text-gray-600 italic border-l-4 border-blue-400 pl-4 py-2 opacity-80" style={{ fontFamily: 'var(--font-handwriting, cursive)', fontSize: '1.1rem' }}>
                                    Saya adalah pribadi yang selalu ingin<br />
                                    belajar dan berkembang dalam hidup.<br />
                                    Saya percaya bahwa usaha dan konsistensi<br />
                                    akan membawa kesuksesan.<br /><br />
                                    [Tanda Tangan]
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 flex justify-center">
                            <button
                                onClick={() => setCurrentStep('upload')}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full transition-colors flex items-center gap-2"
                            >
                                Saya Sudah Siap <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 'upload' && (
                    <div className="text-center space-y-8 py-8">
                        <h2 className="text-2xl font-bold text-gray-900">Unggah Foto Tulisan Anda</h2>
                        <p className="text-gray-500">Pastikan foto jelas, terang, dan format gambar (JPG/PNG).</p>

                        <div
                            {...getRootProps()}
                            className={`max-w-lg mx-auto p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50'
                                }`}
                        >
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                    <UploadCloud className="w-8 h-8 text-blue-600" />
                                </div>
                                {file ? (
                                    <div className="text-center">
                                        <p className="font-medium text-gray-800">{file.name}</p>
                                        <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <p className="font-medium text-gray-700">Tarik dan lepas gambar ke sini</p>
                                        <p className="text-sm text-gray-500 mt-1">atau klik untuk memilih file</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-center gap-4 pt-6">
                            <button
                                onClick={() => setCurrentStep('intro')}
                                className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                disabled={isUploading}
                            >
                                Kembali
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!file || isUploading}
                                className="px-8 py-2.5 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Mengunggah...
                                    </>
                                ) : (
                                    'Mulai Analisis'
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 'processing' && (
                    <div className="py-20 flex flex-col items-center justify-center space-y-6">
                        <div className="relative">
                            <div className="w-24 h-24 border-4 border-blue-100 rounded-full animate-pulse px-2 py-2"></div>
                            <div className="absolute top-0 left-0 w-24 h-24 border-4 border-t-blue-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                                <FileText className="w-8 h-8 animate-bounce" />
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">Sistem Sedang Menganalisis...</h2>
                            <p className="text-gray-500 max-w-sm mx-auto">
                                Sistem kami sedang membaca bentuk tulisan dan tanda tangan Anda untuk menyusun profil kepribadian. Mohon tunggu sekitar 10-20 detik.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
