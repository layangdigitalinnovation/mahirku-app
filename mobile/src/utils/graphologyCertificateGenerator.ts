import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';

export interface GraphologyCertificateData {
  studentName: string;
  completionDate: string;
  certificateId: string; // fallback to the type_id if none exists
  
  typeId: string; // e.g. GRP-8-TRLBLZ
  title: string; // e.g. The Trailblazer
  subtitle: string; // e.g. Visioner Eksekutor
  matchScore: string; // e.g. 94%
  
  summary: string;
  brainProcess: string;
  workEnv: string;
  
  traits: string[];
  strengths: string[];
  challenges: string[];
  careers: string[];
  collabTips: string[];
  conflictRisks: string[];
  devTips: string[];
}

export const generateGraphologyCertificatePDF = async (data: GraphologyCertificateData) => {
  const colorMap: Record<string, string> = {
    'GRP-8-TRLBLZ': 'indigo',
    'GRP-8-PRCDRV': 'emerald',
    'GRP-8-PRANLS': 'slate',
    'GRP-8-INDART': 'violet',
    'GRP-8-EXPCRT': 'fuchsia',
    'GRP-8-CMNBLD': 'sky',
    'GRP-8-STRPLN': 'orange',
    'GRP-8-STDYOP': 'teal',
  };

  const colorKey = colorMap[data.typeId] || 'indigo';

  const colorClasses: Record<string, any> = {
    indigo: { bg: 'bg-indigo-600', text: 'text-indigo-600', lightBg: 'bg-indigo-50/50', border: 'border-indigo-100', textDark: 'text-indigo-800' },
    emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', lightBg: 'bg-emerald-50/50', border: 'border-emerald-100', textDark: 'text-emerald-800' },
    slate: { bg: 'bg-slate-700', text: 'text-slate-700', lightBg: 'bg-slate-50/50', border: 'border-slate-200', textDark: 'text-slate-800' },
    violet: { bg: 'bg-violet-600', text: 'text-violet-600', lightBg: 'bg-violet-50/50', border: 'border-violet-100', textDark: 'text-violet-800' },
    fuchsia: { bg: 'bg-fuchsia-600', text: 'text-fuchsia-600', lightBg: 'bg-fuchsia-50/50', border: 'border-fuchsia-100', textDark: 'text-fuchsia-800' },
    sky: { bg: 'bg-sky-500', text: 'text-sky-500', lightBg: 'bg-sky-50/50', border: 'border-sky-100', textDark: 'text-sky-800' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-500', lightBg: 'bg-orange-50/50', border: 'border-orange-100', textDark: 'text-orange-800' },
    teal: { bg: 'bg-teal-600', text: 'text-teal-600', lightBg: 'bg-teal-50/50', border: 'border-teal-100', textDark: 'text-teal-800' }
  };

  const c = colorClasses[colorKey];

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sertifikat & Laporan - 8 Grapho-Types</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');

        body {
            font-family: 'Inter', sans-serif;
            background-color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 0;
            margin: 0;
            -webkit-print-color-adjust: exact;
        }

        .a4-page {
            width: 210mm;
            height: 297mm;
            background: white;
            position: relative;
            overflow: hidden;
            box-sizing: border-box;
            page-break-after: always;
        }

        @media print {
            @page { size: A4 portrait; margin: 0; }
        }

        .serif { font-family: 'Playfair Display', serif; }

        .bg-pattern {
            background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
    </style>
</head>
<body>
    <!-- PAGE 1: CERTIFICATE -->
    <div class="a4-page p-12 bg-pattern flex flex-col justify-center items-center text-center">
        <div class="absolute inset-8 border-4 border-indigo-100 rounded-2xl pointer-events-none"></div>
        <div class="absolute inset-10 border border-indigo-200 rounded-xl pointer-events-none"></div>

        <div class="mb-12 mt-8">
            <h2 class="text-indigo-600 font-bold tracking-widest text-2xl uppercase">Mahirku</h2>
            <div class="w-16 h-1 bg-indigo-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <h1 class="serif text-5xl text-slate-800 font-bold mb-4 uppercase tracking-wider">Certificate</h1>
        <h3 class="text-xl text-slate-500 tracking-widest uppercase mb-16">Of Completion</h3>

        <p class="text-slate-600 text-lg mb-4">This is to certify that</p>
        
        <h2 class="serif text-6xl text-indigo-700 font-bold mb-8 capitalize border-b-2 border-indigo-100 pb-4 px-12 inline-block">
            ${data.studentName}
        </h2>

        <p class="text-slate-600 text-lg max-w-lg mb-8 leading-relaxed">
            has successfully completed the <br> 
            <strong class="text-slate-800 font-semibold text-xl">Graphology &amp; Talent Mapping Assessment</strong>
        </p>

        <div class="border px-10 py-5 rounded-2xl mb-16 shadow-sm transition-all duration-300 transform ${c.lightBg} ${c.border}">
            <p class="text-sm text-indigo-500 uppercase tracking-wider mb-1 font-bold">Karakter Dominan</p>
            <h3 class="text-3xl font-bold mt-1 ${c.text}">${data.title}</h3>
        </div>

        <div class="flex justify-between w-full max-w-2xl px-8 mt-auto absolute bottom-16">
            <div class="text-left">
                <p class="text-sm font-medium text-slate-500 mb-1">ID: <span class="text-slate-700 font-mono">${data.certificateId || data.typeId}</span></p>
                <p class="text-sm text-slate-500">Date: ${data.completionDate}</p>
            </div>
            <div class="text-right flex items-center gap-3">
                <div class="text-right">
                    <p class="font-bold text-slate-700">MAHIRKU Verify</p>
                    <p class="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide">Official Document</p>
                </div>
                <div class="w-16 h-16 bg-white border-2 border-slate-200 p-1 rounded-lg flex items-center justify-center shadow-sm">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://mahirku.com/verify/certificate/${data.certificateId}" class="w-full h-full" />
                </div>
            </div>
        </div>
    </div>

    <!-- PAGE 2: DETAIL LAPORAN -->
    <div class="a4-page py-8 px-10 flex flex-col bg-white">
        <div class="flex items-center justify-between border-b pb-4 mb-5">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-2xl shadow-sm">
                    <i class="fas fa-fingerprint"></i>
                </div>
                <div>
                    <h2 class="text-xl font-bold text-slate-800">Detail Laporan Assessment</h2>
                    <p class="text-sm text-slate-500">Graphology &amp; Talent Mapping</p>
                </div>
            </div>
            <div class="text-right">
                <p class="text-sm font-semibold text-slate-400">${data.studentName}</p>
                <p class="text-xs text-slate-400">${data.certificateId || data.typeId}</p>
            </div>
        </div>

        <div class="${c.bg} text-white rounded-2xl p-5 mb-5 flex items-center justify-between shadow-md">
            <div>
                <p class="text-indigo-100 text-xs mb-1 uppercase tracking-wider font-semibold opacity-90">Tipe Karakter Dominan</p>
                <h3 class="text-2xl font-bold">${data.title}</h3>
                <p class="text-indigo-50 mt-1 text-sm opacity-90 font-medium">${data.subtitle}</p>
            </div>
            <div class="w-16 h-16 bg-white rounded-full flex flex-col items-center justify-center shadow-inner ${c.text}">
                <span class="text-xl font-black">${data.matchScore}</span>
                <span class="text-[9px] uppercase font-bold opacity-75">Match</span>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-6">
            <!-- KOLOM KIRI -->
            <div class="space-y-4">
                <div>
                    <h4 class="text-[14px] font-bold text-slate-800 mb-1 border-l-4 border-indigo-500 pl-3">Ringkasan Profil</h4>
                    <p class="text-[12.5px] text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                        ${data.summary}
                    </p>
                </div>

                <div>
                    <h4 class="text-[14px] font-bold text-slate-800 mb-1 border-l-4 border-indigo-500 pl-3">Cara Otak Memproses Informasi</h4>
                    <p class="text-[12.5px] text-slate-600 leading-relaxed px-2">
                        ${data.brainProcess}
                    </p>
                </div>

                <div>
                    <h4 class="text-[14px] font-bold text-slate-800 mb-1.5 border-l-4 border-indigo-500 pl-3">Karakter Bawah Sadar</h4>
                    <ul class="space-y-1 pl-2">
                        ${(data.traits || []).map(t => `<li class="flex items-start gap-2 text-[12.5px] text-slate-700 py-0.5"><i class="fas fa-circle mt-1 text-[11px] ${c.text}"></i><span class="leading-snug font-medium">${t}</span></li>`).join('')}
                    </ul>
                </div>

                <div class="bg-emerald-50/50 rounded-xl p-3.5 border border-emerald-100">
                    <h4 class="text-[13px] font-bold text-emerald-800 mb-2 flex items-center gap-2">
                        <i class="fas fa-check-circle"></i> Kekuatan Utama
                    </h4>
                    <ul class="space-y-1">
                        ${(data.strengths || []).map(t => `<li class="flex items-start gap-2 text-[12.5px] text-slate-700 py-0.5"><i class="fas fa-check mt-1 text-[11px] text-emerald-500"></i><span class="leading-snug font-medium">${t}</span></li>`).join('')}
                    </ul>
                </div>
                
                <div class="bg-amber-50/50 rounded-xl p-3.5 border border-amber-100">
                    <h4 class="text-[13px] font-bold text-amber-800 mb-2 flex items-center gap-2">
                        <i class="fas fa-exclamation-triangle"></i> Titik Buta (Blind Spots)
                    </h4>
                    <ul class="space-y-1">
                        ${(data.challenges || []).map(t => `<li class="flex items-start gap-2 text-[12.5px] text-slate-700 py-0.5"><i class="fas fa-exclamation mt-1 text-[11px] text-amber-500"></i><span class="leading-snug font-medium">${t}</span></li>`).join('')}
                    </ul>
                </div>
            </div>

            <!-- KOLOM KANAN -->
            <div class="space-y-4">
                <div>
                    <h4 class="text-[14px] font-bold text-slate-800 mb-1 border-l-4 border-indigo-500 pl-3">Lingkungan Kerja Ideal</h4>
                    <p class="text-[12.5px] text-slate-600 leading-relaxed px-2">
                         ${data.workEnv}
                    </p>
                </div>

                <div>
                    <h4 class="text-[14px] font-bold text-slate-800 mb-2 border-l-4 border-indigo-500 pl-3">Rekomendasi Karir Digital</h4>
                    <div class="grid grid-cols-2 gap-2 pl-2">
                        ${(data.careers || []).map((t, idx) => {
                            const colSpan = (idx === data.careers.length - 1 && data.careers.length % 2 !== 0) ? 'col-span-2' : '';
                            return `<div class="bg-slate-50 p-2 rounded-lg text-[12px] text-slate-700 flex items-center gap-2 border border-slate-200 font-medium shadow-sm ${colSpan}"><i class="fas fa-briefcase ${c.text} opacity-75"></i> ${t}</div>`;
                        }).join('')}
                    </div>
                </div>

                <div class="bg-blue-50/50 rounded-xl p-3.5 border border-blue-100">
                    <h4 class="text-[13px] font-bold text-blue-800 mb-2 flex items-center gap-2">
                        <i class="fas fa-users"></i> Cara Berkolaborasi
                    </h4>
                    <ul class="space-y-1 mb-3">
                        ${(data.collabTips || []).map(t => `<li class="flex items-start gap-2 text-[12.5px] text-slate-700 py-0.5"><i class="fas fa-handshake mt-1 text-[11px] text-blue-500"></i><span class="leading-snug font-medium">${t}</span></li>`).join('')}
                    </ul>

                    <h4 class="text-[13px] font-bold text-rose-800 mb-2 flex items-center gap-2 mt-3 pt-3 border-t border-blue-200">
                        <i class="fas fa-bolt"></i> Potensi Konflik
                    </h4>
                    <ul class="space-y-1">
                        ${(data.conflictRisks || []).map(t => `<li class="flex items-start gap-2 text-[12.5px] text-slate-700 py-0.5"><i class="fas fa-bolt mt-1 text-[11px] text-rose-500"></i><span class="leading-snug font-medium">${t}</span></li>`).join('')}
                    </ul>
                </div>

                <div class="bg-indigo-50/50 rounded-xl p-3.5 border border-indigo-100">
                    <h4 class="text-[13px] font-bold text-indigo-800 mb-2 flex items-center gap-2">
                        <i class="fas fa-chart-line"></i> Tips Pengembangan Diri
                    </h4>
                    <ul class="space-y-1">
                        ${(data.devTips || []).map(t => `<li class="flex items-start gap-2 text-[12.5px] text-slate-700 py-0.5"><i class="fas fa-arrow-up mt-1 text-[11px] ${c.text}"></i><span class="leading-snug font-medium">${t}</span></li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>

        <div class="mt-auto pt-3 border-t border-slate-100 flex items-start gap-2.5">
            <i class="fas fa-info-circle text-slate-400 mt-0.5 text-xs"></i>
            <p class="text-[10px] text-slate-400 leading-relaxed">
                <strong>Disclaimer:</strong> Hasil ini bersifat informatif yang diekstraksi menggunakan algoritma Computer Vision Graphology MAHIRKU. Laporan ini dirancang untuk pemetaan bakat karir digital dan dinamika kolaborasi tim, bukan merupakan diagnosis psikologis klinis. Untuk analisis mendalam, hubungi asesor terkait.
            </p>
        </div>
    </div>
</body>
</html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html }); 
    await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  } catch (error) {
    console.error('Error generating Graphology certificate:', error);
    throw error;
  }
};
