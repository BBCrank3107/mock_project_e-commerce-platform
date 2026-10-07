import type { ReactNode } from 'react';
import { Box, Button, CircularProgress, Container } from '@mui/material';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/common/EmptyState';
export function RequireAccount({
  children,
  admin = false,
}: {
  children: ReactNode;
  admin?: boolean;
}) {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  if (loading)
    return (
      <Box sx={{ p: 8, textAlign: 'center' }}>
        <CircularProgress size={28} aria-label="Đang kiểm tra tài khoản" />
      </Box>
    );
  if (!isAuthenticated)
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search + location.hash }}
      />
    );
  if (admin && !isAdmin)
    return (
      <Container sx={{ py: 6 }}>
        <EmptyState
          title="Khu vực dành cho quản trị viên"
          description="Tài khoản hiện tại chưa có quyền truy cập trang này."
          action={
            <Button component={Link} to="/" variant="contained">
              Về cửa hàng
            </Button>
          }
        />
      </Container>
    );
  return <>{children}</>;
}
