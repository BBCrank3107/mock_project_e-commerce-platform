package com.ecommerce.modules.catalog.dto;

import com.ecommerce.modules.catalog.entity.Subcategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubcategoryDTO {
    private Long id;
    private Long categoryId;
    private String name;
    private String slug;
    private String description;
    private Boolean isActive;

    public static SubcategoryDTO from(Subcategory subcategory) {
        return SubcategoryDTO.builder()
                .id(subcategory.getId())
                .categoryId(subcategory.getCategory() != null ? subcategory.getCategory().getId() : null)
                .name(subcategory.getName())
                .slug(subcategory.getSlug())
                .description(subcategory.getDescription())
                .isActive(subcategory.getIsActive())
                .build();
    }
}
