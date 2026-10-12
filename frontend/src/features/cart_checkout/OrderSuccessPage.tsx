import { useEffect, useState } from 'react';
import { Alert, Button, Container, Paper, Stack, Typography } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { transactionApi, errorMessage } from './transactionApi';
import { OrderDetails } from './OrderDetails';
import type { Order } from './types';
export function OrderSuccessPage() {
  const { id } = useParams(); const [order, setOrder] = useState<Order | null>(null); const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    transactionApi.order(Number(id)).then(data => { if (active) setOrder(data); }).catch(err => { if (active) setError(errorMessage(err)); });
    return () => { active = false; };
  }, [id]);
  return <Container maxWidth="md" sx={{ py: 5 }}>
    {error ? <Alert severity="error">{error}</Alert> : !order ? <Typography>Đang tải đơn hàng...</Typography> : <>
      <Alert severity="success" sx={{ mb: 3 }}>Đặt hàng thành công. Mã đơn: {order.orderCode}</Alert>
      <Paper sx={{ p: 3 }}><OrderDetails order={order} /></Paper>
    </>}
    <Stack direction="row" spacing={2} sx={{ mt: 3 }}><Button component={Link} to="/orders" variant="contained">Đơn hàng của tôi</Button><Button component={Link} to="/">Tiếp tục mua sắm</Button></Stack>
  </Container>;
}
