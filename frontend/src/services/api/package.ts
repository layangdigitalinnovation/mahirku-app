import api from "@/utils/axios";
import { PackagePayload } from "./types";

export const addPackage = async (data: PackagePayload) => {
  return await api.post("/package", data);
};

export const getPackages = async () => {
  return (await api.get("/package")).data.data;
};

export const getOnePackage = async (id: number) => {
  return (await api.get(`/package/${id}`)).data;
};

export const updatePackage = async (id: number, data: PackagePayload) => {
  return (await api.put(`/package/${id}`, data)).data;
};

export const deletePackage = async (id: number) => {
  return (await api.delete(`/package/${id}`)).data;
};
