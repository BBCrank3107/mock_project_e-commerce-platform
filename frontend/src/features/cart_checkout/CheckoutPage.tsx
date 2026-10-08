import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  LocalShippingOutlined,
  PaymentsOutlined,
  AccountBalanceOutlined,
} from '@mui/icons-material';
import { Controller, useForm } from 'react-hook-form';

const AVAILABLE_COUPONS = [
  { code: 'MOCKPROJECT', desc: 'Giảm 20% đơn từ 500k' },
  { code: 'WELCOME10', desc: 'Giảm 10% đơn từ 1tr' },
  { code: 'FREESHIP', desc: 'Giảm 5% đơn từ 500k' },
];
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/common/EmptyState';
import { PageHeading } from '../../components/common/PageHeading';
import { ProductImage } from '../../components/common/ProductImage';
import { useCart } from './CartContext';
import { CheckoutSteps } from './CheckoutSteps';
import { OrderSummary } from './OrderSummary';
import { checkoutSchema } from './checkoutSchema';
import { transactionApi, errorMessage, money } from './transactionApi';
import type { Coupon, CheckoutInput } from './types';
type Form = Omit<CheckoutInput, 'couponCode'>;
export function CheckoutPage() {
  const { cart, loading, busy, error: cartError, refresh } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const submitLock = useRef(false);
  const signature = JSON.stringify(cart?.items.map((i) => [i.productId, i.quantity, i.unitPrice]));
  const latestCart = useRef(signature);
  latestCart.current = signature;
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onBlur',
    defaultValues: { recipientName: user?.fullName || '', paymentMethod: 'COD' },
  });
  const paymentMethod = watch('paymentMethod');
  useEffect(() => {
    void refresh();
  }, [refresh]);
  useEffect(() => {
    setCoupon(null);
    setCouponError('');
  }, [signature]);
  const apply = async (targetCode?: string) => {
    const codeToApply = (targetCode || code).trim();
    if (!codeToApply) return;
    const current = signature;
    setApplying(true);
    setCoupon(null);
    setCouponError('');
    try {
      const result = await transactionApi.coupon(codeToApply);
      if (latestCart.current === current) setCoupon(result);
    } catch (err) {
      setCouponError(errorMessage(err));
    } finally {
      setApplying(false);
    }
  };
  const submit = async (values: Form) => {
    if (submitLock.current || applying || busy || loading) return;
    submitLock.current = true;
    setError('');
    try {
      const order = await transactionApi.checkout({ ...values, couponCode: coupon?.code });
      await refresh();
      navigate(`/orders/${order.id}/success`, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      await refresh();
    } finally {
      submitLock.current = false;
    }
  };
  const locked = isSubmitting || applying || busy;
  return (
    <Container sx={{ py: { xs: 4, md: 5 } }}>
      <CheckoutSteps active={1} />
      <PageHeading
        eyebrow="THE FINAL DETAILS"
        title="Sắp đến tay bạn."
        description="Hoàn thiện thông tin để chúng mình chuẩn bị đơn hàng."
        action={
          <Button component={Link} to="/cart" startIcon={<ArrowBack />}>
            Về giỏ hàng
          </Button>
        }
      />
      {cartError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={<Button onClick={() => void refresh()}>Thử lại</Button>}
        >
          {cartError}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {loading && !cart ? (
        <Skeleton variant="rounded" height={350} />
      ) : cart && !cart.items.length ? (
        <EmptyState
          title="Giỏ hàng chưa có sản phẩm"
          description="Thêm một lựa chọn yêu thích trước khi tiến hành thanh toán."
          action={
            <Button component={Link} to="/#collection" variant="contained">
              Khám phá sản phẩm
            </Button>
          }
        />
      ) : (
        !!cart?.items.length && (
          <Box
            component="form"
            onSubmit={handleSubmit(submit)}
            noValidate
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 370px' },
              gap: 4,
              alignItems: 'start',
            }}
          >
            <Stack spacing={3}>
              <Paper sx={{ p: { xs: 3, md: 4 } }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                  <LocalShippingOutlined color="primary" />
                  <Typography variant="h6">Thông tin nhận hàng</Typography>
                </Stack>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 2.5,
                  }}
                >
                  <TextField
                    label="Họ tên người nhận"
                    autoComplete="shipping name"
                    {...register('recipientName')}
                    error={!!errors.recipientName}
                    helperText={errors.recipientName?.message}
                    disabled={locked}
                  />
                  <TextField
                    label="Số điện thoại"
                    type="tel"
                    autoComplete="shipping tel"
                    {...register('phone')}
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    disabled={locked}
                  />
                  <TextField
                    label="Địa chỉ nhận hàng"
                    autoComplete="shipping street-address"
                    {...register('address')}
                    error={!!errors.address}
                    helperText={errors.address?.message || 'Số nhà, đường, phường/xã, quận/huyện'}
                    disabled={locked}
                    sx={{ gridColumn: '1 / -1' }}
                  />
                  <TextField
                    label="Tỉnh / Thành phố"
                    autoComplete="shipping address-level1"
                    {...register('city')}
                    error={!!errors.city}
                    helperText={errors.city?.message}
                    disabled={locked}
                    sx={{ gridColumn: '1 / -1' }}
                  />
                </Box>
              </Paper>
              <Paper sx={{ p: { xs: 3, md: 4 } }}>
                <Typography variant="h6" sx={{ mb: 2.5 }}>
                  Phương thức thanh toán
                </Typography>
                <Controller
                  name="paymentMethod"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field} aria-label="Phương thức thanh toán">
                      <Stack spacing={1.5}>
                        {[
                          {
                            value: 'COD',
                            label: 'Thanh toán khi nhận hàng',
                            note: 'Thanh toán trực tiếp khi nhận sản phẩm.',
                            icon: <PaymentsOutlined />,
                          },
                          {
                            value: 'BANKING',
                            label: 'Chuyển khoản ngân hàng',
                            note: 'Thanh toán chuyển khoản được xác nhận sau khi kiểm tra.',
                            icon: <AccountBalanceOutlined />,
                          },
                        ].map((method) => (
                          <Box
                            key={method.value}
                            sx={{
                              border: '1px solid',
                              borderColor:
                                field.value === method.value ? 'primary.main' : 'divider',
                              bgcolor: field.value === method.value ? '#f6f8f1' : '#fff',
                              borderRadius: 2,
                              px: 2,
                            }}
                          >
                            <FormControlLabel
                              disabled={locked}
                              value={method.value}
                              control={<Radio size="small" />}
                              sx={{ width: '100%', m: 0, py: 1.5 }}
                              label={
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                  <Box sx={{ color: 'primary.main', display: 'flex' }}>
                                    {method.icon}
                                  </Box>
                                  <Box>
                                    <Typography variant="body2" fontWeight={600}>
                                      {method.label}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {method.note}
                                    </Typography>
                                  </Box>
                                </Stack>
                              }
                            />
                          </Box>
                        ))}
                      </Stack>
                    </RadioGroup>
                  )}
                />
                {paymentMethod === 'BANKING' && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Đặt hàng thành công chưa đồng nghĩa khoản chuyển đã được xác nhận.
                  </Alert>
                )}
                <TextField
                  label="Lời nhắn cho đơn hàng (không bắt buộc)"
                  fullWidth
                  multiline
                  rows={2}
                  {...register('notes')}
                  error={!!errors.notes}
                  helperText={errors.notes?.message}
                  disabled={locked}
                  sx={{ mt: 3 }}
                />
              </Paper>
            </Stack>
            <OrderSummary
              subtotal={cart.subtotal}
              discount={coupon?.discountAmount || 0}
              action={
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  endIcon={<ArrowForward />}
                  disabled={
                    locked || loading || cart.items.some((i) => i.quantity > i.stockQuantity)
                  }
                >
                  {isSubmitting ? 'Đang xác nhận...' : 'Xác nhận đặt hàng'}
                </Button>
              }
            >
              <Stack spacing={2} sx={{ mb: 3 }}>
                {cart.items.map((i) => (
                  <Stack key={i.id} direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 1,
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      <ProductImage src={i.thumbnailUrl} alt={i.productName} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {i.productName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {i.quantity} × {money(i.unitPrice)}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
              {cart.items.some((i) => i.quantity > i.stockQuantity) && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Số lượng vượt tồn kho. Vui lòng điều chỉnh trong giỏ hàng.
                </Alert>
              )}
              <Divider sx={{ mb: 3 }} />
              <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                <TextField
                  label="Mã ưu đãi"
                  size="small"
                  value={code}
                  disabled={locked}
                  inputProps={{ maxLength: 50 }}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setCoupon(null);
                    setCouponError('');
                  }}
                />
                <Button
                  type="button"
                  variant="outlined"
                  disabled={!code.trim() || locked}
                  onClick={() => void apply()}
                  sx={{ flexShrink: 0 }}
                >
                  {applying ? 'Đang kiểm tra' : 'Áp dụng'}
                </Button>
              </Stack>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.8, fontWeight: 600 }}>
                  Mã ưu đãi có sẵn (bấm để chọn):
                </Typography>
                <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                  {AVAILABLE_COUPONS.map((c) => (
                    <Chip
                      key={c.code}
                      label={`${c.code}: ${c.desc}`}
                      size="small"
                      variant={code === c.code ? 'filled' : 'outlined'}
                      color={code === c.code ? 'primary' : 'default'}
                      onClick={() => {
                        setCode(c.code);
                        void apply(c.code);
                      }}
                      sx={{ fontSize: '0.72rem', cursor: 'pointer' }}
                    />
                  ))}
                </Stack>
              </Box>
              {couponError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {couponError}
                </Alert>
              )}
              {coupon && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Đã áp dụng {coupon.code}
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setCoupon(null);
                      setCode('');
                    }}
                    disabled={locked}
                  >
                    Bỏ mã
                  </Button>
                </Alert>
              )}
            </OrderSummary>
          </Box>
        )
      )}
    </Container>
  );
}
