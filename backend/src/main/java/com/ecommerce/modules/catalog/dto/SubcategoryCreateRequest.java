package com.ecommerce.modules.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubcategoryCreateRequest {

    @NotNull(message = "Vui lòng chọn danh mục cha")
    private Long categoryId;

    @NotBlank(message = "Tên danh mục con không được để trống")
    private String name;

    private String slug;

    private String description;
}
