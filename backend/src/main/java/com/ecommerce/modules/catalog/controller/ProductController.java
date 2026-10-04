package com.ecommerce.modules.catalog.controller;

import com.ecommerce.common.dto.ApiResponse;
import com.ecommerce.common.dto.PageResponse;
import com.ecommerce.modules.catalog.dto.*;
import com.ecommerce.modules.catalog.service.ProductService;
import com.ecommerce.modules.catalog.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Catalog Products", description = "CRUD sản phẩm, Tìm kiếm, Lọc, Phân trang & Upload ảnh (Member A)")
public class ProductController {

    private final ProductService productService;
    private final ReviewService reviewService;

    @GetMapping
    @Operation(summary = "Lấy danh sách sản phẩm với Phân trang, Tìm kiếm, Lọc danh mục/giá và Sắp xếp")
    public ResponseEntity<ApiResponse<PageResponse<ProductDTO>>> getProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long subcategoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PageResponse<ProductDTO> result = productService.getProducts(
                keyword, subcategoryId, minPrice, maxPrice, isActive, pageable
        );
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem thông tin chi tiết một sản phẩm theo ID")
    public ResponseEntity<ApiResponse<ProductDTO>> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getProductById(id)));
    }

    @PostMapping
    @Operation(summary = "Tạo mới sản phẩm (Admin)")
    public ResponseEntity<ApiResponse<ProductDTO>> createProduct(@Valid @RequestBody ProductCreateRequest request) {
        ProductDTO created = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo sản phẩm mới thành công!", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin sản phẩm (Admin)")
    public ResponseEntity<ApiResponse<ProductDTO>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request
    ) {
        ProductDTO updated = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật sản phẩm thành công!", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa sản phẩm (Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.ok("Xóa sản phẩm thành công!", null));
    }

    @PostMapping(value = "/{id}/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Tải lên file ảnh cho sản phẩm (File Upload)")
    public ResponseEntity<ApiResponse<String>> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "false") boolean isThumbnail
    ) {
        String imageUrl = productService.uploadProductImage(id, file, isThumbnail);
        return ResponseEntity.ok(ApiResponse.ok("Upload ảnh sản phẩm thành công!", imageUrl));
    }

    @GetMapping("/{id}/reviews")
    @Operation(summary = "Lấy danh sách đánh giá của sản phẩm")
    public ResponseEntity<ApiResponse<List<ReviewDTO>>> getReviews(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getReviewsByProductId(id)));
    }

    @PostMapping("/{id}/reviews")
    @Operation(summary = "Gửi đánh giá và nhận xét sản phẩm")
    public ResponseEntity<ApiResponse<ReviewDTO>> addReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewCreateRequest request
    ) {
        ReviewDTO created = reviewService.createReview(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Gửi đánh giá thành công!", created));
    }
}
