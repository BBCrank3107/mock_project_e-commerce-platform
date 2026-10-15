import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { errorMessage } from '../cart_checkout/transactionApi';
import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Alert,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TextField,
  Pagination,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { Add, Edit, Delete, Search, ArrowBack } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { catalogApi } from './catalogApi';
import type { Product, Category } from './types';
import { ProductFormDialog } from './ProductFormDialog';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ProductImage } from '../../components/common/ProductImage';

export const AdminProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const requestRevision = useRef(0);

  // Search & Pagination
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebouncedValue(keyword);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Confirm Dialog states (Requirement: Không dùng window.confirm)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const fetchProducts = async () => {
    const revision = ++requestRevision.current;
    setLoading(true);
    setError('');
    try {
      const res = await catalogApi.getProducts({
        keyword: debouncedKeyword.trim() || undefined,
        page: page - 1,
        size: 8,
        sortBy: 'id',
        sortDir: 'desc',
      });
      if (revision !== requestRevision.current) return;
      if (!res.content.length && page > 1) {
        setPage(page - 1);
        return;
      }
      setProducts(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err) {
      if (revision === requestRevision.current) setError(errorMessage(err));
    } finally {
      if (revision === requestRevision.current) setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await catalogApi.getCategories();
      setCategories(data);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    return () => {
      requestRevision.current += 1;
    };
  }, [debouncedKeyword, page]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleOpenDelete = (product: Product) => {
    setDeletingProduct(product);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setDeletingLoading(true);
    try {
      await catalogApi.deleteProduct(deletingProduct.id);
      setConfirmOpen(false);
      setDeletingProduct(null);
      fetchProducts();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setDeletingLoading(false);
    }
  };

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <Container maxWidth={false} disableGutters>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Button component={Link} to="/" startIcon={<ArrowBack />} sx={{ mb: 1 }}>
            Xem cửa hàng công khai
          </Button>
          <Typography variant="h4" fontWeight={800}>
            Sản phẩm
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tổng cộng: <b>{totalElements}</b> sản phẩm trong hệ thống
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            component={Link}
            to="/admin/categories"
            sx={{ borderRadius: 2, fontWeight: 'bold', py: 1.2, px: 2.5 }}
          >
            Quản Lý Danh Mục
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            disabled={loading || !categories.length}
            onClick={handleOpenCreate}
            sx={{ borderRadius: 2, fontWeight: 'bold', py: 1.2, px: 3 }}
          >
            Thêm Sản Phẩm Mới
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {/* Search Bar */}
      <Box sx={{ mb: 3, maxWidth: 400 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm sản phẩm theo tên..."
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Table List View */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 'none' }}>
        <Table sx={{ minWidth: 750 }}>
          <TableHead sx={{ bgcolor: '#f5f6f0' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Ảnh</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tên Sản Phẩm</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Mã SKU</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Danh Mục Con</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Giá Bán</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Trạng Thái</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                Hành Động
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Không tìm thấy sản phẩm nào!
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>#{p.id}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        minWidth: 52,
                        aspectRatio: '1 / 1',
                        borderRadius: 2,
                        border: '1px solid #e2e8f0',
                        bgcolor: '#f1f5f9',
                        overflow: 'hidden',
                        display: 'block',
                      }}
                    >
                      <ProductImage
                        src={p.thumbnailUrl}
                        alt={p.name}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 2,
                          display: 'block',
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {p.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={p.sku || 'N/A'} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{p.subcategoryName}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                      {formatVND(p.discountPrice || p.price)}
                    </Typography>
                    {p.discountPrice && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ textDecoration: 'line-through' }}
                      >
                        {formatVND(p.price)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={p.isActive ? 'Đang bán' : 'Tạm ẩn'}
                      color={p.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      aria-label={`Sửa ${p.name}`}
                      color="primary"
                      onClick={() => handleOpenEdit(p)}
                      size="small"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      aria-label={`Xóa ${p.name}`}
                      color="error"
                      onClick={() => handleOpenDelete(p)}
                      size="small"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            disabled={loading}
            count={totalPages}
            page={page}
            onChange={(_, val) => setPage(val)}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Modal Thêm/Sửa Sản Phẩm (Validation on blur & File Upload) */}
      <ProductFormDialog
        open={formOpen}
        product={editingProduct}
        categories={categories}
        onClose={() => setFormOpen(false)}
        onSuccess={fetchProducts}
        onCategoriesRefresh={loadCategories}
      />

      {/* Modal Xác Nhận Xóa Nguy Hiểm (CUSTOM CONFIRM DIALOG - KHÔNG DÙNG WINDOW.CONFIRM) */}
      <ConfirmDialog
        open={confirmOpen}
        title="Xác nhận xóa sản phẩm"
        message={`Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm "${deletingProduct?.name}" (Mã: #${deletingProduct?.id}) khỏi hệ thống không? Thao tác này không thể hoàn tác.`}
        confirmText="Xóa Sản Phẩm"
        confirmColor="error"
        loading={deletingLoading}
        error={error}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </Container>
  );
};
