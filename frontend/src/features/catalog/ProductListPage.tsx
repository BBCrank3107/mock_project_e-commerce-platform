import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  TextField,
  MenuItem,
  Pagination,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Slider,
  CircularProgress,
  InputAdornment,
  Breadcrumbs,
  Chip,
  Divider,
} from '@mui/material';
import {
  Search,
  TuneOutlined,
  RestartAlt,
  NavigateNext,
  StorefrontOutlined,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { catalogApi } from './catalogApi';
import type { Product, Category } from './types';
import { ProductCard } from './ProductCard';

export const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // States for Filter, Search, Sort, Paging
  const [keyword, setKeyword] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | undefined>(undefined);
  const [priceRange, setPriceRange] = useState<number[]>([0, 60000000]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    catalogApi.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await catalogApi.getProducts({
          keyword: keyword.trim() || undefined,
          subcategoryId: selectedSubcategory,
          minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
          maxPrice: priceRange[1] < 60000000 ? priceRange[1] : undefined,
          sortBy,
          sortDir,
          page: page - 1,
          size: 6,
        });
        setProducts(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      } catch (err) {
        console.error('Lỗi khi tải sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword, selectedSubcategory, priceRange, sortBy, sortDir, page]);

  const handleResetFilter = () => {
    setKeyword('');
    setSelectedSubcategory(undefined);
    setPriceRange([0, 60000000]);
    setSortBy('createdAt');
    setSortDir('desc');
    setPage(1);
  };

  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(val) + ' đ';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
      {/* Breadcrumb điều hướng tự nhiên */}
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2.5 }}>
        <Typography component={Link} to="/" color="text.secondary" variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <StorefrontOutlined fontSize="inherit" /> Trang chủ
        </Typography>
        <Typography color="text.primary" variant="body2" fontWeight={600}>
          Sản phẩm công nghệ
        </Typography>
      </Breadcrumbs>

      {/* Header tiêu đề đơn giản, chuyên nghiệp - KHÔNG GRADIENT */}
      <Box sx={{ mb: 3.5, pb: 2, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#0f172a" sx={{ letterSpacing: '-0.5px' }}>
            Danh Sách Sản Phẩm
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Thiết bị chính hãng, bảo hành toàn diện tại CyberTech Store
          </Typography>
        </Box>
        <Chip
          label={`${totalElements} sản phẩm`}
          color="default"
          variant="outlined"
          sx={{ fontWeight: 600, borderColor: '#cbd5e1' }}
        />
      </Box>

      <Grid container spacing={{ xs: 2.5, md: 3 }}>
        {/* CỘT BỘ LỌC BÊN TRÁI (FILTER) */}
        <Grid item xs={12} md={3.5} lg={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#0f172a' }}>
                  <TuneOutlined fontSize="small" color="primary" /> Bộ lọc
                </Typography>
                {(selectedSubcategory !== undefined || keyword || priceRange[0] > 0 || priceRange[1] < 60000000) && (
                  <Button
                    size="small"
                    startIcon={<RestartAlt />}
                    onClick={handleResetFilter}
                    sx={{ fontSize: '0.8rem', p: 0.5 }}
                  >
                    Xóa lọc
                  </Button>
                )}
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Lọc theo danh mục */}
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', mb: 1 }}>
                Danh mục
              </Typography>
              <RadioGroup
                value={selectedSubcategory ?? ''}
                onChange={(e) => {
                  setSelectedSubcategory(e.target.value !== '' ? Number(e.target.value) : undefined);
                  setPage(1);
                }}
              >
                <FormControlLabel
                  value=""
                  control={<Radio size="small" />}
                  label={<Typography variant="body2">Tất cả sản phẩm</Typography>}
                  sx={{ mb: 0.5 }}
                />
                {categories.map((cat) => (
                  <Box key={cat.id} sx={{ mb: 1.5 }}>
                    <Typography variant="body2" fontWeight={600} color="#334155" sx={{ py: 0.5 }}>
                      {cat.name}
                    </Typography>
                    {cat.subcategories?.map((sub) => (
                      <FormControlLabel
                        key={sub.id}
                        value={sub.id}
                        control={<Radio size="small" />}
                        label={<Typography variant="body2" color="text.secondary">{sub.name}</Typography>}
                        sx={{ display: 'block', ml: 1, my: 0.2 }}
                      />
                    ))}
                  </Box>
                ))}
              </RadioGroup>

              <Divider sx={{ my: 2.5 }} />

              {/* Lọc theo khoảng giá */}
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', mb: 1.5 }}>
                Khoảng giá (VNĐ)
              </Typography>
              <Box sx={{ px: 1 }}>
                <Slider
                  value={priceRange}
                  onChange={(_, newValue) => setPriceRange(newValue as number[])}
                  onChangeCommitted={() => setPage(1)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={60000000}
                  step={1000000}
                  valueLabelFormat={(val) => formatVND(val)}
                  size="small"
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {formatVND(priceRange[0])}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {formatVND(priceRange[1])}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* CỘT SẢN PHẨM BÊN PHẢI (LIST VIEW) */}
        <Grid item xs={12} md={8.5} lg={9}>
          {/* Thanh công cụ Tìm kiếm và Sắp xếp */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
              p: 2,
              bgcolor: '#ffffff',
              borderRadius: 3,
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Search Input */}
            <TextField
              size="small"
              placeholder="Tìm kiếm sản phẩm theo tên..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
              sx={{ flexGrow: 1, maxWidth: { xs: '100%', sm: 360 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Sort Selector */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                Sắp xếp:
              </Typography>
              <TextField
                select
                size="small"
                value={`${sortBy}-${sortDir}`}
                onChange={(e) => {
                  const [field, dir] = e.target.value.split('-');
                  setSortBy(field);
                  setSortDir(dir);
                  setPage(1);
                }}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="createdAt-desc">Mới nhất</MenuItem>
                <MenuItem value="price-asc">Giá tăng dần</MenuItem>
                <MenuItem value="price-desc">Giá giảm dần</MenuItem>
                <MenuItem value="name-asc">Tên A-Z</MenuItem>
              </TextField>
            </Box>
          </Box>

          {/* Lưới sản phẩm */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
              <CircularProgress size={36} />
            </Box>
          ) : products.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, bgcolor: '#ffffff', borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle1" fontWeight={600} color="#0f172a">
                Không tìm thấy sản phẩm nào
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                Vui lòng thử lại với từ khóa hoặc bộ lọc khác.
              </Typography>
              <Button variant="outlined" size="small" onClick={handleResetFilter}>
                Xóa bộ lọc
              </Button>
            </Box>
          ) : (
            <>
              <Grid container spacing={2.5}>
                {products.map((product) => (
                  <Grid item key={product.id} xs={12} sm={6} lg={4}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>

              {/* Phân trang chuẩn */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, pt: 2 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                    shape="rounded"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};
