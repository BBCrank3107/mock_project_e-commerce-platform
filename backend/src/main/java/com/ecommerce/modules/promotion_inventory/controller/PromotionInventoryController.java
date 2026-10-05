package com.ecommerce.modules.promotion_inventory.controller;
import com.ecommerce.common.dto.ApiResponse;
import com.ecommerce.modules.order.dto.TransactionDtos.*;
import com.ecommerce.modules.order.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api") @RequiredArgsConstructor
public class PromotionInventoryController {
    private final TransactionService service;
    @PostMapping("/promotions/apply") public ApiResponse<CouponView> apply(@Valid @RequestBody ApplyCoupon body) { return ApiResponse.ok(service.applyCoupon(body.code())); }
    @GetMapping("/inventory/{productId}") public ApiResponse<InventoryView> inventory(@PathVariable Long productId) { return ApiResponse.ok(service.getInventory(productId)); }
}
