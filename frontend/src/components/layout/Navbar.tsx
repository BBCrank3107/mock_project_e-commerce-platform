import { useState } from 'react';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ArrowForward,
  Close,
  LogoutOutlined,
  MenuOutlined,
  PersonOutline,
  SearchOutlined,
  ShoppingBagOutlined,
} from '@mui/icons-material';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../features/cart_checkout/CartContext';

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menu, setMenu] = useState<HTMLElement | null>(null);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState('');
  const doSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setMobile(false);
    navigate({
      pathname: '/',
      search: search.trim() ? `?keyword=${encodeURIComponent(search.trim())}` : '',
      hash: '#collection',
    });
  };
  const links = [
    { to: '/#collection', label: 'Bộ sưu tập' },
    { to: '/orders', label: 'Đơn hàng của tôi' },
  ];
  const searchField = (
    <Box component="form" role="search" onSubmit={doSearch} sx={{ width: '100%' }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Tìm thiết bị của bạn..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        inputProps={{ 'aria-label': 'Tìm kiếm sản phẩm' }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlined sx={{ fontSize: 19 }} />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
  return (
    <>
      <Box sx={{ bgcolor: '#263c30', color: '#e9eee7', textAlign: 'center', py: 0.75, px: 2 }}>
        <Typography variant="caption" sx={{ fontSize: '0.68rem', letterSpacing: '0.06em' }}>
          CYBERTECH SELECT · Công nghệ tinh tuyển. Trải nghiệm xứng tầm.
        </Typography>
      </Box>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          bgcolor: 'rgba(246,245,241,0.96)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container>
          <Stack
            direction="row"
            alignItems="center"
            spacing={{ xs: 1, md: 4 }}
            sx={{ minHeight: { xs: 72, md: 86 } }}
          >
            <Link to="/" aria-label="CyberTech — Trang chủ">
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Box
                  sx={{
                    width: 37,
                    height: 37,
                    bgcolor: 'primary.main',
                    color: '#fff',
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 12,
                    letterSpacing: '-0.08em',
                    fontWeight: 600,
                  }}
                >
                  CT.
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: 21,
                      lineHeight: 1.2,
                      letterSpacing: '-0.06em',
                    }}
                  >
                    cybertech<span style={{ color: '#a27c4d' }}>.</span>
                  </Typography>
                  <Typography
                    sx={{ fontSize: 8, letterSpacing: '0.24em', color: 'text.secondary' }}
                  >
                    TECHNOLOGY, CURATED
                  </Typography>
                </Box>
              </Stack>
            </Link>
            <Stack
              component="nav"
              aria-label="Điều hướng chính"
              direction="row"
              spacing={3}
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              {links.map((link) => (
                <Box
                  key={link.to}
                  component={Link}
                  to={link.to}
                  sx={{
                    whiteSpace: 'nowrap',
                    fontSize: 12,
                    color: location.pathname === link.to ? 'primary.main' : 'text.secondary',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  {link.label}
                </Box>
              ))}
            </Stack>
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                maxWidth: 300,
                ml: 'auto !important',
                display: { xs: 'none', lg: 'block' },
              }}
            >
              {searchField}
            </Box>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ ml: 'auto !important' }}>
              <Tooltip title="Giỏ hàng">
                <IconButton
                  component={Link}
                  to="/cart"
                  aria-label={`Giỏ hàng, ${cart?.itemCount || 0} sản phẩm`}
                >
                  <Badge badgeContent={cart?.itemCount || 0} color="primary">
                    <ShoppingBagOutlined sx={{ fontSize: 23 }} />
                  </Badge>
                </IconButton>
              </Tooltip>
              {isAuthenticated ? (
                <Tooltip title="Tài khoản">
                  <IconButton
                    onClick={(e) => setMenu(e.currentTarget)}
                    aria-label="Mở menu tài khoản"
                    aria-haspopup="menu"
                    aria-expanded={!!menu}
                  >
                    <Avatar
                      src={user?.avatarUrl}
                      sx={{ width: 30, height: 30, bgcolor: 'primary.main', fontSize: 12 }}
                    >
                      {user?.fullName?.[0]}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              ) : (
                <Button
                  component={Link}
                  to="/login"
                  startIcon={<PersonOutline />}
                  size="small"
                  sx={{ display: { xs: 'none', sm: 'flex' }, color: 'text.primary' }}
                >
                  Đăng nhập
                </Button>
              )}
              <IconButton
                onClick={() => setMobile(true)}
                aria-label="Mở menu điều hướng"
                sx={{ display: { md: 'none' } }}
              >
                <MenuOutlined />
              </IconButton>
            </Stack>
          </Stack>
        </Container>
      </AppBar>
      <Menu
        anchorEl={menu}
        open={!!menu}
        onClose={() => setMenu(null)}
        PaperProps={{ sx: { mt: 1.5, minWidth: 240, p: 1, boxShadow: '0 14px 50px #20292318' } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography fontWeight={600}>{user?.fullName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem component={Link} to="/orders" onClick={() => setMenu(null)}>
          Đơn hàng của tôi
        </MenuItem>
        {isAdmin && (
          <MenuItem component={Link} to="/admin/orders" onClick={() => setMenu(null)}>
            Không gian quản trị <ArrowForward sx={{ ml: 'auto', fontSize: 16 }} />
          </MenuItem>
        )}
        <Divider />
        <MenuItem
          onClick={() => {
            logout();
            setMenu(null);
            navigate('/');
          }}
          sx={{ color: 'error.main', gap: 1 }}
        >
          <LogoutOutlined fontSize="small" />
          Đăng xuất
        </MenuItem>
      </Menu>
      <Drawer
        anchor="right"
        open={mobile}
        onClose={() => setMobile(false)}
        PaperProps={{ sx: { width: 'min(360px, 90vw)', p: 3 } }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6">Khám phá CyberTech</Typography>
          <IconButton onClick={() => setMobile(false)} aria-label="Đóng menu">
            <Close />
          </IconButton>
        </Stack>
        {searchField}
        <Stack spacing={1} sx={{ mt: 3 }}>
          {links.map((link) => (
            <Button
              key={link.to}
              component={NavLink}
              to={link.to}
              onClick={() => setMobile(false)}
              sx={{ justifyContent: 'flex-start' }}
            >
              {link.label}
            </Button>
          ))}
          {isAdmin && (
            <Button
              component={Link}
              to="/admin/orders"
              onClick={() => setMobile(false)}
              sx={{ justifyContent: 'flex-start' }}
            >
              Quản trị
            </Button>
          )}
          {!isAuthenticated && (
            <Button
              variant="contained"
              component={Link}
              to="/login"
              onClick={() => setMobile(false)}
            >
              Đăng nhập
            </Button>
          )}
        </Stack>
      </Drawer>
    </>
  );
}
