import api from '../../utils/axios';

export interface DiscOption {
    id?: number;
    text: string;
    value: 'D' | 'I' | 'S' | 'C';
}

export interface DiscQuestion {
    id: number;
    question_order: number;
    options: DiscOption[];
}

export interface GetQuestionsResponse {
    questions: DiscQuestion[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const getAdminDiscQuestions = async (page: number = 1, limit: number = 10): Promise<GetQuestionsResponse> => {
    const response = await api.get(`/admin/disc/questions?page=${page}&limit=${limit}`);
    return response.data;
};

export const createDiscQuestion = async (data: { question_order: number; options: DiscOption[] }) => {
    const response = await api.post('/admin/disc/questions', data);
    return response.data;
};

export const updateDiscQuestion = async (id: number, data: { question_order?: number; options?: DiscOption[] }) => {
    const response = await api.put(`/admin/disc/questions/${id}`, data);
    return response.data;
};

export const deleteDiscQuestion = async (id: number) => {
    const response = await api.delete(`/admin/disc/questions/${id}`);
    return response.data;
};

export const reorderDiscQuestions = async (orders: { id: number; question_order: number }[]) => {
    const response = await api.put('/admin/disc/questions/reorder', { orders });
    return response.data;
};
