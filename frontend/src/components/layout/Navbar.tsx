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
} from '@mui/material';
import {
  ShoppingCart,
  Dashboard,
  Storefront,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
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
    <AppBar position="sticky" sx={{ bgcolor: '#0f172a', boxShadow: 3 }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* Logo */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <Storefront sx={{ mr: 1, fontSize: 32, color: '#38bdf8' }} />
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 800,
                letterSpacing: '.1rem',
                color: '#f8fafc',
              }}
            >
              CYBER<span style={{ color: '#38bdf8' }}>TECH</span>
            </Typography>
          </Box>

          {/* Nav Links */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              component={Link}
              to="/"
              sx={{ color: '#e2e8f0', fontWeight: 'bold' }}
            >
              Sản Phẩm
            </Button>

            {isAdmin && (
              <Button
                component={Link}
                to="/admin/products"
                startIcon={<Dashboard />}
                variant="outlined"
                color="secondary"
                sx={{
                  borderColor: '#818cf8',
                  color: '#c7d2fe',
                  '&:hover': { borderColor: '#a5b4fc', bgcolor: 'rgba(99, 102, 241, 0.1)' },
                }}
              >
                Quản Trị (Admin)
              </Button>
            )}

            {/* Cart Icon (Placeholder cho Member B nối) */}
            <IconButton
              component={Link}
              to="/cart"
              sx={{ color: '#e2e8f0' }}
            >
              <Badge badgeContent={2} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>

            {/* Auth section */}
            {isAuthenticated ? (
              <Box>
                <IconButton onClick={handleOpenMenu} sx={{ p: 0 }}>
                  <Avatar
                    alt={user?.fullName}
                    src={user?.avatarUrl}
                    sx={{ width: 36, height: 36, border: '2px solid #38bdf8' }}
                  />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                  sx={{ mt: 1.5 }}
                >
                  <MenuItem disabled>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {user?.fullName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        @{user?.username}
                      </Typography>
                      {isAdmin && (
                        <Chip
                          label="ADMIN"
                          color="error"
                          size="small"
                          sx={{ ml: 1, height: 20 }}
                        />
                      )}
                    </Box>
                  </MenuItem>
                  {isAdmin && (
                    <MenuItem
                      component={Link}
                      to="/admin/products"
                      onClick={handleCloseMenu}
                    >
                      Quản lý sản phẩm
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    Đăng xuất
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  sx={{ color: '#38bdf8', borderColor: '#38bdf8' }}
                >
                  Đăng Nhập
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  sx={{ bgcolor: '#38bdf8', color: '#0f172a', fontWeight: 'bold' }}
                >
                  Đăng Ký
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
