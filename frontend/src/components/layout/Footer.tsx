import { Box, Container, Stack, Typography } from '@mui/material';
import { ArrowOutward } from '@mui/icons-material';
import { Link } from 'react-router-dom';
export function Footer() {
  return (
    <Box
      component="footer"
      sx={{ bgcolor: '#202e25', color: '#f5f5ec', mt: 8, pt: { xs: 5, md: 7 }, pb: 3 }}
    >
      <Container>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' },
            gap: 5,
            pb: 5,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 30, letterSpacing: '-0.06em', fontWeight: 500 }}>
              cybertech.
            </Typography>
            <Typography variant="body2" sx={{ mt: 2, color: '#aebaae', maxWidth: 340 }}>
              Những thiết bị bạn yêu thích, trong một trải nghiệm mua sắm được chăm chút.
            </Typography>
          </Box>
          <Box>
            <Typography variant="overline" sx={{ color: '#a6b59f' }}>
              Khám phá
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {[
                { to: '/#collection', label: 'Bộ sưu tập công nghệ' },
                { to: '/cart', label: 'Giỏ hàng của bạn' },
                { to: '/orders', label: 'Theo dõi đơn hàng' },
              ].map((item) => (
                <Typography
                  component={Link}
                  to={item.to}
                  key={item.to}
                  variant="body2"
                  sx={{ '&:hover': { color: '#cfdbbc' } }}
                >
                  {item.label} <ArrowOutward sx={{ fontSize: 12, ml: 0.5 }} />
                </Typography>
              ))}
            </Stack>
          </Box>
          <Box>
            <Typography variant="overline" sx={{ color: '#a6b59f' }}>
              Tài khoản
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              <Typography component={Link} to="/login" variant="body2">
                Đăng nhập
              </Typography>
              <Typography component={Link} to="/register" variant="body2">
                Tạo tài khoản
              </Typography>
              <Typography variant="body2" sx={{ color: '#aebaae' }}>
                COD & chuyển khoản ngân hàng
              </Typography>
            </Stack>
          </Box>
        </Box>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          spacing={1}
          sx={{ borderTop: '1px solid #ffffff18', pt: 3 }}
        >
          <Typography variant="caption" sx={{ color: '#aebaae' }}>
            © {new Date().getFullYear()} CyberTech Store.
          </Typography>
          <Typography variant="caption" sx={{ color: '#aebaae' }}>
            Chọn tinh tế. Sống thông minh.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
