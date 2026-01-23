import { api } from './client';

export interface GoogleLoginResponse {
    message: string;
    token: string;
    user: {
        id: number;
        username: string;
        email: string;
        fullname: string;
        roleId: number;
        tokens: number;
    };
}

export const googleLogin = async (idToken: string): Promise<GoogleLoginResponse> => {
    const response = await api.post<GoogleLoginResponse>('/auth/google-login', { idToken });
    return response.data;
};
