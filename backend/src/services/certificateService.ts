import PDFDocument from 'pdfkit';
import ThinkingStyleResult from '../models/ThinkingStyleResult';
import User from '../models/User';
import ThinkingStyle from '../models/ThinkingStyle';

interface CertificateData {
    userName: string;
    testDate: string;
    thinkingStyleType: string;
    thinkingStyleCode: string;
    description: string;
    certificateId: string;
}

export const generateCertificatePDF = (data: CertificateData): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margin: 50
            });

            const chunks: Buffer[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Colors
            const primaryColor = '#4F46E5'; // Indigo
            const secondaryColor = '#818CF8'; // Light indigo
            const textColor = '#1E293B'; // Dark slate
            const lightGray = '#F1F5F9';

            // Header Background
            doc.rect(0, 0, 842, 150)
                .fillAndStroke(primaryColor, primaryColor);

            // Title
            doc.fillColor('#FFFFFF')
                .fontSize(36)
                .font('Helvetica-Bold')
                .text('CERTIFICATE', 0, 50, { align: 'center' });

            doc.fontSize(20)
                .font('Helvetica')
                .text('OF COMPLETION', 0, 95, { align: 'center' });

            // Decorative border
            doc.rect(40, 40, 762, 455)
                .lineWidth(3)
                .strokeColor(secondaryColor)
                .stroke();

            doc.rect(50, 50, 742, 435)
                .lineWidth(1)
                .strokeColor(lightGray)
                .stroke();

            // Main content
            doc.fillColor(textColor)
                .fontSize(16)
                .font('Helvetica')
                .text('This is to certify that', 0, 180, { align: 'center' });

            // User name
            doc.fillColor(primaryColor)
                .fontSize(32)
                .font('Helvetica-Bold')
                .text(data.userName, 0, 220, { align: 'center' });

            // Test info
            doc.fillColor(textColor)
                .fontSize(16)
                .font('Helvetica')
                .text('has successfully completed the', 0, 270, { align: 'center' });

            doc.fontSize(24)
                .font('Helvetica-Bold')
                .text('Cognitive Style Test', 0, 300, { align: 'center' });

            // Result box
            const boxY = 350;
            doc.roundedRect(250, boxY, 342, 80, 10)
                .fillAndStroke(lightGray, secondaryColor);

            doc.fillColor(primaryColor)
                .fontSize(14)
                .font('Helvetica-Bold')
                .text('Thinking Style:', 0, boxY + 20, { align: 'center' });

            doc.fillColor(textColor)
                .fontSize(20)
                .font('Helvetica-Bold')
                .text(`${data.thinkingStyleType} (${data.thinkingStyleCode})`, 0, boxY + 45, { align: 'center' });

            // Footer info
            const footerY = 470;
            doc.fillColor(textColor)
                .fontSize(12)
                .font('Helvetica')
                .text(`Date: ${data.testDate}`, 100, footerY);

            doc.text(`Certificate ID: ${data.certificateId}`, 0, footerY, { align: 'right', width: 742 });

            // Signature line
            doc.moveTo(550, 520)
                .lineTo(720, 520)
                .strokeColor(textColor)
                .stroke();

            doc.fontSize(10)
                .fillColor(textColor)
                .text('Authorized Signature', 550, 530);

            // Footer branding
            doc.fontSize(10)
                .fillColor(secondaryColor)
                .text('Mahirku Platform - Cognitive Assessment', 0, 560, { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

export const getCertificateData = async (testResultId: number): Promise<CertificateData> => {
    const result = await ThinkingStyleResult.findByPk(testResultId, {
        include: [
            { model: User },
            { model: ThinkingStyle, as: 'thinkingStyle' }
        ]
    });

    if (!result) {
        throw new Error('Test result not found');
    }

    const user = (result as any).User;
    const thinkingStyle = (result as any).thinkingStyle;

    return {
        userName: user.fullname || user.username,
        testDate: new Date(result.createdAt).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        thinkingStyleType: thinkingStyle.type,
        thinkingStyleCode: thinkingStyle.code,
        description: thinkingStyle.description,
        certificateId: `CST-${result.id}-${Date.now().toString(36).toUpperCase()}`
    };
};
