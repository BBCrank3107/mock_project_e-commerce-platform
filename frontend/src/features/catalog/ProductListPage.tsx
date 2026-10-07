import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Skeleton,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowForward,
  ArrowOutward,
  Close,
  SearchOutlined,
  TuneOutlined,
} from '@mui/icons-material';
import { Link, useSearchParams } from 'react-router-dom';
import { catalogApi } from './catalogApi';
import { readCatalogQuery, updateCatalogQuery } from './catalogQuery';
import type { Category, Product } from './types';
import { ProductCard } from './ProductCard';
import { ProductImage } from '../../components/common/ProductImage';
import { EmptyState } from '../../components/common/EmptyState';
import { errorMessage, money } from '../cart_checkout/transactionApi';

export function ProductListPage() {
  const [params, setParams] = useSearchParams();
  const { keyword, subcategory, minPrice, maxPrice, page, sort } = readCatalogQuery(params);
  const [products, setProducts] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [retry, setRetry] = useState(0);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const [input, setInput] = useState(keyword);
  const [range, setRange] = useState([minPrice, maxPrice]);
  const query = params.toString();
  const change = (patch: Record<string, string | undefined>) => {
    setParams((previous) => updateCatalogQuery(previous, patch));
  };
  useEffect(() => setInput(keyword), [keyword]);
  useEffect(() => setRange([minPrice, maxPrice]), [minPrice, maxPrice]);
  useEffect(() => {
    if (input === keyword) return;
    const timer = window.setTimeout(() => change({ keyword: input.trim() || undefined }), 350);
    return () => window.clearTimeout(timer);
  }, [input, keyword]);
  useEffect(() => {
    let active = true;
    catalogApi
      .getCategories()
      .then((data) => {
        if (active) {
          setCategories(data);
          setCategoryError('');
        }
      })
      .catch((err) => {
        if (active) setCategoryError(errorMessage(err));
      });
    catalogApi
      .getProducts({ size: 15 })
      .then((data) => {
        if (active)
          setFeatured(data.content.find((p) => /macbook/i.test(p.name)) || data.content[0] || null);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [retry]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const [sortBy, sortDir] = sort.split('-');
    catalogApi
      .getProducts({
        keyword: keyword || undefined,
        subcategoryId: subcategory,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice < 60000000 ? maxPrice : undefined,
        sortBy,
        sortDir,
        page: page - 1,
        size: 9,
      })
      .then((data) => {
        if (!active) return;
        setProducts(data.content);
        setTotal(data.totalElements);
        setPages(data.totalPages);
        if (data.totalPages > 0 && page > data.totalPages)
          change({ page: String(data.totalPages) });
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query, retry]);
  const filtered = !!keyword || !!subcategory || minPrice > 0 || maxPrice < 60000000;
  const clear = () => {
    setInput('');
    setParams({});
  };
  const filters = (
    <Box sx={{ p: { xs: 3, md: 0 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6">Tinh chỉnh lựa chọn</Typography>
        {filtered && (
          <Button size="small" onClick={clear}>
            Xóa lọc
          </Button>
        )}
      </Stack>
      <Typography variant="overline" color="text.secondary">
        Danh mục
      </Typography>
      {categoryError && (
        <Alert severity="error" sx={{ my: 2 }}>
          {categoryError}
          <Button onClick={() => setRetry((n) => n + 1)}>Thử lại</Button>
        </Alert>
      )}
      <Button
        fullWidth
        onClick={() => change({ subcategoryId: undefined })}
        sx={{
          justifyContent: 'space-between',
          mt: 1,
          bgcolor: !subcategory ? '#e8ece2' : 'transparent',
        }}
      >
        Tất cả sản phẩm
        <ArrowOutward sx={{ fontSize: 15 }} />
      </Button>
      {categories.map((cat) => (
        <Box key={cat.id} sx={{ mt: 2.5 }}>
          <Typography variant="body2" fontWeight={600} sx={{ px: 1.5, mb: 0.5 }}>
            {cat.name}
          </Typography>
          {cat.subcategories?.map((sub) => (
            <Button
              key={sub.id}
              size="small"
              fullWidth
              onClick={() => change({ subcategoryId: String(sub.id) })}
              sx={{
                justifyContent: 'flex-start',
                px: 1.5,
                color: subcategory === sub.id ? 'primary.main' : 'text.secondary',
                bgcolor: subcategory === sub.id ? '#e8ece2' : 'transparent',
                fontWeight: subcategory === sub.id ? 600 : 400,
              }}
            >
              {sub.name}
            </Button>
          ))}
        </Box>
      ))}
      <Divider sx={{ my: 3 }} />
      <Typography variant="overline" color="text.secondary">
        Khoảng giá
      </Typography>
      <Box sx={{ px: 1, mt: 2 }}>
        <Slider
          value={range}
          min={0}
          max={60000000}
          step={500000}
          onChange={(_, value) => setRange(value as number[])}
          onChangeCommitted={(_, value) => {
            const [min, max] = value as number[];
            change({
              minPrice: min ? String(min) : undefined,
              maxPrice: max < 60000000 ? String(max) : undefined,
            });
          }}
          getAriaLabel={() => 'Khoảng giá sản phẩm'}
          getAriaValueText={money}
        />
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="caption">{money(range[0])}</Typography>
          <Typography variant="caption">{money(range[1])}</Typography>
        </Stack>
      </Box>
    </Box>
  );
  return (
    <Container sx={{ py: { xs: 3, md: 4 } }}>
      {!filtered && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.05fr 1fr' },
            bgcolor: '#e9ebdf',
            borderRadius: 4,
            overflow: 'hidden',
            mb: 6,
          }}
        >
          <Box sx={{ p: { xs: 4, md: 6 }, alignSelf: 'center' }}>
            <Typography variant="overline" color="primary.main">
              THE CURATED EDIT / 2026
            </Typography>
            <Typography component="h1" variant="h1" sx={{ mt: 2, maxWidth: 550 }}>
              Công nghệ tốt.
              <br />
              <Box
                component="span"
                sx={{
                  fontFamily: 'Georgia, serif',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  color: '#5b7158',
                }}
              >
                Cuộc sống đẹp.
              </Box>
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 3, mb: 3, maxWidth: 370 }}>
              Khám phá những thiết bị được chọn lọc cho công việc, sáng tạo và từng khoảnh khắc của
              bạn.
            </Typography>
            <Button component="a" href="#collection" variant="contained" endIcon={<ArrowForward />}>
              Khám phá bộ sưu tập
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 3, color: 'text.secondary' }}>
              THIẾT BỊ SỐ · ÂM THANH · PHỤ KIỆN
            </Typography>
          </Box>
          <Box sx={{ position: 'relative', minHeight: { xs: 260, md: 460 }, bgcolor: '#d8dfd0' }}>
            {featured ? (
              <>
                <ProductImage
                  src={featured.thumbnailUrl}
                  alt={featured.name}
                  sx={{ position: 'absolute', inset: 0 }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 24,
                    left: 24,
                    right: 24,
                    p: 2.5,
                    bgcolor: 'rgba(255,255,255,0.93)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="overline" color="secondary.main">
                    Lựa chọn nổi bật
                  </Typography>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {featured.name}
                    </Typography>
                    <IconButton
                      component={Link}
                      to={`/products/${featured.id}`}
                      aria-label={`Khám phá ${featured.name}`}
                    >
                      <ArrowOutward />
                    </IconButton>
                  </Stack>
                </Box>
              </>
            ) : (
              <Box sx={{ p: 6, height: '100%', display: 'grid', placeItems: 'center' }}>
                <Typography
                  sx={{ fontSize: 110, letterSpacing: '-0.1em', color: '#aab79e', fontWeight: 600 }}
                >
                  CT.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}
      <Box id="collection" sx={{ mb: 4 }}>
        <Typography variant="overline" color="secondary.main">
          CURATED FOR YOU
        </Typography>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          sx={{ mt: 1 }}
        >
          <Typography component={filtered ? 'h1' : 'h2'} variant="h4">
            {keyword ? `Kết quả cho “${keyword}”` : 'Tìm điều bạn yêu thích.'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            {loading ? 'Đang tải...' : `${total} sản phẩm`}
          </Typography>
        </Stack>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '225px minmax(0, 1fr)' },
          gap: { xs: 2, md: 5 },
        }}
      >
        <Box
          component="aside"
          sx={{
            display: { xs: 'none', md: 'block' },
            pr: 3,
            borderRight: '1px solid',
            borderColor: 'divider',
          }}
        >
          {filters}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2.5 }}>
            <TextField
              size="small"
              placeholder="Tên sản phẩm, thiết bị..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              inputProps={{ 'aria-label': 'Tìm trong bộ sưu tập' }}
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<TuneOutlined />}
                onClick={() => setDrawer(true)}
                sx={{ display: { md: 'none' } }}
              >
                Bộ lọc
              </Button>
              <TextField
                select
                size="small"
                value={sort}
                label="Sắp xếp"
                onChange={(e) => change({ sort: e.target.value })}
                sx={{ minWidth: 165, flex: 1 }}
              >
                <MenuItem value="createdAt-desc">Mới nhất</MenuItem>
                <MenuItem value="price-asc">Giá thấp đến cao</MenuItem>
                <MenuItem value="price-desc">Giá cao đến thấp</MenuItem>
                <MenuItem value="name-asc">Tên A–Z</MenuItem>
              </TextField>
            </Stack>
          </Stack>
          {filtered && (
            <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 2.5 }}>
              {keyword && (
                <Chip
                  label={keyword}
                  onDelete={() => {
                    setInput('');
                    change({ keyword: undefined });
                  }}
                />
              )}
              {subcategory && (
                <Chip
                  label={
                    categories
                      .flatMap((c) => c.subcategories || [])
                      .find((s) => s.id === subcategory)?.name || 'Danh mục đã chọn'
                  }
                  onDelete={() => change({ subcategoryId: undefined })}
                />
              )}
              {(minPrice > 0 || maxPrice < 60000000) && (
                <Chip
                  label={`${money(minPrice)} – ${money(maxPrice)}`}
                  onDelete={() => change({ minPrice: undefined, maxPrice: undefined })}
                />
              )}
            </Stack>
          )}
          {error ? (
            <Alert
              severity="error"
              action={<Button onClick={() => setRetry((n) => n + 1)}>Thử lại</Button>}
            >
              {error}
            </Alert>
          ) : loading ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(3, 1fr)' },
                gap: 2,
              }}
            >
              {Array.from({ length: 6 }, (_, i) => (
                <Paper key={i} sx={{ p: 2 }}>
                  <Skeleton variant="rounded" sx={{ aspectRatio: '1', height: 'auto' }} />
                  <Skeleton sx={{ mt: 2 }} />
                  <Skeleton width="60%" />
                  <Skeleton height={48} />
                </Paper>
              ))}
            </Box>
          ) : products.length ? (
            <>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(3, 1fr)' },
                  gap: { xs: 1.5, sm: 2.5 },
                }}
              >
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </Box>
              {pages > 1 && (
                <Stack alignItems="center" sx={{ mt: 4 }}>
                  <Pagination
                    count={pages}
                    page={page}
                    onChange={(_, value) => {
                      change({ page: String(value) });
                      document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    color="primary"
                    shape="rounded"
                  />
                </Stack>
              )}
            </>
          ) : (
            <EmptyState
              title="Chưa tìm thấy lựa chọn phù hợp"
              description="Thử từ khóa khác hoặc mở rộng bộ lọc để khám phá thêm sản phẩm."
              action={
                <Button onClick={clear} variant="outlined">
                  Xóa bộ lọc
                </Button>
              }
            />
          )}
        </Box>
      </Box>
      <Drawer
        anchor="left"
        open={drawer}
        onClose={() => setDrawer(false)}
        PaperProps={{ sx: { width: 'min(340px, 90vw)' } }}
      >
        <Stack direction="row" justifyContent="flex-end" sx={{ p: 1 }}>
          <IconButton aria-label="Đóng bộ lọc" onClick={() => setDrawer(false)}>
            <Close />
          </IconButton>
        </Stack>
        {filters}
        <Button variant="contained" onClick={() => setDrawer(false)} sx={{ m: 3 }}>
          Xem sản phẩm
        </Button>
      </Drawer>
    </Container>
  );
}
