import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { Add, ArrowBack, ArrowForward, DeleteOutline, Remove } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { PageHeading } from '../../components/common/PageHeading';
import { ProductImage } from '../../components/common/ProductImage';
import { CheckoutSteps } from './CheckoutSteps';
import { OrderSummary } from './OrderSummary';
import { useCart } from './CartContext';
import { money } from './transactionApi';
export function CartPage() {
  const { cart, loading, busy, error, refresh, update, remove } = useCart();
  const [deleting, setDeleting] = useState<number | null>(null);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const change = (id: number, quantity: number) => {
    void update(id, quantity).catch(() => {});
  };
  const confirmRemove = async () => {
    if (deleting === null) return;
    try {
      await remove(deleting);
      setDeleting(null);
    } catch {
      /* Context displays the error. */
    }
  };
  return (
    <Container sx={{ py: { xs: 4, md: 5 } }}>
      <CheckoutSteps active={0} />
      <PageHeading
        eyebrow="YOUR SELECTION"
        title="Những lựa chọn của bạn."
        description={
          cart ? `${cart.itemCount} sản phẩm trong giỏ hàng` : 'Cùng hoàn thiện lựa chọn của bạn.'
        }
        action={
          <Button component={Link} to="/#collection" startIcon={<ArrowBack />}>
            Tiếp tục khám phá
          </Button>
        }
      />
      {error && (
        <Alert
          severity="error"
          action={
            <Button onClick={() => void refresh()} disabled={busy}>
              Thử lại
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}
      {loading && !cart && <Skeleton variant="rounded" height={280} />}
      {!loading && !error && cart?.items.length === 0 && (
        <EmptyState
          title="Một khởi đầu mới cho giỏ hàng"
          description="Chọn thiết bị yêu thích từ bộ sưu tập. Chúng sẽ xuất hiện ở đây khi bạn thêm vào giỏ."
          action={
            <Button
              component={Link}
              to="/#collection"
              variant="contained"
              endIcon={<ArrowForward />}
            >
              Khám phá sản phẩm
            </Button>
          }
        />
      )}
      {!!cart?.items.length && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 350px' },
            gap: 4,
            alignItems: 'start',
          }}
        >
          <Paper sx={{ overflow: 'hidden' }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{
                px: 3,
                py: 2,
                bgcolor: '#fafbf7',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="overline" color="text.secondary">
                Sản phẩm
              </Typography>
              <Typography variant="overline" color="text.secondary">
                Thành tiền
              </Typography>
            </Stack>
            {cart.items.map((item) => (
              <Box
                key={item.id}
                sx={{
                  p: { xs: 2, sm: 3 },
                  '&:not(:last-child)': { borderBottom: '1px solid', borderColor: 'divider' },
                }}
              >
                <Stack direction="row" spacing={{ xs: 2, sm: 3 }}>
                  <Box
                    component={Link}
                    to={`/products/${item.productId}`}
                    sx={{
                      width: { xs: 80, sm: 112 },
                      height: { xs: 80, sm: 112 },
                      flexShrink: 0,
                      overflow: 'hidden',
                      borderRadius: 2,
                      bgcolor: '#f0f2e9',
                    }}
                  >
                    <ProductImage src={item.thumbnailUrl} alt={item.productName} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Typography
                        component={Link}
                        to={`/products/${item.productId}`}
                        variant="body2"
                        fontWeight={600}
                      >
                        {item.productName}
                      </Typography>
                      <IconButton
                        size="small"
                        aria-label={`Xóa ${item.productName}`}
                        disabled={busy || loading}
                        onClick={() => setDeleting(item.id)}
                      >
                        <DeleteOutline sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                      {money(item.unitPrice)}
                    </Typography>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      gap={1}
                      flexWrap="wrap"
                      sx={{ mt: 2 }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
                      >
                        <IconButton
                          size="small"
                          aria-label={`Giảm số lượng ${item.productName}`}
                          disabled={busy || loading || item.quantity <= 1}
                          onClick={() => change(item.id, item.quantity - 1)}
                        >
                          <Remove sx={{ fontSize: 16 }} />
                        </IconButton>
                        <Typography
                          aria-live="polite"
                          variant="body2"
                          sx={{ minWidth: 28, textAlign: 'center' }}
                        >
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          aria-label={`Tăng số lượng ${item.productName}`}
                          disabled={
                            busy ||
                            loading ||
                            item.quantity >= item.stockQuantity ||
                            item.quantity >= 999
                          }
                          onClick={() => change(item.id, item.quantity + 1)}
                        >
                          <Add sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Stack>
                      <Typography fontWeight={600}>{money(item.totalPrice)}</Typography>
                    </Stack>
                  </Box>
                </Stack>
                {item.quantity > item.stockQuantity && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Hiện còn {item.stockQuantity} sản phẩm. Vui lòng giảm số lượng hoặc xóa sản phẩm
                    để tiếp tục.
                  </Alert>
                )}
              </Box>
            ))}
          </Paper>
          <OrderSummary
            subtotal={cart.subtotal}
            action={
              <>
                <Button
                  component={Link}
                  to="/checkout"
                  variant="contained"
                  fullWidth
                  size="large"
                  endIcon={<ArrowForward />}
                  disabled={busy || loading || cart.items.some((i) => i.quantity > i.stockQuantity)}
                >
                  Tiến hành thanh toán
                </Button>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 2, display: 'block', textAlign: 'center' }}
                >
                  Bạn có thể áp dụng mã ưu đãi ở bước tiếp theo.
                </Typography>
              </>
            }
          />
        </Box>
      )}
      <ConfirmDialog
        open={deleting !== null}
        title="Bỏ sản phẩm khỏi giỏ?"
        message="Bạn có thể thêm lại sản phẩm bất cứ lúc nào từ bộ sưu tập."
        confirmText="Xóa khỏi giỏ"
        loading={busy}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void confirmRemove()}
      />
    </Container>
  );
}
