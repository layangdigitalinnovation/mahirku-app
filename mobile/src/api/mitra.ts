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
    // Mitra uses same endpoint as affiliator for referral link
    return api.get('/affiliate/referral-link');
};
