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
} from '@mui/material';
import { CloudUpload, Close } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { catalogApi } from './catalogApi';
import type { Product, Category } from './types';

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
}

export const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  open,
  product,
  categories,
  onClose,
  onSuccess,
}) => {
  const isEditing = Boolean(product);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Yêu cầu: Validation on blur
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

      // Xử lý upload file ảnh nếu người dùng chọn file
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

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers sx={{ py: 3 }}>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMessage}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Tên sản phẩm *"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
                margin="dense"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Mã SKU (Tùy chọn)"
                {...register('sku')}
                error={!!errors.sku}
                helperText={errors.sku?.message}
                margin="dense"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Danh mục con *"
                defaultValue=""
                value={watch('subcategoryId') || ''}
                onChange={(e) =>
                  setValue('subcategoryId', Number(e.target.value), { shouldValidate: true })
                }
                error={!!errors.subcategoryId}
                helperText={errors.subcategoryId?.message}
                margin="dense"
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
              <TextField
                fullWidth
                type="number"
                label="Giá bán (VNĐ) *"
                {...register('price', { valueAsNumber: true })}
                error={!!errors.price}
                helperText={errors.price?.message}
                margin="dense"
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="Giá khuyến mãi"
                {...register('discountPrice', {
                  setValueAs: (v) => (v === '' ? null : Number(v)),
                })}
                error={!!errors.discountPrice}
                helperText={errors.discountPrice?.message}
                margin="dense"
              />
            </Grid>

            {/* Upload File Ảnh */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Ảnh sản phẩm
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 1, flexWrap: 'wrap' }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  sx={{ borderRadius: 2 }}
                >
                  Chọn Tệp Ảnh
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </Button>
                {selectedFile && (
                  <Typography variant="body2" color="text.secondary">
                    Đã chọn: <b>{selectedFile.name}</b>
                  </Typography>
                )}
              </Box>

              {previewUrl && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Xem trước ảnh:
                  </Typography>
                  <Box
                    component="img"
                    src={previewUrl}
                    alt="preview"
                    sx={{
                      width: 120,
                      height: 120,
                      aspectRatio: '1 / 1',
                      objectFit: 'contain',
                      borderRadius: 2,
                      border: '1px solid #cbd5e1',
                      bgcolor: '#f8fafc',
                      p: 1,
                    }}
                  />
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Mô tả chi tiết sản phẩm"
                {...register('description')}
                margin="dense"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={loading} variant="outlined" color="inherit">
            Hủy Bỏ
          </Button>
          <Button type="submit" disabled={loading} variant="contained" sx={{ fontWeight: 'bold' }}>
            {loading ? 'Đang lưu...' : isEditing ? 'Cập Nhật' : 'Tạo Mới'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
