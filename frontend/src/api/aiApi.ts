import axiosClient from './axiosClient';

export interface ProductSummary {
  id: number;
  name: string;
  price: number;
  discountPrice?: number;
  thumbnailUrl?: string;
  description?: string;
}

export interface ChatResponse {
  reply: string;
  recommendedProducts: ProductSummary[];
  suggestedQuestions: string[];
  source: string;
}

export const aiApi = {
  chat: async (message: string): Promise<ChatResponse> => {
    const res = await axiosClient.post<{ data: ChatResponse }>('/ai/chat', { message });
    return res.data.data;
  },
  getSuggestions: async (): Promise<string[]> => {
    const res = await axiosClient.get<{ data: string[] }>('/ai/suggestions');
    return res.data.data;
  },
};
