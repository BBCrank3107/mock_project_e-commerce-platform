package com.ecommerce.modules.order.controller;
import com.ecommerce.common.dto.*;
import com.ecommerce.modules.order.dto.TransactionDtos.*;
import com.ecommerce.modules.order.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/orders") @RequiredArgsConstructor
public class OrderController {
    private final TransactionService service;
    @PostMapping("/checkout") public ApiResponse<OrderView> checkout(@Valid @RequestBody Checkout body) { return ApiResponse.ok(service.checkout(body)); }
    @GetMapping("/my-orders") public ApiResponse<PageResponse<OrderView>> mine(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="10") int size) { return ApiResponse.ok(service.myOrders(page, size)); }
    @GetMapping("/{id}") public ApiResponse<OrderView> detail(@PathVariable Long id) { return ApiResponse.ok(service.detail(id, false)); }
    @PostMapping("/{id}/cancel") public ApiResponse<OrderView> cancel(@PathVariable Long id) { return ApiResponse.ok(service.cancel(id)); }
}
