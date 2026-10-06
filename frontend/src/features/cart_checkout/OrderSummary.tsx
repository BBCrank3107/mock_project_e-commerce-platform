import type { ReactNode } from 'react';
import { Divider, Paper, Stack, Typography } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { money } from './transactionApi';
export function OrderSummary({
  subtotal,
  discount = 0,
  children,
  action,
}: {
  subtotal: number;
  discount?: number;
  children?: ReactNode;
  action: ReactNode;
}) {
  return (
    <Paper sx={{ p: { xs: 3, md: 3.5 }, width: '100%', position: { md: 'sticky' }, top: 112 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Tóm tắt đơn hàng
      </Typography>
      {children}
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            Tạm tính
          </Typography>
          <Typography variant="body2">{money(subtotal)}</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            Giảm giá
          </Typography>
          <Typography variant="body2" color={discount ? 'success.main' : 'text.primary'}>
            {discount ? '−' : ''}
            {money(discount)}
          </Typography>
        </Stack>
      </Stack>
      <Divider sx={{ my: 2.5 }} />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography fontWeight={600}>Tổng cộng</Typography>
        <Typography sx={{ fontSize: 23, letterSpacing: '-0.04em', fontWeight: 600 }}>
          {money(subtotal - discount)}
        </Typography>
      </Stack>
      {action}
      <Stack
        direction="row"
        spacing={0.75}
        justifyContent="center"
        alignItems="center"
        sx={{ mt: 2 }}
      >
        <LockOutlined sx={{ fontSize: 13, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">
          Kiểm tra thông tin trước khi xác nhận
        </Typography>
      </Stack>
    </Paper>
  );
}
