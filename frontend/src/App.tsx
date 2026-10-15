import { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { CartProvider } from './features/cart_checkout/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { FloatingAiChat } from './components/ai/FloatingAiChat';
import { AppRoutes } from './routes/AppRoutes';
import { theme } from './theme';
function Shell() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const frame = requestAnimationFrame(() =>
        document.getElementById(hash.slice(1))?.scrollIntoView()
      );
      return () => cancelAnimationFrame(frame);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box component="a" href="#main-content" className="skip-link">
        Bỏ qua điều hướng
      </Box>
      <Navbar />
      <Box component="main" id="main-content" sx={{ flex: 1, minWidth: 0 }}>
        <AppRoutes />
      </Box>
      {!pathname.startsWith('/admin') && <Footer />}
      <FloatingAiChat />
    </Box>
  );
}
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <WishlistProvider>
              <BrowserRouter>
                <Shell />
              </BrowserRouter>
            </WishlistProvider>
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
