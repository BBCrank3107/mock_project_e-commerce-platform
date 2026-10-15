import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  Box,
  Typography,
  Alert,
  IconButton,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { CloudUpload, Close, Add, DeleteOutline, Link as LinkIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { catalogApi } from './catalogApi';
import type { Product, Category } from './types';
import { getImageUrl } from '../../utils/imageUrl';
import { CategoryQuickCreateDialog } from './CategoryQuickCreateDialog';

const productSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm không được để trống').min(3, 'Tối thiểu 3 ký tự'),
  subcategoryId: z
    .number({ invalid_type_error: 'Vui lòng chọn danh mục con' })
    .min(1, 'Vui lòng chọn danh mục con'),
  sku: z.string().optional(),
  price: z
    .number({ invalid_type_error: 'Giá phải là số hợp lệ' })
    .min(1000, 'Giá tối thiểu 1.000 VNĐ'),
  discountPrice: z.number().optional().nullable(),
  description: z.string().optional(),
  thumbnailUrl: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormDialogProps {
  open: boolean;
  product?: Product | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
  onCategoriesRefresh?: () => Promise<void> | void;
}

export const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  open,
  product,
  categories,
  onClose,
  onSuccess,
  onCategoriesRefresh,
}) => {
  const isEditing = Boolean(product);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    mode: 'onBlur',
  });

  const watchedThumbnailUrl = watch('thumbnailUrl');

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        subcategoryId: product.subcategoryId,
        sku: product.sku,
        price: product.price,
        discountPrice: product.discountPrice || undefined,
        description: product.description || '',
        thumbnailUrl: product.thumbnailUrl || '',
      });
      setPreviewUrl(product.thumbnailUrl || '');
    } else {
      reset({
        name: '',
        subcategoryId: undefined as any,
        sku: '',
        price: 0,
        discountPrice: undefined,
        description: '',
        thumbnailUrl: '',
      });
      setPreviewUrl('');
    }
    setSelectedFile(null);
    setErrorMessage(null);
  }, [product, open, reset]);

  // Cập nhật preview khi người dùng nhập URL (chỉ khi chưa chọn file)
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(watchedThumbnailUrl || '');
    }
  }, [watchedThumbnailUrl, selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) {
        setErrorMessage('Vui lòng chọn ảnh có dung lượng tối đa 10 MB.');
        return;
      }
      setErrorMessage(null);
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setValue('thumbnailUrl', '');
    setPreviewUrl('');
  };

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      let savedProduct: Product;
      if (isEditing && product) {
        savedProduct = await catalogApi.updateProduct(product.id, data);
      } else {
        savedProduct = await catalogApi.createProduct(data);
      }

      // Xử lý upload file ảnh nếu người dùng chọn file tải lên
      if (selectedFile) {
        await catalogApi.uploadProductImage(savedProduct.id, selectedFile, true);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={loading ? undefined : onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}
        >
          <Typography component="span" variant="h6" fontWeight="bold">
            {isEditing ? 'Cập Nhật Sản Phẩm' : 'Thêm Mới Sản Phẩm'}
          </Typography>
          <IconButton onClick={onClose} disabled={loading} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers>
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Tên sản phẩm *"
                  placeholder="Nhập tên sản phẩm..."
                  {...register('name')}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  margin="dense"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Mã SKU"
                  placeholder="VD: ASUS-ROGV-01"
                  {...register('sku')}
                  error={!!errors.sku}
                  helperText={errors.sku?.message}
                  margin="dense"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="caption" fontWeight="bold" color="text.secondary">
                    Danh mục con *
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<Add fontSize="small" />}
                    onClick={() => setOpenCategoryModal(true)}
                    sx={{ fontSize: '0.75rem', py: 0, textTransform: 'none' }}
                  >
                    Thêm danh mục
                  </Button>
                </Box>
                <TextField
                  select
                  fullWidth
                  defaultValue=""
                  value={watch('subcategoryId') || ''}
                  onChange={(e) =>
                    setValue('subcategoryId', Number(e.target.value), { shouldValidate: true })
                  }
                  error={!!errors.subcategoryId}
                  helperText={errors.subcategoryId?.message || 'Chọn phân loại nhóm sản phẩm'}
                  margin="none"
                >
                  {categories.map((cat) =>
                    cat.subcategories?.map((sub) => (
                      <MenuItem key={sub.id} value={sub.id}>
                        {cat.name} &gt; {sub.name}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={3}>
                <Box sx={{ height: 24, mb: 0.5 }} />
                <TextField
                  fullWidth
                  type="number"
                  label="Giá bán (VNĐ) *"
                  {...register('price', { valueAsNumber: true })}
                  error={!!errors.price}
                  helperText={errors.price?.message}
                  margin="none"
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Box sx={{ height: 24, mb: 0.5 }} />
                <TextField
                  fullWidth
                  type="number"
                  label="Giá khuyến mãi"
                  {...register('discountPrice', {
                    setValueAs: (v) => (v === '' ? null : Number(v)),
                  })}
                  error={!!errors.discountPrice}
                  helperText={errors.discountPrice?.message}
                  margin="none"
                />
              </Grid>

              {/* Phần Ảnh Sản Phẩm (Hỗ trợ cả Nhập URL và Tải Tệp Lên) */}
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ color: '#1e293b' }}>
                    Ảnh đại diện sản phẩm (Hỗ trợ URL online hoặc Tải tệp từ máy)
                  </Typography>

                  <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    {/* Cách 1: Nhập link ảnh trực tiếp */}
                    <Grid item xs={12} sm={7}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Nhập liên kết ảnh trực tiếp (URL)"
                        placeholder="https://images.unsplash.com/... hoặc link ảnh online"
                        {...register('thumbnailUrl')}
                        error={!!errors.thumbnailUrl}
                        helperText={errors.thumbnailUrl?.message || 'Dán link ảnh online nếu có'}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LinkIcon fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1.5, flexWrap: 'wrap' }}>
                        <Button
                          component="label"
                          variant="outlined"
                          size="small"
                          startIcon={<CloudUpload />}
                          sx={{ borderRadius: 2, textTransform: 'none' }}
                        >
                          Hoặc Tải Tệp Ảnh Lên
                          <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                        </Button>
                        {selectedFile && (
                          <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                            Đã chọn tệp: {selectedFile.name}
                          </Typography>
                        )}
                        {(previewUrl || selectedFile) && (
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteOutline />}
                            onClick={handleClearImage}
                            sx={{ textTransform: 'none', ml: 'auto' }}
                          >
                            Xóa ảnh
                          </Button>
                        )}
                      </Box>
                    </Grid>

                    {/* Khung Xem Trước Ảnh (Preview) */}
                    <Grid item xs={12} sm={5} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 140,
                          height: 140,
                          aspectRatio: '1 / 1',
                          borderRadius: 2,
                          border: '2px dashed #cbd5e1',
                          bgcolor: '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          p: 1,
                          position: 'relative',
                        }}
                      >
                        {previewUrl ? (
                          <Box
                            component="img"
                            src={previewUrl.startsWith('blob:') ? previewUrl : getImageUrl(previewUrl)}
                            alt="preview"
                            onError={(e: any) => {
                              e.target.src = '/product-placeholder.svg';
                            }}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              display: 'block',
                            }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary" textAlign="center">
                            Chưa có ảnh xem trước
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Mô tả sản phẩm"
                  placeholder="Mô tả chi tiết cấu hình, tính năng của sản phẩm..."
                  {...register('description')}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  margin="dense"
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={onClose} disabled={loading} color="inherit">
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ borderRadius: 2, px: 3, fontWeight: 'bold' }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : isEditing ? (
                'Cập Nhật'
              ) : (
                'Tạo Sản Phẩm'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal tạo nhanh danh mục con / danh mục cha */}
      {openCategoryModal && (
        <CategoryQuickCreateDialog
          open={openCategoryModal}
          onClose={() => setOpenCategoryModal(false)}
          categories={categories}
          initialMode="subcategory"
          onSuccess={async (newSubId) => {
            if (onCategoriesRefresh) {
              await onCategoriesRefresh();
            }
            if (newSubId) {
              setValue('subcategoryId', newSubId, { shouldValidate: true });
            }
          }}
        />
      )}
    </>
  );
};
