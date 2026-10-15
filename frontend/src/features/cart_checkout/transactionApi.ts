import axios from 'axios';
import client from '../../api/axiosClient';
import type { Cart, Coupon, Order, Page, OrderStatus, CheckoutInput } from './types';
interface Response<T> {
  data: T;
}
export const transactionApi = {
  inventory: async (productId: number) =>
    (
      await client.get<Response<{ productId: number; stockQuantity: number }>>(
        `/inventory/${productId}`
      )
    ).data.data,
  cart: async () => (await client.get<Response<Cart>>('/cart')).data.data,
  add: async (productId: number, quantity = 1) =>
    (await client.post<Response<Cart>>('/cart/items', { productId, quantity })).data.data,
  update: async (id: number, quantity: number) =>
    (await client.put<Response<Cart>>(`/cart/items/${id}`, { quantity })).data.data,
  remove: async (id: number) =>
    (await client.delete<Response<Cart>>(`/cart/items/${id}`)).data.data,
  coupon: async (code: string) =>
    (await client.post<Response<Coupon>>('/promotions/apply', { code })).data.data,
  checkout: async (input: CheckoutInput, idempotencyKey?: string) =>
    (
      await client.post<Response<Order>>('/orders/checkout', input, {
        headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
      })
    ).data.data,
  myOrders: async (page = 0) =>
    (await client.get<Response<Page<Order>>>('/orders/my-orders', { params: { page, size: 10 } }))
      .data.data,
  order: async (id: number) => (await client.get<Response<Order>>(`/orders/${id}`)).data.data,
  cancel: async (id: number) =>
    (await client.post<Response<Order>>(`/orders/${id}/cancel`)).data.data,
  adminOrders: async (page: number, status: string) =>
    (
      await client.get<Response<Page<Order>>>('/admin/orders', {
        params: { page, size: 10, status: status || undefined },
      })
    ).data.data,
  status: async (id: number, status: OrderStatus) =>
    (await client.patch<Response<Order>>(`/admin/orders/${id}/status`, { status })).data.data,
};
export const money = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
export const errorMessage = (error: unknown) =>
  axios.isAxiosError(error)
    ? error.response?.data?.message || 'Không thể kết nối máy chủ. Vui lòng thử lại.'
    : 'Đã xảy ra lỗi. Vui lòng thử lại.';
