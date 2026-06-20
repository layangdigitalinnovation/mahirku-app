import html2pdf from 'html2pdf.js';

interface CertificateData {
  studentName: string;
  courseName: string;
  completionDate: string;
  certificateId: string;
  resultTitle?: string;
  resultDescription?: string;
}

export const generateCertificatePDF = async (data: CertificateData, fileName: string = 'Sertifikat_Mahirku.pdf') => {
  const { studentName, courseName, completionDate, certificateId, resultTitle } = data;

  const html = `
    <div style="width: 1122px; height: 793px; display: flex; justify-content: center; align-items: center; padding: 40px; box-sizing: border-box; background-color: #f7fafc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <div style="width: 100%; height: 100%; border: 10px solid #4F46E5; padding: 5px; box-sizing: border-box; background: white; position: relative;">
        <div style="width: 100%; height: 100%; border: 2px solid #C7D2FE; box-sizing: border-box; padding: 40px; display: flex; flex-direction: column; align-items: center; text-align: center; background-image: radial-gradient(#EEF2FF 1px, transparent 1px); background-size: 20px 20px;">
          
          <div style="font-size: 24px; font-weight: 800; color: #4F46E5; letter-spacing: 2px; margin-bottom: 30px; text-transform: uppercase;">
            MAHIRKU
          </div>
          
          <div style="font-size: 48px; font-weight: 700; color: #1E293B; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 10px; border-bottom: 4px solid #F59E0B; padding-bottom: 10px;">
            Certificate
          </div>
          <div style="font-size: 18px; color: #64748B; margin-bottom: 40px; letter-spacing: 1px;">
            OF COMPLETION
          </div>

          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="font-size: 16px; color: #64748B; margin-bottom: 10px; font-style: italic;">
              This is to certify that
            </div>
            <div style="font-size: 42px; font-weight: 700; color: #1E293B; margin-bottom: 20px; font-family: 'Times New Roman', serif;">
              ${studentName}
            </div>
            
            <div style="font-size: 16px; color: #64748B; margin-bottom: 10px;">
              has successfully completed the
            </div>
            <div style="font-size: 32px; font-weight: 700; color: #4F46E5; margin-bottom: 30px;">
              ${courseName}
            </div>

            ${resultTitle ? `
            <div style="background-color: #EEF2FF; border: 1px solid #C7D2FE; padding: 15px 40px; border-radius: 50px; margin-bottom: 30px;">
               <div style="font-size: 20px; color: #4F46E5; font-weight: 600;">${resultTitle}</div>
            </div>
            ` : ''}
          </div>

          <div style="width: 100%; display: flex; flex-direction: row; justify-content: space-between; align-items: flex-end; margin-top: 20px; border-top: 1px solid #E2E8F0; padding-top: 20px;">
            <div style="text-align: left;">
              ${completionDate ? `
              <div style="font-size: 12px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px;">Date Issued</div>
              <div style="font-size: 16px; color: #1E293B; font-weight: 600; margin-top: 5px;">${completionDate}</div>
              <div style="margin-top: 10px;"></div>
              ` : ''}
              <div style="font-size: 12px; color: #94A3B8; margin-top: 5px;">ID: ${certificateId}</div>
            </div>

            <div style="display: flex; flex-direction: row; align-items: center; gap: 15px;">
              <div style="text-align: right;">
                <div style="font-size: 14px; font-weight: 700; color: #1E293B;">MAHIRKU Verify</div>
                <div style="font-size: 12px; color: #64748B;">Official Document</div>
              </div>
              <div style="width: 60px; height: 60px; border: 2px solid #E2E8F0; padding: 2px; display: flex; justify-content: center; align-items: center; background-color: #F8FAFC;">
                <span style="font-size: 10px; color: #94A3B8; text-align: center;">Scan<br/>Valid</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;

  const container = document.createElement('div');
  // Hide the container off-screen so it doesn't affect the layout
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.innerHTML = html;
  
  // html2canvas requires the element to be in the DOM to compute styles properly
  document.body.appendChild(container);

  const opt: any = {
    margin: 0,
    filename: fileName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: true },
    jsPDF: { unit: 'px', format: [1122, 793], orientation: 'landscape' } // A4 Landscape roughly
  };

  try {
    await html2pdf().from(container.firstElementChild as HTMLElement).set(opt).save();
  } catch (error) {
    console.error('Error generating certificate:', error);
    
    // Fallback to window.print()
    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${fileName}</title>
              <style>
                @page { size: A4 landscape; margin: 0; }
                body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f7fafc; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              </style>
            </head>
            <body>
              ${html}
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                  }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        throw new Error("Popup blocked");
      }
    } catch (fallbackErr) {
      console.error("Fallback failed", fallbackErr);
      throw error;
    }
  } finally {
    // Always clean up the DOM
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};
