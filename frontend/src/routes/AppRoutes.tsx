import { lazy, Suspense } from 'react';
import { Box, Button, Container, LinearProgress } from '@mui/material';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { RequireAccount } from '../features/cart_checkout/RequireAccount';
import { AdminLayout } from '../components/layout/AdminLayout';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { safeReturnPath } from '../features/auth/returnPath';
const ProductListPage = lazy(() =>
  import('../features/catalog/ProductListPage').then((m) => ({ default: m.ProductListPage }))
);
const ProductDetailPage = lazy(() =>
  import('../features/catalog/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage }))
);
const AdminDashboardPage = lazy(() =>
  import('../features/dashboard/AdminDashboardPage').then((m) => ({
    default: m.AdminDashboardPage,
  }))
);
const AdminProductListPage = lazy(() =>
  import('../features/catalog/AdminProductListPage').then((m) => ({
    default: m.AdminProductListPage,
  }))
);
const AdminCategoryListPage = lazy(() =>
  import('../features/catalog/AdminCategoryListPage').then((m) => ({
    default: m.AdminCategoryListPage,
  }))
);
const AdminVoucherListPage = lazy(() =>
  import('../features/promotion/AdminVoucherListPage').then((m) => ({
    default: m.AdminVoucherListPage,
  }))
);
const LoginPage = lazy(() =>
  import('../features/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('../features/auth/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const CartPage = lazy(() =>
  import('../features/cart_checkout/CartPage').then((m) => ({ default: m.CartPage }))
);
const CheckoutPage = lazy(() =>
  import('../features/cart_checkout/CheckoutPage').then((m) => ({ default: m.CheckoutPage }))
);
const MyOrdersPage = lazy(() =>
  import('../features/cart_checkout/MyOrdersPage').then((m) => ({ default: m.MyOrdersPage }))
);
const OrderSuccessPage = lazy(() =>
  import('../features/cart_checkout/OrderSuccessPage').then((m) => ({
    default: m.OrderSuccessPage,
  }))
);
const AdminOrderListPage = lazy(() =>
  import('../features/admin_orders/AdminOrderListPage').then((m) => ({
    default: m.AdminOrderListPage,
  }))
);
const WishlistPage = lazy(() =>
  import('../features/wishlist/WishlistPage').then((m) => ({ default: m.WishlistPage }))
);
function AuthPage({ register = false }: { register?: boolean }) {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  if (loading) return <LinearProgress />;
  if (isAuthenticated) {
    const defaultPath = isAdmin ? '/admin/orders' : '/';
    const returnTarget = safeReturnPath(location.state);
    return <Navigate to={returnTarget === '/' ? defaultPath : returnTarget} replace />;
  }
  return register ? <RegisterPage /> : <LoginPage />;
}

function CustomerOrdersRoute() {
  const { isAdmin } = useAuth();
  if (isAdmin) {
    return <Navigate to="/admin/orders" replace />;
  }
  return <MyOrdersPage />;
}
export function AppRoutes() {
  return (
    <Suspense
      fallback={
        <Box sx={{ py: 6 }}>
          <LinearProgress aria-label="Đang tải trang" />
        </Box>
      }
    >
      <Routes>
        <Route path="/" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage register />} />
        <Route
          path="/cart"
          element={
            <RequireAccount>
              <CartPage />
            </RequireAccount>
          }
        />
        <Route
          path="/checkout"
          element={
            <RequireAccount>
              <CheckoutPage />
            </RequireAccount>
          }
        />
        <Route
          path="/wishlist"
          element={
            <RequireAccount>
              <WishlistPage />
            </RequireAccount>
          }
        />
        <Route
          path="/orders"
          element={
            <RequireAccount>
              <CustomerOrdersRoute />
            </RequireAccount>
          }
        />
        <Route
          path="/orders/:id/success"
          element={
            <RequireAccount>
              <OrderSuccessPage />
            </RequireAccount>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAccount admin>
              <AdminLayout />
            </RequireAccount>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="orders" element={<AdminOrderListPage />} />
          <Route path="products" element={<AdminProductListPage />} />
          <Route path="categories" element={<AdminCategoryListPage />} />
          <Route path="vouchers" element={<AdminVoucherListPage />} />
        </Route>
        <Route
          path="*"
          element={
            <Container sx={{ py: 6 }}>
              <EmptyState
                title="Trang này chưa có trong bộ sưu tập"
                description="Đường dẫn có thể đã thay đổi. Hãy quay về cửa hàng để tiếp tục khám phá."
                action={
                  <Button variant="contained" component={Link} to="/">
                    Về trang chủ
                  </Button>
                }
              />
            </Container>
          }
        />
      </Routes>
    </Suspense>
  );
}
