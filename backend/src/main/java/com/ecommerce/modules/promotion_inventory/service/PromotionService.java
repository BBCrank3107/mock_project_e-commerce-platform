package com.ecommerce.modules.promotion_inventory.service;

import com.ecommerce.modules.order.dto.TransactionDtos.CouponView;
import com.ecommerce.modules.order.service.TransactionException;
import com.ecommerce.modules.promotion_inventory.dto.PromotionDTOs.PromotionRequest;
import com.ecommerce.modules.promotion_inventory.dto.PromotionDTOs.PromotionResponse;
import com.ecommerce.modules.promotion_inventory.entity.Promotion;
import com.ecommerce.modules.promotion_inventory.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionService {

    private final PromotionRepository promotions;

    public CouponView apply(String code, BigDecimal subtotal) {
        var promo = promotions.findByCodeIgnoreCase(code.trim()).orElseThrow(() ->
            new TransactionException(HttpStatus.BAD_REQUEST, "Mã giảm giá không tồn tại"));
        var now = Instant.now();
        if (!Boolean.TRUE.equals(promo.getIsActive()) || (promo.getValidFrom() != null && now.isBefore(promo.getValidFrom())) || (promo.getValidTo() != null && !now.isBefore(promo.getValidTo())))
            throw new TransactionException(HttpStatus.BAD_REQUEST, "Mã giảm giá chưa có hiệu lực hoặc đã hết hạn");
        if (subtotal.compareTo(promo.getMinOrderAmount() == null ? BigDecimal.ZERO : promo.getMinOrderAmount()) < 0)
            throw new TransactionException(HttpStatus.BAD_REQUEST, "Đơn hàng chưa đạt giá trị tối thiểu");
        var discount = subtotal.multiply(BigDecimal.valueOf(promo.getDiscountPercent())).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        if (promo.getMaxDiscountAmount() != null) discount = discount.min(promo.getMaxDiscountAmount());
        discount = discount.min(subtotal);
        return new CouponView(promo.getId(), promo.getCode(), discount, subtotal.subtract(discount));
    }

    @Transactional(readOnly = true)
    public List<PromotionResponse> getAllPromotions() {
        return promotions.findAllByOrderByIdDesc().stream()
                .map(PromotionResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PromotionResponse> getActivePromotions() {
        Instant now = Instant.now();
        return promotions.findByIsActiveTrue().stream()
                .filter(p -> (p.getValidFrom() == null || !now.isBefore(p.getValidFrom()))
                          && (p.getValidTo() == null || now.isBefore(p.getValidTo())))
                .map(PromotionResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public PromotionResponse createPromotion(PromotionRequest req) {
        String code = req.getCode().trim().toUpperCase();
        if (promotions.existsByCodeIgnoreCase(code)) {
            throw new TransactionException(HttpStatus.BAD_REQUEST, "Mã voucher '" + code + "' đã tồn tại!");
        }

        Instant validFrom = req.getValidFrom() != null ? req.getValidFrom() : Instant.now();
        Instant validTo = req.getValidTo() != null ? req.getValidTo() : Instant.now().plus(30, ChronoUnit.DAYS);

        if (validTo.isBefore(validFrom)) {
            throw new TransactionException(HttpStatus.BAD_REQUEST, "Ngày kết thúc phải sau ngày bắt đầu!");
        }

        Promotion promo = Promotion.builder()
                .code(code)
                .description(req.getDescription())
                .discountPercent(req.getDiscountPercent())
                .maxDiscountAmount(req.getMaxDiscountAmount())
                .minOrderAmount(req.getMinOrderAmount())
                .validFrom(validFrom)
                .validTo(validTo)
                .isActive(req.getIsActive() != null ? req.getIsActive() : true)
                .build();

        return PromotionResponse.from(promotions.save(promo));
    }

    @Transactional
    public PromotionResponse updatePromotion(Long id, PromotionRequest req) {
        Promotion promo = promotions.findById(id).orElseThrow(() ->
                new TransactionException(HttpStatus.NOT_FOUND, "Không tìm thấy voucher với id: " + id));

        String newCode = req.getCode().trim().toUpperCase();
        if (!promo.getCode().equalsIgnoreCase(newCode) && promotions.existsByCodeIgnoreCase(newCode)) {
            throw new TransactionException(HttpStatus.BAD_REQUEST, "Mã voucher '" + newCode + "' đã tồn tại!");
        }

        Instant validFrom = req.getValidFrom() != null ? req.getValidFrom() : promo.getValidFrom();
        Instant validTo = req.getValidTo() != null ? req.getValidTo() : promo.getValidTo();

        if (validTo != null && validFrom != null && validTo.isBefore(validFrom)) {
            throw new TransactionException(HttpStatus.BAD_REQUEST, "Ngày kết thúc phải sau ngày bắt đầu!");
        }

        promo.setCode(newCode);
        promo.setDescription(req.getDescription());
        promo.setDiscountPercent(req.getDiscountPercent());
        promo.setMaxDiscountAmount(req.getMaxDiscountAmount());
        promo.setMinOrderAmount(req.getMinOrderAmount());
        promo.setValidFrom(validFrom);
        promo.setValidTo(validTo);
        if (req.getIsActive() != null) {
            promo.setIsActive(req.getIsActive());
        }

        return PromotionResponse.from(promotions.save(promo));
    }

    @Transactional
    public PromotionResponse togglePromotion(Long id) {
        Promotion promo = promotions.findById(id).orElseThrow(() ->
                new TransactionException(HttpStatus.NOT_FOUND, "Không tìm thấy voucher với id: " + id));
        promo.setIsActive(!Boolean.TRUE.equals(promo.getIsActive()));
        return PromotionResponse.from(promotions.save(promo));
    }

    @Transactional
    public void deletePromotion(Long id) {
        Promotion promo = promotions.findById(id).orElseThrow(() ->
                new TransactionException(HttpStatus.NOT_FOUND, "Không tìm thấy voucher với id: " + id));
        promotions.delete(promo);
    }
}
