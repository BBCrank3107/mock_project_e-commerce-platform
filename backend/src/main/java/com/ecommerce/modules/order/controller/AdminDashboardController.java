package com.ecommerce.modules.order.controller;

import com.ecommerce.common.dto.ApiResponse;
import com.ecommerce.modules.order.dto.DashboardDTOs.DashboardResponse;
import com.ecommerce.modules.order.service.AdminDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@Tag(name = "Admin Analytics Dashboard", description = "Bảng điều khiển thống kê chỉ số kinh doanh & biểu đồ doanh thu")
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    @GetMapping("/stats")
    @Operation(summary = "Lấy dữ liệu thống kê tổng quan, biểu đồ doanh thu và phân bổ đơn hàng")
    public ResponseEntity<ApiResponse<DashboardResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok("Lấy dữ liệu thống kê dashboard thành công!", dashboardService.getDashboardStats()));
    }
}
