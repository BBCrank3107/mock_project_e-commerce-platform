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
  Breadcrumbs,
} from '@mui/material';
import {
  AddShoppingCartOutlined,
  ArrowBackIosNewOutlined,
  NavigateNext,
  LocalShippingOutlined,
  VerifiedUserOutlined,
  RateReviewOutlined,
} from '@mui/icons-material';
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
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 14 }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  if (!product) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h6" color="error">Không tìm thấy sản phẩm!</Typography>
        <Button component={Link} to="/" variant="outlined" sx={{ mt: 2 }} startIcon={<ArrowBackIosNewOutlined />}>
          Quay lại danh sách
        </Button>
      </Container>
    );
  }

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <Container maxWidth="lg" sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
      {/* Breadcrumb */}
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Typography component={Link} to="/" color="text.secondary" variant="body2">
          Trang chủ
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {product.categoryName}
        </Typography>
        <Typography color="text.primary" variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 300 }}>
          {product.name}
        </Typography>
      </Breadcrumbs>

      <Grid container spacing={{ xs: 3, md: 5 }}>
        {/* Gallery Ảnh bên trái */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              width: '100%',
              aspectRatio: '1 / 1',
              borderRadius: 3,
              overflow: 'hidden',
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: { xs: 2, sm: 3 },
            }}
          >
            <Box
              component="img"
              src={activeImage || product.thumbnailUrl}
              alt={product.name}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: 2,
              }}
            />
          </Box>

          {/* Thumbnails */}
          {product.imageUrls && product.imageUrls.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1.5, mt: 2, overflowX: 'auto', py: 0.5 }}>
              <Box
                component="img"
                src={product.thumbnailUrl}
                alt="thumb"
                onClick={() => setActiveImage(product.thumbnailUrl)}
                sx={{
                  width: 72,
                  height: 72,
                  minWidth: 72,
                  aspectRatio: '1 / 1',
                  objectFit: 'contain',
                  borderRadius: 2,
                  p: 0.5,
                  cursor: 'pointer',
                  bgcolor: '#ffffff',
                  border: activeImage === product.thumbnailUrl ? '2px solid #0284c7' : '1px solid #e2e8f0',
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
                    width: 72,
                    height: 72,
                    minWidth: 72,
                    aspectRatio: '1 / 1',
                    objectFit: 'contain',
                    borderRadius: 2,
                    p: 0.5,
                    cursor: 'pointer',
                    bgcolor: '#ffffff',
                    border: activeImage === url ? '2px solid #0284c7' : '1px solid #e2e8f0',
                  }}
                />
              ))}
            </Box>
          )}
        </Grid>

        {/* Thông tin sản phẩm bên phải */}
        <Grid item xs={12} md={6}>
          <Chip label={product.subcategoryName} size="small" variant="outlined" sx={{ mb: 1.5, fontWeight: 600 }} />
          <Typography variant="h5" fontWeight={800} color="#0f172a" sx={{ lineHeight: 1.3, mb: 1.5 }}>
            {product.name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
            <Rating value={4.8} precision={0.1} readOnly size="small" />
            <Typography variant="body2" color="text.secondary">
              ({reviews.length} đánh giá)
            </Typography>
            <Divider orientation="vertical" flexItem />
            <Typography variant="body2" color="text.secondary">
              SKU: <b>{product.sku || 'N/A'}</b>
            </Typography>
          </Box>

          {/* Hộp Giá tiền phẳng, rõ ràng */}
          <Box sx={{ p: 2.5, bgcolor: '#ffffff', borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
            {hasDiscount ? (
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                <Typography variant="h4" color="#dc2626" fontWeight={800}>
                  {formatVND(product.discountPrice!)}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                  {formatVND(product.price)}
                </Typography>
              </Box>
            ) : (
              <Typography variant="h4" color="#0f172a" fontWeight={800}>
                {formatVND(product.price)}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Đã bao gồm thuế VAT (10%) và bảo hành chính hãng
            </Typography>
          </Box>

          {/* Dịch vụ cam kết */}
          <Box sx={{ display: 'flex', gap: 3, mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalShippingOutlined color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">Giao hàng miễn phí</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VerifiedUserOutlined color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">Bảo hành 12 tháng</Typography>
            </Box>
          </Box>

          <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8, mb: 4, color: '#334155' }}>
            {product.description}
          </Typography>

          <Button
            variant="contained"
            size="large"
            startIcon={<AddShoppingCartOutlined />}
            sx={{ px: 4, py: 1.4, fontWeight: 700, borderRadius: 2 }}
            onClick={() => alert(`Đã thêm "${product.name}" vào giỏ hàng!`)}
          >
            Thêm vào giỏ hàng
          </Button>
        </Grid>
      </Grid>

      <Divider sx={{ my: 6 }} />

      {/* Đánh giá & Nhận xét */}
      <Box sx={{ maxWidth: 840 }}>
        <Typography variant="h6" fontWeight={800} color="#0f172a" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RateReviewOutlined color="primary" /> Đánh giá & Nhận xét ({reviews.length})
        </Typography>

        {isAuthenticated ? (
          <Card sx={{ mb: 4, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Gửi nhận xét của bạn
              </Typography>

              {reviewSuccess && <Alert severity="success" sx={{ mb: 2 }}>{reviewSuccess}</Alert>}
              {reviewError && <Alert severity="error" sx={{ mb: 2 }}>{reviewError}</Alert>}

              <Box component="form" onSubmit={handleSendReview}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Typography variant="body2">Đánh giá sao:</Typography>
                  <Rating value={rating} onChange={(_, val) => setRating(val)} size="small" />
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Chia sẻ cảm nhận chân thật của bạn về sản phẩm này..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button type="submit" variant="contained" disabled={submittingReview || !comment.trim()}>
                  {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
            Vui lòng <Link to="/login" style={{ fontWeight: 600, color: '#0284c7' }}>Đăng nhập</Link> để viết đánh giá cho sản phẩm này.
          </Alert>
        )}

        {/* Danh sách bình luận */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {reviews.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Chưa có nhận xét nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!
            </Typography>
          ) : (
            reviews.map((rev) => (
              <Box
                key={rev.id}
                sx={{
                  p: 2.5,
                  bgcolor: '#ffffff',
                  borderRadius: 2.5,
                  border: '1px solid #e2e8f0',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Avatar src={rev.userAvatar} sx={{ width: 34, height: 34, bgcolor: '#e2e8f0', color: '#0f172a' }}>
                    {rev.fullName?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {rev.fullName || rev.username}
                    </Typography>
                    <Rating value={rev.rating} size="small" readOnly />
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ color: '#334155', mt: 1, pl: 6 }}>
                  {rev.comment}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </Box>
    </Container>
  );
};
