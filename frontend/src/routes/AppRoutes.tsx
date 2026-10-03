import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProductListPage } from '../features/catalog/ProductListPage';
import { ProductDetailPage } from '../features/catalog/ProductDetailPage';
import { AdminProductListPage } from '../features/catalog/AdminProductListPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { Box, Typography, Container } from '@mui/material';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Member A: Catalog & Public Store */}
      <Route path="/" element={<ProductListPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />

      {/* Member A: Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Member A: Admin Product Management */}
      <Route path="/admin/products" element={<AdminProductListPage />} />

      {/* Placeholder cho Member B kết nối Cart & Checkout */}
      <Route
        path="/cart"
        element={
          <Container sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight="bold">
              🛒 Giỏ Hàng & Thanh Toán
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Phân hệ đang được hoàn thiện bởi Thành viên B (Order & Checkout module).
            </Typography>
          </Container>
        }
      />

      {/* 404 Not Found */}
      <Route
        path="*"
        element={
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="bold" color="error">
              404 - Không Tìm Thấy Trang
            </Typography>
          </Box>
        }
      />
    </Routes>
  );
};
