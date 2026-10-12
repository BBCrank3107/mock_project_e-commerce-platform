export interface CartLine {
  id: number; productId: number; productName: string; thumbnailUrl: string;
  quantity: number; unitPrice: number; totalPrice: number; stockQuantity: number;
}
export interface Cart { id: number; items: CartLine[]; subtotal: number; itemCount: number }
export interface Coupon { promotionId: number; code: string; discountAmount: number; finalAmount: number }
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
export interface Order {
  id: number; orderCode: string; userId: number; customerName: string;
  totalAmount: number; discountAmount: number; finalAmount: number;
  status: OrderStatus; notes: string; createdAt: string;
  items: { productId: number; productName: string; thumbnailUrl: string; quantity: number; unitPrice: number; totalPrice: number }[];
  shipping: { recipientName: string; phone: string; address: string; city: string; shippingStatus: string } | null;
  payment: { paymentMethod: string; paymentStatus: string; amount: number } | null;
}
export interface Page<T> { content: T[]; pageNumber: number; pageSize: number; totalElements: number; totalPages: number }
export interface CheckoutInput { recipientName: string; phone: string; address: string; city: string; couponCode?: string; paymentMethod: 'COD' | 'BANKING'; notes?: string }
