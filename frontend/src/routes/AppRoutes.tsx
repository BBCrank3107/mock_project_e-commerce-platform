import { CartPage } from '../features/cart_checkout/CartPage';
import { AdminOrderListPage } from '../features/admin_orders/AdminOrderListPage';
import { CheckoutPage } from '../features/cart_checkout/CheckoutPage';
import { MyOrdersPage } from '../features/cart_checkout/MyOrdersPage';
import { OrderSuccessPage } from '../features/cart_checkout/OrderSuccessPage';
import { RequireAccount } from '../features/cart_checkout/RequireAccount';
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProductListPage } from '../features/catalog/ProductListPage';
import { ProductDetailPage } from '../features/catalog/ProductDetailPage';
import { AdminProductListPage } from '../features/catalog/AdminProductListPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { Box, Typography } from '@mui/material';

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

      <Route path="/cart" element={<RequireAccount><CartPage /></RequireAccount>} />
      <Route path="/checkout" element={<RequireAccount><CheckoutPage /></RequireAccount>} />
      <Route path="/orders" element={<RequireAccount><MyOrdersPage /></RequireAccount>} />
      <Route path="/orders/:id/success" element={<RequireAccount><OrderSuccessPage /></RequireAccount>} />
      <Route path="/admin/orders" element={<RequireAccount admin><AdminOrderListPage /></RequireAccount>} />

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
