package com.ecommerce.modules.catalog.dto;

import com.ecommerce.modules.catalog.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDTO {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String iconUrl;
    private Boolean isActive;
    private List<SubcategoryDTO> subcategories;

    public static CategoryDTO from(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .iconUrl(category.getIconUrl())
                .isActive(category.getIsActive())
                .subcategories(category.getSubcategories() != null ?
                        category.getSubcategories().stream().map(SubcategoryDTO::from).collect(Collectors.toList()) :
                        List.of())
                .build();
    }
}
