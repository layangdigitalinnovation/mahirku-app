import api from "@/utils/axios";
import { VoucherPayload } from "./types";

export const getAllVoucher = async () => {
  return (await api.get("/voucher")).data.data;
};

export const createVoucher = async (data: VoucherPayload) => {
  return (await api.post("/voucher", data)).data.data;
};

export const validateVoucher = async (code: string) => {
  const res = await api.get(`/voucher/validate/${code}`);
  return res.data.data;
};  

export const deleteVoucher = async (id: number) => {
  return (await api.delete(`/voucher/${id}`)).data;
};
