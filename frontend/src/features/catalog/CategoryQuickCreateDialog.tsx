import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  IconButton,
  Alert,
  Box,
  Tabs,
  Tab,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { catalogApi } from './catalogApi';
import type { Category } from './types';

interface Props {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  initialMode?: 'category' | 'subcategory';
  defaultCategoryId?: number;
  onSuccess: (newSubcategoryId?: number) => void;
}

export const CategoryQuickCreateDialog: React.FC<Props> = ({
  open,
  onClose,
  categories,
  initialMode = 'subcategory',
  defaultCategoryId,
  onSuccess,
}) => {
  const [tab, setTab] = useState<'category' | 'subcategory'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Category
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catIconUrl, setCatIconUrl] = useState('');

  // Form Subcategory
  const [selectedCatId, setSelectedCatId] = useState<number | ''>(
    defaultCategoryId || (categories.length > 0 ? categories[0].id : '')
  );
  const [subName, setSubName] = useState('');
  const [subDescription, setSubDescription] = useState('');

  const resetForm = () => {
    setCatName('');
    setCatDescription('');
    setCatIconUrl('');
    setSubName('');
    setSubDescription('');
    setError(null);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  const handleSaveCategory = async () => {
    if (!catName.trim()) {
      setError('Vui lòng nhập tên danh mục chính.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await catalogApi.createCategory({
        name: catName.trim(),
        description: catDescription.trim() || undefined,
        iconUrl: catIconUrl.trim() || undefined,
      });
      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo danh mục chính.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSubcategory = async () => {
    if (!selectedCatId) {
      setError('Vui lòng chọn danh mục cha.');
      return;
    }
    if (!subName.trim()) {
      setError('Vui lòng nhập tên danh mục con.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const createdSub = await catalogApi.createSubcategory({
        categoryId: Number(selectedCatId),
        name: subName.trim(),
        description: subDescription.trim() || undefined,
      });
      resetForm();
      onSuccess(createdSub.id);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo danh mục con.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}
      >
        <Typography component="span" variant="h6" fontWeight="bold">
          Thêm Danh Mục & Phân Loại
        </Typography>
        <IconButton onClick={handleClose} disabled={loading} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, val) => {
            setTab(val);
            setError(null);
          }}
        >
          <Tab value="subcategory" label="1. Thêm Danh Mục Con (Subcategory)" />
          <Tab value="category" label="2. Thêm Danh Mục Cha (Category)" />
        </Tabs>
      </Box>

      <DialogContent sx={{ pt: 2.5 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {tab === 'subcategory' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Danh mục con gắn trực tiếp với sản phẩm (ví dụ: <i>Laptop Gaming, Chuột Không Dây</i>).
            </Typography>

            <TextField
              select
              fullWidth
              label="Chọn danh mục cha *"
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(Number(e.target.value))}
              disabled={loading || categories.length === 0}
              helperText={
                categories.length === 0 ? 'Chưa có danh mục cha nào, hãy tạo danh mục cha trước!' : ''
              }
            >
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Tên danh mục con *"
              placeholder="VD: Laptop Gaming & Đồ Họa, Tai nghe Bluetooth..."
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              disabled={loading}
            />

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Mô tả danh mục con (tùy chọn)"
              placeholder="Mô tả ngắn gọn về nhóm sản phẩm này..."
              value={subDescription}
              onChange={(e) => setSubDescription(e.target.value)}
              disabled={loading}
            />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Danh mục cha bao quát các nhóm lớn (ví dụ: <i>Laptop, Điện Thoại, Phụ Kiện</i>).
            </Typography>

            <TextField
              fullWidth
              label="Tên danh mục cha *"
              placeholder="VD: Laptop & Máy Tính, Điện Thoại, Đồng Hồ Thông Minh..."
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Icon URL hoặc hình ảnh đại diện (tùy chọn)"
              placeholder="https://... hoặc /uploads/..."
              value={catIconUrl}
              onChange={(e) => setCatIconUrl(e.target.value)}
              disabled={loading}
            />

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Mô tả danh mục cha (tùy chọn)"
              placeholder="Mô tả đặc điểm danh mục..."
              value={catDescription}
              onChange={(e) => setCatDescription(e.target.value)}
              disabled={loading}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
        <Button onClick={handleClose} disabled={loading} color="inherit">
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={tab === 'subcategory' ? handleSaveSubcategory : handleSaveCategory}
          disabled={loading}
          sx={{ borderRadius: 2, px: 3, fontWeight: 'bold' }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Lưu Danh Mục'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
