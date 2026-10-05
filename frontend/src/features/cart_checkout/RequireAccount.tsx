import type { ReactNode } from 'react';
import { Alert, Box, CircularProgress } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
export function RequireAccount({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  if (loading) return <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress /></Box>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (admin && !isAdmin) return <Alert severity="error">Bạn không có quyền quản trị đơn hàng.</Alert>;
  return <>{children}</>;
}
