import api from "@/utils/axios";
import { VoucherPayload } from "./types";

export const getAllVoucher = async () => {
  return (await api.get("/vouchers")).data.data;
};

export const createVoucher = async (data: VoucherPayload) => {
  return (await api.post("/vouchers", data)).data.data;
};

export const validateVoucher = async (code: string) => {
  const res = await api.get(`/vouchers/validate/${code}`);
  return res.data.data;
};

export const deleteVoucher = async (id: number) => {
  return (await api.delete(`/vouchers/${id}`)).data;
};
