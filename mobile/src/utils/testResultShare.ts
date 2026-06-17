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
  description?: string;
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
  if (type === 'cst') return { a: '#3B82F6', b: '#2563EB', icon: '🧠', name: 'Cognitive Style' };
  if (type === 'disc') return { a: '#0EA5E9', b: '#0284C7', icon: '👥', name: 'DISC Personality' };
  return { a: '#0D9488', b: '#0F766E', icon: '✍️', name: 'Graphology' };
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
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=https://mahirku.com`;
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
        background: #F8FAFC;
        color: #0F172A;
      }
      .page {
        width: 100%;
        height: 100vh;
        position: relative;
        overflow: hidden;
      }
      .bg-pattern {
        position: absolute;
        top: 0; left: 0; right: 0; height: 600px;
        background: linear-gradient(135deg, ${theme.a} 0%, ${theme.b} 100%);
        z-index: 0;
      }
      .safe {
        position: relative;
        z-index: 1;
        width: 100%;
        height: 100%;
        padding: 90px 70px 70px 70px;
        display: flex;
        flex-direction: column;
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 40px;
        color: #FFFFFF;
      }
      .brand {
        display: flex;
        flex-direction: column;
      }
      .brandName {
        font-weight: 900;
        letter-spacing: 3px;
        font-size: 26px;
      }
      .brandSub {
        font-size: 16px;
        font-weight: 600;
        opacity: 0.9;
        margin-top: 4px;
      }
      .badge {
        padding: 10px 18px;
        border-radius: 999px;
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.4);
        font-weight: 700;
        font-size: 14px;
      }
      
      .hero-card {
        background: #FFFFFF;
        border-radius: 32px;
        padding: 50px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.06);
        border: 1px solid #E2E8F0;
        margin-bottom: 30px;
      }
      .label-top {
        color: ${theme.a};
        font-size: 14px;
        letter-spacing: 2px;
        font-weight: 800;
        text-transform: uppercase;
        margin-bottom: 12px;
      }
      .primary {
        font-weight: 900;
        color: #0F172A;
        font-size: 64px;
        line-height: 1.1;
        letter-spacing: -1px;
        margin-bottom: 16px;
        word-break: break-word;
      }
      .secondary {
        color: #475569;
        font-size: 22px;
        font-weight: 700;
        line-height: 1.4;
        margin-bottom: 24px;
        border-bottom: 2px solid #F1F5F9;
        padding-bottom: 24px;
      }
      .description {
        color: #334155;
        font-size: 18px;
        line-height: 1.6;
        margin-bottom: 24px;
      }
      
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }
      .chip {
        padding: 14px 20px;
        border-radius: 16px;
        background: #F1F5F9;
        color: #0F172A;
        font-size: 16px;
        font-weight: 700;
        border: 1px solid #E2E8F0;
      }
      
      .footer {
        margin-top: auto;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        background: #FFFFFF;
        padding: 30px 40px;
        border-radius: 28px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.04);
        border: 1px solid #E2E8F0;
      }
      .who {
        flex: 1;
      }
      .label-footer {
        color: #64748B;
        font-size: 13px;
        letter-spacing: 1.5px;
        font-weight: 700;
        text-transform: uppercase;
        margin-bottom: 8px;
      }
      .name {
        color: #0F172A;
        font-weight: 900;
        font-size: 24px;
        margin-bottom: 8px;
      }
      .meta {
        color: #475569;
        font-size: 15px;
        line-height: 1.5;
      }
      .qrWrap {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 20px;
      }
      .qr-text {
        text-align: right;
      }
      .hint {
        color: #0F172A;
        font-weight: 800;
        font-size: 13px;
        letter-spacing: 1px;
        margin-bottom: 4px;
      }
      .site {
        color: ${theme.a};
        font-weight: 800;
        font-size: 16px;
      }
      .qr {
        width: 100px;
        height: 100px;
        border-radius: 16px;
        border: 2px solid #E2E8F0;
        background: #FFFFFF;
        padding: 6px;
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="bg-pattern"></div>
      <div class="safe">
        <div class="header">
          <div class="brand">
            <div class="brandName">MAHIRKU</div>
            <div class="brandSub">${escapeHtml(theme.name)} Result</div>
          </div>
          <div class="badge">${dateLabel ? escapeHtml(dateLabel) : 'Hasil Tes'}</div>
        </div>

        <div class="hero-card">
          <div class="label-top">HASIL UTAMA</div>
          <div class="primary">${primary}</div>
          ${secondary ? `<div class="secondary">${secondary}</div>` : ''}
          ${payload.description ? `<div class="description">${escapeHtml(payload.description)}</div>` : ''}
          ${highlightHtml}
        </div>

        <div class="footer">
          <div class="who">
            <div class="label-footer">MILIK PENGGUNA</div>
            <div class="name">${userName}</div>
            <div class="meta">
              Pindai QR code di samping untuk mencoba tes ini atau kunjungi situs kami.
            </div>
          </div>
          <div class="qrWrap">
            <div class="qr-text">
              <div class="hint">COBA MAHIRKU</div>
              <div class="site">mahirku.com</div>
            </div>
            <img class="qr" src="${qrUrl}" />
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
  `;

  const { uri } = await Print.printToFileAsync({ html, width: 1080, height: 1920 });
  await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
};
