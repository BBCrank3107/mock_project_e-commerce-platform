import React, { useState, useEffect } from 'react';
import {
  Container,
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
  Avatar,
  TextField,
  Pagination,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  ArrowBack,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { catalogApi } from './catalogApi';
import type { Product, Category } from './types';
import { ProductFormDialog } from './ProductFormDialog';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const AdminProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Pagination
  const [keyword, setKeyword] = useState('');
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
    setLoading(true);
    try {
      const res = await catalogApi.getProducts({
        keyword: keyword.trim() || undefined,
        page: page - 1,
        size: 8,
        sortBy: 'id',
        sortDir: 'desc',
      });
      setProducts(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err) {
      console.error('Lỗi khi tải danh sách:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    catalogApi.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [keyword, page]);

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
      console.error('Lỗi khi xóa:', err);
    } finally {
      setDeletingLoading(false);
    }
  };

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Button component={Link} to="/" startIcon={<ArrowBack />} sx={{ mb: 1 }}>
            Xem cửa hàng công khai
          </Button>
          <Typography variant="h4" fontWeight={800}>
            Quản Lý Sản Phẩm (Admin)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tổng cộng: <b>{totalElements}</b> sản phẩm trong hệ thống
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenCreate}
          sx={{ borderRadius: 2, fontWeight: 'bold', py: 1.2, px: 3 }}
        >
          Thêm Sản Phẩm Mới
        </Button>
      </Box>

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
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
        <Table sx={{ minWidth: 750 }}>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Ảnh</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tên Sản Phẩm</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Mã SKU</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Danh Mục Con</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Giá Bán</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Trạng Thái</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Hành Động</TableCell>
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
                    <Avatar
                      variant="rounded"
                      src={p.thumbnailUrl}
                      sx={{ width: 48, height: 48, border: '1px solid #e2e8f0' }}
                    />
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
                      <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
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
                    <IconButton color="primary" onClick={() => handleOpenEdit(p)} size="small">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleOpenDelete(p)} size="small">
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
      />

      {/* Modal Xác Nhận Xóa Nguy Hiểm (CUSTOM CONFIRM DIALOG - KHÔNG DÙNG WINDOW.CONFIRM) */}
      <ConfirmDialog
        open={confirmOpen}
        title="Xác nhận xóa sản phẩm"
        message={`Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm "${deletingProduct?.name}" (Mã: #${deletingProduct?.id}) khỏi hệ thống không? Thao tác này không thể hoàn tác.`}
        confirmText="Xóa Sản Phẩm"
        confirmColor="error"
        loading={deletingLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </Container>
  );
};
