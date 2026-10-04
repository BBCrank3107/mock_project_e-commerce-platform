import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Chip,
  Divider,
  Rating,
  Card,
  CardContent,
  TextField,
  Alert,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { ShoppingCart, ArrowBack } from '@mui/icons-material';
import { useParams, Link } from 'react-router-dom';
import { catalogApi } from './catalogApi';
import type { Product, Review } from './types';
import { useAuth } from '../../context/AuthContext';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeImage, setActiveImage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Review Form
  const [rating, setRating] = useState<number | null>(5);
  const [comment, setComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const prod = await catalogApi.getProductById(Number(id));
        setProduct(prod);
        setActiveImage(prod.thumbnailUrl);
        const revs = await catalogApi.getReviews(Number(id));
        setReviews(revs);
      } catch (err) {
        console.error('Lỗi khi tải chi tiết:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleSendReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !rating || !comment.trim()) return;

    setSubmittingReview(true);
    setReviewError(null);
    setReviewSuccess(null);
    try {
      const newReview = await catalogApi.addReview(Number(id), {
        rating,
        comment: comment.trim(),
      });
      setReviews([newReview, ...reviews]);
      setComment('');
      setReviewSuccess('Cảm ơn bạn đã gửi đánh giá cho sản phẩm!');
    } catch (err: any) {
      setReviewError(err.response?.data?.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Không tìm thấy sản phẩm!</Typography>
        <Button component={Link} to="/" variant="outlined" sx={{ mt: 2 }} startIcon={<ArrowBack />}>
          Quay lại danh sách
        </Button>
      </Container>
    );
  }

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Button component={Link} to="/" startIcon={<ArrowBack />} sx={{ mb: 3 }}>
        Quay lại trang sản phẩm
      </Button>

      <Grid container spacing={5}>
        {/* Gallery Ảnh */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
              p: 2,
            }}
          >
            <Box
              component="img"
              src={activeImage || product.thumbnailUrl}
              alt={product.name}
              sx={{
                width: '100%',
                maxHeight: 480,
                objectFit: 'contain',
                borderRadius: 2,
              }}
            />
          </Box>

          {/* Thumbnails */}
          {product.imageUrls && product.imageUrls.length > 0 && (
            <Box sx={{ display: 'flex', gap: 2, mt: 2, overflowX: 'auto', py: 1 }}>
              <Box
                component="img"
                src={product.thumbnailUrl}
                alt="thumb"
                onClick={() => setActiveImage(product.thumbnailUrl)}
                sx={{
                  width: 70,
                  height: 70,
                  objectFit: 'cover',
                  borderRadius: 2,
                  cursor: 'pointer',
                  border: activeImage === product.thumbnailUrl ? '2px solid #38bdf8' : '1px solid #cbd5e1',
                }}
              />
              {product.imageUrls.map((url, idx) => (
                <Box
                  key={idx}
                  component="img"
                  src={url}
                  alt={`thumb-${idx}`}
                  onClick={() => setActiveImage(url)}
                  sx={{
                    width: 70,
                    height: 70,
                    objectFit: 'cover',
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: activeImage === url ? '2px solid #38bdf8' : '1px solid #cbd5e1',
                  }}
                />
              ))}
            </Box>
          )}
        </Grid>

        {/* Thông tin sản phẩm */}
        <Grid item xs={12} md={6}>
          <Chip label={product.subcategoryName} color="primary" size="small" sx={{ mb: 1.5 }} />
          <Typography variant="h4" fontWeight={800} gutterBottom>
            {product.name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Rating value={4.8} precision={0.1} readOnly />
            <Typography variant="body2" color="text.secondary">
              ({reviews.length} đánh giá khách hàng)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Mã SKU: <b>{product.sku}</b>
            </Typography>
          </Box>

          <Box sx={{ p: 2.5, bgcolor: '#f1f5f9', borderRadius: 3, mb: 3 }}>
            {hasDiscount ? (
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                <Typography variant="h4" color="error.main" fontWeight="bold">
                  {formatVND(product.discountPrice!)}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                  {formatVND(product.price)}
                </Typography>
              </Box>
            ) : (
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {formatVND(product.price)}
              </Typography>
            )}
          </Box>

          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8, mb: 4, color: '#334155' }}>
            {product.description}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCart />}
              sx={{ px: 4, py: 1.5, fontWeight: 'bold', borderRadius: 2 }}
              onClick={() => alert(`Đã thêm "${product.name}" vào giỏ hàng!`)}
            >
              Thêm Vào Giỏ Hàng
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 6 }} />

      {/* Phần Đánh Giá & Nhận Xét */}
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Đánh Giá & Nhận Xét ({reviews.length})
        </Typography>

        {/* Form gửi review */}
        {isAuthenticated ? (
          <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Gửi nhận xét của bạn
              </Typography>

              {reviewSuccess && <Alert severity="success" sx={{ mb: 2 }}>{reviewSuccess}</Alert>}
              {reviewError && <Alert severity="error" sx={{ mb: 2 }}>{reviewError}</Alert>}

              <Box component="form" onSubmit={handleSendReview}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="body2">Đánh giá của bạn:</Typography>
                  <Rating
                    value={rating}
                    onChange={(_, val) => setRating(val)}
                  />
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submittingReview || !comment.trim()}
                >
                  {submittingReview ? 'Đang gửi...' : 'Gửi Nhận Xét'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Alert severity="info" sx={{ mb: 4 }}>
            Vui lòng <Link to="/login"><b>Đăng nhập</b></Link> để viết đánh giá cho sản phẩm này.
          </Alert>
        )}

        {/* Danh sách reviews */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {reviews.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên nhận xét!
            </Typography>
          ) : (
            reviews.map((rev) => (
              <Card key={rev.id} variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Avatar src={rev.userAvatar} sx={{ width: 32, height: 32 }}>
                    {rev.fullName?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {rev.fullName || rev.username}
                    </Typography>
                    <Rating value={rev.rating} size="small" readOnly />
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ color: '#334155', mt: 1 }}>
                  {rev.comment}
                </Typography>
              </Card>
            ))
          )}
        </Box>
      </Box>
    </Container>
  );
};
