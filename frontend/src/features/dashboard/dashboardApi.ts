import axiosClient from '../../api/axiosClient';
import type { DashboardResponse } from './types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardResponse> => {
    const res = await axiosClient.get<ApiResponse<DashboardResponse>>('/admin/dashboard/stats');
    return res.data.data;
  },
};
