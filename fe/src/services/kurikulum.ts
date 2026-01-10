import { api } from "@/lib/api";

export interface Kurikulum {
    id: string;
    nama: string;
    tahunMulai: number;
    tahunSelesai?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateKurikulumData {
    nama: string;
    tahunMulai: number;
    tahunSelesai?: number;
    isActive: boolean;
}

export const getAllKurikulum = async () => {
    const response = await api.get('/kurikulum');
    return response.data as Kurikulum[];
};

export const createKurikulum = async (data: CreateKurikulumData) => {
    const response = await api.post('/kurikulum', data);
    return response.data as Kurikulum;
};

export const updateKurikulum = async (id: string, data: Partial<CreateKurikulumData>) => {
    const response = await api.put(`/kurikulum/${id}`, data);
    return response.data as Kurikulum;
};

export const deleteKurikulum = async (id: string) => {
    const response = await api.delete(`/kurikulum/${id}`);
    return response.data as { message: string };
};
