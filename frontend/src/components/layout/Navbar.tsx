import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import {
  ShoppingCartOutlined,
  AdminPanelSettingsOutlined,
  LogoutOutlined,
  PersonOutline,
  StorefrontOutlined,
  Inventory2Outlined,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../features/cart_checkout/CartContext';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleCloseMenu();
    logout();
    navigate('/');
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: '#0a0a0a',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        color: '#ffffff',
        zIndex: 1100,
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Toolbar disableGutters sx={{ minHeight: 68, justifyContent: 'space-between' }}>
          {/* Brand Logo */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              gap: 1.2,
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <StorefrontOutlined fontSize="small" />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.5px',
                  color: '#ffffff',
                  lineHeight: 1.1,
                }}
              >
                CyberTech
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#94a3b8',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  display: 'block',
                }}
              >
                Cửa hàng công nghệ
              </Typography>
            </Box>
          </Box>

          {/* Navigation Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Button
              component={Link}
              to="/"
              sx={{
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.95rem',
                px: 2,
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
              }}
            >
              Sản phẩm
            </Button>

            {isAdmin && (
              <Button
                component={Link}
                to="/admin/products"
                startIcon={<AdminPanelSettingsOutlined />}
                variant="outlined"
                size="small"
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 1.8,
                  '&:hover': {
                    borderColor: '#ffffff',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Quản trị Admin
              </Button>
            )}

            {isAuthenticated && <Button component={Link} to="/orders" sx={{ color: '#ffffff' }}>Đơn của tôi</Button>}
            {isAdmin && <Button component={Link} to="/admin/orders" sx={{ color: '#ffffff' }}>Quản lý đơn hàng</Button>}
            {/* Shopping Cart Button */}
            <IconButton
              component={Link}
              to="/cart"
              sx={{
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 2,
                p: 1,
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
              }}
            >
              <Badge badgeContent={cart?.itemCount || 0} color="error">
                <ShoppingCartOutlined fontSize="small" />
              </Badge>
            </IconButton>

            {/* User Authentication Menu */}
            {isAuthenticated ? (
              <Box>
                <Button
                  onClick={handleOpenMenu}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    textTransform: 'none',
                    p: 0.5,
                    pr: 1.5,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 2,
                    color: '#ffffff',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                  }}
                >
                  <Avatar
                    alt={user?.fullName}
                    src={user?.avatarUrl}
                    sx={{ width: 32, height: 32, bgcolor: 'primary.main', color: '#ffffff' }}
                  >
                    {user?.fullName?.charAt(0) || <PersonOutline fontSize="small" />}
                  </Avatar>
                  <Box sx={{ textAlign: 'left', display: { xs: 'none', sm: 'block' } }}>
                    <Typography variant="body2" fontWeight={600} color="#ffffff" noWrap>
                      {user?.fullName}
                    </Typography>
                  </Box>
                </Button>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 220,
                      borderRadius: 3,
                      boxShadow: '0 10px 25px -3px rgba(0,0,0,0.3)',
                      border: '1px solid #e2e8f0',
                    },
                  }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {user?.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      @{user?.username}
                    </Typography>
                    {isAdmin && (
                      <Box sx={{ mt: 0.8 }}>
                        <Chip
                          label="QUẢN TRỊ VIÊN"
                          color="primary"
                          size="small"
                          sx={{ height: 22, fontSize: '0.65rem', fontWeight: 700 }}
                        />
                      </Box>
                    )}
                  </Box>
                  <Divider />
                  {isAdmin && (
                    <MenuItem
                      component={Link}
                      to="/admin/products"
                      onClick={handleCloseMenu}
                      sx={{ py: 1.2, gap: 1.5 }}
                    >
                      <Inventory2Outlined fontSize="small" color="action" />
                      <Typography variant="body2">Quản lý sản phẩm</Typography>
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout} sx={{ py: 1.2, gap: 1.5, color: 'error.main' }}>
                    <LogoutOutlined fontSize="small" />
                    <Typography variant="body2" fontWeight={600}>
                      Đăng xuất
                    </Typography>
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: '#ffffff',
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2,
                    '&:hover': {
                      borderColor: '#ffffff',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Đăng nhập
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size="small"
                  sx={{
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2,
                    bgcolor: 'primary.main',
                    color: '#ffffff',
                  }}
                >
                  Đăng ký
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
