import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  TrendingUp,
  ShoppingBagOutlined,
  Inventory2Outlined,
  PeopleOutline,
  Refresh,
  ArrowForward,
  CheckCircleOutline,
  ScheduleOutlined,
  LocalShippingOutlined,
  CancelOutlined,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { dashboardApi } from './dashboardApi';
import type { DashboardResponse, RevenueByDate } from './types';
import { ProductImage } from '../../components/common/ProductImage';
import { errorMessage } from '../cart_checkout/transactionApi';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<RevenueByDate | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await dashboardApi.getStats();
      setData(stats);
      if (stats.revenueTrend && stats.revenueTrend.length > 0) {
        setHoveredDate(stats.revenueTrend[stats.revenueTrend.length - 1]);
      }
    } catch (err: any) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatVnd = (val?: number) => {
    if (val === undefined || val === null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const getStatusChip = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return <Chip size="small" icon={<CheckCircleOutline sx={{ fontSize: 14 }} />} label="Hoàn tất" color="success" sx={{ fontWeight: 600 }} />;
      case 'CONFIRMED':
        return <Chip size="small" label="Đã xác nhận" color="primary" sx={{ fontWeight: 600 }} />;
      case 'SHIPPING':
        return <Chip size="small" icon={<LocalShippingOutlined sx={{ fontSize: 14 }} />} label="Đang giao" color="info" sx={{ fontWeight: 600 }} />;
      case 'PENDING':
        return <Chip size="small" icon={<ScheduleOutlined sx={{ fontSize: 14 }} />} label="Chờ duyệt" color="warning" sx={{ fontWeight: 600 }} />;
      case 'CANCELLED':
        return <Chip size="small" icon={<CancelOutlined sx={{ fontSize: 14 }} />} label="Đã hủy" color="error" sx={{ fontWeight: 600 }} />;
      default:
        return <Chip size="small" label={status || 'N/A'} />;
    }
  };

  if (loading && !data) {
    return (
      <Container maxWidth={false} disableGutters>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const summary = data?.summary;
  const revenueTrend = data?.revenueTrend || [];
  const maxRevenue = Math.max(...revenueTrend.map((r) => r.revenue), 1000000);

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
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              fontSize: { xs: '1.5rem', sm: '1.85rem', md: '2.1rem' },
              lineHeight: 1.25,
              letterSpacing: '-0.02em',
            }}
          >
            Tổng Quan Kinh Doanh
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Theo dõi doanh thu, phân tích giao dịch và hiệu suất bán hàng thời gian thực
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchStats}
            disabled={loading}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Làm mới
          </Button>
          <Button
            variant="contained"
            component={Link}
            to="/admin/orders"
            endIcon={<ArrowForward />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Xem đơn hàng
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 4 Thẻ KPI Tài Chính */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {/* KPI 1: Doanh thu */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid #e2e8f0',
              height: '100%',
              bgcolor: '#ffffff',
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Tổng Doanh Thu
                </Typography>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: '#dcfce7',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrendingUp />
                </Box>
              </Box>
              <Typography variant="h5" fontWeight={800} sx={{ color: '#0f172a', mb: 0.5 }}>
                {formatVnd(summary?.totalRevenue)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Hôm nay: <b>{formatVnd(summary?.todayRevenue)}</b>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* KPI 2: Đơn hàng */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid #e2e8f0',
              height: '100%',
              bgcolor: '#ffffff',
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Tổng Đơn Hàng
                </Typography>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: '#dbeafe',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShoppingBagOutlined />
                </Box>
              </Box>
              <Typography variant="h5" fontWeight={800} sx={{ color: '#0f172a', mb: 0.5 }}>
                {summary?.totalOrders || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Hoàn tất: <b>{summary?.completedOrders}</b> ({summary?.conversionRate}%)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* KPI 3: Sản phẩm */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid #e2e8f0',
              height: '100%',
              bgcolor: '#ffffff',
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Sản Phẩm Đang Bán
                </Typography>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: '#f3e8ff',
                    color: '#9333ea',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Inventory2Outlined />
                </Box>
              </Box>
              <Typography variant="h5" fontWeight={800} sx={{ color: '#0f172a', mb: 0.5 }}>
                {summary?.totalProducts || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Mặt hàng đang kinh doanh
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* KPI 4: Khách hàng */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid #e2e8f0',
              height: '100%',
              bgcolor: '#ffffff',
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Khách Hàng Đăng Ký
                </Typography>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: '#fef3c7',
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PeopleOutline />
                </Box>
              </Box>
              <Typography variant="h5" fontWeight={800} sx={{ color: '#0f172a', mb: 0.5 }}>
                {summary?.totalCustomers || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Người dùng hệ thống
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Row 2: Biểu đồ Doanh Thu 7 Ngày & Phân Bổ Trạng Thái Đơn Hàng */}
      <Grid container spacing={3} sx={{ mb: 3.5 }}>
        {/* Biểu đồ Doanh thu (Area / Bar Chart SVG) */}
        <Grid item xs={12} lg={8}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 3,
              borderColor: '#e2e8f0',
              boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Doanh Thu 7 Ngày Gần Nhất
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Rê chuột vào từng ngày để xem chi tiết doanh thu và số lượng đơn
                </Typography>
              </Box>
              {hoveredDate && (
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ color: 'primary.main' }}>
                    {formatVnd(hoveredDate.revenue)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {hoveredDate.displayDate}: {hoveredDate.orderCount} đơn hàng
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Khung Biểu Đồ Tương Tác */}
            <Box
              sx={{
                flex: 1,
                minHeight: 220,
                display: 'flex',
                alignItems: 'flex-end',
                gap: { xs: 1.5, sm: 3 },
                pt: 3,
                pb: 1,
                px: 2,
                bgcolor: '#f8fafc',
                borderRadius: 2.5,
                border: '1px solid #f1f5f9',
              }}
            >
              {revenueTrend.map((item) => {
                const heightPercent = maxRevenue > 0 ? Math.max((item.revenue / maxRevenue) * 100, 6) : 6;
                const isHovered = hoveredDate?.date === item.date;

                return (
                  <Box
                    key={item.date}
                    onMouseEnter={() => setHoveredDate(item)}
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'flex-end',
                      cursor: 'pointer',
                    }}
                  >
                    {/* Cột Doanh Thu */}
                    <Box
                      sx={{
                        width: '100%',
                        maxWidth: 42,
                        height: `${heightPercent}%`,
                        borderRadius: '6px 6px 2px 2px',
                        bgcolor: isHovered ? '#15803d' : item.revenue > 0 ? '#16a34a' : '#cbd5e1',
                        boxShadow: isHovered ? '0 2px 8px rgba(22, 163, 74, 0.25)' : 'none',
                        transition: 'all 0.2s ease',
                        transform: isHovered ? 'scaleY(1.03)' : 'none',
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 1,
                        fontSize: '0.75rem',
                        fontWeight: isHovered ? 'bold' : 500,
                        color: isHovered ? 'primary.main' : 'text.secondary',
                      }}
                    >
                      {item.displayDate}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>

        {/* Biểu đồ Trạng Thái Đơn Hàng (Distribution Donut / Bars) */}
        <Grid item xs={12} lg={4}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 3,
              borderColor: '#e2e8f0',
              boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
              height: '100%',
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Phân Bổ Trạng Thái Đơn
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2.5 }}>
              Tỷ lệ phần trăm trên tổng {summary?.totalOrders || 0} đơn hàng
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {data?.orderStatusDistribution.map((item) => (
                <Box key={item.status}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                      <Typography variant="body2" fontWeight={500}>
                        {item.label}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      {item.count} <Typography component="span" variant="caption" color="text.secondary">({item.percentage}%)</Typography>
                    </Typography>
                  </Box>
                  <Box sx={{ height: 6, bgcolor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: `${item.percentage}%`, bgcolor: item.color, borderRadius: 3 }} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Row 3: Top Sản Phẩm Bán Chạy & Đơn Hàng Gần Đây */}
      <Grid container spacing={3}>
        {/* Top Sản Phẩm Bán Chạy */}
        <Grid item xs={12} md={6}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 3,
              borderColor: '#e2e8f0',
              boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Top Sản Phẩm Bán Chạy
              </Typography>
              <Button component={Link} to="/admin/products" size="small" endIcon={<ArrowForward />} sx={{ textTransform: 'none' }}>
                Xem tất cả
              </Button>
            </Box>

            {data?.topProducts && data.topProducts.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {data.topProducts.map((p, idx) => (
                  <Box
                    key={p.productId}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: '#f8fafc',
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          bgcolor: idx === 0 ? '#fef08a' : idx === 1 ? '#e2e8f0' : idx === 2 ? '#ffedd5' : '#f1f5f9',
                          color: '#0f172a',
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        #{idx + 1}
                      </Box>
                      <Box sx={{ width: 44, height: 44, borderRadius: 1.5, overflow: 'hidden' }}>
                        <ProductImage src={p.thumbnailUrl} alt={p.name} />
                      </Box>
                      <Box sx={{ maxWidth: { xs: 150, sm: 220 } }}>
                        <Typography variant="subtitle2" fontWeight={600} noWrap>
                          {p.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Đã bán: <b>{p.soldQuantity}</b> sản phẩm
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: 'primary.main', pl: 1 }}>
                      {formatVnd(p.totalRevenue)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                Chưa có dữ liệu sản phẩm đã bán.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Đơn Hàng Gần Đây */}
        <Grid item xs={12} md={6}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 3,
              borderColor: '#e2e8f0',
              boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Đơn Hàng Gần Đây
              </Typography>
              <Button component={Link} to="/admin/orders" size="small" endIcon={<ArrowForward />} sx={{ textTransform: 'none' }}>
                Quản lý đơn
              </Button>
            </Box>

            {data?.recentOrders && data.recentOrders.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Mã đơn</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Khách hàng</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Tổng tiền</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.recentOrders.map((o) => (
                      <TableRow key={o.orderId} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{o.orderCode}</TableCell>
                        <TableCell>{o.customerName}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          {formatVnd(o.finalAmount)}
                        </TableCell>
                        <TableCell>{getStatusChip(o.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                Chưa có đơn hàng nào trong hệ thống.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
