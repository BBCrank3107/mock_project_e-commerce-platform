import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
} from '@mui/material';
import { ShoppingCartOutlined, VisibilityOutlined } from '@mui/icons-material';
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
        borderRadius: 3,
        transition: 'transform 0.2s, box-shadow 0.2s',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      {hasDiscount && (
        <Chip
          label={`-${discountPercent}%`}
          color="error"
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            fontWeight: 'bold',
            zIndex: 1,
          }}
        />
      )}

      <Box sx={{ position: 'relative', pt: '75%', bgcolor: '#f8fafc', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          image={product.thumbnailUrl || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500'}
          alt={product.name}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            p: 1,
            borderRadius: 3,
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          {product.subcategoryName || product.categoryName}
        </Typography>

        <Typography
          component={Link}
          to={`/products/${product.id}`}
          variant="subtitle1"
          fontWeight="bold"
          sx={{
            mt: 0.5,
            mb: 1,
            textDecoration: 'none',
            color: 'text.primary',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: 48,
            '&:hover': { color: 'primary.main' },
          }}
        >
          {product.name}
        </Typography>

        <Box sx={{ mt: 'auto', mb: 2 }}>
          {hasDiscount ? (
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography variant="h6" color="error.main" fontWeight="bold">
                {formatVND(product.discountPrice!)}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: 'line-through' }}
              >
                {formatVND(product.price)}
              </Typography>
            </Box>
          ) : (
            <Typography variant="h6" color="primary.main" fontWeight="bold">
              {formatVND(product.price)}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            component={Link}
            to={`/products/${product.id}`}
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<VisibilityOutlined />}
            sx={{ borderRadius: 2 }}
          >
            Chi tiết
          </Button>
          <Button
            fullWidth
            variant="contained"
            size="small"
            startIcon={<ShoppingCartOutlined />}
            sx={{ borderRadius: 2 }}
            onClick={() => alert(`Đã thêm "${product.name}" vào giỏ hàng!`)}
          >
            Mua
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
