import { useState } from 'react';
import { Alert, Box, Button, Container, Divider, Paper, Stack, Typography, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useCart } from './CartContext';
import { money } from './transactionApi';

export function CartPage() {
  const { cart, loading, busy, error, refresh, update, remove } = useCart();
  const [deleting, setDeleting] = useState<number | null>(null);
  const change = (id: number, quantity: number) => { void update(id, quantity).catch(() => {}); };
  const confirmRemove = async () => { if (deleting === null) return; try { await remove(deleting); setDeleting(null); } catch { /* Error shown by cart context */ } };
  return <Container sx={{ py: 4 }}>
    <Typography variant="h4" fontWeight={700} gutterBottom>Giỏ hàng</Typography>
    {error && <Alert severity="error" action={<Button onClick={() => void refresh()}>Thử lại</Button>} sx={{ mb: 2 }}>{error}</Alert>}
    {loading && <CircularProgress />}
    {!loading && cart?.items.length === 0 && <Paper sx={{ p: 5, textAlign: 'center' }}><Typography>Giỏ hàng đang trống.</Typography><Button component={Link} to="/">Tiếp tục mua sắm</Button></Paper>}
    {!!cart?.items.length && <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
      <Paper sx={{ flex: 1, width: '100%', p: 2 }}>
        {cart.items.map(item => <Box key={item.id} sx={{ py: 2, borderBottom: '1px solid #e2e8f0' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box component="img" src={item.thumbnailUrl} alt={item.productName} sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 2 }} />
            <Box sx={{ flex: 1 }}><Typography component={Link} to={`/products/${item.productId}`} fontWeight={600}>{item.productName}</Typography><Typography>{money(item.unitPrice)}</Typography><Typography variant="caption">Còn {item.stockQuantity} sản phẩm</Typography></Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2, flexWrap: 'wrap' }}>
            <Button aria-label={`Giảm số lượng ${item.productName}`} disabled={busy || item.quantity <= 1} onClick={() => change(item.id, item.quantity - 1)}>−</Button>
            <Typography aria-live="polite">{item.quantity}</Typography>
            <Button aria-label={`Tăng số lượng ${item.productName}`} disabled={busy || item.quantity >= item.stockQuantity || item.quantity >= 999} onClick={() => change(item.id, item.quantity + 1)}>+</Button>
            <Typography sx={{ flex: 1 }} fontWeight={600}>{money(item.totalPrice)}</Typography>
            <Button color="error" disabled={busy} onClick={() => setDeleting(item.id)}>Xóa</Button>
          </Stack>
          {item.quantity > item.stockQuantity && <Alert severity="warning">Số lượng vượt tồn kho. Vui lòng giảm số lượng hoặc xóa sản phẩm.</Alert>}
        </Box>)}
      </Paper>
      <Paper sx={{ p: 3, width: { xs: '100%', md: 330 }, boxSizing: 'border-box' }}>
        <Typography variant="h6" gutterBottom>Tóm tắt đơn hàng</Typography>
        <Typography>Tạm tính: {money(cart.subtotal)}</Typography><Typography>Giảm giá: áp dụng tại bước thanh toán</Typography><Divider sx={{ my: 2 }} />
        <Typography fontWeight={700}>Tổng cộng: {money(cart.subtotal)}</Typography>
        <Button component={Link} to="/checkout" variant="contained" fullWidth sx={{ mt: 2 }} disabled={busy || loading || cart.items.some(i => i.quantity > i.stockQuantity)}>Tiến hành thanh toán</Button>
      </Paper>
    </Stack>}
    <ConfirmDialog open={deleting !== null} message="Bạn có chắc muốn xóa sản phẩm khỏi giỏ hàng?" loading={busy} onCancel={() => setDeleting(null)} onConfirm={() => void confirmRemove()} />
  </Container>;
}
