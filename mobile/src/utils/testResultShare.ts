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
        background: #0B1220;
      }
      .page {
        width: 100%;
        height: 100vh;
        background:
          radial-gradient(900px 900px at 25% 10%, ${theme.b}40, transparent 60%),
          radial-gradient(900px 900px at 85% 20%, ${theme.a}45, transparent 60%),
          radial-gradient(1200px 900px at 50% 110%, rgba(255,255,255,0.10), transparent 55%),
          linear-gradient(180deg, #0B1220 0%, #0F172A 100%);
        position: relative;
        overflow: hidden;
      }
      .glow1 {
        position: absolute;
        width: 820px;
        height: 820px;
        left: -240px;
        top: -260px;
        background: radial-gradient(circle, ${theme.a}55, transparent 70%);
        filter: blur(2px);
        opacity: 0.9;
      }
      .glow2 {
        position: absolute;
        width: 920px;
        height: 920px;
        right: -340px;
        top: 120px;
        background: radial-gradient(circle, ${theme.b}55, transparent 72%);
        filter: blur(2px);
        opacity: 0.9;
      }
      .safe {
        position: relative;
        width: 100%;
        height: 100%;
        padding: 120px 86px 92px 86px;
        display: flex;
        flex-direction: column;
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 12px;
      }
      .brand {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .brandName {
        font-weight: 900;
        letter-spacing: 3px;
        color: rgba(255,255,255,0.95);
        font-size: 22px;
      }
      .brandSub {
        color: rgba(255,255,255,0.82);
        font-size: 16px;
        font-weight: 700;
      }
      .badge {
        padding: 12px 16px;
        border-radius: 999px;
        background: rgba(255,255,255,0.20);
        border: 1px solid rgba(255,255,255,0.25);
        color: rgba(255,255,255,0.92);
        font-weight: 700;
        font-size: 14px;
      }
      .hero {
        margin-top: 26px;
        padding: 34px 34px;
        border-radius: 34px;
        background: rgba(255,255,255,0.12);
        border: 1px solid rgba(255,255,255,0.18);
        box-shadow: 0 30px 80px rgba(0,0,0,0.28);
      }
      .label {
        color: rgba(255,255,255,0.82);
        font-size: 13px;
        letter-spacing: 2px;
        font-weight: 800;
      }
      .primary {
        margin-top: 10px;
        font-weight: 900;
        color: rgba(255,255,255,0.98);
        font-size: 78px;
        line-height: 1.03;
        letter-spacing: -1px;
        word-break: break-word;
      }
      .secondary {
        margin-top: 14px;
        color: rgba(255,255,255,0.92);
        font-size: 20px;
        line-height: 1.4;
        font-weight: 700;
      }
      .chips {
        margin-top: 18px;
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }
      .chip {
        padding: 12px 14px;
        border-radius: 999px;
        background: rgba(255,255,255,0.18);
        border: 1px solid rgba(255,255,255,0.22);
        color: rgba(255,255,255,0.92);
        font-size: 14px;
        font-weight: 700;
      }
      .footer {
        margin-top: auto;
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        justify-content: space-between;
        gap: 18px;
        padding-top: 22px;
      }
      .who {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 22px 22px;
        border-radius: 26px;
        background: rgba(255,255,255,0.10);
        border: 1px solid rgba(255,255,255,0.16);
        flex: 1;
      }
      .name {
        color: rgba(255,255,255,0.96);
        font-weight: 900;
        font-size: 20px;
      }
      .meta {
        color: rgba(255,255,255,0.86);
        font-size: 14px;
        line-height: 1.45;
      }
      .qrWrap {
        display: flex;
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
        padding: 22px 22px;
        border-radius: 26px;
        background: rgba(255,255,255,0.10);
        border: 1px solid rgba(255,255,255,0.16);
      }
      .qr {
        width: 200px;
        height: 200px;
        border-radius: 24px;
        border: 2px solid rgba(255,255,255,0.18);
        background: rgba(255,255,255,0.90);
        padding: 10px;
      }
      .hint {
        color: rgba(255,255,255,0.92);
        font-weight: 800;
        font-size: 12px;
        letter-spacing: 1.2px;
      }
      .watermark {
        position: absolute;
        right: -36px;
        bottom: -36px;
        font-size: 210px;
        opacity: 0.12;
        filter: blur(0.3px);
        pointer-events: none;
      }
      .site {
        color: rgba(255,255,255,0.92);
        font-weight: 900;
        font-size: 14px;
        letter-spacing: 0.6px;
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="glow1"></div>
      <div class="glow2"></div>
      <div class="watermark">${theme.icon}</div>
      <div class="safe">
        <div class="header">
          <div class="brand">
            <div class="brandName">MAHIRKU</div>
            <div class="brandSub">${escapeHtml(theme.name)} Result</div>
          </div>
          <div class="badge">${dateLabel ? escapeHtml(dateLabel) : 'Hasil Tes'}</div>
        </div>

        <div class="hero">
          <div class="label">HASIL UTAMA</div>
          <div class="primary">${primary}</div>
          ${secondary ? `<div class="secondary">${secondary}</div>` : ''}
          ${highlightHtml}
        </div>

        <div class="footer">
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
            <div class="site">mahirku.com</div>
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

