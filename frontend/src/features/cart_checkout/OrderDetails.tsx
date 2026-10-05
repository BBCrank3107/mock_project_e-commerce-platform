import { Box, Chip, Divider, Stack, Typography } from '@mui/material';
import { money } from './transactionApi';
import type { Order, OrderStatus } from './types';
export const statusLabels: Record<OrderStatus, string> = { PENDING: 'Chờ duyệt', CONFIRMED: 'Đã xác nhận', SHIPPING: 'Đang giao', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy' };
export const nextStatuses: Record<OrderStatus, OrderStatus[]> = { PENDING: ['CONFIRMED', 'CANCELLED'], CONFIRMED: ['SHIPPING', 'CANCELLED'], SHIPPING: ['COMPLETED'], COMPLETED: [], CANCELLED: [] };
export function OrderStatusChip({ status }: { status: OrderStatus }) {
  return <Chip size="small" label={statusLabels[status]} color={status === 'PENDING' ? 'warning' : status === 'COMPLETED' ? 'success' : status === 'CANCELLED' ? 'error' : 'info'} />;
}
export function OrderDetails({ order }: { order: Order }) {
  return <Stack spacing={2}>
    <Typography sx={{ overflowWrap: 'anywhere' }} fontWeight={700}>{order.orderCode}</Typography>
    <Box><OrderStatusChip status={order.status} /></Box>
    <Typography>Người đặt: {order.customerName} · {new Date(order.createdAt).toLocaleString('vi-VN')}</Typography>
    {order.items.map((i, index) => <Stack key={`${i.productId}-${index}`} direction="row" spacing={2} alignItems="center">
      <Box component="img" src={i.thumbnailUrl} alt={i.productName} sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }} />
      <Box><Typography>{i.productName} × {i.quantity}</Typography><Typography>{money(i.unitPrice)} / sản phẩm · {money(i.totalPrice)}</Typography></Box>
    </Stack>)}
    <Divider /><Typography>Tạm tính: {money(order.totalAmount)} · Giảm giá: {money(order.discountAmount)}</Typography>
    <Typography fontWeight={700}>Tổng thanh toán: {money(order.finalAmount)}</Typography>
    {order.shipping && <Box><Typography fontWeight={600}>Giao hàng</Typography><Typography>{order.shipping.recipientName} · {order.shipping.phone}</Typography><Typography>{order.shipping.address}, {order.shipping.city}</Typography></Box>}
    {order.payment && <Typography>Thanh toán: {order.payment.paymentMethod} · {order.payment.paymentStatus === 'COMPLETED' ? 'Đã thanh toán' : order.payment.paymentStatus === 'FAILED' ? 'Đã hủy' : 'Chờ thanh toán'}</Typography>}
    {order.notes && <Typography>Ghi chú: {order.notes}</Typography>}
  </Stack>;
}
