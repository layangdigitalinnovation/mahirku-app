import api from "@/utils/axios";

export const getMitraDashboardStats = async () => {
  return (await api.get("/mitra/dashboard")).data;
};

export const getMitraMembers = async () => {
  return (await api.get("/mitra/members")).data;
};

export const addMitraMember = async (data: any) => {
  return (await api.post("/mitra/members", data)).data;
};
