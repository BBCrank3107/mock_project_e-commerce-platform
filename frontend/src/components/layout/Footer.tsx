import React from 'react';
import { Box, Container, Typography, Grid, Link as MuiLink } from '@mui/material';

export const Footer: React.FC = () => {
  return (
    <Box sx={{ bgcolor: '#0b1120', color: '#94a3b8', py: 6, mt: 'auto', borderTop: '1px solid #1e293b' }}>
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="#f8fafc" fontWeight="bold" gutterBottom>
              CYBER<span style={{ color: '#38bdf8' }}>TECH</span> STORE
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              Hệ thống bán lẻ thiết bị công nghệ chính hãng hàng đầu Việt Nam. Cam kết 100% sản phẩm chất lượng cao, bảo hành chính hãng và hỗ trợ tận tâm.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="subtitle1" color="#f8fafc" fontWeight="bold" gutterBottom>
              Chính Sách & Hỗ Trợ
            </Typography>
            <Typography variant="body2" component="div" sx={{ lineHeight: 2 }}>
              <MuiLink href="#" color="inherit" underline="hover">Chính sách bảo hành đổi trả</MuiLink><br />
              <MuiLink href="#" color="inherit" underline="hover">Hướng dẫn mua hàng online</MuiLink><br />
              <MuiLink href="#" color="inherit" underline="hover">Chính sách vận chuyển toàn quốc</MuiLink>
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="subtitle1" color="#f8fafc" fontWeight="bold" gutterBottom>
              Thông Tin Liên Hệ
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 2 }}>
              📍 123 Đường Công Nghệ, Quận 1, TP. Hồ Chí Minh<br />
              📞 Hotline: 1800 6868 (Miễn phí)<br />
              ✉️ Email: support@cybertech.vn
            </Typography>
          </Grid>
        </Grid>
        <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid #1e293b', textAlign: 'center' }}>
          <Typography variant="caption" color="#64748b">
            © 2026 CyberTech Store Mock Project. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
