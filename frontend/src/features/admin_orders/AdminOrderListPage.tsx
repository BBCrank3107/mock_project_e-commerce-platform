import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Pagination, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { OrderDetails, OrderStatusChip, nextStatuses, statusLabels } from '../cart_checkout/OrderDetails';
import { transactionApi, errorMessage, money } from '../cart_checkout/transactionApi';
import type { Order, OrderStatus, Page } from '../cart_checkout/types';
export function AdminOrderListPage() {
  const [page, setPage] = useState(0); const [status, setStatus] = useState(''); const [data, setData] = useState<Page<Order> | null>(null);
  const [selected, setSelected] = useState<Order | null>(null); const [cancelId, setCancelId] = useState<number | null>(null);
  const [error, setError] = useState(''); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const result = await transactionApi.adminOrders(page, status); if (!result.content.length && page > 0) setPage(page-1); else setData(result); }
    catch (err) { setError(errorMessage(err)); } finally { setLoading(false); }
  }, [page, status]);
  useEffect(() => { void load(); }, [load]);
  const change = async (id: number, next: OrderStatus) => {
    setBusy(true); setError('');
    try { const order = await transactionApi.status(id, next); setSelected(previous => previous?.id === id ? order : previous); setCancelId(null); await load(); }
    catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  };
  return <Container sx={{ py: 4 }}>
    <Typography variant="h4" fontWeight={700} gutterBottom>Quản lý đơn hàng</Typography>
    <Stack direction="row" spacing={2} sx={{ my: 3 }}><TextField select label="Trạng thái" value={status} disabled={busy || loading} onChange={e => { setStatus(e.target.value); setPage(0); }} sx={{ minWidth: 220 }}>
      <MenuItem value="">Tất cả</MenuItem>{Object.entries(statusLabels).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
    </TextField><Button onClick={() => void load()} disabled={busy || loading}>Làm mới</Button></Stack>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {loading ? <Typography>Đang tải...</Typography> : <>
      <TableContainer component={Paper}><Table><TableHead><TableRow><TableCell>Mã đơn</TableCell><TableCell>Người đặt</TableCell><TableCell>Tổng tiền</TableCell><TableCell>Trạng thái</TableCell><TableCell>Thao tác</TableCell></TableRow></TableHead>
        <TableBody>{data?.content.map(order => <TableRow key={order.id}>
          <TableCell sx={{ maxWidth: 240, overflowWrap: 'anywhere' }}>{order.orderCode}</TableCell><TableCell>{order.customerName}</TableCell><TableCell>{money(order.finalAmount)}</TableCell><TableCell><OrderStatusChip status={order.status} /></TableCell>
          <TableCell><Stack spacing={1}><Button size="small" onClick={() => setSelected(order)}>Chi tiết</Button>
            {nextStatuses[order.status].length > 0 && <TextField select size="small" label="Chuyển trạng thái" value="" disabled={busy} onChange={e => { const next = e.target.value as OrderStatus; if (next === 'CANCELLED') setCancelId(order.id); else void change(order.id, next); }} sx={{ minWidth: 180 }}>
              {nextStatuses[order.status].map(next => <MenuItem key={next} value={next}>{statusLabels[next]}</MenuItem>)}
            </TextField>}
          </Stack></TableCell>
        </TableRow>)}{!data?.content.length && <TableRow><TableCell colSpan={5}>Không có đơn hàng phù hợp.</TableCell></TableRow>}</TableBody>
      </Table></TableContainer>
      {!!data?.totalPages && <Pagination sx={{ mt: 3 }} page={page+1} count={data.totalPages} disabled={busy || loading} onChange={(_, value) => setPage(value-1)} />}
    </>}
    <Dialog open={!!selected} onClose={() => setSelected(null)} fullWidth maxWidth="md"><DialogTitle>Chi tiết đơn hàng</DialogTitle><DialogContent>{selected && <OrderDetails order={selected} />}</DialogContent><DialogActions><Button onClick={() => setSelected(null)}>Đóng</Button></DialogActions></Dialog>
    <ConfirmDialog open={cancelId !== null} title="Hủy đơn hàng" message="Bạn có chắc muốn hủy đơn hàng? Hệ thống sẽ hoàn lại số lượng vào kho." loading={busy} onCancel={() => setCancelId(null)} onConfirm={() => { if (cancelId !== null) void change(cancelId, 'CANCELLED'); }} />
  </Container>;
}
