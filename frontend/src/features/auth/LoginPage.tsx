import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Link as MuiLink,
} from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema } from './authSchema';
import type { LoginSchemaType } from './authSchema';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Yêu cầu: Validation on blur
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginSchemaType) => {
    setErrorMessage(null);
    setLoading(true);
    try {
      await login(data as any);
      navigate('/');
    } catch (err: any) {
      const msg =
        err.response?.data?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản!';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        px: 2,
      }}
    >
      <Card sx={{ maxWidth: 450, width: '100%', boxShadow: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 50,
                height: 50,
                bgcolor: 'primary.main',
                color: 'white',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
              }}
            >
              <LockOutlined />
            </Box>
            <Typography variant="h5" fontWeight="bold">
              Đăng Nhập
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Đăng nhập tài khoản CyberTech Store
            </Typography>
          </Box>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              margin="normal"
              fullWidth
              id="username"
              label="Tên đăng nhập hoặc Email"
              autoComplete="username"
              autoFocus
              {...register('username')}
              error={!!errors.username}
              helperText={errors.username?.message}
            />

            <TextField
              margin="normal"
              fullWidth
              id="password"
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.2, fontWeight: 'bold' }}
            >
              {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2">
                Chưa có tài khoản?{' '}
                <MuiLink component={Link} to="/register" fontWeight="bold">
                  Đăng ký ngay
                </MuiLink>
              </Typography>
            </Box>

            <Box
              sx={{
                mt: 3,
                p: 1.5,
                bgcolor: 'grey.100',
                borderRadius: 2,
                fontSize: '0.85rem',
              }}
            >
              <Typography variant="caption" display="block" color="text.secondary">
                💡 <b>Tài khoản mẫu:</b>
              </Typography>
              <Typography variant="caption" display="block">
                • Admin: <code>admin</code> / <code>123456</code>
              </Typography>
              <Typography variant="caption" display="block">
                • Customer: <code>customer</code> / <code>123456</code>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
