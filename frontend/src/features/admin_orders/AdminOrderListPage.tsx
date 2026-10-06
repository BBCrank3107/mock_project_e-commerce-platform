import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowForward, Refresh } from '@mui/icons-material';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { PageHeading } from '../../components/common/PageHeading';
import {
  OrderDetails,
  OrderStatusChip,
  nextStatuses,
  statusLabels,
} from '../cart_checkout/OrderDetails';
import { transactionApi, errorMessage, money } from '../cart_checkout/transactionApi';
import type { Order, OrderStatus, Page } from '../cart_checkout/types';
export function AdminOrderListPage() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState('');
  const [data, setData] = useState<Page<Order> | null>(null);
  const request = useRef(0);
  const [selected, setSelected] = useState<Order | null>(null);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const current = ++request.current;
    setLoading(true);
    setError('');
    try {
      const result = await transactionApi.adminOrders(page, status);
      if (current !== request.current) return;
      if (!result.content.length && page > 0) setPage(page - 1);
      else setData(result);
    } catch (err) {
      if (current === request.current) setError(errorMessage(err));
    } finally {
      if (current === request.current) setLoading(false);
    }
  }, [page, status]);
  useEffect(() => {
    void load();
    return () => {
      request.current++;
    };
  }, [load]);
  const change = async (id: number, next: OrderStatus) => {
    setBusy(true);
    setError('');
    setCancelError('');
    try {
      const order = await transactionApi.status(id, next);
      setSelected((previous) => (previous?.id === id ? order : previous));
      setCancelId(null);
      await load();
    } catch (err) {
      if (next === 'CANCELLED') setCancelError(errorMessage(err));
      else setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  const actions = (order: Order) => (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
      <Button
        size="small"
        variant="outlined"
        onClick={() => setSelected(order)}
        endIcon={<ArrowForward />}
      >
        Chi tiết
      </Button>
      {nextStatuses[order.status].length > 0 && (
        <TextField
          select
          size="small"
          label="Chuyển trạng thái"
          value=""
          disabled={busy || loading}
          onChange={(e) => {
            const next = e.target.value as OrderStatus;
            if (next === 'CANCELLED') {
              setCancelError('');
              setCancelId(order.id);
            } else void change(order.id, next);
          }}
          sx={{ minWidth: 165 }}
        >
          {nextStatuses[order.status].map((next) => (
            <MenuItem key={next} value={next}>
              {statusLabels[next]}
            </MenuItem>
          ))}
        </TextField>
      )}
    </Stack>
  );
  return (
    <Box>
      <PageHeading
        eyebrow="ORDER MANAGEMENT"
        title="Đơn hàng"
        description="Theo dõi và điều phối từng đơn hàng của cửa hàng."
        action={
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => void load()}
            disabled={busy || loading}
          >
            Làm mới
          </Button>
        }
      />
      <Box
        sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 2, mb: 3 }}
      >
        <Paper sx={{ p: 3 }}>
          <Typography variant="overline" color="text.secondary">
            Đơn hàng theo bộ lọc
          </Typography>
          <Typography variant="h3" sx={{ mt: 1 }}>
            {loading ? '—' : (data?.totalElements ?? 0)}
          </Typography>
        </Paper>
        <Paper sx={{ p: 3 }}>
          <Typography variant="overline" color="text.secondary">
            Trạng thái đang xem
          </Typography>
          <Typography variant="h6" sx={{ mt: 1.5 }}>
            {status ? statusLabels[status as OrderStatus] : 'Tất cả đơn hàng'}
          </Typography>
        </Paper>
      </Box>
      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
        >
          <TextField
            select
            size="small"
            label="Lọc trạng thái"
            value={status}
            disabled={busy || loading}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">Tất cả trạng thái</MenuItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <Typography variant="caption" color="text.secondary">
            Hủy đơn chỉ khả dụng trước khi giao hàng.
          </Typography>
        </Stack>
      </Paper>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {loading ? (
        <Skeleton variant="rounded" height={350} />
      ) : !error && !data?.content.length ? (
        <EmptyState
          title="Chưa có đơn hàng phù hợp"
          description="Thử thay đổi bộ lọc trạng thái hoặc làm mới để cập nhật dữ liệu."
          action={
            <Button
              onClick={() => {
                setStatus('');
                setPage(0);
              }}
            >
              Xem tất cả
            </Button>
          }
        />
      ) : (
        <>
          <TableContainer component={Paper} sx={{ display: { xs: 'none', lg: 'block' } }}>
            <Table sx={{ minWidth: 750 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Đơn hàng</TableCell>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Tổng tiền</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.content.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        #{String(order.id).padStart(6, '0')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </Typography>
                    </TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
                      {money(order.finalAmount)}
                    </TableCell>
                    <TableCell>
                      <OrderStatusChip status={order.status} />
                    </TableCell>
                    <TableCell>{actions(order)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack spacing={2} sx={{ display: { lg: 'none' } }}>
            {data?.content.map((order) => (
              <Paper key={order.id} sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={600}>#{String(order.id).padStart(6, '0')}</Typography>
                  <OrderStatusChip status={order.status} />
                </Stack>
                <Typography variant="body2" sx={{ mt: 1.5 }}>
                  {order.customerName}
                </Typography>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mt: 1, mb: 2 }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </Typography>
                  <Typography fontWeight={600}>{money(order.finalAmount)}</Typography>
                </Stack>
                {actions(order)}
              </Paper>
            ))}
          </Stack>
          {!!data?.totalPages && data.totalPages > 1 && (
            <Stack
              direction="row"
              flexWrap="wrap"
              gap={2}
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 3 }}
            >
              <Typography variant="caption" color="text.secondary">
                Trang {page + 1} / {data.totalPages}
              </Typography>
              <Pagination
                page={page + 1}
                count={data.totalPages}
                disabled={busy || loading}
                onChange={(_, value) => setPage(value - 1)}
              />
            </Stack>
          )}
        </>
      )}
      <Dialog open={!!selected} onClose={() => setSelected(null)} fullWidth maxWidth="sm">
        <DialogTitle>Chi tiết đơn hàng</DialogTitle>
        <DialogContent>{selected && <OrderDetails order={selected} />}</DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={cancelId !== null}
        title="Xác nhận hủy đơn"
        message="Đơn hàng sẽ dừng xử lý và số lượng sản phẩm được hoàn lại tồn kho."
        confirmText="Hủy đơn hàng"
        loading={busy}
        error={cancelError}
        onCancel={() => setCancelId(null)}
        onConfirm={() => {
          if (cancelId !== null) void change(cancelId, 'CANCELLED');
        }}
      />
    </Box>
  );
}
