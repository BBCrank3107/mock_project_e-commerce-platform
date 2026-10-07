import { Box, Container, Stack, Typography } from '@mui/material';
import { Inventory2Outlined, ReceiptLongOutlined, ArrowBackOutlined } from '@mui/icons-material';
import { Link, NavLink, Outlet } from 'react-router-dom';
export function AdminLayout() {
  return (
    <Container sx={{ py: { xs: 3, md: 5 } }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '205px minmax(0, 1fr)' },
          gap: { xs: 3, md: 5 },
        }}
      >
        <Box component="aside">
          <Typography variant="overline" color="secondary.main" sx={{ px: 2 }}>
            Workspace
          </Typography>
          <Typography variant="h6" sx={{ px: 2, mt: 0.5, mb: 3 }}>
            Quản trị cửa hàng
          </Typography>
          <Stack
            component="nav"
            aria-label="Điều hướng quản trị"
            direction={{ xs: 'row', md: 'column' }}
            spacing={1}
            sx={{ flexWrap: 'wrap' }}
          >
            {[
              {
                to: '/admin/orders',
                icon: <ReceiptLongOutlined fontSize="small" />,
                label: 'Đơn hàng',
              },
              {
                to: '/admin/products',
                icon: <Inventory2Outlined fontSize="small" />,
                label: 'Sản phẩm',
              },
            ].map((item) => (
              <Box
                key={item.to}
                component={NavLink}
                to={item.to}
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  p: 1.7,
                  fontSize: 13,
                  borderRadius: 2,
                  color: 'text.secondary',
                  '&.active': { bgcolor: '#e5eadf', color: 'primary.main', fontWeight: 600 },
                }}
              >
                {item.icon}
                {item.label}
              </Box>
            ))}
            <Box
              component={Link}
              to="/"
              sx={{ display: 'flex', gap: 1.5, p: 1.7, fontSize: 13, color: 'text.secondary' }}
            >
              <ArrowBackOutlined fontSize="small" />
              Về cửa hàng
            </Box>
          </Stack>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </Container>
  );
}
