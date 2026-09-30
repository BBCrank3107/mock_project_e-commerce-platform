package com.ecommerce.modules.catalog.dto;

import com.ecommerce.modules.catalog.entity.Product;
import com.ecommerce.modules.catalog.entity.ProductImage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long id;
    private Long subcategoryId;
    private String subcategoryName;
    private Long categoryId;
    private String categoryName;
    private String name;
    private String slug;
    private String sku;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private String description;
    private String thumbnailUrl;
    private Boolean isActive;
    private Instant createdAt;
    private List<String> imageUrls;

    public static ProductDTO from(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .subcategoryId(product.getSubcategory() != null ? product.getSubcategory().getId() : null)
                .subcategoryName(product.getSubcategory() != null ? product.getSubcategory().getName() : null)
                .categoryId(product.getSubcategory() != null && product.getSubcategory().getCategory() != null ?
                        product.getSubcategory().getCategory().getId() : null)
                .categoryName(product.getSubcategory() != null && product.getSubcategory().getCategory() != null ?
                        product.getSubcategory().getCategory().getName() : null)
                .name(product.getName())
                .slug(product.getSlug())
                .sku(product.getSku())
                .price(product.getPrice())
                .discountPrice(product.getDiscountPrice())
                .description(product.getDescription())
                .thumbnailUrl(product.getThumbnailUrl())
                .isActive(product.getIsActive())
                .createdAt(product.getCreatedAt())
                .imageUrls(product.getImages() != null ?
                        product.getImages().stream().map(ProductImage::getImageUrl).collect(Collectors.toList()) :
                        List.of())
                .build();
    }
}
