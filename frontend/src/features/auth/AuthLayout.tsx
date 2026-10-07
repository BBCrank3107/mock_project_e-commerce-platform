import type { ReactNode } from 'react';
import { Box, Container, Stack, Typography } from '@mui/material';
import { ArrowBack, CheckCircleOutline } from '@mui/icons-material';
import { Link } from 'react-router-dom';
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Container sx={{ py: { xs: 3, md: 6 } }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: '#fff',
        }}
      >
        <Box
          sx={{
            bgcolor: '#e9ecdf',
            p: { xs: 4, md: 6 },
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            component={Link}
            to="/"
            variant="body2"
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <ArrowBack fontSize="small" />
            Về cửa hàng
          </Typography>
          <Box sx={{ py: 5 }}>
            <Typography variant="overline" color="secondary.main">
              YOUR NEXT CHAPTER
            </Typography>
            <Typography variant="h2" sx={{ mt: 2 }}>
              Một tài khoản.
              <br />
              <Box
                component="span"
                sx={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#597050' }}
              >
                Nhiều cảm hứng.
              </Box>
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 3, maxWidth: 320 }}>
              Lưu những lựa chọn yêu thích, đặt hàng dễ dàng và theo dõi từng hành trình giao nhận.
            </Typography>
          </Box>
          <Stack spacing={1.5}>
            {[
              'Mua sắm liền mạch',
              'Theo dõi đơn hàng mọi lúc',
              'Quản lý thông tin trong một nơi',
            ].map((text) => (
              <Stack key={text} direction="row" spacing={1.5} alignItems="center">
                <CheckCircleOutline sx={{ fontSize: 18, color: 'primary.main' }} />
                <Typography variant="body2">{text}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 1, sm: 3, md: 4 },
          }}
        >
          {children}
        </Box>
      </Box>
    </Container>
  );
}
