package com.ecommerce.modules.catalog.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductUpdateRequest {

    @NotNull(message = "Danh mục con không được để trống")
    private Long subcategoryId;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;

    private String sku;

    @NotNull(message = "Giá sản phẩm không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá sản phẩm phải lớn hơn 0")
    private BigDecimal price;

    private BigDecimal discountPrice;

    private String description;

    private String thumbnailUrl;

    private Boolean isActive;
}
