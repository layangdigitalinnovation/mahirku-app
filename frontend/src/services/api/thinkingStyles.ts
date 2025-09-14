import api from "@/utils/axios"
import { ThinkingStyleResult } from "./types";

export interface ThinkingStyleRequest {
    fullname : string;
    birthdate : string;
    fingerPrintId? : string;
    referrerId? : string | null
}

export const submitThinkingStyleTest = async (data : ThinkingStyleRequest) => {
    const res = await api.post("thinking-style/submit", data)
    return res.data
}

export const getAllThinkingStyleTest = async () : Promise<ThinkingStyleResult[]> => {
    const res = await api.get("thinking-style/history")
    return res.data.data
}

export const downloadPDFTest = async (id : number) => {
    const res = await api.get(`thinking-style/pdf/${id}`, {
        responseType: "blob",
    })
    return res.data
}