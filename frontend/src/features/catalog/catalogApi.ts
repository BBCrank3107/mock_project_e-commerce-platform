import axiosClient from '../../api/axiosClient';
import type { Category, Product, PageResponse, Review, ProductFilterParams } from './types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const catalogApi = {
  getCategories: async (): Promise<Category[]> => {
    const res = await axiosClient.get<ApiResponse<Category[]>>('/categories');
    return res.data.data;
  },

  getProducts: async (params?: ProductFilterParams): Promise<PageResponse<Product>> => {
    const res = await axiosClient.get<ApiResponse<PageResponse<Product>>>('/products', {
      params,
    });
    return res.data.data;
  },

  getProductById: async (id: number): Promise<Product> => {
    const res = await axiosClient.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data.data;
  },

  createProduct: async (data: any): Promise<Product> => {
    const res = await axiosClient.post<ApiResponse<Product>>('/products', data);
    return res.data.data;
  },

  updateProduct: async (id: number, data: any): Promise<Product> => {
    const res = await axiosClient.put<ApiResponse<Product>>(`/products/${id}`, data);
    return res.data.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await axiosClient.delete(`/products/${id}`);
  },

  uploadProductImage: async (
    id: number,
    file: File,
    isThumbnail: boolean = false
  ): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isThumbnail', String(isThumbnail));

    const res = await axiosClient.post<ApiResponse<string>>(
      `/products/${id}/upload-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data.data;
  },

  getReviews: async (productId: number): Promise<Review[]> => {
    const res = await axiosClient.get<ApiResponse<Review[]>>(`/products/${productId}/reviews`);
    return res.data.data;
  },

  addReview: async (productId: number, data: { rating: number; comment: string }): Promise<Review> => {
    const res = await axiosClient.post<ApiResponse<Review>>(`/products/${productId}/reviews`, data);
    return res.data.data;
  },
};
