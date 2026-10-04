import React from 'react';
import { Box, Container, Typography, Grid, Link as MuiLink } from '@mui/material';
import {
  LocationOnOutlined,
  PhoneOutlined,
  EmailOutlined,
  ShieldOutlined,
  LocalShippingOutlined,
  HeadsetMicOutlined,
} from '@mui/icons-material';

export const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#0a0a0a',
        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        color: '#94a3b8',
        pt: 6,
        pb: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Cam kết thương hiệu */}
        <Grid container spacing={3} sx={{ pb: 5, mb: 5, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: 'rgba(56, 189, 248, 0.12)',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldOutlined />
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={700} color="#ffffff">
                  100% Chính Hãng
                </Typography>
                <Typography variant="body2" color="#94a3b8">
                  Bảo hành chính hãng toàn quốc
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: 'rgba(74, 222, 128, 0.12)',
                  color: '#4ade80',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LocalShippingOutlined />
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={700} color="#ffffff">
                  Giao Hàng Toàn Quốc
                </Typography>
                <Typography variant="body2" color="#94a3b8">
                  Vận chuyển an toàn, nhanh chóng
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: 'rgba(248, 113, 113, 0.12)',
                  color: '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <HeadsetMicOutlined />
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={700} color="#ffffff">
                  Hỗ Trợ 24/7
                </Typography>
                <Typography variant="body2" color="#94a3b8">
                  Tư vấn nhiệt tình, tận tâm
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Thông tin chân trang */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Typography variant="h6" fontWeight={800} color="#ffffff" gutterBottom>
              CyberTech Store
            </Typography>
            <Typography variant="body2" color="#94a3b8" sx={{ mb: 2.5, maxWidth: 420, lineHeight: 1.7 }}>
              Nền tảng thương mại điện tử chuyên cung cấp thiết bị số và phụ kiện công nghệ cao cấp chính hãng tại Việt Nam.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LocationOnOutlined fontSize="small" sx={{ color: '#38bdf8' }} />
                <Typography variant="body2" color="#e2e8f0">
                  123 Đường Công Nghệ, Quận 1, TP. Hồ Chí Minh
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PhoneOutlined fontSize="small" sx={{ color: '#38bdf8' }} />
                <Typography variant="body2" color="#e2e8f0">
                  Hotline: 1800 6868 (Miễn phí cuộc gọi)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <EmailOutlined fontSize="small" sx={{ color: '#38bdf8' }} />
                <Typography variant="body2" color="#e2e8f0">
                  Email: support@cybertech.vn
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={6} md={3}>
            <Typography variant="subtitle2" fontWeight={700} color="#ffffff" gutterBottom>
              Chính Sách Bán Hàng
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mt: 1.5 }}>
              <MuiLink href="#" color="#94a3b8" underline="hover" variant="body2" sx={{ '&:hover': { color: '#ffffff' } }}>
                Chính sách bảo hành đổi trả
              </MuiLink>
              <MuiLink href="#" color="#94a3b8" underline="hover" variant="body2" sx={{ '&:hover': { color: '#ffffff' } }}>
                Chính sách bảo mật thông tin
              </MuiLink>
              <MuiLink href="#" color="#94a3b8" underline="hover" variant="body2" sx={{ '&:hover': { color: '#ffffff' } }}>
                Hình thức thanh toán
              </MuiLink>
              <MuiLink href="#" color="#94a3b8" underline="hover" variant="body2" sx={{ '&:hover': { color: '#ffffff' } }}>
                Quy trình vận chuyển giao nhận
              </MuiLink>
            </Box>
          </Grid>

          <Grid item xs={6} md={4}>
            <Typography variant="subtitle2" fontWeight={700} color="#ffffff" gutterBottom>
              Về Chúng Tôi
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mt: 1.5 }}>
              <MuiLink href="#" color="#94a3b8" underline="hover" variant="body2" sx={{ '&:hover': { color: '#ffffff' } }}>
                Giới thiệu CyberTech Store
              </MuiLink>
              <MuiLink href="#" color="#94a3b8" underline="hover" variant="body2" sx={{ '&:hover': { color: '#ffffff' } }}>
                Hệ thống cửa hàng
              </MuiLink>
              <MuiLink href="#" color="#94a3b8" underline="hover" variant="body2" sx={{ '&:hover': { color: '#ffffff' } }}>
                Tuyển dụng nhân tài
              </MuiLink>
              <MuiLink href="#" color="#94a3b8" underline="hover" variant="body2" sx={{ '&:hover': { color: '#ffffff' } }}>
                Liên hệ hợp tác kinh doanh
              </MuiLink>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
          <Typography variant="caption" color="#64748b">
            © 2026 CyberTech Store. Dự án Mock Project Java Spring Boot & React Vite.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
