package com.ecommerce.modules.order.controller;
import com.ecommerce.common.dto.ApiResponse;
import com.ecommerce.modules.order.dto.TransactionDtos.*;
import com.ecommerce.modules.order.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/cart") @RequiredArgsConstructor
public class CartController {
    private final TransactionService service;
    @GetMapping public ApiResponse<CartView> get() { return ApiResponse.ok(service.getCart()); }
    @PostMapping("/items") public ApiResponse<CartView> add(@Valid @RequestBody AddItem body) { return ApiResponse.ok(service.addItem(body)); }
    @PutMapping("/items/{id}") public ApiResponse<CartView> update(@PathVariable Long id, @Valid @RequestBody Quantity body) { return ApiResponse.ok(service.updateItem(id, body)); }
    @DeleteMapping("/items/{id}") public ApiResponse<CartView> delete(@PathVariable Long id) { return ApiResponse.ok(service.deleteItem(id)); }
}
