import { api } from './client';

export interface AffiliateBalance {
    totalEarned: number;
    withdrawn: number;
    available: number;
}

export interface AffiliateStats {
    balance: AffiliateBalance;
    statistics: {
        totalTests: number;
        totalTokenPurchaseCommissions: number;
        totalCommissions: number;
    };
    recentCommissions: AffiliateCommission[];
    recentWithdraws: WithdrawRequest[];
}

export interface AffiliateCommission {
    id: number;
    referrerId: number;
    referredUserId: number;
    amount: number;
    status: string;
    source: string;
    testCompleted: boolean;
    createdAt: string;
    referredUser?: {
        id: number;
        fullname: string;
        email: string;
    };
}

export interface WithdrawRequest {
    id: number;
    affiliateId: number;
    amount: number;
    status: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    note?: string;
    createdAt: string;
    updatedAt: string;
}

export const getReferralLink = () => api.get('/affiliate/referral-link');

export const getAffiliateStats = () => api.get<AffiliateStats>('/affiliate/stats');

export const requestWithdraw = (data: {
    amount: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
}) => api.post('/affiliate/withdraw', data);
