import axiosClient from '../../api/axiosClient';
import type { NotificationItem } from './types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const notificationApi = {
  getMyNotifications: async (): Promise<NotificationItem[]> => {
    const res = await axiosClient.get<ApiResponse<NotificationItem[]>>('/notifications');
    return res.data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await axiosClient.get<ApiResponse<number>>('/notifications/unread-count');
    return res.data.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await axiosClient.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await axiosClient.patch('/notifications/read-all');
  },

  deleteNotification: async (id: number): Promise<void> => {
    await axiosClient.delete(`/notifications/${id}`);
  },
};
