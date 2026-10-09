import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { DeleteOutline, ArrowForward } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { PageHeading } from '../../components/common/PageHeading';
import { ProductImage } from '../../components/common/ProductImage';
import { EmptyState } from '../../components/common/EmptyState';
import { AddToCartButton } from '../cart_checkout/AddToCartButton';
import { money } from '../cart_checkout/transactionApi';
import { useWishlist } from '../../context/WishlistContext';

export const WishlistPage: React.FC = () => {
  const { items, loading, removeFromWishlist } = useWishlist();

  return (
    <Container sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeading
        eyebrow="TỦ ĐỒ CỦA BẠN"
        title="Sản phẩm yêu thích"
        description="Bộ sưu tập những thiết bị bạn đã lưu lại để tham khảo hoặc mua sắm sau."
        action={
          items.length > 0 && (
            <Chip
              label={`${items.length} sản phẩm đã lưu`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          )
        }
      />

      {loading && items.length === 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 2.5,
          }}
        >
          {Array.from({ length: 4 }, (_, i) => (
            <Paper key={i} sx={{ p: 2, borderRadius: 2.5 }}>
              <Skeleton variant="rounded" sx={{ aspectRatio: '1', height: 'auto' }} />
              <Skeleton sx={{ mt: 2 }} />
              <Skeleton width="60%" />
              <Skeleton height={40} sx={{ mt: 1 }} />
            </Paper>
          ))}
        </Box>
      ) : items.length === 0 ? (
        <EmptyState
          title="Chưa có sản phẩm yêu thích nào"
          description="Khám phá các thiết bị công nghệ tinh tuyển và lưu lại những món đồ bạn yêu thích nhất để tiện mua sắm sau."
          action={
            <Button
              component={Link}
              to="/#collection"
              variant="contained"
              endIcon={<ArrowForward />}
              sx={{ mt: 1 }}
            >
              Khám phá bộ sưu tập
            </Button>
          }
        />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: { xs: 1.5, sm: 2.5 },
          }}
        >
          {items.map(({ id: wishId, product }) => {
            const discounted =
              product.discountPrice != null && product.discountPrice < product.price;
            return (
              <Card
                key={wishId}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2.5,
                  overflow: 'hidden',
                  transition: 'transform 180ms, box-shadow 180ms',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 14px 32px rgba(38, 60, 48, 0.1)',
                  },
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
                    sx={{ display: 'block', width: '100%', height: '100%' }}
                  >
                    <ProductImage
                      src={product.thumbnailUrl}
                      alt={product.name}
                      sx={{ transition: 'transform 400ms', '&:hover': { transform: 'scale(1.05)' } }}
                    />
                  </Box>

                  {discounted && (
                    <Chip
                      size="small"
                      label={`−${Math.round((1 - product.discountPrice! / product.price) * 100)}%`}
                      sx={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        bgcolor: '#fff',
                        color: 'primary.main',
                        fontWeight: 600,
                      }}
                    />
                  )}

                  <Tooltip title="Xóa khỏi yêu thích">
                    <IconButton
                      size="small"
                      onClick={() => void removeFromWishlist(product.id)}
                      aria-label={`Xóa ${product.name} khỏi yêu thích`}
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(4px)',
                        '&:hover': { bgcolor: '#fee2e2', color: '#dc2626' },
                      }}
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <CardContent
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    '&:last-child': { pb: { xs: 1.5, sm: 2 } },
                  }}
                >
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ fontSize: { xs: 8, sm: 9 }, mb: 0.5 }}
                  >
                    {product.subcategoryName || 'Thiết bị'}
                  </Typography>
                  <Typography
                    component={Link}
                    to={`/products/${product.id}`}
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      lineHeight: 1.35,
                      minHeight: '2.7em',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 1.5,
                      color: 'text.primary',
                      textDecoration: 'none',
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    {product.name}
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mb: 2, mt: 'auto' }}>
                    <Typography sx={{ fontWeight: 600, fontSize: { xs: 14, sm: 16 } }}>
                      {money(discounted ? product.discountPrice! : product.price)}
                    </Typography>
                    {discounted && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ textDecoration: 'line-through' }}
                      >
                        {money(product.price)}
                      </Typography>
                    )}
                  </Stack>

                  <AddToCartButton productId={product.id} />
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Container>
  );
};
