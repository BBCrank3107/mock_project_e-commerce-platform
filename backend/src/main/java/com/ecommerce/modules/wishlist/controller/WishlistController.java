package com.ecommerce.modules.wishlist.controller;

import com.ecommerce.common.dto.ApiResponse;
import com.ecommerce.modules.wishlist.dto.WishlistItemDTO;
import com.ecommerce.modules.wishlist.dto.WishlistToggleResponse;
import com.ecommerce.modules.wishlist.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlists")
@RequiredArgsConstructor
@Tag(name = "Wishlist", description = "Quản lý danh sách sản phẩm yêu thích (Wishlist)")
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    @Operation(summary = "Lấy danh sách sản phẩm yêu thích của người dùng hiện tại")
    public ResponseEntity<ApiResponse<List<WishlistItemDTO>>> getMyWishlist() {
        return ResponseEntity.ok(ApiResponse.ok(wishlistService.getMyWishlist()));
    }

    @GetMapping("/ids")
    @Operation(summary = "Lấy danh sách ID các sản phẩm trong wishlist của người dùng")
    public ResponseEntity<ApiResponse<List<Long>>> getMyWishlistProductIds() {
        return ResponseEntity.ok(ApiResponse.ok(wishlistService.getMyWishlistProductIds()));
    }

    @PostMapping("/toggle/{productId}")
    @Operation(summary = "Bật / Tắt trạng thái yêu thích của sản phẩm (Toggle like/unlike)")
    public ResponseEntity<ApiResponse<WishlistToggleResponse>> toggleWishlist(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.ok(wishlistService.toggleWishlist(productId)));
    }

    @PostMapping("/{productId}")
    @Operation(summary = "Thêm sản phẩm vào danh sách yêu thích")
    public ResponseEntity<ApiResponse<String>> addToWishlist(@PathVariable Long productId) {
        wishlistService.addToWishlist(productId);
        return ResponseEntity.ok(ApiResponse.ok("Đã thêm vào danh sách yêu thích"));
    }

    @DeleteMapping("/{productId}")
    @Operation(summary = "Xóa sản phẩm khỏi danh sách yêu thích")
    public ResponseEntity<ApiResponse<String>> removeFromWishlist(@PathVariable Long productId) {
        wishlistService.removeFromWishlist(productId);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa khỏi danh sách yêu thích"));
    }

    @GetMapping("/check/{productId}")
    @Operation(summary = "Kiểm tra sản phẩm có trong wishlist không")
    public ResponseEntity<ApiResponse<Boolean>> checkWishlist(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.ok(wishlistService.isInWishlist(productId)));
    }
}
