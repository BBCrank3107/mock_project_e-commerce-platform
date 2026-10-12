package com.ecommerce.modules.promotion_inventory.service;
import com.ecommerce.modules.promotion_inventory.repository.PromotionRepository;
import com.ecommerce.modules.order.dto.TransactionDtos.CouponView;
import com.ecommerce.modules.order.service.TransactionException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import java.math.*;
import java.time.Instant;

@Service @RequiredArgsConstructor
public class PromotionService {
    private final PromotionRepository promotions;
    public CouponView apply(String code, BigDecimal subtotal) {
        var promo = promotions.findByCodeIgnoreCase(code.trim()).orElseThrow(() ->
            new TransactionException(HttpStatus.BAD_REQUEST, "Mã giảm giá không tồn tại"));
        var now = Instant.now();
        if (!Boolean.TRUE.equals(promo.getIsActive()) || now.isBefore(promo.getValidFrom()) || !now.isBefore(promo.getValidTo()))
            throw new TransactionException(HttpStatus.BAD_REQUEST, "Mã giảm giá chưa có hiệu lực hoặc đã hết hạn");
        if (subtotal.compareTo(promo.getMinOrderAmount() == null ? BigDecimal.ZERO : promo.getMinOrderAmount()) < 0)
            throw new TransactionException(HttpStatus.BAD_REQUEST, "Đơn hàng chưa đạt giá trị tối thiểu");
        var discount = subtotal.multiply(BigDecimal.valueOf(promo.getDiscountPercent())).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        if (promo.getMaxDiscountAmount() != null) discount = discount.min(promo.getMaxDiscountAmount());
        discount = discount.min(subtotal);
        return new CouponView(promo.getId(), promo.getCode(), discount, subtotal.subtract(discount));
    }
}
