import axiosClient from '../../api/axiosClient';
import type { Voucher, VoucherFormData } from './types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const voucherApi = {
  getVouchers: async (): Promise<Voucher[]> => {
    const res = await axiosClient.get<ApiResponse<Voucher[]>>('/promotions');
    return res.data.data;
  },

  getActiveVouchers: async (): Promise<Voucher[]> => {
    const res = await axiosClient.get<ApiResponse<Voucher[]>>('/promotions/active');
    return res.data.data;
  },

  createVoucher: async (data: VoucherFormData): Promise<Voucher> => {
    const res = await axiosClient.post<ApiResponse<Voucher>>('/promotions', data);
    return res.data.data;
  },

  updateVoucher: async (id: number, data: VoucherFormData): Promise<Voucher> => {
    const res = await axiosClient.put<ApiResponse<Voucher>>(`/promotions/${id}`, data);
    return res.data.data;
  },

  toggleVoucher: async (id: number): Promise<Voucher> => {
    const res = await axiosClient.patch<ApiResponse<Voucher>>(`/promotions/${id}/toggle`);
    return res.data.data;
  },

  deleteVoucher: async (id: number): Promise<void> => {
    await axiosClient.delete(`/promotions/${id}`);
  },
};
