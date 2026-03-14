import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { Share } from 'react-native';

export type ShareTestType = 'cst' | 'disc' | 'grp';

type SharePayload = {
  type: ShareTestType;
  userName: string;
  createdAtISO?: string;
  primary: string;
  secondary?: string;
  highlights?: string[];
};

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const formatDateId = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
};

const getTheme = (type: ShareTestType) => {
  if (type === 'cst') return { a: '#4F46E5', b: '#818CF8', icon: '🧠', name: 'Cognitive Style' };
  if (type === 'disc') return { a: '#0EA5E9', b: '#38BDF8', icon: '👥', name: 'DISC Personality' };
  return { a: '#8B5CF6', b: '#6366F1', icon: '✍️', name: 'Graphology' };
};

export const buildShareCaption = (payload: SharePayload) => {
  const theme = getTheme(payload.type);
  const primary = payload.primary.trim();
  const secondary = (payload.secondary || '').trim();
  const parts = [
    `Aku baru saja menyelesaikan ${theme.name} di Mahirku.`,
    primary ? `Hasilku: ${primary}${secondary ? ` — ${secondary}` : ''}` : '',
    'Coba juga tesnya di Mahirku:',
    'https://mahirku.com',
    '#Mahirku',
  ].filter(Boolean);
  return parts.join('\n');
};

export const shareResultText = async (payload: SharePayload) => {
  const message = buildShareCaption(payload);
  await Share.share({ message });
};

export const shareResultPosterPDF = async (payload: SharePayload) => {
  const theme = getTheme(payload.type);
  const dateLabel = formatDateId(payload.createdAtISO);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://mahirku.com`;
  const primary = escapeHtml(payload.primary);
  const secondary = payload.secondary ? escapeHtml(payload.secondary) : '';
  const userName = escapeHtml(payload.userName || 'Pengguna');
  const highlights = (payload.highlights || []).slice(0, 6).map(escapeHtml);
  const highlightHtml = highlights.length
    ? `
      <div class="chips">
        ${highlights.map((h) => `<div class="chip">${h}</div>`).join('')}
      </div>
    `
    : '';

  const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      @page { margin: 0; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        -webkit-print-color-adjust: exact;
        background: #0B1220;
      }
      .bg {
        width: 100%;
        height: 100vh;
        padding: 40px;
        background: radial-gradient(1200px 600px at 20% 10%, ${theme.b}33, transparent 55%),
                    radial-gradient(900px 500px at 90% 20%, ${theme.a}33, transparent 55%),
                    linear-gradient(135deg, #0B1220 0%, #0F172A 100%);
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .card {
        width: 840px;
        height: 520px;
        border-radius: 28px;
        overflow: hidden;
        position: relative;
        box-shadow: 0 30px 80px rgba(0,0,0,0.45);
        background: linear-gradient(135deg, ${theme.a} 0%, ${theme.b} 100%);
      }
      .glass {
        position: absolute;
        inset: 0;
        padding: 32px;
        background: linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.10) 100%);
      }
      .top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .brand {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .brandName {
        font-weight: 900;
        letter-spacing: 3px;
        color: rgba(255,255,255,0.95);
        font-size: 18px;
      }
      .brandSub {
        color: rgba(255,255,255,0.82);
        font-size: 14px;
      }
      .badge {
        padding: 10px 14px;
        border-radius: 999px;
        background: rgba(255,255,255,0.20);
        border: 1px solid rgba(255,255,255,0.25);
        color: rgba(255,255,255,0.92);
        font-weight: 700;
        font-size: 13px;
      }
      .main {
        margin-top: 34px;
        display: flex;
        gap: 28px;
        align-items: stretch;
      }
      .left {
        flex: 1;
        padding: 22px 24px;
        border-radius: 22px;
        background: rgba(15, 23, 42, 0.26);
        border: 1px solid rgba(255,255,255,0.20);
      }
      .label {
        color: rgba(255,255,255,0.82);
        font-size: 12px;
        letter-spacing: 1.6px;
        font-weight: 800;
      }
      .primary {
        margin-top: 10px;
        font-weight: 900;
        color: rgba(255,255,255,0.98);
        font-size: 46px;
        line-height: 1.05;
      }
      .secondary {
        margin-top: 10px;
        color: rgba(255,255,255,0.92);
        font-size: 18px;
        line-height: 1.35;
      }
      .chips {
        margin-top: 16px;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .chip {
        padding: 10px 12px;
        border-radius: 999px;
        background: rgba(255,255,255,0.18);
        border: 1px solid rgba(255,255,255,0.22);
        color: rgba(255,255,255,0.92);
        font-size: 13px;
        font-weight: 700;
      }
      .right {
        width: 260px;
        padding: 22px 22px;
        border-radius: 22px;
        background: rgba(255,255,255,0.14);
        border: 1px solid rgba(255,255,255,0.20);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .who {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .name {
        color: rgba(255,255,255,0.96);
        font-weight: 900;
        font-size: 18px;
      }
      .meta {
        color: rgba(255,255,255,0.86);
        font-size: 13px;
        line-height: 1.35;
      }
      .qrWrap {
        display: flex;
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
      }
      .qr {
        width: 120px;
        height: 120px;
        border-radius: 16px;
        border: 2px solid rgba(255,255,255,0.22);
        background: rgba(255,255,255,0.90);
        padding: 6px;
      }
      .hint {
        color: rgba(255,255,255,0.92);
        font-weight: 800;
        font-size: 12px;
        letter-spacing: 1px;
      }
      .watermark {
        position: absolute;
        right: -30px;
        bottom: -40px;
        font-size: 160px;
        opacity: 0.10;
        filter: blur(0.3px);
      }
    </style>
  </head>
  <body>
    <div class="bg">
      <div class="card">
        <div class="watermark">${theme.icon}</div>
        <div class="glass">
          <div class="top">
            <div class="brand">
              <div class="brandName">MAHIRKU</div>
              <div class="brandSub">${escapeHtml(theme.name)} Result</div>
            </div>
            <div class="badge">${dateLabel ? escapeHtml(dateLabel) : 'Hasil Tes'}</div>
          </div>
          <div class="main">
            <div class="left">
              <div class="label">HASIL UTAMA</div>
              <div class="primary">${primary}</div>
              ${secondary ? `<div class="secondary">${secondary}</div>` : ''}
              ${highlightHtml}
            </div>
            <div class="right">
              <div class="who">
                <div class="label">PEMILIK HASIL</div>
                <div class="name">${userName}</div>
                <div class="meta">
                  Bagikan hasil tes Anda untuk menginspirasi teman-teman mencoba Mahirku.
                </div>
              </div>
              <div class="qrWrap">
                <div class="hint">SCAN UNTUK COBA MAHIRKU</div>
                <img class="qr" src="${qrUrl}" />
                <div class="meta">mahirku.com</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
  `;

  const { uri } = await Print.printToFileAsync({ html, width: 1123, height: 794 });
  await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
};

