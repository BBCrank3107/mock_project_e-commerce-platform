package com.ecommerce.modules.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class DashboardDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SummaryStats {
        private BigDecimal totalRevenue;
        private BigDecimal todayRevenue;
        private long totalOrders;
        private long completedOrders;
        private long pendingOrders;
        private long cancelledOrders;
        private long totalProducts;
        private long totalCustomers;
        private double conversionRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueByDate {
        private String date; // YYYY-MM-DD
        private String displayDate; // dd/MM
        private BigDecimal revenue;
        private long orderCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusCount {
        private String status;
        private String label;
        private long count;
        private double percentage;
        private String color;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopSellingProduct {
        private Long productId;
        private String name;
        private String thumbnailUrl;
        private long soldQuantity;
        private BigDecimal totalRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentOrder {
        private Long orderId;
        private String orderCode;
        private String customerName;
        private BigDecimal finalAmount;
        private String status;
        private String statusLabel;
        private Instant createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardResponse {
        private SummaryStats summary;
        private List<RevenueByDate> revenueTrend;
        private List<StatusCount> orderStatusDistribution;
        private List<TopSellingProduct> topProducts;
        private List<RecentOrder> recentOrders;
    }
}
