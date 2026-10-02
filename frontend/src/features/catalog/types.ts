export interface Subcategory {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
  subcategories: Subcategory[];
}

export interface Product {
  id: number;
  subcategoryId: number;
  subcategoryName: string;
  categoryId: number;
  categoryName: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  discountPrice?: number;
  description?: string;
  thumbnailUrl: string;
  isActive: boolean;
  createdAt: string;
  imageUrls: string[];
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface Review {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  userAvatar?: string;
  productId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductFilterParams {
  keyword?: string;
  subcategoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  size?: number;
  isActive?: boolean;
}
