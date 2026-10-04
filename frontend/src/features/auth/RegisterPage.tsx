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
import { Visibility, VisibilityOff, PersonAddOutlined } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema } from './authSchema';
import type { RegisterSchemaType } from './authSchema';
import { useAuth } from '../../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register: authRegister } = useAuth();
  const navigate = useNavigate();

  // Yêu cầu: Validation on blur
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: RegisterSchemaType) => {
    setErrorMessage(null);
    setLoading(true);
    try {
      await authRegister(data as any);
      navigate('/');
    } catch (err: any) {
      const msg =
        err.response?.data?.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin!';
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
        minHeight: '85vh',
        px: 2,
        py: 4,
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%', boxShadow: 4, borderRadius: 3 }}>
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
              <PersonAddOutlined />
            </Box>
            <Typography variant="h5" fontWeight="bold">
              Đăng Ký Tài Khoản
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gia nhập CyberTech Store ngay hôm nay
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
              label="Tên đăng nhập *"
              {...register('username')}
              error={!!errors.username}
              helperText={errors.username?.message}
            />

            <TextField
              margin="normal"
              fullWidth
              id="fullName"
              label="Họ và tên *"
              {...register('fullName')}
              error={!!errors.fullName}
              helperText={errors.fullName?.message}
            />

            <TextField
              margin="normal"
              fullWidth
              id="email"
              label="Địa chỉ Email *"
              type="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <TextField
              margin="normal"
              fullWidth
              id="phone"
              label="Số điện thoại"
              {...register('phone')}
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />

            <TextField
              margin="normal"
              fullWidth
              id="password"
              label="Mật khẩu *"
              type={showPassword ? 'text' : 'password'}
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

            <TextField
              margin="normal"
              fullWidth
              id="confirmPassword"
              label="Xác nhận mật khẩu *"
              type={showPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.2, fontWeight: 'bold' }}
            >
              {loading ? 'Đang tạo tài khoản...' : 'Đăng Ký'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2">
                Đã có tài khoản?{' '}
                <MuiLink component={Link} to="/login" fontWeight="bold">
                  Đăng nhập ngay
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
