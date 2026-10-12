import { useEffect, useState } from 'react';
import { Alert, Box, Button, Container, Divider, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from './CartContext';
import { transactionApi, errorMessage, money } from './transactionApi';
import type { Coupon, CheckoutInput } from './types';

const schema = z.object({
  recipientName: z.string().trim().min(1, 'Vui lòng nhập họ tên').max(150),
  phone: z.string().trim().regex(/^[+0-9][0-9 ()-]{8,19}$/, 'Số điện thoại không hợp lệ'),
  address: z.string().trim().min(1, 'Vui lòng nhập địa chỉ').max(2000),
  city: z.string().trim().min(1, 'Vui lòng nhập tỉnh/thành phố').max(100),
  paymentMethod: z.enum(['COD', 'BANKING']), notes: z.string().max(2000).optional(),
});
type Form = Omit<CheckoutInput, 'couponCode'>;
export function CheckoutPage() {
  const { cart, loading, error: cartError, refresh } = useCart(); const { user } = useAuth(); const navigate = useNavigate();
  const [code, setCode] = useState(''); const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState(''); const [applying, setApplying] = useState(false); const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema), mode: 'onBlur', defaultValues: { recipientName: user?.fullName || '', paymentMethod: 'COD' } });
  useEffect(() => { setCoupon(null); setCouponError(''); }, [cart?.subtotal]);
  const apply = async () => {
    setApplying(true); setCoupon(null); setCouponError('');
    try { setCoupon(await transactionApi.coupon(code.trim())); } catch (err) { setCouponError(errorMessage(err)); }
    finally { setApplying(false); }
  };
  const submit = async (values: Form) => {
    setError('');
    try {
      const order = await transactionApi.checkout({ ...values, couponCode: coupon?.code });
      await refresh(); navigate(`/orders/${order.id}/success`, { replace: true });
    } catch (err) { setError(errorMessage(err)); await refresh(); }
  };
  if (loading && !cart) return <Container sx={{ py: 4 }}><Typography>Đang tải giỏ hàng...</Typography></Container>;
  return <Container sx={{ py: 4 }}>
    <Typography variant="h4" fontWeight={700} gutterBottom>Thanh toán</Typography>
    {cartError && <Alert severity="error" action={<Button onClick={() => void refresh()}>Thử lại</Button>}>{cartError}</Alert>}
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {!cart?.items.length ? <Paper sx={{ p: 4 }}><Typography>Giỏ hàng đang trống hoặc chưa tải được.</Typography><Button component={Link} to="/cart">Quay lại giỏ hàng</Button></Paper> :
      <Box component="form" onSubmit={handleSubmit(submit)} noValidate>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
          <Paper sx={{ p: 3, flex: 1, width: '100%', boxSizing: 'border-box' }}>
            <Typography variant="h6" gutterBottom>Thông tin nhận hàng</Typography>
            <Stack spacing={2}>
              <TextField label="Họ tên người nhận" {...register('recipientName')} error={!!errors.recipientName} helperText={errors.recipientName?.message} disabled={isSubmitting} />
              <TextField label="Số điện thoại" {...register('phone')} error={!!errors.phone} helperText={errors.phone?.message} disabled={isSubmitting} />
              <TextField label="Địa chỉ" {...register('address')} error={!!errors.address} helperText={errors.address?.message} disabled={isSubmitting} />
              <TextField label="Tỉnh/Thành phố" {...register('city')} error={!!errors.city} helperText={errors.city?.message} disabled={isSubmitting} />
              <TextField select label="Phương thức thanh toán" defaultValue="COD" {...register('paymentMethod')} disabled={isSubmitting}><MenuItem value="COD">Thanh toán khi nhận hàng (COD)</MenuItem><MenuItem value="BANKING">Chuyển khoản ngân hàng</MenuItem></TextField>
              <Alert severity="info">Thanh toán chuyển khoản được ghi nhận ở trạng thái chờ xử lý. Đơn hàng chưa được xác nhận đã thanh toán.</Alert>
              <TextField label="Ghi chú" multiline rows={2} {...register('notes')} error={!!errors.notes} helperText={errors.notes?.message} disabled={isSubmitting} />
            </Stack>
          </Paper>
          <Paper sx={{ p: 3, width: { xs: '100%', md: 370 }, boxSizing: 'border-box' }}>
            <Typography variant="h6" gutterBottom>Đơn hàng của bạn</Typography>
            {cart.items.map(i => <Typography key={i.id} variant="body2" sx={{ mb: 1 }}>{i.productName} × {i.quantity} — {money(i.totalPrice)}</Typography>)}
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={1}><TextField label="Mã giảm giá" size="small" value={code} disabled={isSubmitting || applying} onChange={e => { setCode(e.target.value); setCoupon(null); setCouponError(''); }} /><Button type="button" disabled={!code.trim() || applying || isSubmitting} onClick={() => void apply()}>Áp dụng</Button></Stack>
            {couponError && <Alert severity="error" sx={{ mt: 1 }}>{couponError}</Alert>}
            {coupon && <Alert severity="success" sx={{ mt: 1 }}>Đã áp dụng {coupon.code}: giảm {money(coupon.discountAmount)}</Alert>}
            <Typography sx={{ mt: 2 }}>Tạm tính: {money(cart.subtotal)}</Typography>
            <Typography>Giảm giá: {money(coupon?.discountAmount || 0)}</Typography>
            <Typography variant="h6" sx={{ my: 2 }}>Tổng cộng: {money(coupon?.finalAmount ?? cart.subtotal)}</Typography>
            <Button type="submit" variant="contained" fullWidth disabled={isSubmitting || applying || loading || cart.items.some(i => i.quantity > i.stockQuantity)}>{isSubmitting ? 'Đang đặt hàng...' : 'Đặt hàng ngay'}</Button>
          </Paper>
        </Stack>
      </Box>}
  </Container>;
}
