import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { Platform } from 'react-native';

interface CertificateData {
  studentName: string;
  courseName: string;
  completionDate: string;
  certificateId: string;
  resultTitle?: string;
  resultDescription?: string;
}

export const generateCertificatePDF = async (data: CertificateData) => {
  const { studentName, courseName, completionDate, certificateId, resultTitle } = data;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://mahirku.com/verify/certificate/${certificateId}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { size: landscape; margin: 0; }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f7fafc;
      -webkit-print-color-adjust: exact;
    }
    .container {
      width: 100%;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px;
      box-sizing: border-box;
    }
    .border-wrap {
      width: 100%;
      height: 100%;
      border: 10px solid #4F46E5;
      padding: 5px;
      box-sizing: border-box;
      background: white;
      position: relative;
    }
    .inner-border {
      width: 100%;
      height: 100%;
      border: 2px solid #C7D2FE;
      box-sizing: border-box;
      padding: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      background-image: radial-gradient(#EEF2FF 1px, transparent 1px);
      background-size: 20px 20px;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      color: #4F46E5;
      letter-spacing: 2px;
      margin-bottom: 40px;
      text-transform: uppercase;
    }
    .title {
      font-size: 48px;
      font-weight: 700;
      color: #1E293B;
      text-transform: uppercase;
      letter-spacing: 4px;
      margin-bottom: 10px;
      border-bottom: 4px solid #F59E0B;
      padding-bottom: 10px;
    }
    .subtitle {
      font-size: 18px;
      color: #64748B;
      margin-bottom: 40px;
      letter-spacing: 1px;
    }
    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .certifies {
      font-size: 16px;
      color: #64748B;
      margin-bottom: 10px;
      font-style: italic;
    }
    .student-name {
      font-size: 42px;
      font-weight: 700;
      color: #1E293B;
      margin-bottom: 20px;
      font-family: 'Times New Roman', serif;
    }
    .completed-text {
      font-size: 16px;
      color: #64748B;
      margin-bottom: 10px;
    }
    .course-name {
      font-size: 32px;
      font-weight: 700;
      color: #4F46E5;
      margin-bottom: 30px;
    }
    .result-box {
      background-color: #EEF2FF;
      border: 1px solid #C7D2FE;
      padding: 15px 40px;
      border-radius: 50px;
      margin-bottom: 40px;
    }
    .result-text {
      font-size: 20px;
      color: #4F46E5;
      font-weight: 600;
    }
    .footer {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 20px;
      border-top: 1px solid #E2E8F0;
      padding-top: 20px;
    }
    .date-section {
      text-align: left;
    }
    .date-label {
      font-size: 12px;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .date-value {
      font-size: 16px;
      color: #1E293B;
      font-weight: 600;
      margin-top: 5px;
    }
    .id-value {
      font-size: 12px;
      color: #94A3B8;
      margin-top: 5px;
    }
    .signature-section {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 15px;
    }
    .signature-text {
      text-align: right;
    }
    .auth-title {
      font-size: 14px;
      font-weight: 700;
      color: #1E293B;
    }
    .auth-subtitle {
      font-size: 12px;
      color: #64748B;
    }
    .qr-code {
      width: 60px;
      height: 60px;
      border: 2px solid #E2E8F0;
      padding: 2px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="border-wrap">
      <div class="inner-border">
        <div class="logo">MAHIRKU</div>
        
        <div class="title">Certificate</div>
        <div class="subtitle">OF COMPLETION</div>

        <div class="content">
          <div class="certifies">This is to certify that</div>
          <div class="student-name">${studentName}</div>
          
          <div class="completed-text">has successfully completed the</div>
          <div class="course-name">${courseName}</div>

          ${resultTitle ? `
          <div class="result-box">
             <div class="result-text">${resultTitle}</div>
          </div>
          ` : ''}
        </div>

        <div class="footer">
          <div class="date-section">
            ${completionDate ? `
            <div class="date-label">Date Issued</div>
            <div class="date-value">${completionDate}</div>
            ` : ''}
            <div class="id-value">ID: ${certificateId}</div>
          </div>

          <div class="signature-section">
            <div class="signature-text">
              <div class="auth-title">MAHIRKU Verify</div>
              <div class="auth-subtitle">Official Document</div>
            </div>
            <img src="${qrUrl}" class="qr-code" />
          </div>
        </div>

      </div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html, width: 842, height: 595 }); // A4 Landscape roughly
    await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  } catch (error) {
    console.error('Error generating certificate:', error);
    throw error;
  }
};
