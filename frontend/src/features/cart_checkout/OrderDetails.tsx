import {
  Alert,
  Box,
  Chip,
  Divider,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { ProductImage } from '../../components/common/ProductImage';
import { money } from './transactionApi';
import type { Order, OrderStatus } from './types';
export const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Chờ duyệt',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};
export const nextStatuses: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPING', 'CANCELLED'],
  SHIPPING: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};
export function OrderStatusChip({ status }: { status: OrderStatus }) {
  return (
    <Chip
      size="small"
      label={statusLabels[status]}
      color={
        status === 'PENDING'
          ? 'warning'
          : status === 'COMPLETED'
            ? 'success'
            : status === 'CANCELLED'
              ? 'error'
              : 'info'
      }
      variant="outlined"
    />
  );
}
export function OrderDetails({ order }: { order: Order }) {
  const active = ['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED'].indexOf(order.status);
  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
        <Typography variant="h6">Đơn #{String(order.id).padStart(6, '0')}</Typography>
        <OrderStatusChip status={order.status} />
      </Stack>
      <Box>
        <Typography variant="caption" color="text.secondary">
          Mã tham chiếu
        </Typography>
        <Typography
          variant="body2"
          sx={{ overflowWrap: 'anywhere', fontFamily: 'monospace', fontSize: 12 }}
        >
          {order.orderCode}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(order.createdAt).toLocaleString('vi-VN')} · {order.customerName}
        </Typography>
      </Box>
      {order.status === 'CANCELLED' ? (
        <Alert severity="info">Đơn hàng đã hủy.</Alert>
      ) : (
        <Stepper
          activeStep={active}
          alternativeLabel
          sx={{ '& .MuiStepLabel-label': { fontSize: 11 } }}
        >
          {['Đã đặt', 'Xác nhận', 'Đang giao', 'Hoàn thành'].map((label, index) => (
            <Step key={label} completed={index < active || order.status === 'COMPLETED'}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}
      <Divider />
      {order.items.map((item, index) => (
        <Stack key={`${item.productId}-${index}`} direction="row" spacing={2} alignItems="center">
          <Box sx={{ width: 64, height: 64, flexShrink: 0, overflow: 'hidden', borderRadius: 1.5 }}>
            <ProductImage src={item.thumbnailUrl} alt={item.productName} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={500}>
              {item.productName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.quantity} × {money(item.unitPrice)}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
            {money(item.totalPrice)}
          </Typography>
        </Stack>
      ))}
      <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: '#f5f6f0' }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            Tạm tính
          </Typography>
          <Typography variant="body2">{money(order.totalAmount)}</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Giảm giá
          </Typography>
          <Typography variant="body2" color="success.main">
            −{money(order.discountAmount)}
          </Typography>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Stack direction="row" justifyContent="space-between">
          <Typography fontWeight={600}>Tổng thanh toán</Typography>
          <Typography fontWeight={600}>{money(order.finalAmount)}</Typography>
        </Stack>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
        {order.shipping && (
          <Box>
            <Typography variant="overline" color="text.secondary">
              Địa chỉ nhận hàng
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ mt: 1 }}>
              {order.shipping.recipientName}
            </Typography>
            <Typography variant="body2">{order.shipping.phone}</Typography>
            <Typography variant="body2" color="text.secondary">
              {order.shipping.address}, {order.shipping.city}
            </Typography>
          </Box>
        )}
        {order.payment && (
          <Box>
            <Typography variant="overline" color="text.secondary">
              Thanh toán
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {order.payment.paymentMethod === 'COD'
                ? 'Thanh toán khi nhận hàng'
                : 'Chuyển khoản ngân hàng'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {order.payment.paymentStatus === 'COMPLETED'
                ? 'Đã thanh toán'
                : order.payment.paymentStatus === 'FAILED'
                  ? 'Không thành công / đã hủy'
                  : 'Chờ thanh toán'}
            </Typography>
          </Box>
        )}
      </Box>
      {order.notes && (
        <Box>
          <Typography variant="overline" color="text.secondary">
            Ghi chú
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            {order.notes}
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
