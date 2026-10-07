import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { PageHeading } from '../../components/common/PageHeading';
import { EmptyState } from '../../components/common/EmptyState';
import { ProductImage } from '../../components/common/ProductImage';
import { transactionApi, errorMessage, money } from './transactionApi';
import { OrderDetails, OrderStatusChip } from './OrderDetails';
import type { Order, Page } from './types';
export function MyOrdersPage() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Page<Order> | null>(null);
  const request = useRef(0);
  const [error, setError] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);
  const load = useCallback(async () => {
    const current = ++request.current;
    setLoading(true);
    setError('');
    try {
      const result = await transactionApi.myOrders(page);
      if (current === request.current) setData(result);
    } catch (err) {
      if (current === request.current) setError(errorMessage(err));
    } finally {
      if (current === request.current) setLoading(false);
    }
  }, [page]);
  useEffect(() => {
    void load();
    return () => {
      request.current++;
    };
  }, [load]);
  const cancel = async () => {
    if (cancelId === null) return;
    setBusy(true);
    setCancelError('');
    try {
      const result = await transactionApi.cancel(cancelId);
      setSelected((old) => (old?.id === result.id ? result : old));
      setCancelId(null);
      await load();
    } catch (err) {
      setCancelError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 5 } }}>
      <PageHeading
        eyebrow="YOUR JOURNEY"
        title="Mỗi lựa chọn, một hành trình."
        description="Theo dõi trạng thái và xem lại các đơn hàng của bạn."
        action={
          <Button component={Link} to="/#collection" endIcon={<ArrowForward />}>
            Tiếp tục mua sắm
          </Button>
        }
      />
      {error && (
        <Alert
          severity="error"
          action={<Button onClick={() => void load()}>Thử lại</Button>}
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}
      {loading ? (
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={200} />
          <Skeleton variant="rounded" height={200} />
        </Stack>
      ) : (
        <Stack spacing={3}>
          {!error && !data?.content.length && (
            <EmptyState
              title="Hành trình của bạn bắt đầu từ đây"
              description="Đơn hàng sẽ xuất hiện ở đây sau khi bạn hoàn tất thanh toán."
              action={
                <Button component={Link} to="/#collection" variant="contained">
                  Khám phá bộ sưu tập
                </Button>
              }
            />
          )}
          {data?.content.map((order) => (
            <Paper key={order.id} sx={{ overflow: 'hidden' }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Đơn #{String(order.id).padStart(6, '0')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </Typography>
                </Box>
                <OrderStatusChip status={order.status} />
              </Stack>
              <Box sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      flexShrink: 0,
                      borderRadius: 1.5,
                      overflow: 'hidden',
                    }}
                  >
                    <ProductImage
                      src={order.items[0]?.thumbnailUrl}
                      alt={order.items[0]?.productName || 'Đơn hàng'}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      {order.items[0]?.productName || 'Đơn hàng'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
                      {order.items.length > 1 ? ` · ${order.items.length} loại` : ''}
                    </Typography>
                  </Box>
                  <Typography fontWeight={600}>{money(order.finalAmount)}</Typography>
                </Stack>
                <Stack
                  direction="row"
                  justifyContent="flex-end"
                  spacing={1}
                  flexWrap="wrap"
                  sx={{ mt: 2 }}
                >
                  {['PENDING', 'CONFIRMED'].includes(order.status) && (
                    <Button
                      size="small"
                      color="error"
                      disabled={busy}
                      onClick={() => {
                        setCancelError('');
                        setCancelId(order.id);
                      }}
                    >
                      Hủy đơn
                    </Button>
                  )}
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setSelected(order)}
                    endIcon={<ArrowForward />}
                  >
                    Xem chi tiết
                  </Button>
                </Stack>
              </Box>
            </Paper>
          ))}
          {!!data?.totalPages && data.totalPages > 1 && (
            <Stack alignItems="center">
              <Pagination
                page={page + 1}
                count={data.totalPages}
                onChange={(_, value) => setPage(value - 1)}
                disabled={busy || loading}
              />
            </Stack>
          )}
        </Stack>
      )}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết đơn hàng</DialogTitle>
        <DialogContent>{selected && <OrderDetails order={selected} />}</DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={cancelId !== null}
        title="Hủy đơn hàng này?"
        message="Đơn hàng sẽ dừng xử lý sau khi xác nhận. Bạn có thể tạo một đơn mới khi muốn mua lại."
        confirmText="Xác nhận hủy"
        loading={busy}
        error={cancelError}
        onCancel={() => setCancelId(null)}
        onConfirm={() => void cancel()}
      />
    </Container>
  );
}
