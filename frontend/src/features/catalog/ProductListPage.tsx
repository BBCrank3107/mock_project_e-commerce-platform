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
} from '@mui/material';
import { Search, FilterAlt, RestartAlt } from '@mui/icons-material';
import { catalogApi } from './catalogApi';
import type { Product, Category } from './types';
import { ProductCard } from './ProductCard';

export const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // States for Filter, Search, Sort, Paging (Requirements)
  const [keyword, setKeyword] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | undefined>(undefined);
  const [priceRange, setPriceRange] = useState<number[]>([0, 60000000]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Fetch categories once
  useEffect(() => {
    catalogApi.getCategories().then(setCategories).catch(console.error);
  }, []);

  // Fetch products on filter changes
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
          page: page - 1, // API 0-indexed
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Banner Header */}
      <Box
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Khám Phá Công Nghệ Đỉnh Cao
        </Typography>
        <Typography variant="body1" sx={{ color: '#94a3b8', maxWidth: 600 }}>
          Trải nghiệm các dòng sản phẩm chính hãng với mức giá ưu đãi nhất tại CyberTech Store.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* CỘT BỘ LỌC (FILTERING) */}
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, position: 'sticky', top: 80 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterAlt color="primary" /> Bộ Lọc
                </Typography>
                <Button size="small" startIcon={<RestartAlt />} onClick={handleResetFilter}>
                  Đặt lại
                </Button>
              </Box>

              {/* Lọc theo danh mục */}
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                Danh Mục Sản Phẩm
              </Typography>
              <RadioGroup
                value={selectedSubcategory || ''}
                onChange={(e) => {
                  setSelectedSubcategory(e.target.value ? Number(e.target.value) : undefined);
                  setPage(1);
                }}
              >
                <FormControlLabel value="" control={<Radio size="small" />} label="Tất cả sản phẩm" />
                {categories.map((cat) => (
                  <Box key={cat.id} sx={{ mb: 1 }}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary">
                      {cat.name}
                    </Typography>
                    {cat.subcategories?.map((sub) => (
                      <FormControlLabel
                        key={sub.id}
                        value={sub.id}
                        control={<Radio size="small" />}
                        label={sub.name}
                        sx={{ display: 'block', ml: 1 }}
                      />
                    ))}
                  </Box>
                ))}
              </RadioGroup>

              {/* Lọc theo khoảng giá */}
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
                Khoảng Giá (VNĐ)
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
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatVND(priceRange[0])}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatVND(priceRange[1])}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* CỘT DANH SÁCH SẢN PHẨM (LIST VIEW: SEARCH, SORT, PAGING) */}
        <Grid item xs={12} md={9}>
          {/* Controls Bar: Searching & Sorting */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            {/* Searching */}
            <TextField
              size="small"
              placeholder="Tìm kiếm sản phẩm theo tên..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
              sx={{ minWidth: 320, bgcolor: 'background.paper', borderRadius: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Sorting */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Sắp xếp theo:
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
                sx={{ minWidth: 180, bgcolor: 'background.paper', borderRadius: 2 }}
              >
                <MenuItem value="createdAt-desc">Mới nhất</MenuItem>
                <MenuItem value="price-asc">Giá tăng dần</MenuItem>
                <MenuItem value="price-desc">Giá giảm dần</MenuItem>
                <MenuItem value="name-asc">Tên A-Z</MenuItem>
              </TextField>
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Tìm thấy <b>{totalElements}</b> sản phẩm phù hợp
          </Typography>

          {/* Grid Products */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : products.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'background.paper', borderRadius: 3 }}>
              <Typography variant="h6" color="text.secondary">
                Không tìm thấy sản phẩm nào!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Vui lòng thử lại với từ khóa hoặc bộ lọc khác.
              </Typography>
              <Button variant="outlined" sx={{ mt: 2 }} onClick={handleResetFilter}>
                Đặt lại bộ lọc
              </Button>
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {products.map((product) => (
                  <Grid item key={product.id} xs={12} sm={6} lg={4}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>

              {/* Paging Component (Yêu cầu Pagination) */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                    size="large"
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
