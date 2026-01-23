import { ChildUser } from "@/components/table/columns/childUserColumn";
import api from "@/utils/axios";
import { CreateUserPayload } from "./types";


export const getUserChilds = async () => {
  const response = await api.get<ChildUser[]>("/tokens/children");
  return response.data;
};

export const addChildUser = async (childUser: CreateUserPayload) => {
  const response = await api.post<ChildUser>("/tokens/add-child", childUser);
  return response.data;
}

export const transferTokenToChild = async ({ childUserId, tokenAmount }: { childUserId: number, tokenAmount: number }) => {
  const response = await api.post<ChildUser>("/tokens/transfer-token", { childId: childUserId, tokenAmount });
  return response.data;
}

export const purchaseToken = async ({ packageId, voucherCode }: { packageId: number, voucherCode?: string }) => {
  const response = await api.post<{
    message: string;
    paymentUrl: string | null;
    invoiceId: number;
    isFree?: boolean;
  }>("/tokens/purchase", { packageId, voucherCode });
  return response.data;
}
