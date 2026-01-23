import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
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
    testResultId: number;
}

export const generateCertificatePDF = async (data: CertificateData): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margin: 0
            });

            const chunks: Buffer[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Generate QR Code for verification
            const verificationUrl = process.env.NODE_ENV === 'production'
                ? `https://mahirku.com/verify-certificate/${data.certificateId}`
                : `http://localhost:5173/verify-certificate/${data.certificateId}`;

            const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
                width: 120,
                margin: 1,
                color: {
                    dark: '#4F46E5',
                    light: '#FFFFFF'
                }
            });

            const qrImageBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');

            // Colors
            const primaryColor = '#4F46E5'; // Indigo
            const accentColor = '#818CF8'; // Light indigo
            const goldColor = '#F59E0B'; // Amber/Gold
            const textColor = '#1E293B'; // Dark slate
            const lightBg = '#F8FAFC';

            const pageWidth = 842; // A4 landscape width
            const pageHeight = 595; // A4 landscape height

            // === BACKGROUND & DECORATIVE ELEMENTS ===

            // Subtle gradient background
            doc.rect(0, 0, pageWidth, pageHeight)
                .fill(lightBg);

            // Decorative corner elements
            // Top left corner
            doc.moveTo(0, 0)
                .lineTo(100, 0)
                .lineTo(0, 100)
                .fill(primaryColor)
                .opacity(0.1);

            // Top right corner
            doc.moveTo(pageWidth, 0)
                .lineTo(pageWidth - 100, 0)
                .lineTo(pageWidth, 100)
                .fill(accentColor)
                .opacity(0.1);

            // Bottom left corner
            doc.moveTo(0, pageHeight)
                .lineTo(100, pageHeight)
                .lineTo(0, pageHeight - 100)
                .fill(accentColor)
                .opacity(0.1);

            // Bottom right corner
            doc.moveTo(pageWidth, pageHeight)
                .lineTo(pageWidth - 100, pageHeight)
                .lineTo(pageWidth, pageHeight - 100)
                .fill(primaryColor)
                .opacity(0.1);

            doc.opacity(1); // Reset opacity

            // Main border with gradient effect
            doc.roundedRect(40, 40, pageWidth - 80, pageHeight - 80, 10)
                .lineWidth(4)
                .strokeColor(primaryColor)
                .stroke();

            doc.roundedRect(50, 50, pageWidth - 100, pageHeight - 100, 8)
                .lineWidth(2)
                .strokeColor(accentColor)
                .stroke();

            // === HEADER SECTION ===

            // Header background with gradient simulation
            const headerHeight = 120;
            doc.rect(60, 60, pageWidth - 120, headerHeight)
                .fillAndStroke(primaryColor, primaryColor);

            // Gold accent line
            doc.rect(60, 60 + headerHeight - 4, pageWidth - 120, 4)
                .fill(goldColor);

            // Certificate title
            doc.fillColor('#FFFFFF')
                .fontSize(48)
                .font('Helvetica-Bold')
                .text('CERTIFICATE', 0, 85, { align: 'center', width: pageWidth });

            doc.fontSize(22)
                .font('Helvetica')
                .text('OF ACHIEVEMENT', 0, 140, { align: 'center', width: pageWidth });

            // === CONTENT SECTION ===

            const contentStartY = 200;

            // Introductory text
            doc.fillColor(textColor)
                .fontSize(14)
                .font('Helvetica')
                .text('This is to proudly certify that', 0, contentStartY, { align: 'center', width: pageWidth });

            // User name with underline decoration
            const nameY = contentStartY + 35;
            doc.fillColor(primaryColor)
                .fontSize(36)
                .font('Helvetica-Bold')
                .text(data.userName, 0, nameY, { align: 'center', width: pageWidth });

            // Decorative underline for name
            const nameWidth = doc.widthOfString(data.userName);
            const nameLineStart = (pageWidth - nameWidth) / 2;
            doc.moveTo(nameLineStart, nameY + 45)
                .lineTo(nameLineStart + nameWidth, nameY + 45)
                .lineWidth(2)
                .strokeColor(goldColor)
                .stroke();

            // Achievement text
            const achievementY = nameY + 65;
            doc.fillColor(textColor)
                .fontSize(16)
                .font('Helvetica')
                .text('has successfully completed the', 0, achievementY, { align: 'center', width: pageWidth });

            doc.fontSize(28)
                .font('Helvetica-Bold')
                .fillColor(primaryColor)
                .text('Cognitive Style Assessment', 0, achievementY + 30, { align: 'center', width: pageWidth });

            // Result display box with enhanced styling
            const boxY = achievementY + 75;
            const boxWidth = 400;
            const boxHeight = 90;
            const boxX = (pageWidth - boxWidth) / 2;

            // Shadow effect
            doc.roundedRect(boxX + 4, boxY + 4, boxWidth, boxHeight, 12)
                .fill('#64748B')
                .opacity(0.1);

            doc.opacity(1);

            // Main box with gradient
            doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 12)
                .fillAndStroke('#FFFFFF', accentColor)
                .lineWidth(2);

            // Gold accent bar
            doc.roundedRect(boxX + 15, boxY + 15, 8, boxHeight - 30, 4)
                .fill(goldColor);

            doc.fillColor(primaryColor)
                .fontSize(14)
                .font('Helvetica-Bold')
                .text('Assessment Result', boxX, boxY + 20, { align: 'center', width: boxWidth });

            doc.fillColor(textColor)
                .fontSize(24)
                .font('Helvetica-Bold')
                .text(`${data.thinkingStyleType}`, boxX, boxY + 45, { align: 'center', width: boxWidth });

            doc.fillColor(accentColor)
                .fontSize(16)
                .font('Helvetica')
                .text(`(${data.thinkingStyleCode})`, boxX, boxY + 72, { align: 'center', width: boxWidth });

            // === FOOTER SECTION ===

            const footerY = pageHeight - 120;

            // Date
            doc.fillColor(textColor)
                .fontSize(11)
                .font('Helvetica')
                .text('Date of Completion:', 100, footerY, { continued: true })
                .font('Helvetica-Bold')
                .text(` ${data.testDate}`);

            // Certificate ID
            doc.font('Helvetica')
                .text('Certificate ID: ', pageWidth - 350, footerY, { continued: true, width: 250 })
                .font('Helvetica-Bold')
                .text(data.certificateId);

            // QR Code section
            const qrX = pageWidth - 180;
            const qrY = footerY + 30;

            // QR Code background
            doc.roundedRect(qrX - 10, qrY - 10, 140, 140, 8)
                .fillAndStroke('#FFFFFF', accentColor);

            // Add QR code image
            doc.image(qrImageBuffer, qrX, qrY, { width: 120, height: 120 });

            doc.fillColor(textColor)
                .fontSize(9)
                .font('Helvetica')
                .text('Scan to Verify', qrX + 25, qrY + 125);

            // Signature section
            const sigY = footerY + 45;

            // Signature line
            doc.moveTo(100, sigY + 40)
                .lineTo(280, sigY + 40)
                .strokeColor(textColor)
                .lineWidth(1.5)
                .stroke();

            doc.fontSize(10)
                .fillColor(textColor)
                .font('Helvetica-Bold')
                .text('Mahirku Platform', 100, sigY + 50)
                .font('Helvetica')
                .fontSize(9)
                .fillColor('#64748B')
                .text('Authorized by Cognitive Assessment Division', 100, sigY + 65);

            // Platform branding footer
            doc.fontSize(9)
                .fillColor(accentColor)
                .font('Helvetica')
                .text('© Mahirku – Professional Cognitive & Personality Assessment Platform', 0, pageHeight - 35, {
                    align: 'center',
                    width: pageWidth
                });

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
        certificateId: `CST-${result.id}-${Date.now().toString(36).toUpperCase()}`,
        testResultId: result.id
    };
};

// New function to verify certificate
export const verifyCertificate = async (certificateId: string) => {
    // Extract test result ID from certificate ID format: CST-{id}-{timestamp}
    const parts = certificateId.split('-');
    if (parts.length < 2 || parts[0] !== 'CST') {
        throw new Error('Invalid certificate ID format');
    }

    const testResultId = parseInt(parts[1]);

    const result = await ThinkingStyleResult.findByPk(testResultId, {
        include: [
            { model: User, attributes: ['fullname', 'username'] },
            { model: ThinkingStyle, as: 'thinkingStyle', attributes: ['type', 'code'] }
        ]
    });

    if (!result) {
        return null;
    }

    const user = (result as any).User;
    const thinkingStyle = (result as any).thinkingStyle;

    return {
        isValid: true,
        userName: user.fullname || user.username,
        testDate: new Date(result.createdAt).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        thinkingStyleType: thinkingStyle.type,
        thinkingStyleCode: thinkingStyle.code,
        certificateId: certificateId
    };
};
