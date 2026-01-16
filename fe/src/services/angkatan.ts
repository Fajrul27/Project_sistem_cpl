import { api } from "@/lib/api";
import { Kurikulum } from "./kurikulum";

export interface Angkatan {
    id: string;
    tahun: number;
    isActive: boolean;
    kurikulumId?: string | null;
    kurikulum?: Kurikulum | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAngkatanData {
    tahun: number;
    isActive?: boolean;
    kurikulumId?: string | null;
}

export const getAllAngkatan = async () => {
    const response = await api.get('/angkatan');
    return response.data as Angkatan[];
};

export const createAngkatan = async (data: CreateAngkatanData) => {
    const response = await api.post('/angkatan', data);
    return response.data as Angkatan;
};

export const updateAngkatan = async (id: string, data: Partial<CreateAngkatanData>) => {
    const response = await api.put(`/angkatan/${id}`, data);
    return response.data as Angkatan;
};

export const deleteAngkatan = async (id: string) => {
    const response = await api.delete(`/angkatan/${id}`);
    return response.data as { message: string };
};
