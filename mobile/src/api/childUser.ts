import { api } from './client';

export interface ChildUser {
    id: number;
    username: string;
    email: string;
    fullname: string;
    tokens: number;
    address: string;
    phoneNumber: string;
    parentId: number;
    createdAt: string;
    updatedAt: string;
}

export interface AddChildPayload {
    username: string;
    email: string;
    fullname: string;
    address: string;
    phoneNumber: string;
    password: string;
}

export interface TransferTokenPayload {
    childId: number;
    tokenAmount: number;
}

export const addChildUser = async (payload: AddChildPayload) => {
    const response = await api.post('/tokens/add-child', payload);
    return response.data;
};

export const getChildrenUsers = async (): Promise<ChildUser[]> => {
    const response = await api.get('/tokens/children');
    return response.data;
};

export const transferTokenToChild = async (payload: TransferTokenPayload) => {
    const response = await api.post('/tokens/transfer-token', payload);
    return response.data;
};
