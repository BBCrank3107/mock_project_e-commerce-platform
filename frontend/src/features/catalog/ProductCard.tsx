import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
} from '@mui/material';
import { AddShoppingCartOutlined } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import type { Product } from './types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2.5,
        border: '1px solid #e2e8f0',
        bgcolor: '#ffffff',
        boxShadow: 'none',
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
        '&:hover': {
          borderColor: '#94a3b8',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
      }}
    >
      {/* Badge giảm giá */}
      {hasDiscount && (
        <Chip
          label={`-${discountPercent}%`}
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            bgcolor: '#dc2626',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.75rem',
            height: 22,
            zIndex: 1,
          }}
        />
      )}

      {/* Ảnh sản phẩm chuẩn 1:1, bo góc, cùng 1 kích thước */}
      <Box
        component={Link}
        to={`/products/${product.id}`}
        sx={{
          position: 'relative',
          width: 'calc(100% - 20px)',
          aspectRatio: '1 / 1',
          m: '10px 10px 0 10px',
          bgcolor: '#f8fafc',
          borderRadius: 2.5,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #f1f5f9',
        }}
      >
        <Box
          component="img"
          src={product.thumbnailUrl || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500'}
          alt={product.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            p: 2,
            borderRadius: 2.5,
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        />
      </Box>

      {/* Nội dung sản phẩm */}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ textTransform: 'uppercase', letterSpacing: '0.3px' }}>
          {product.subcategoryName || product.categoryName}
        </Typography>

        <Typography
          component={Link}
          to={`/products/${product.id}`}
          variant="body1"
          fontWeight={600}
          sx={{
            mt: 0.5,
            mb: 1.5,
            textDecoration: 'none',
            color: '#0f172a',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: 44,
            lineHeight: 1.4,
            fontSize: '0.925rem',
            '&:hover': { color: 'primary.main' },
          }}
        >
          {product.name}
        </Typography>

        <Box sx={{ mt: 'auto', mb: 2 }}>
          {hasDiscount ? (
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography variant="h6" color="#dc2626" fontWeight={700} sx={{ fontSize: '1.1rem' }}>
                {formatVND(product.discountPrice!)}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: 'line-through', fontSize: '0.85rem' }}
              >
                {formatVND(product.price)}
              </Typography>
            </Box>
          ) : (
            <Typography variant="h6" color="#0f172a" fontWeight={700} sx={{ fontSize: '1.1rem' }}>
              {formatVND(product.price)}
            </Typography>
          )}
        </Box>

        <Button
          fullWidth
          variant="outlined"
          size="small"
          startIcon={<AddShoppingCartOutlined fontSize="small" />}
          sx={{
            borderRadius: 2,
            borderColor: '#cbd5e1',
            color: '#0f172a',
            fontWeight: 600,
            py: 0.8,
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: '#f0f9ff',
            },
          }}
          onClick={() => alert(`Đã thêm "${product.name}" vào giỏ hàng!`)}
        >
          Thêm vào giỏ
        </Button>
      </CardContent>
    </Card>
  );
};
