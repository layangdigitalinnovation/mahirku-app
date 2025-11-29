import api from "@/utils/axios";
import { PackagePayload } from "./types";

export const addPackage = async (data: PackagePayload) => {
  return await api.post("/packages", data);
};

export const getPackages = async () => {
  return (await api.get("/packages")).data.data;
};

export const getOnePackage = async (id: number) => {
  return (await api.get(`/packages/${id}`)).data;
};

export const updatePackage = async (id: number, data: PackagePayload) => {
  return (await api.put(`/packages/${id}`, data)).data;
};

export const deletePackage = async (id: number) => {
  return (await api.delete(`/packages/${id}`)).data;
};
