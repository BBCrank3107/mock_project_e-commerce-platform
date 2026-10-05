package com.ecommerce.modules.order.controller;
import com.ecommerce.common.dto.ApiResponse;
import com.ecommerce.modules.order.service.TransactionException;
import org.springframework.core.annotation.Order;
import org.springframework.core.Ordered;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice
public class TransactionExceptionHandler {
    @ExceptionHandler(TransactionException.class)
    public ResponseEntity<ApiResponse<Void>> domain(TransactionException ex) {
        return ResponseEntity.status(ex.getStatus()).body(ApiResponse.error(ex.getMessage()));
    }
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> forbidden(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Bạn không có quyền thực hiện thao tác này"));
    }
}
