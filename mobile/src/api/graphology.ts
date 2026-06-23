import { api } from './client';

export interface GraphologyUploadResponse {
    status: string;
    test_id: string;
    message?: string;
}

export interface GraphologyResultData {
    status: string;
    message?: string;
    type_id?: string;
    title?: string;
    subtitle?: string;
    match_score?: string;
    summary?: string;
    brain_process?: string;
    work_environment?: string;
    traits?: string[];
    strengths?: string[];
    challenges?: string[];
    careers?: string[];
    collab_tips?: string[];
    conflict_risks?: string[];
    dev_tips?: string[];
    extracted_text?: string;
}

export const graphologyApi = {
    uploadImage: async (imageUri: string, userId: number): Promise<GraphologyUploadResponse> => {
        const formData = new FormData();

        // Extract filename and infer type from URI
        const filename = imageUri.split('/').pop() || 'upload.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('image', {
            uri: imageUri,
            name: filename,
            type
        } as any);

        formData.append('user_id', userId.toString());

        // Send using the pre-configured api instance to automatically attach Authorization token
        const response = await api.post(`/graphology/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            transformRequest: (data) => data, // Prevent axios from stringifying FormData
        });
        return response.data;
    },

    getResult: async (testId: string): Promise<GraphologyResultData> => {
        const response = await api.get(`/graphology/result/${testId}`);
        return response.data;
    },
};
