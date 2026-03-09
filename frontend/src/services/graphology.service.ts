import axios from 'axios';

// Gunakan base url sesuai env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface GraphologyUploadResponse {
    status: string;
    test_id: string;
    message?: string;
}

export interface GraphologyResultData {
    status: string;
    message?: string;
    personality_type?: string;
    thinking_style?: string;
    emotional_tendency?: string;
    communication_style?: string;
    strengths?: string[];
    weaknesses?: string[];
    career_recommendations?: string[];
    extracted_text?: string;
}

export const graphologyService = {
    uploadImage: async (imageFile: File, userId: number): Promise<GraphologyUploadResponse> => {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('user_id', userId.toString());

        // Send with credentials to include any auth cookies/tokens if required
        const response = await axios.post(`${API_URL}/api/graphology/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            withCredentials: true,
        });
        return response.data;
    },

    getResult: async (testId: string): Promise<GraphologyResultData> => {
        const response = await axios.get(`${API_URL}/api/graphology/result/${testId}`, {
            withCredentials: true,
        });
        return response.data;
    },
};
