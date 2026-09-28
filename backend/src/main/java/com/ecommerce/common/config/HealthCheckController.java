package com.ecommerce.common.config;

import com.ecommerce.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
@Tag(name = "Health Check", description = "Kiểm tra trạng thái server")
public class HealthCheckController {

    @GetMapping
    @Operation(summary = "Kiểm tra backend đã sẵn sàng hoạt động")
    public ApiResponse<Map<String, Object>> health() {
        return ApiResponse.ok("E-Commerce Backend is running smoothly!", Map.of(
                "status", "UP",
                "version", "1.0.0",
                "project", "ECommercePlatform Mock Project"
        ));
    }
}
