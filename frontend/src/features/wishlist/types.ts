import type { Product } from '../catalog/types';

export interface WishlistItem {
  id: number;
  product: Product;
  createdAt: string;
}

export interface WishlistToggleResponse {
  productId: number;
  inWishlist: boolean;
  message: string;
}
