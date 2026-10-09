import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import type { Product } from './types';
import { AddToCartButton } from '../cart_checkout/AddToCartButton';
import { money } from '../cart_checkout/transactionApi';
import { ProductImage } from '../../components/common/ProductImage';
import { WishlistButton } from '../wishlist/WishlistButton';

export function ProductCard({ product }: { product: Product }) {
  const location = useLocation();
  const catalogState = { catalog: `${location.pathname}${location.search}#collection` };
  const discounted = product.discountPrice != null && product.discountPrice < product.price;
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2.5,
        overflow: 'hidden',
        transition: 'transform 180ms, box-shadow 180ms',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 14px 32px #263c3010' },
      }}
    >
      <Box
        sx={{
          aspectRatio: '1',
          position: 'relative',
          bgcolor: '#eef0e9',
          overflow: 'hidden',
        }}
      >
        <Box
          component={Link}
          to={`/products/${product.id}`}
          state={catalogState}
          sx={{ display: 'block', width: '100%', height: '100%' }}
        >
          <ProductImage
            src={product.thumbnailUrl}
            alt={product.name}
            sx={{ transition: 'transform 400ms', '&:hover': { transform: 'scale(1.04)' } }}
          />
        </Box>
        {discounted && (
          <Chip
            size="small"
            label={`−${Math.round((1 - product.discountPrice! / product.price) * 100)}%`}
            sx={{ position: 'absolute', top: 12, left: 12, bgcolor: '#fff', color: 'primary.main', fontWeight: 600 }}
          />
        )}
        <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}>
          <WishlistButton product={product} size="small" />
        </Box>
      </Box>
      <CardContent
        sx={{
          p: { xs: 1.5, sm: 2.5 },
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          '&:last-child': { pb: { xs: 1.5, sm: 2.5 } },
        }}
      >
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ fontSize: { xs: 8, sm: 9 }, mb: 0.75 }}
        >
          {product.subcategoryName || product.categoryName}
        </Typography>
        <Typography
          component={Link}
          to={`/products/${product.id}`}
          state={catalogState}
          sx={{
            fontSize: { xs: 12, sm: 14 },
            fontWeight: 500,
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: { xs: 39, sm: 45 },
            '&:hover': { color: 'primary.main' },
          }}
        >
          {product.name}
        </Typography>
        <Box sx={{ mt: 'auto', pt: 2, pb: 2 }}>
          <Typography
            sx={{ fontWeight: 600, fontSize: { xs: 14, sm: 17 }, letterSpacing: '-0.03em' }}
          >
            {money(discounted ? product.discountPrice! : product.price)}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              textDecoration: 'line-through',
              color: 'text.secondary',
              minHeight: 20,
              display: 'block',
              visibility: discounted ? 'visible' : 'hidden',
            }}
          >
            {money(product.price)}
          </Typography>
        </Box>
        <AddToCartButton productId={product.id} compact />
      </CardContent>
    </Card>
  );
}
