import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Container, Pagination, Paper, Stack, Typography } from '@mui/material';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { transactionApi, errorMessage } from './transactionApi';
import { OrderDetails } from './OrderDetails';
import type { Order, Page } from './types';
export function MyOrdersPage() {
  const [page, setPage] = useState(0); const [data, setData] = useState<Page<Order> | null>(null);
  const [error, setError] = useState(''); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const load = useCallback(async () => { setLoading(true); setError(''); try { setData(await transactionApi.myOrders(page)); } catch (err) { setError(errorMessage(err)); } finally { setLoading(false); } }, [page]);
  useEffect(() => { void load(); }, [load]);
  const cancel = async () => { if (cancelId === null) return; setBusy(true); setError(''); try { await transactionApi.cancel(cancelId); setCancelId(null); await load(); } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); } };
  return <Container maxWidth="md" sx={{ py: 4 }}>
    <Typography variant="h4" fontWeight={700} gutterBottom>Đơn hàng của tôi</Typography>
    {error && <Alert severity="error" action={<Button onClick={() => void load()}>Thử lại</Button>}>{error}</Alert>}
    {loading ? <Typography>Đang tải...</Typography> : <Stack spacing={3}>
      {!data?.content.length && <Typography>Chưa có đơn hàng.</Typography>}
      {data?.content.map(order => <Paper key={order.id} sx={{ p: 3 }}><OrderDetails order={order} />
        {['PENDING', 'CONFIRMED'].includes(order.status) && <Button color="error" disabled={busy} sx={{ mt: 2 }} onClick={() => setCancelId(order.id)}>Hủy đơn hàng</Button>}
      </Paper>)}
      {!!data?.totalPages && <Pagination page={page+1} count={data.totalPages} onChange={(_, value) => setPage(value-1)} disabled={busy} />}
    </Stack>}
    <ConfirmDialog open={cancelId !== null} message="Bạn có chắc muốn hủy đơn hàng? Số lượng sản phẩm sẽ được hoàn lại kho." loading={busy} onCancel={() => setCancelId(null)} onConfirm={() => void cancel()} />
  </Container>;
}
