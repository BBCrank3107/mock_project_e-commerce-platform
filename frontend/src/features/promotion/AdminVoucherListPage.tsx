import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Switch,
  Alert,
  CircularProgress,
  Paper,
  Tooltip,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Add,
  ConfirmationNumberOutlined,
  Edit,
  DeleteOutline,
  ContentCopy,
  CheckCircleOutline,
  HighlightOff,
  AccessTime,
  Refresh,
  Search,
  GridView,
  TableRows,
  ShoppingBagOutlined,
  CalendarTodayOutlined,
} from '@mui/icons-material';
import { voucherApi } from './voucherApi';
import type { Voucher } from './types';
import { VoucherFormDialog } from './VoucherFormDialog';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { errorMessage } from '../cart_checkout/transactionApi';

export const AdminVoucherListPage: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'DISABLED'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Form Dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  // Confirm Delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingVoucher, setDeletingVoucher] = useState<Voucher | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchVouchers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await voucherApi.getVouchers();
      setVouchers(data);
    } catch (err: any) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggle = async (v: Voucher) => {
    try {
      const updated = await voucherApi.toggleVoucher(v.id);
      setVouchers((prev) => prev.map((item) => (item.id === v.id ? updated : item)));
    } catch (err: any) {
      setError(errorMessage(err));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingVoucher) return;
    setDeleteLoading(true);
    try {
      await voucherApi.deleteVoucher(deletingVoucher.id);
      setConfirmOpen(false);
      setDeletingVoucher(null);
      await fetchVouchers();
    } catch (err: any) {
      setError(errorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatVnd = (val?: number) => {
    if (!val) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'Không thời hạn';
    const d = new Date(isoStr);
    return d.toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (v: Voucher) => {
    switch (v.status) {
      case 'ACTIVE':
        return (
          <Chip
            size="small"
            icon={<CheckCircleOutline sx={{ fontSize: 14 }} />}
            label="Đang áp dụng"
            color="success"
            sx={{ fontWeight: 600, px: 0.5 }}
          />
        );
      case 'EXPIRED':
        return (
          <Chip
            size="small"
            icon={<AccessTime sx={{ fontSize: 14 }} />}
            label="Đã hết hạn"
            sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontWeight: 600, px: 0.5 }}
          />
        );
      case 'UPCOMING':
        return (
          <Chip
            size="small"
            label="Sắp diễn ra"
            color="info"
            sx={{ fontWeight: 600, px: 0.5 }}
          />
        );
      case 'DISABLED':
        return (
          <Chip
            size="small"
            icon={<HighlightOff sx={{ fontSize: 14 }} />}
            label="Tạm tắt"
            sx={{ bgcolor: '#fef2f2', color: '#ef4444', fontWeight: 600, px: 0.5 }}
          />
        );
      default:
        return <Chip size="small" label={v.statusLabel || 'N/A'} />;
    }
  };

  // Filtered vouchers
  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      const matchSearch =
        v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.description && v.description.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchStatus = true;
      if (statusFilter === 'ACTIVE') matchStatus = v.status === 'ACTIVE';
      else if (statusFilter === 'EXPIRED') matchStatus = v.status === 'EXPIRED';
      else if (statusFilter === 'DISABLED') matchStatus = v.status === 'DISABLED';

      return matchSearch && matchStatus;
    });
  }, [vouchers, searchTerm, statusFilter]);

  const activeCount = vouchers.filter((v) => v.status === 'ACTIVE').length;
  const expiredCount = vouchers.filter((v) => v.status === 'EXPIRED').length;
  const disabledCount = vouchers.filter((v) => v.status === 'DISABLED').length;

  return (
    <Container maxWidth={false} disableGutters>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              fontSize: { xs: '1.5rem', sm: '1.85rem', md: '2.1rem' },
              lineHeight: 1.25,
              letterSpacing: '-0.02em',
            }}
          >
            Quản Lý Voucher & Khuyến Mãi
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Thiết lập mã giảm giá, kiểm soát tỷ lệ chiết khấu và điều kiện áp dụng đơn hàng
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchVouchers}
            disabled={loading}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Làm mới
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditingVoucher(null);
              setFormOpen(true);
            }}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2.5 }}
          >
            Tạo Voucher Mới
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filter, Search & View Controls Bar */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2.5,
          borderColor: '#e2e8f0',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2,
        }}
      >
        {/* Search input & Filter chips */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
          <TextField
            size="small"
            placeholder="Tìm theo mã hoặc nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 20, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: { xs: '100%', sm: 260 } }}
          />

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`Tất cả (${vouchers.length})`}
              clickable
              color={statusFilter === 'ALL' ? 'primary' : 'default'}
              variant={statusFilter === 'ALL' ? 'filled' : 'outlined'}
              onClick={() => setStatusFilter('ALL')}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label={`Đang áp dụng (${activeCount})`}
              clickable
              color={statusFilter === 'ACTIVE' ? 'success' : 'default'}
              variant={statusFilter === 'ACTIVE' ? 'filled' : 'outlined'}
              onClick={() => setStatusFilter('ACTIVE')}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label={`Đã hết hạn (${expiredCount})`}
              clickable
              color={statusFilter === 'EXPIRED' ? 'warning' : 'default'}
              variant={statusFilter === 'EXPIRED' ? 'filled' : 'outlined'}
              onClick={() => setStatusFilter('EXPIRED')}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label={`Tạm tắt (${disabledCount})`}
              clickable
              color={statusFilter === 'DISABLED' ? 'error' : 'default'}
              variant={statusFilter === 'DISABLED' ? 'filled' : 'outlined'}
              onClick={() => setStatusFilter('DISABLED')}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Box>

        {/* View mode toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <ToggleButtonGroup
            size="small"
            value={viewMode}
            exclusive
            onChange={(_, val) => val && setViewMode(val)}
            sx={{ bgcolor: '#ffffff' }}
          >
            <ToggleButton value="grid" aria-label="Dạng thẻ">
              <Tooltip title="Dạng thẻ lưới">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <GridView sx={{ fontSize: 18 }} />
                  <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    Thẻ
                  </Typography>
                </Box>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="table" aria-label="Dạng bảng">
              <Tooltip title="Dạng bảng danh sách">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TableRows sx={{ fontSize: 18 }} />
                  <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    Bảng
                  </Typography>
                </Box>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>

      {/* Main Content Area */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredVouchers.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <ConfirmationNumberOutlined sx={{ fontSize: 56, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" fontWeight="bold">
            {searchTerm || statusFilter !== 'ALL'
              ? 'Không tìm thấy voucher phù hợp'
              : 'Chưa có voucher khuyến mãi nào'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm || statusFilter !== 'ALL'
              ? 'Thử thay đổi từ khóa tìm kiếm hoặc bỏ bộ lọc trạng thái.'
              : 'Hãy tạo voucher đầu tiên để khuyến khích khách hàng mua sắm tại cửa hàng.'}
          </Typography>
          {searchTerm || statusFilter !== 'ALL' ? (
            <Button
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
              }}
              sx={{ borderRadius: 2 }}
            >
              Xóa bộ lọc
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setEditingVoucher(null);
                setFormOpen(true);
              }}
              sx={{ borderRadius: 2 }}
            >
              Tạo Voucher Ngay
            </Button>
          )}
        </Paper>
      ) : viewMode === 'grid' ? (
        /* Dạng thẻ lưới thoáng đãng 2 cột (xs={12} md={6}) */
        <Grid container spacing={2.5}>
          {filteredVouchers.map((v) => (
            <Grid item xs={12} md={6} key={v.id}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  borderColor: v.isActive ? '#e2e8f0' : '#f1f5f9',
                  bgcolor: v.isActive ? '#ffffff' : '#fcfcfc',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                  {/* Top Bar: Code Badge + Full Status Chip (Không bao giờ bị tràn/cắt chữ) */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                      flexWrap: 'wrap',
                      gap: 1.5,
                    }}
                  >
                    {/* Voucher Code Badge */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          py: 0.6,
                          px: 1.5,
                          borderRadius: 2,
                          bgcolor: v.isActive ? '#eff6ff' : '#f1f5f9',
                          border: v.isActive ? '1.5px dashed #3b82f6' : '1.5px dashed #cbd5e1',
                          color: v.isActive ? '#1d4ed8' : '#64748b',
                          fontWeight: 800,
                          fontSize: '1rem',
                          letterSpacing: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <ConfirmationNumberOutlined sx={{ fontSize: 18 }} />
                        <span>{v.code}</span>
                      </Box>
                      <Tooltip title={copiedCode === v.code ? 'Đã sao chép!' : 'Sao chép mã'}>
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(v.code)}
                          sx={{
                            bgcolor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            '&:hover': { bgcolor: '#e2e8f0' },
                          }}
                        >
                          <ContentCopy sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {/* Status Badge */}
                    {getStatusBadge(v)}
                  </Box>

                  {/* Giá trị giảm chiết khấu */}
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                    <Typography variant="h5" fontWeight={800} sx={{ color: '#0f172a' }}>
                      Giảm {v.discountPercent}%
                    </Typography>
                    {v.maxDiscountAmount ? (
                      <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600 }}>
                        (Tối đa {formatVnd(v.maxDiscountAmount)})
                      </Typography>
                    ) : (
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        (Không giới hạn mức giảm)
                      </Typography>
                    )}
                  </Box>

                  {/* Box Điều kiện & Thời hạn áp dụng */}
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: '#f8fafc',
                      border: '1px solid #f1f5f9',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#334155', fontSize: '0.85rem' }}>
                      <ShoppingBagOutlined sx={{ fontSize: 17, color: '#64748b' }} />
                      <span>Đơn tối thiểu:</span>
                      <Typography component="span" variant="body2" fontWeight={700} sx={{ color: '#0f172a' }}>
                        {v.minOrderAmount ? formatVnd(v.minOrderAmount) : 'Không yêu cầu (0 ₫)'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#334155', fontSize: '0.85rem' }}>
                      <CalendarTodayOutlined sx={{ fontSize: 16, color: '#64748b' }} />
                      <span>Hiệu lực:</span>
                      <Typography component="span" variant="body2" fontWeight={600} sx={{ color: '#0f172a' }}>
                        {formatDate(v.validFrom)} &rarr; {formatDate(v.validTo)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Mô tả chương trình */}
                  {v.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        minHeight: 38,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontSize: '0.85rem',
                      }}
                    >
                      {v.description}
                    </Typography>
                  )}

                  {/* Footer Actions */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      pt: 1.5,
                      borderTop: '1px solid #f1f5f9',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Switch
                        size="small"
                        checked={v.isActive}
                        onChange={() => handleToggle(v)}
                        color="success"
                      />
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ color: v.isActive ? '#16a34a' : '#94a3b8', fontSize: '0.85rem' }}
                      >
                        {v.isActive ? 'Đang kích hoạt' : 'Tạm tắt'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Edit sx={{ fontSize: 15 }} />}
                        onClick={() => {
                          setEditingVoucher(v);
                          setFormOpen(true);
                        }}
                        sx={{
                          borderRadius: 1.5,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          borderColor: '#cbd5e1',
                          color: '#334155',
                          '&:hover': { borderColor: 'primary.main', bgcolor: '#f8fafc' },
                        }}
                      >
                        Sửa
                      </Button>
                      <IconButton
                        size="small"
                        color="error"
                        title="Xóa voucher"
                        onClick={() => {
                          setDeletingVoucher(v);
                          setConfirmOpen(true);
                        }}
                        sx={{
                          border: '1px solid #fee2e2',
                          bgcolor: '#fef2f2',
                          borderRadius: 1.5,
                          '&:hover': { bgcolor: '#fee2e2' },
                        }}
                      >
                        <DeleteOutline sx={{ fontSize: 17 }} />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        /* Dạng bảng danh sách cô đọng */
        <Paper variant="outlined" sx={{ borderRadius: 3, borderColor: '#e2e8f0', overflow: 'hidden' }}>
          <TableContainer>
            <Table size="medium">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Mã Voucher</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Mức Giảm</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Đơn Tối Thiểu</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Thời Hạn Áp Dụng</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trạng Thái</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Kích Hoạt</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Thao Tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredVouchers.map((v) => (
                  <TableRow key={v.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            color: '#1d4ed8',
                            bgcolor: '#eff6ff',
                            px: 1,
                            py: 0.25,
                            borderRadius: 1.5,
                            fontSize: '0.9rem',
                            border: '1px dashed #93c5fd',
                          }}
                        >
                          {v.code}
                        </Box>
                        <Tooltip title={copiedCode === v.code ? 'Đã sao chép!' : 'Sao chép mã'}>
                          <IconButton size="small" onClick={() => handleCopy(v.code)}>
                            <ContentCopy sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      {v.description && (
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, maxWidth: 220 }} noWrap>
                          {v.description}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" sx={{ color: '#0f172a' }}>
                        Giảm {v.discountPercent}%
                      </Typography>
                      {v.maxDiscountAmount && (
                        <Typography variant="caption" color="text.secondary">
                          Tối đa: {formatVnd(v.maxDiscountAmount)}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {v.minOrderAmount ? formatVnd(v.minOrderAmount) : '0 ₫'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(v.validFrom)} &rarr; {formatDate(v.validTo)}
                      </Typography>
                    </TableCell>

                    <TableCell>{getStatusBadge(v)}</TableCell>

                    <TableCell>
                      <Switch
                        size="small"
                        checked={v.isActive}
                        onChange={() => handleToggle(v)}
                        color="success"
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Box sx={{ display: 'inline-flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          title="Sửa voucher"
                          onClick={() => {
                            setEditingVoucher(v);
                            setFormOpen(true);
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          title="Xóa voucher"
                          onClick={() => {
                            setDeletingVoucher(v);
                            setConfirmOpen(true);
                          }}
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Modal Thêm/Sửa Voucher */}
      <VoucherFormDialog
        open={formOpen}
        voucher={editingVoucher}
        onClose={() => setFormOpen(false)}
        onSuccess={fetchVouchers}
      />

      {/* Modal Xác Nhận Xóa */}
      <ConfirmDialog
        open={confirmOpen}
        title="Xác nhận xóa voucher"
        message={`Bạn có chắc muốn xóa vĩnh viễn mã voucher "${deletingVoucher?.code}" khỏi hệ thống không?`}
        confirmText="Xóa Voucher"
        confirmColor="error"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeletingVoucher(null);
        }}
      />
    </Container>
  );
};
