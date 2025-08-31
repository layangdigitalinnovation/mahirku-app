import api from "@/utils/axios"

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

export const getAllThinkingStyleTest = async () => {
    const res = await api.get("thinking-style/history")
    return res.data.data
}