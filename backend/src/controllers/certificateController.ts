import { Request, Response } from 'express';
import { generateCertificatePDF, getCertificateData } from '../services/certificateService';

export const downloadCertificate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { testId } = req.params;
        const userId = (req as any).user.userId;

        // Get certificate data
        const certData = await getCertificateData(parseInt(testId));

        // Generate PDF
        const pdfBuffer = await generateCertificatePDF(certData);

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=cognitive-test-certificate-${testId}.pdf`);
        res.setHeader('Content-Length', pdfBuffer.length);

        // Send PDF
        res.send(pdfBuffer);
    } catch (error: any) {
        console.error('Download certificate error:', error);
        res.status(500).json({
            message: 'Failed to generate certificate',
            error: error.message
        });
    }
};
