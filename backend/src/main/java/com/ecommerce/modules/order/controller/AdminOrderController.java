package com.ecommerce.modules.order.controller;
import com.ecommerce.common.dto.*;
import com.ecommerce.modules.order.dto.TransactionDtos.*;
import com.ecommerce.modules.order.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/admin/orders") @RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {
    private final TransactionService service;
    @GetMapping public ApiResponse<PageResponse<OrderView>> list(@RequestParam(required=false) String status, @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="10") int size) { return ApiResponse.ok(service.adminOrders(status, page, size)); }
    @GetMapping("/{id}") public ApiResponse<OrderView> detail(@PathVariable Long id) { return ApiResponse.ok(service.detail(id, true)); }
    @PatchMapping("/{id}/status") public ApiResponse<OrderView> status(@PathVariable Long id, @Valid @RequestBody Status body) { return ApiResponse.ok(service.changeStatus(id, body.status())); }
}
