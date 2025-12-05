import api from "@/utils/axios";



export const getReferralLink = async () => (await api.get<{referralLink : string}>('/affiliate/referral-link')).data


// Tambah Komisi
export const addCommission = async (payload: { testId: string }) => {
  const { data } = await api.post("/affiliate/add-commission", payload);
  return data;
};

// Statistik Affiliate
export const fetchAffiliateStats = async () => {
  const { data } = await api.get("/affiliate/stats");
  return data;
};

// Balance Detail
export const fetchAffiliateBalanceDetail = async () => {
  const { data } = await api.get("/affiliate/balance");
  return data;
};

// Breakdown Komisi
export const fetchCommissionBreakdown = async () => {
  const { data } = await api.get("/affiliate/commission-breakdown");
  return data;
};

