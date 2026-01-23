import { Request, Response } from 'express';
import { generateCertificatePDF, getCertificateData, verifyCertificate as verifyCertificateService } from '../services/certificateService';

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

export const verifyCertificate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { certificateId } = req.params;

        const verificationData = await verifyCertificateService(certificateId);

        if (!verificationData) {
            res.status(404).json({
                isValid: false,
                message: 'Certificate not found'
            });
            return;
        }

        res.status(200).json(verificationData);
    } catch (error: any) {
        console.error('Verify certificate error:', error);
        res.status(500).json({
            isValid: false,
            message: 'Failed to verify certificate',
            error: error.message
        });
    }
};
