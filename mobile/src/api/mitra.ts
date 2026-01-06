import { api } from './client';

export interface MitraDashboardStats {
    totalMembers: number;
    totalAffiliators: number;
    totalCommission: number;
    recentCommissions: RecentCommission[];
}

export interface RecentCommission {
    id: number;
    referrerId: number;
    referredUserId: number;
    amount: number;
    status: string;
    source: string;
    testCompleted: boolean;
    createdAt: string;
    referredUser?: {
        fullname: string;
        email: string;
    };
}

export const getMitraDashboardStats = () => api.get<MitraDashboardStats>('/mitra/dashboard');

export const getMitraReferralLink = () => {
    return api.get('/affiliate/referral-link');
};

export interface MitraMember {
    id: number;
    username: string;
    email: string;
    fullname: string;
    tokens: number;
    address: string;
    phoneNumber: string;
    parentId: number;
    createdAt: string;
    role?: {
        id: number;
        name: string;
    };
    totalCommissionGenerated: number;
}

export interface MitraMembersResponse {
    data: MitraMember[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const getMitraMembers = (params?: { page?: number; limit?: number; search?: string }) => {
    return api.get<MitraMembersResponse>('/mitra/members', { params });
};

export const promoteToAffiliator = (memberId: number) => {
    return api.post(`/mitra/members/${memberId}/promote`);
};
