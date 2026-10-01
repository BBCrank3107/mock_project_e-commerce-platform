import axiosClient from '../../api/axiosClient';
import type { AuthResponse, LoginFormData, RegisterFormData, User } from './types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const authApi = {
  login: async (data: LoginFormData): Promise<AuthResponse> => {
    const response = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data.data;
  },

  register: async (data: RegisterFormData): Promise<AuthResponse> => {
    const response = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await axiosClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },
};
