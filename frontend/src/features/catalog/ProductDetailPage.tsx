import { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Container,
  Divider,
  IconButton,
  Paper,
  Rating,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add,
  ArrowBack,
  ArrowForward,
  LocalShippingOutlined,
  Remove,
  VerifiedOutlined,
} from '@mui/icons-material';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { catalogApi } from './catalogApi';
import type { Product, Review } from './types';
import { ProductImage } from '../../components/common/ProductImage';
import { EmptyState } from '../../components/common/EmptyState';
import { AddToCartButton } from '../cart_checkout/AddToCartButton';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../cart_checkout/CartContext';
import { transactionApi, errorMessage, money } from '../cart_checkout/transactionApi';
import { WishlistButton } from '../wishlist/WishlistButton';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const catalog = (location.state as { catalog?: unknown } | null)?.catalog;
  const backToCatalog =
    typeof catalog === 'string' && /^\/\?(?!\/)/.test(catalog) ? catalog : '/#collection';
  const { isAuthenticated } = useAuth();
  const { add, busy } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [image, setImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [stock, setStock] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [reviewsError, setReviewsError] = useState('');
  const [rating, setRating] = useState<number | null>(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [sending, setSending] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setQuantity(1);
    setProduct(null);
    setReviews([]);
    setReviewSuccess('');
    setReviewError('');
    setComment('');
    setReviewsError('');
    catalogApi
      .getProductById(Number(id))
      .then((data) => {
        if (active) {
          setProduct(data);
          setImage(data.thumbnailUrl);
        }
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    catalogApi
      .getReviews(Number(id))
      .then((data) => {
        if (active) setReviews(data);
      })
      .catch((err) => {
        if (active) setReviewsError(errorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [id, retry]);
  useEffect(() => {
    let active = true;
    setStock(null);
    if (isAuthenticated)
      transactionApi
        .inventory(Number(id))
        .then((data) => {
          if (active) {
            setStock(data.stockQuantity);
            setQuantity((value) => Math.max(1, Math.min(value, data.stockQuantity)));
          }
        })
        .catch(() => {});
    return () => {
      active = false;
    };
  }, [id, isAuthenticated, retry]);
  const buyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    try {
      await add(Number(id), quantity);
      navigate('/checkout');
    } catch (err) {
      setError(errorMessage(err));
    }
  };
  const sendReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!rating || !comment.trim()) return;
    setSending(true);
    setReviewError('');
    setReviewSuccess('');
    try {
      const review = await catalogApi.addReview(Number(id), { rating, comment: comment.trim() });
      setReviews((previous) => [review, ...previous.filter((r) => r.id !== review.id)]);
      setComment('');
      setReviewSuccess('Cảm ơn bạn đã chia sẻ trải nghiệm.');
    } catch (err) {
      setReviewError(errorMessage(err));
    } finally {
      setSending(false);
    }
  };
  if (loading)
    return (
      <Container sx={{ py: 5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 5 }}>
          <Skeleton variant="rounded" sx={{ height: 'auto', aspectRatio: '1' }} />
          <Box>
            <Skeleton height={80} />
            <Skeleton height={60} />
            <Skeleton height={200} />
          </Box>
        </Box>
      </Container>
    );
  if (!product)
    return (
      <Container sx={{ py: 5 }}>
        <EmptyState
          title="Chưa thể tải sản phẩm"
          description={error || 'Sản phẩm có thể đã ngừng kinh doanh.'}
          action={
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button onClick={() => setRetry((n) => n + 1)} variant="contained">
                Thử lại
              </Button>
              <Button component={Link} to="/">
                Về cửa hàng
              </Button>
            </Stack>
          }
        />
      </Container>
    );
  const discounted = product.discountPrice != null && product.discountPrice < product.price;
  const images = Array.from(
    new Set([product.thumbnailUrl, ...(product.imageUrls || [])].filter(Boolean))
  );
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
  const unavailable = !product.isActive || stock === 0;
  return (
    <Container sx={{ py: { xs: 3, md: 4 } }}>
      <Breadcrumbs sx={{ mb: 4, fontSize: 12 }}>
        <Link to="/">Cửa hàng</Link>
        <Link to={`/?subcategoryId=${product.subcategoryId}#collection`}>
          {product.subcategoryName}
        </Link>
        <Typography variant="caption" color="text.primary">
          Chi tiết sản phẩm
        </Typography>
      </Breadcrumbs>
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' },
          gap: { xs: 4, md: 7 },
          alignItems: 'start',
        }}
      >
        <Box>
          <Box sx={{ aspectRatio: '1', borderRadius: 3, bgcolor: '#eceee5', overflow: 'hidden' }}>
            <ProductImage src={image} alt={product.name} />
          </Box>
          {images.length > 1 && (
            <Stack direction="row" spacing={1.5} sx={{ mt: 2, overflowX: 'auto', pb: 1 }}>
              {images.map((url, index) => (
                <Box
                  key={url}
                  component="button"
                  aria-label={`Xem ảnh ${index + 1}`}
                  aria-pressed={image === url}
                  onClick={() => setImage(url)}
                  sx={{
                    p: 0.5,
                    width: 72,
                    height: 72,
                    flexShrink: 0,
                    border: '1px solid',
                    borderColor: image === url ? 'primary.main' : 'divider',
                    bgcolor: '#fff',
                    borderRadius: 2,
                    cursor: 'pointer',
                    overflow: 'hidden',
                  }}
                >
                  <ProductImage src={url} alt={`${product.name} — ảnh ${index + 1}`} />
                </Box>
              ))}
            </Stack>
          )}
        </Box>
        <Box sx={{ pt: { md: 1 } }}>
          <Typography variant="overline" color="secondary.main">
            {product.subcategoryName} / CYBERTECH SELECT
          </Typography>
          <Typography component="h1" variant="h3" sx={{ mt: 1.5, lineHeight: 1.3 }}>
            {product.name}
          </Typography>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 2 }}>
            <Rating value={average} precision={0.1} readOnly size="small" />
            <Typography component="a" href="#reviews" variant="caption" color="text.secondary">
              {reviews.length
                ? `${average.toFixed(1)} · ${reviews.length} đánh giá`
                : 'Chưa có đánh giá'}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="baseline" flexWrap="wrap" gap={2} sx={{ my: 3 }}>
            <Typography sx={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.05em' }}>
              {money(discounted ? product.discountPrice! : product.price)}
            </Typography>
            {discounted && (
              <Typography color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                {money(product.price)}
              </Typography>
            )}
          </Stack>
          <Divider />
          <Typography color="text.secondary" variant="body2" sx={{ my: 3, whiteSpace: 'pre-line' }}>
            {product.description || 'Thông tin chi tiết sẽ được cập nhật.'}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: unavailable ? 'error.main' : 'primary.main',
              }}
            />
            <Typography variant="caption" color={unavailable ? 'error.main' : 'text.secondary'}>
              {unavailable
                ? 'Sản phẩm hiện chưa có sẵn'
                : stock == null
                  ? 'Tồn kho được kiểm tra khi thêm vào giỏ'
                  : `Còn ${stock} sản phẩm`}
            </Typography>
            {product.sku && (
              <Chip
                variant="outlined"
                size="small"
                label={product.sku}
                sx={{ ml: 'auto !important' }}
              />
            )}
          </Stack>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Stack
              direction="row"
              alignItems="center"
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: '#fff' }}
            >
              <IconButton
                aria-label="Giảm số lượng"
                disabled={quantity <= 1 || busy}
                onClick={() => setQuantity((q) => q - 1)}
              >
                <Remove fontSize="small" />
              </IconButton>
              <Typography sx={{ minWidth: 26, textAlign: 'center' }}>{quantity}</Typography>
              <IconButton
                aria-label="Tăng số lượng"
                disabled={busy || quantity >= (stock ?? 999)}
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Add fontSize="small" />
              </IconButton>
            </Stack>
            <AddToCartButton productId={product.id} quantity={quantity} disabled={unavailable} />
            <WishlistButton product={product} size="large" />
          </Stack>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            endIcon={<ArrowForward />}
            disabled={busy || unavailable}
            onClick={() => void buyNow()}
          >
            Mua ngay
          </Button>
          <Box sx={{ mt: 3, p: 2.5, bgcolor: '#ecefe5', borderRadius: 2 }}>
            <Stack direction="row" spacing={1.5} sx={{ mb: 1 }} alignItems="center">
              <VerifiedOutlined sx={{ fontSize: 18 }} />
              <Typography variant="caption">
                Thông tin và giá được kiểm tra trước khi đặt hàng.
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <LocalShippingOutlined sx={{ fontSize: 18 }} />
              <Typography variant="caption">Chọn địa chỉ nhận hàng tại bước thanh toán.</Typography>
            </Stack>
          </Box>
        </Box>
      </Box>
      <Box id="reviews" sx={{ mt: { xs: 6, md: 9 } }}>
        <Divider sx={{ mb: 4 }} />
        <Typography variant="overline" color="secondary.main">
          SHARED EXPERIENCES
        </Typography>
        <Typography variant="h4" component="h2" sx={{ mt: 1, mb: 4 }}>
          Trải nghiệm từ khách hàng.
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1.2fr' },
            gap: 4,
            alignItems: 'start',
          }}
        >
          <Paper sx={{ p: 3 }}>
            {isAuthenticated ? (
              <Box component="form" onSubmit={sendReview}>
                <Typography variant="h6">Chia sẻ đánh giá của bạn</Typography>
                {reviewError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {reviewError}
                  </Alert>
                )}
                {reviewSuccess && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    {reviewSuccess}
                  </Alert>
                )}
                <Rating
                  name="Đánh giá sản phẩm"
                  value={rating}
                  onChange={(_, value) => setRating(value)}
                  disabled={sending}
                  sx={{ my: 2 }}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Trải nghiệm của bạn"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={sending}
                  inputProps={{ maxLength: 2000 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={sending || !rating || !comment.trim()}
                  sx={{ mt: 2 }}
                >
                  {sending ? 'Đang gửi...' : 'Gửi đánh giá'}
                </Button>
              </Box>
            ) : (
              <Box>
                <Typography variant="h6">Câu chuyện của bạn có ý nghĩa.</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                  Đăng nhập để chia sẻ trải nghiệm sản phẩm.
                </Typography>
                <Button
                  component={Link}
                  to="/login"
                  state={{ from: `/products/${id}#reviews` }}
                  variant="outlined"
                >
                  Đăng nhập
                </Button>
              </Box>
            )}
          </Paper>
          <Stack spacing={2}>
            {reviewsError && (
              <Alert
                severity="error"
                action={<Button onClick={() => setRetry((n) => n + 1)}>Thử lại</Button>}
              >
                {reviewsError}
              </Alert>
            )}
            {!reviewsError && !reviews.length && (
              <Typography color="text.secondary">
                Chưa có đánh giá. Hãy là người đầu tiên chia sẻ.
              </Typography>
            )}
            {reviews.map((review) => (
              <Paper key={review.id} sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar
                    src={review.userAvatar}
                    sx={{ width: 36, height: 36, bgcolor: '#e8ece2', color: 'primary.main' }}
                  >
                    {review.fullName?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {review.fullName || review.username}
                    </Typography>
                    <Rating readOnly size="small" value={review.rating} />
                  </Box>
                </Stack>
                <Typography
                  variant="body2"
                  sx={{ mt: 2, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                >
                  {review.comment}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </Box>
      </Box>
      <Button component={Link} to={backToCatalog} startIcon={<ArrowBack />} sx={{ mt: 4 }}>
        Về bộ sưu tập
      </Button>
    </Container>
  );
}
