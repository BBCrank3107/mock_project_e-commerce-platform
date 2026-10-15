import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  IconButton,
  Grid,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { voucherApi } from './voucherApi';
import type { Voucher, VoucherFormData } from './types';

interface Props {
  open: boolean;
  voucher?: Voucher | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const VoucherFormDialog: React.FC<Props> = ({
  open,
  voucher,
  onClose,
  onSuccess,
}) => {
  const isEditing = Boolean(voucher);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number | ''>(10);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | ''>('');
  const [minOrderAmount, setMinOrderAmount] = useState<number | ''>('');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (voucher) {
      setCode(voucher.code);
      setDescription(voucher.description || '');
      setDiscountPercent(voucher.discountPercent);
      setMaxDiscountAmount(voucher.maxDiscountAmount || '');
      setMinOrderAmount(voucher.minOrderAmount || '');
      setValidFrom(voucher.validFrom ? voucher.validFrom.substring(0, 10) : '');
      setValidTo(voucher.validTo ? voucher.validTo.substring(0, 10) : '');
      setIsActive(voucher.isActive);
    } else {
      setCode('');
      setDescription('');
      setDiscountPercent(10);
      setMaxDiscountAmount('');
      setMinOrderAmount('');
      const today = new Date().toISOString().substring(0, 10);
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
      setValidFrom(today);
      setValidTo(nextMonth);
      setIsActive(true);
    }
    setError(null);
  }, [voucher, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Vui lòng nhập mã voucher.');
      return;
    }
    if (!discountPercent || Number(discountPercent) < 1 || Number(discountPercent) > 100) {
      setError('Phần trăm giảm giá phải từ 1% đến 100%.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: VoucherFormData = {
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        discountPercent: Number(discountPercent),
        maxDiscountAmount: maxDiscountAmount !== '' ? Number(maxDiscountAmount) : undefined,
        minOrderAmount: minOrderAmount !== '' ? Number(minOrderAmount) : undefined,
        validFrom: validFrom ? new Date(validFrom + 'T00:00:00Z').toISOString() : undefined,
        validTo: validTo ? new Date(validTo + 'T23:59:59Z').toISOString() : undefined,
        isActive,
      };

      if (isEditing && voucher) {
        await voucherApi.updateVoucher(voucher.id, payload);
      } else {
        await voucherApi.createVoucher(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu voucher.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}
      >
        <Typography component="span" variant="h6" fontWeight="bold">
          {isEditing ? 'Cập Nhật Voucher' : 'Tạo Voucher Khuyến Mãi Mới'}
        </Typography>
        <IconButton onClick={onClose} disabled={loading} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Mã Voucher */}
            <Grid item xs={12} sm={7}>
              <TextField
                fullWidth
                label="Mã Voucher *"
                placeholder="VD: WELCOME10, CYBER20"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={loading}
                helperText="Khách hàng sẽ nhập mã này tại bước Checkout"
              />
            </Grid>

            {/* % Giảm giá */}
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                type="number"
                label="% Giảm giá *"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value === '' ? '' : Number(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                disabled={loading}
              />
            </Grid>

            {/* Giảm tối đa */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Mức giảm tối đa (VNĐ)"
                placeholder="Để trống nếu không giới hạn"
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={loading}
              />
            </Grid>

            {/* Đơn hàng tối thiểu */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Đơn hàng tối thiểu (VNĐ)"
                placeholder="VD: 500000"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={loading}
              />
            </Grid>

            {/* Ngày bắt đầu */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Có hiệu lực từ ngày"
                InputLabelProps={{ shrink: true }}
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                disabled={loading}
              />
            </Grid>

            {/* Ngày kết thúc */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Hết hạn vào ngày"
                InputLabelProps={{ shrink: true }}
                value={validTo}
                onChange={(e) => setValidTo(e.target.value)}
                disabled={loading}
              />
            </Grid>

            {/* Mô tả */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Mô tả chương trình ưu đãi"
                placeholder="VD: Giảm 10% tối đa 500.000đ cho khách hàng mới gia nhập CyberTech..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </Grid>

            {/* Trạng thái hoạt động */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    color="primary"
                    disabled={loading}
                  />
                }
                label="Kích hoạt voucher ngay bây giờ"
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
            {loading ? <CircularProgress size={24} color="inherit" /> : isEditing ? 'Cập Nhật' : 'Tạo Voucher'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
