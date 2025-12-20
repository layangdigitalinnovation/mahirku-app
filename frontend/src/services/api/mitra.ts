import api from "@/utils/axios";

export const getMitraDashboardStats = async () => {
  return (await api.get("/mitra/dashboard")).data;
};

export const getMitraMembers = async (params?: { page?: number; limit?: number; search?: string }) => {
  return (await api.get("/mitra/members", { params })).data;
};

export const addMitraMember = async (data: any) => {
  return (await api.post("/mitra/members", data)).data;
};

export const promoteMemberToAffiliator = async (id: number) => {
  return (await api.post(`/mitra/members/${id}/promote`)).data;
};
