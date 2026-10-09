import axiosClient from '../../api/axiosClient';
import type { WishlistItem, WishlistToggleResponse } from './types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const wishlistApi = {
  getMyWishlist: async (): Promise<WishlistItem[]> => {
    const res = await axiosClient.get<ApiResponse<WishlistItem[]>>('/wishlists');
    return res.data.data;
  },

  getWishlistIds: async (): Promise<number[]> => {
    const res = await axiosClient.get<ApiResponse<number[]>>('/wishlists/ids');
    return res.data.data;
  },

  toggleWishlist: async (productId: number): Promise<WishlistToggleResponse> => {
    const res = await axiosClient.post<ApiResponse<WishlistToggleResponse>>(
      `/wishlists/toggle/${productId}`
    );
    return res.data.data;
  },

  addToWishlist: async (productId: number): Promise<string> => {
    const res = await axiosClient.post<ApiResponse<string>>(`/wishlists/${productId}`);
    return res.data.data;
  },

  removeFromWishlist: async (productId: number): Promise<string> => {
    const res = await axiosClient.delete<ApiResponse<string>>(`/wishlists/${productId}`);
    return res.data.data;
  },

  checkWishlist: async (productId: number): Promise<boolean> => {
    const res = await axiosClient.get<ApiResponse<boolean>>(`/wishlists/check/${productId}`);
    return res.data.data;
  },
};
