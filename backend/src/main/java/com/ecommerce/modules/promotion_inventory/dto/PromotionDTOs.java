package com.ecommerce.modules.promotion_inventory.dto;

import com.ecommerce.modules.promotion_inventory.entity.Promotion;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

public class PromotionDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PromotionRequest {
        @NotBlank(message = "Mã voucher không được để trống")
        private String code;

        private String description;

        @NotNull(message = "Phần trăm giảm giá không được để trống")
        @Min(value = 1, message = "Giảm tối thiểu 1%")
        @Max(value = 100, message = "Giảm tối đa 100%")
        private Integer discountPercent;

        private BigDecimal maxDiscountAmount;

        private BigDecimal minOrderAmount;

        private Instant validFrom;

        private Instant validTo;

        private Boolean isActive;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PromotionResponse {
        private Long id;
        private String code;
        private String description;
        private Integer discountPercent;
        private BigDecimal maxDiscountAmount;
        private BigDecimal minOrderAmount;
        private Instant validFrom;
        private Instant validTo;
        private Boolean isActive;
        private String status;
        private String statusLabel;

        public static PromotionResponse from(Promotion p) {
            Instant now = Instant.now();
            String status = "ACTIVE";
            String statusLabel = "Đang áp dụng";

            if (!Boolean.TRUE.equals(p.getIsActive())) {
                status = "DISABLED";
                statusLabel = "Đã tắt";
            } else if (p.getValidTo() != null && now.isAfter(p.getValidTo())) {
                status = "EXPIRED";
                statusLabel = "Đã hết hạn";
            } else if (p.getValidFrom() != null && now.isBefore(p.getValidFrom())) {
                status = "UPCOMING";
                statusLabel = "Sắp diễn ra";
            }

            return PromotionResponse.builder()
                    .id(p.getId())
                    .code(p.getCode())
                    .description(p.getDescription())
                    .discountPercent(p.getDiscountPercent())
                    .maxDiscountAmount(p.getMaxDiscountAmount())
                    .minOrderAmount(p.getMinOrderAmount())
                    .validFrom(p.getValidFrom())
                    .validTo(p.getValidTo())
                    .isActive(p.getIsActive())
                    .status(status)
                    .statusLabel(statusLabel)
                    .build();
        }
    }
}
