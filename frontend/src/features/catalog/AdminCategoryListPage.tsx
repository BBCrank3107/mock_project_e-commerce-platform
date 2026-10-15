import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Add,
  ArrowBack,
  Category as CategoryIcon,
  SubdirectoryArrowRight,
  DeleteOutline,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { catalogApi } from './catalogApi';
import type { Category } from './types';
import { CategoryQuickCreateDialog } from './CategoryQuickCreateDialog';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { errorMessage } from '../cart_checkout/transactionApi';

export const AdminCategoryListPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'category' | 'subcategory'>('category');
  const [targetCatId, setTargetCatId] = useState<number | undefined>(undefined);

  // Delete State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'category' | 'subcategory';
    id: number;
    name: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await catalogApi.getCategories();
      setCategories(data);
    } catch (err: any) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAddCategory = () => {
    setDialogMode('category');
    setTargetCatId(undefined);
    setDialogOpen(true);
  };

  const handleOpenAddSubcategory = (catId?: number) => {
    setDialogMode('subcategory');
    setTargetCatId(catId);
    setDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      if (deleteTarget.type === 'category') {
        await catalogApi.deleteCategory(deleteTarget.id);
        setSuccessMsg(`Đã xóa danh mục "${deleteTarget.name}".`);
      } else {
        await catalogApi.deleteSubcategory(deleteTarget.id);
        setSuccessMsg(`Đã xóa phân loại "${deleteTarget.name}".`);
      }
      setConfirmOpen(false);
      setDeleteTarget(null);
      await loadCategories();
    } catch (err: any) {
      setError(errorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalSubcategories = categories.reduce(
    (sum, c) => sum + (c.subcategories ? c.subcategories.length : 0),
    0
  );

  return (
    <Container maxWidth={false} disableGutters>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3.5,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Button
            component={Link}
            to="/admin/products"
            startIcon={<ArrowBack fontSize="small" />}
            size="small"
            sx={{
              mb: 0.5,
              color: 'text.secondary',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': { color: 'primary.main', bgcolor: 'transparent' },
            }}
          >
            Quay lại danh sách sản phẩm
          </Button>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              fontSize: { xs: '1.5rem', sm: '1.85rem', md: '2.1rem' },
              lineHeight: 1.25,
              letterSpacing: '-0.02em',
            }}
          >
            Danh Mục & Phân Loại
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Tổng cộng: <b>{categories.length}</b> danh mục chính &bull; <b>{totalSubcategories}</b> danh mục con
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => handleOpenAddSubcategory()}
            disabled={loading || categories.length === 0}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              py: 1,
              px: 2,
              whiteSpace: 'nowrap',
              textTransform: 'none',
            }}
          >
            Thêm Danh Mục Con
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenAddCategory}
            disabled={loading}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              py: 1,
              px: 2.2,
              whiteSpace: 'nowrap',
              textTransform: 'none',
            }}
          >
            Thêm Danh Mục Cha
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : categories.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <CategoryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" fontWeight="bold">
            Chưa có danh mục nào trong hệ thống
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Hãy bấm vào nút bên dưới để tạo danh mục cha đầu tiên.
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpenAddCategory}>
            Thêm Danh Mục Ngay
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {categories.map((cat) => (
            <Grid item xs={12} key={cat.id}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  borderColor: '#e2e8f0',
                  overflow: 'visible',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Category Header */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          bgcolor: '#eff6ff',
                          color: '#2563eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CategoryIcon fontSize="medium" />
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography variant="h6" fontWeight="bold">
                            {cat.name}
                          </Typography>
                          <Chip
                            size="small"
                            label={`slug: ${cat.slug}`}
                            sx={{ fontSize: '0.75rem', bgcolor: '#f1f5f9' }}
                          />
                        </Box>
                        {cat.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {cat.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => handleOpenAddSubcategory(cat.id)}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                      >
                        Thêm phân loại con
                      </Button>
                      <IconButton
                        size="small"
                        color="error"
                        title="Xóa danh mục cha này"
                        onClick={() => {
                          setDeleteTarget({
                            type: 'category',
                            id: cat.id,
                            name: cat.name,
                          });
                          setConfirmOpen(true);
                        }}
                      >
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2.5 }} />

                  {/* Subcategories list */}
                  <Box>
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      color="text.secondary"
                      sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5 }}
                    >
                      Danh mục con trực thuộc ({cat.subcategories?.length || 0})
                    </Typography>

                    {cat.subcategories && cat.subcategories.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                        {cat.subcategories.map((sub) => (
                          <Chip
                            key={sub.id}
                            icon={<SubdirectoryArrowRight sx={{ fontSize: 16 }} />}
                            label={
                              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                                <b>{sub.name}</b>
                                <Typography component="span" variant="caption" sx={{ opacity: 0.7 }}>
                                  ({sub.slug})
                                </Typography>
                              </Box>
                            }
                            onDelete={() => {
                              setDeleteTarget({
                                type: 'subcategory',
                                id: sub.id,
                                name: sub.name,
                              });
                              setConfirmOpen(true);
                            }}
                            deleteIcon={<DeleteOutline sx={{ fontSize: 16 }} />}
                            sx={{
                              py: 2,
                              px: 0.5,
                              borderRadius: 2,
                              bgcolor: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              '&:hover': { bgcolor: '#f1f5f9' },
                            }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: '#f8fafc',
                          borderRadius: 2,
                          border: '1px dashed #cbd5e1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Chưa có danh mục con nào. Bấm nút để thêm phân loại con cho nhóm này.
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<Add />}
                          onClick={() => handleOpenAddSubcategory(cat.id)}
                          sx={{ textTransform: 'none' }}
                        >
                          Thêm ngay
                        </Button>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal Thêm Mới */}
      {dialogOpen && (
        <CategoryQuickCreateDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          categories={categories}
          initialMode={dialogMode}
          defaultCategoryId={targetCatId}
          onSuccess={async () => {
            setSuccessMsg('Đã thêm thành công!');
            await loadCategories();
          }}
        />
      )}

      {/* Modal Xác Nhận Xóa */}
      <ConfirmDialog
        open={confirmOpen}
        title={`Xác nhận xóa ${deleteTarget?.type === 'category' ? 'danh mục cha' : 'danh mục con'}`}
        message={`Bạn có chắc muốn xóa "${deleteTarget?.name}" không? Thao tác này sẽ ẩn danh mục khỏi hệ thống hiển thị.`}
        confirmText="Xác Nhận Xóa"
        confirmColor="error"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteTarget(null);
        }}
      />
    </Container>
  );
};
