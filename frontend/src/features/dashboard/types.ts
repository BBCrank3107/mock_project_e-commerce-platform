export interface SummaryStats {
  totalRevenue: number;
  todayRevenue: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalProducts: number;
  totalCustomers: number;
  conversionRate: number;
}

export interface RevenueByDate {
  date: string;
  displayDate: string;
  revenue: number;
  orderCount: number;
}

export interface StatusCount {
  status: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TopSellingProduct {
  productId: number;
  name: string;
  thumbnailUrl?: string;
  soldQuantity: number;
  totalRevenue: number;
}

export interface RecentOrder {
  orderId: number;
  orderCode: string;
  customerName: string;
  finalAmount: number;
  status: string;
  statusLabel: string;
  createdAt: string;
}

export interface DashboardResponse {
  summary: SummaryStats;
  revenueTrend: RevenueByDate[];
  orderStatusDistribution: StatusCount[];
  topProducts: TopSellingProduct[];
  recentOrders: RecentOrder[];
}
