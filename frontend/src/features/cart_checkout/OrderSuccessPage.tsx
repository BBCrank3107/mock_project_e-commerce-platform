import { useEffect, useState } from 'react';
import { Alert, Box, Button, Container, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { Check, ArrowForward } from '@mui/icons-material';
import { Link, useParams } from 'react-router-dom';
import { transactionApi, errorMessage } from './transactionApi';
import { OrderDetails } from './OrderDetails';
import { CheckoutSteps } from './CheckoutSteps';
import type { Order } from './types';
export function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setError('');
    setOrder(null);
    transactionApi
      .order(Number(id))
      .then((data) => {
        if (active) setOrder(data);
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [id, retry]);
  return (
    <Container maxWidth="sm" sx={{ py: 5 }}>
      <CheckoutSteps active={2} />
      {error ? (
        <Alert
          severity="error"
          action={<Button onClick={() => setRetry((n) => n + 1)}>Thử lại</Button>}
        >
          {error}
        </Alert>
      ) : !order ? (
        <Skeleton variant="rounded" height={400} />
      ) : (
        <>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor: '#e2ebdc',
                color: 'primary.main',
                display: 'grid',
                placeItems: 'center',
                mx: 'auto',
                mb: 2.5,
              }}
            >
              <Check sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="overline" color="secondary.main">
              THANK YOU FOR CHOOSING US
            </Typography>
            <Typography variant="h4" component="h1" sx={{ mt: 1 }}>
              {order.status === 'CANCELLED'
                ? 'Đơn hàng đã được hủy.'
                : 'Đơn hàng đã được ghi nhận.'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Bạn có thể theo dõi cập nhật trong mục Đơn hàng của tôi.
            </Typography>
          </Box>
          <Paper sx={{ p: { xs: 2.5, sm: 4 } }}>
            <OrderDetails order={order} />
          </Paper>
        </>
      )}
      <Stack spacing={1.5} sx={{ mt: 3 }}>
        <Button component={Link} to="/orders" variant="contained" endIcon={<ArrowForward />}>
          Theo dõi đơn hàng
        </Button>
        <Button component={Link} to="/#collection">
          Tiếp tục khám phá
        </Button>
      </Stack>
    </Container>
  );
}
