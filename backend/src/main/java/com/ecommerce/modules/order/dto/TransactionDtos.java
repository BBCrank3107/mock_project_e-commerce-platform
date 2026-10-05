package com.ecommerce.modules.order.dto;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class TransactionDtos {
    private TransactionDtos() {}
    public record AddItem(@NotNull @Positive Long productId, @NotNull @Min(1) @Max(999) Integer quantity) {}
    public record Quantity(@NotNull @Min(1) @Max(999) Integer quantity) {}
    public record Checkout(
        @NotBlank @Size(max=150) String recipientName,
        @NotBlank @Pattern(regexp="[+0-9][0-9 ()-]{8,19}") String phone,
        @NotBlank @Size(max=2000) String address,
        @NotBlank @Size(max=100) String city,
        @Size(max=50) String couponCode,
        @NotBlank @Pattern(regexp="COD|BANKING") String paymentMethod,
        @Size(max=2000) String notes) {}
    public record ApplyCoupon(@NotBlank @Size(max=50) String code) {}
    public record Status(@NotBlank @Pattern(regexp="PENDING|CONFIRMED|SHIPPING|COMPLETED|CANCELLED") String status) {}
    public record CartLine(Long id, Long productId, String productName, String thumbnailUrl,
        int quantity, BigDecimal unitPrice, BigDecimal totalPrice, int stockQuantity) {}
    public record CartView(Long id, List<CartLine> items, BigDecimal subtotal, int itemCount) {}
    public record CouponView(Long promotionId, String code, BigDecimal discountAmount, BigDecimal finalAmount) {}
    public record InventoryView(Long productId, int stockQuantity) {}
    public record OrderLine(Long productId, String productName, String thumbnailUrl, int quantity,
        BigDecimal unitPrice, BigDecimal totalPrice) {}
    public record ShippingView(String recipientName, String phone, String address, String city, String shippingStatus) {}
    public record PaymentView(String paymentMethod, String paymentStatus, BigDecimal amount) {}
    public record OrderView(Long id, String orderCode, Long userId, String customerName, BigDecimal totalAmount,
        BigDecimal discountAmount, BigDecimal finalAmount, String status, String notes, Instant createdAt,
        List<OrderLine> items, ShippingView shipping, PaymentView payment) {}
}
