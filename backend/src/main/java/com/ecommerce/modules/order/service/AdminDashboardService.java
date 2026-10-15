package com.ecommerce.modules.order.service;

import com.ecommerce.modules.auth_user.entity.User;
import com.ecommerce.modules.auth_user.repository.UserRepository;
import com.ecommerce.modules.catalog.entity.Product;
import com.ecommerce.modules.catalog.repository.ProductRepository;
import com.ecommerce.modules.order.dto.DashboardDTOs.*;
import com.ecommerce.modules.order.entity.Order;
import com.ecommerce.modules.order.entity.OrderItem;
import com.ecommerce.modules.order.repository.OrderItemRepository;
import com.ecommerce.modules.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DISPLAY_FORMATTER = DateTimeFormatter.ofPattern("dd/MM");

    @Transactional(readOnly = true)
    public DashboardResponse getDashboardStats() {
        List<Order> allOrders = orderRepository.findAll();
        List<OrderItem> allOrderItems = orderItemRepository.findAll();
        long totalProducts = productRepository.count();
        long totalCustomers = userRepository.count();

        // 1. Summary Stats
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal todayRevenue = BigDecimal.ZERO;
        long completedCount = 0;
        long pendingCount = 0;
        long cancelledCount = 0;
        LocalDate today = LocalDate.now(VIETNAM_ZONE);

        for (Order o : allOrders) {
            String status = o.getStatus() != null ? o.getStatus().toUpperCase() : "PENDING";
            BigDecimal amount = o.getFinalAmount() != null ? o.getFinalAmount() : BigDecimal.ZERO;

            if (!"CANCELLED".equals(status)) {
                totalRevenue = totalRevenue.add(amount);

                if (o.getCreatedAt() != null) {
                    LocalDate orderDate = o.getCreatedAt().atZone(VIETNAM_ZONE).toLocalDate();
                    if (today.equals(orderDate)) {
                        todayRevenue = todayRevenue.add(amount);
                    }
                }
            }

            if ("COMPLETED".equals(status)) completedCount++;
            else if ("PENDING".equals(status)) pendingCount++;
            else if ("CANCELLED".equals(status)) cancelledCount++;
        }

        long totalOrders = allOrders.size();
        double conversionRate = totalOrders > 0
                ? Math.round((completedCount * 100.0 / totalOrders) * 10.0) / 10.0
                : 0.0;

        SummaryStats summary = SummaryStats.builder()
                .totalRevenue(totalRevenue)
                .todayRevenue(todayRevenue)
                .totalOrders(totalOrders)
                .completedOrders(completedCount)
                .pendingOrders(pendingCount)
                .cancelledOrders(cancelledCount)
                .totalProducts(totalProducts)
                .totalCustomers(totalCustomers)
                .conversionRate(conversionRate)
                .build();

        // 2. Revenue Trend (7 ngày gần nhất)
        Map<String, BigDecimal> dailyRevenue = new HashMap<>();
        Map<String, Long> dailyOrderCount = new HashMap<>();

        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            String key = d.format(DATE_FORMATTER);
            dailyRevenue.put(key, BigDecimal.ZERO);
            dailyOrderCount.put(key, 0L);
        }

        for (Order o : allOrders) {
            if ("CANCELLED".equalsIgnoreCase(o.getStatus())) continue;
            if (o.getCreatedAt() != null) {
                LocalDate d = o.getCreatedAt().atZone(VIETNAM_ZONE).toLocalDate();
                String key = d.format(DATE_FORMATTER);
                if (dailyRevenue.containsKey(key)) {
                    BigDecimal amt = o.getFinalAmount() != null ? o.getFinalAmount() : BigDecimal.ZERO;
                    dailyRevenue.put(key, dailyRevenue.get(key).add(amt));
                    dailyOrderCount.put(key, dailyOrderCount.get(key) + 1);
                }
            }
        }

        List<RevenueByDate> revenueTrend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            String key = d.format(DATE_FORMATTER);
            revenueTrend.add(RevenueByDate.builder()
                    .date(key)
                    .displayDate(d.format(DISPLAY_FORMATTER))
                    .revenue(dailyRevenue.get(key))
                    .orderCount(dailyOrderCount.get(key))
                    .build());
        }

        // 3. Order Status Distribution
        Map<String, Long> statusCounts = new HashMap<>();
        statusCounts.put("COMPLETED", 0L);
        statusCounts.put("PENDING", 0L);
        statusCounts.put("CONFIRMED", 0L);
        statusCounts.put("SHIPPING", 0L);
        statusCounts.put("CANCELLED", 0L);

        for (Order o : allOrders) {
            String s = o.getStatus() != null ? o.getStatus().toUpperCase() : "PENDING";
            statusCounts.put(s, statusCounts.getOrDefault(s, 0L) + 1);
        }

        List<StatusCount> distribution = List.of(
                buildStatusCount("COMPLETED", "Đã hoàn thành", statusCounts.get("COMPLETED"), totalOrders, "#10b981"),
                buildStatusCount("CONFIRMED", "Đã xác nhận", statusCounts.get("CONFIRMED"), totalOrders, "#3b82f6"),
                buildStatusCount("SHIPPING", "Đang vận chuyển", statusCounts.get("SHIPPING"), totalOrders, "#8b5cf6"),
                buildStatusCount("PENDING", "Chờ duyệt", statusCounts.get("PENDING"), totalOrders, "#f59e0b"),
                buildStatusCount("CANCELLED", "Đã hủy", statusCounts.get("CANCELLED"), totalOrders, "#ef4444")
        );

        // 4. Top Selling Products
        Map<Long, Long> productSoldQty = new HashMap<>();
        Map<Long, BigDecimal> productRevenue = new HashMap<>();

        for (OrderItem item : allOrderItems) {
            if (item.getProductId() != null) {
                Long pid = item.getProductId();
                long qty = item.getQuantity() != null ? item.getQuantity() : 1;
                BigDecimal itemTotal = item.getTotalPrice() != null ? item.getTotalPrice() : BigDecimal.ZERO;

                productSoldQty.put(pid, productSoldQty.getOrDefault(pid, 0L) + qty);
                productRevenue.put(pid, productRevenue.getOrDefault(pid, BigDecimal.ZERO).add(itemTotal));
            }
        }

        List<TopSellingProduct> topProducts = productSoldQty.entrySet().stream()
                .sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
                .limit(5)
                .map(entry -> {
                    Long pid = entry.getKey();
                    Optional<Product> prodOpt = productRepository.findById(pid);
                    String name = prodOpt.map(Product::getName).orElse("Sản phẩm #" + pid);
                    String thumb = prodOpt.map(Product::getThumbnailUrl).orElse("");
                    return TopSellingProduct.builder()
                            .productId(pid)
                            .name(name)
                            .thumbnailUrl(thumb)
                            .soldQuantity(entry.getValue())
                            .totalRevenue(productRevenue.getOrDefault(pid, BigDecimal.ZERO))
                            .build();
                })
                .collect(Collectors.toList());

        // 5. Recent Orders (5 đơn mới nhất)
        Map<Long, String> userNames = userRepository.findAll().stream()
                .collect(Collectors.toMap(User::getId, u -> u.getFullName() != null && !u.getFullName().isBlank() ? u.getFullName() : u.getUsername(), (a, b) -> a));

        List<RecentOrder> recentOrders = allOrders.stream()
                .sorted((o1, o2) -> Long.compare(o2.getId(), o1.getId()))
                .limit(5)
                .map(o -> RecentOrder.builder()
                        .orderId(o.getId())
                        .orderCode(o.getOrderCode() != null ? o.getOrderCode() : "ORD-" + o.getId())
                        .customerName(userNames.getOrDefault(o.getUserId(), "Khách hàng #" + o.getUserId()))
                        .finalAmount(o.getFinalAmount() != null ? o.getFinalAmount() : BigDecimal.ZERO)
                        .status(o.getStatus())
                        .statusLabel(getStatusLabel(o.getStatus()))
                        .createdAt(o.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .summary(summary)
                .revenueTrend(revenueTrend)
                .orderStatusDistribution(distribution)
                .topProducts(topProducts)
                .recentOrders(recentOrders)
                .build();
    }

    private StatusCount buildStatusCount(String status, String label, Long count, long total, String color) {
        long c = count != null ? count : 0;
        double pct = total > 0 ? Math.round((c * 100.0 / total) * 10.0) / 10.0 : 0.0;
        return StatusCount.builder()
                .status(status)
                .label(label)
                .count(c)
                .percentage(pct)
                .color(color)
                .build();
    }

    private String getStatusLabel(String status) {
        if (status == null) return "Chờ xử lý";
        return switch (status.toUpperCase()) {
            case "PENDING" -> "Chờ duyệt";
            case "CONFIRMED" -> "Đã xác nhận";
            case "SHIPPING" -> "Đang giao";
            case "COMPLETED" -> "Đã hoàn thành";
            case "CANCELLED" -> "Đã hủy";
            default -> status;
        };
    }
}
