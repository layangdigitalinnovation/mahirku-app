import api from "@/utils/axios";

export interface AiReportResponse<T = any> {
  status: string;
  report: T | null;
  error: string | null;
  generatedAt: string | null;
}

export const getThinkingStyleAiReport = async (resultId: number): Promise<AiReportResponse> => {
  const res = await api.get(`thinking-style/ai-report/${resultId}`);
  return res.data.data;
};

export const getDiscAiReport = async (resultId: number): Promise<AiReportResponse> => {
  const res = await api.get(`disc/ai-report/${resultId}`);
  return res.data.data;
};

export const getGraphologyAiReport = async (resultId: number): Promise<AiReportResponse> => {
  const res = await api.get(`graphology/ai-report/${resultId}`);
  return res.data.data;
};
