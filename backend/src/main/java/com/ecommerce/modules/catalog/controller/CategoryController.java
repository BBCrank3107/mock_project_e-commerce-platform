package com.ecommerce.modules.catalog.controller;

import com.ecommerce.common.dto.ApiResponse;
import com.ecommerce.modules.catalog.dto.CategoryDTO;
import com.ecommerce.modules.catalog.dto.SubcategoryDTO;
import com.ecommerce.modules.catalog.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Catalog Categories", description = "Quản lý danh mục & phân loại sản phẩm (Member A)")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Lấy tất cả danh mục chính kèm danh mục con")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getAllCategories()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết danh mục theo ID")
    public ResponseEntity<ApiResponse<CategoryDTO>> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getCategoryById(id)));
    }

    @GetMapping("/{id}/subcategories")
    @Operation(summary = "Lấy danh sách danh mục con thuộc danh mục cha")
    public ResponseEntity<ApiResponse<List<SubcategoryDTO>>> getSubcategories(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getSubcategoriesByCategoryId(id)));
    }
}
