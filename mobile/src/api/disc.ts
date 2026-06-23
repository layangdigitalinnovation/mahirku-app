import { api as client } from './client';

export interface DiscOption {
    id: number;
    text: string;
    value: string;
}

export interface DiscQuestion {
    id: number;
    question_order: number;
    options: DiscOption[];
}

export interface DiscResultData {
    id?: number;
    dScore: number;
    iScore: number;
    sScore: number;
    cScore: number;
    dominantType: string;
}

export const getDiscQuestions = async (): Promise<DiscQuestion[]> => {
    const response = await client.get('/disc/questions');
    return response.data;
};

export const submitDiscTest = async (answers: number[]): Promise<{ message: string; result: DiscResultData }> => {
    const response = await client.post('/disc/submit', { answers });
    return response.data;
};

export type DiscAiReportResponse = {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    report: any | null;
    error: string | null;
    generatedAt: string | null;
};

export const getDiscAiReport = (resultId: number) =>
    client.get<{ message: string; data: DiscAiReportResponse }>(`/disc/ai-report/${resultId}`);

