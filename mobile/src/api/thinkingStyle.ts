import { api } from './client';

export interface SubmitTestRequest {
    fullname: string;
    birthdate: string;
    fingerprintId?: string;
    referrerId?: number;
    questionnaire?: any;
}

export interface ThinkingStyleResult {
    id: number;
    userId: number;
    fullname: string;
    birthdate: string;
    resultDigit: number;
    thinkingStyleId: number;
    createdAt: string;
    updatedAt: string;
    testType?: 'THINKING_STYLE' | 'DISC'; // Added to distinguish test type
    // DISC specific fields
    dScore?: number;
    iScore?: number;
    sScore?: number;
    cScore?: number;
    dominantType?: string;
    thinkingStyle?: {
        id: number;
        type: string;
        code: string;
        description: string;
        theory: string;
        detailPage: string;
    };
    questionnaire?: any;
    questionnairePercent?: number | null;
    aiReportStatus?: 'pending' | 'processing' | 'completed' | 'failed';
}

export const submitTest = (data: SubmitTestRequest) =>
    api.post<{ message: string; data: ThinkingStyleResult }>('/thinking-style/submit', data);

export const getHistory = () =>
    api.get<{ message: string; data: ThinkingStyleResult[] }>('/thinking-style/history');

export const downloadPDF = (resultId: number) =>
    api.get(`/thinking-style/pdf/${resultId}`, {
        responseType: 'blob' as any
    });

export type ThinkingStyleAiReportResponse = {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    report: any | null;
    error: string | null;
    generatedAt: string | null;
};

export const getAiReport = (resultId: number) =>
    api.get<{ message: string; data: ThinkingStyleAiReportResponse }>(`/thinking-style/ai-report/${resultId}`);
