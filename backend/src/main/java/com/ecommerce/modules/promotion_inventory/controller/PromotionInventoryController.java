package com.ecommerce.modules.promotion_inventory.controller;

import com.ecommerce.common.dto.ApiResponse;
import com.ecommerce.modules.order.dto.TransactionDtos.ApplyCoupon;
import com.ecommerce.modules.order.dto.TransactionDtos.CouponView;
import com.ecommerce.modules.order.dto.TransactionDtos.InventoryView;
import com.ecommerce.modules.order.service.TransactionService;
import com.ecommerce.modules.promotion_inventory.dto.PromotionDTOs.PromotionRequest;
import com.ecommerce.modules.promotion_inventory.dto.PromotionDTOs.PromotionResponse;
import com.ecommerce.modules.promotion_inventory.service.PromotionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Promotions & Vouchers", description = "Quản lý mã giảm giá (Voucher), kiểm tra tồn kho & áp dụng ưu đãi")
public class PromotionInventoryController {

    private final TransactionService transactionService;
    private final PromotionService promotionService;

    // 1. Áp dụng mã giảm giá khi Checkout
    @PostMapping("/promotions/apply")
    @Operation(summary = "Áp dụng mã giảm giá cho đơn hàng")
    public ApiResponse<CouponView> apply(@Valid @RequestBody ApplyCoupon body) {
        return ApiResponse.ok(transactionService.applyCoupon(body.code()));
    }

    // 2. Kiểm tra tồn kho sản phẩm
    @GetMapping("/inventory/{productId}")
    @Operation(summary = "Kiểm tra tồn kho sản phẩm")
    public ApiResponse<InventoryView> inventory(@PathVariable Long productId) {
        return ApiResponse.ok(transactionService.getInventory(productId));
    }

    // 3. Admin lấy tất cả voucher
    @GetMapping("/promotions")
    @Operation(summary = "Lấy tất cả danh sách voucher cho quản trị viên")
    public ResponseEntity<ApiResponse<List<PromotionResponse>>> getAllPromotions() {
        return ResponseEntity.ok(ApiResponse.ok(promotionService.getAllPromotions()));
    }

    // 4. Lấy danh sách voucher đang hoạt động (Public / Chatbot)
    @GetMapping("/promotions/active")
    @Operation(summary = "Lấy danh sách voucher đang có hiệu lực")
    public ResponseEntity<ApiResponse<List<PromotionResponse>>> getActivePromotions() {
        return ResponseEntity.ok(ApiResponse.ok(promotionService.getActivePromotions()));
    }

    // 5. Admin tạo mới voucher
    @PostMapping("/promotions")
    @Operation(summary = "Tạo mới voucher khuyến mãi")
    public ResponseEntity<ApiResponse<PromotionResponse>> createPromotion(@Valid @RequestBody PromotionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Tạo voucher mới thành công!", promotionService.createPromotion(request)));
    }

    // 6. Admin cập nhật voucher
    @PutMapping("/promotions/{id}")
    @Operation(summary = "Cập nhật thông tin voucher")
    public ResponseEntity<ApiResponse<PromotionResponse>> updatePromotion(
            @PathVariable Long id,
            @Valid @RequestBody PromotionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật voucher thành công!", promotionService.updatePromotion(id, request)));
    }

    // 7. Bật / Tắt trạng thái voucher
    @PatchMapping("/promotions/{id}/toggle")
    @Operation(summary = "Bật hoặc tắt trạng thái kích hoạt của voucher")
    public ResponseEntity<ApiResponse<PromotionResponse>> togglePromotion(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái voucher thành công!", promotionService.togglePromotion(id)));
    }

    // 8. Xóa voucher
    @DeleteMapping("/promotions/{id}")
    @Operation(summary = "Xóa voucher khỏi hệ thống")
    public ResponseEntity<ApiResponse<Void>> deletePromotion(@PathVariable Long id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.ok(ApiResponse.ok("Xóa voucher thành công!", null));
    }
}
