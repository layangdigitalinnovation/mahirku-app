import { ChildUser } from "@/components/table/columns/childUserColumn";
import api from "@/utils/axios";
import { CreateUserPayload } from "./types";


export const getUserChilds = async () => {
  const response = await api.get<ChildUser[]>("/token/children");
  return response.data;
};

export const addChildUser = async (childUser: CreateUserPayload) => {
  const response = await api.post<ChildUser>("/token/add-child", childUser);
  return response.data;
}

export const transferTokenToChild = async ({ childUserId, tokenAmount } : {childUserId : number, tokenAmount : number}) => {
  const response = await api.post<ChildUser>("/token/transfer-token", { childId : childUserId, tokenAmount });
  return response.data;
}

export const purchaseToken = async ({packageId, voucherCode} : {packageId : number, voucherCode? : string}) => {
  const response = await api.post<{
    message : string;
    paymentUrl : string;
    invoiceId : number;
  }>("/token/purchase", { packageId, voucherCode});
  return response.data;
}

