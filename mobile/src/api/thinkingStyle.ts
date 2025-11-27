import { api } from './client';

export interface SubmitTestRequest {
    fullname: string;
    birthdate: string;
    bloodType?: string;
    fingerprintId?: string;
    referrerId?: number;
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
    thinkingStyle?: {
        id: number;
        type: string;
        code: string;
        description: string;
        theory: string;
        detailPage: string;
    };
}

export const submitTest = (data: SubmitTestRequest) =>
    api.post<{ message: string; data: ThinkingStyleResult }>('/thinking-style/submit', data);

export const getHistory = () =>
    api.get<{ message: string; data: ThinkingStyleResult[] }>('/thinking-style/history');

export const downloadPDF = (resultId: number) =>
    api.get(`/thinking-style/pdf/${resultId}`, {
        responseType: 'blob' as any
    });
