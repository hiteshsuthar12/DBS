package com.inventory.controller;

import com.inventory.dto.ApiResponse;
import com.inventory.dto.DashboardDto;
import com.inventory.dto.StockDto;
import com.inventory.service.DashboardService;
import com.inventory.service.StockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Endpoints for executive KPIs, stock charts, and distribution analytics")
public class DashboardController {

    private final DashboardService dashboardService;
    private final StockService stockService;

    @GetMapping("/summary")
    @Operation(summary = "Get core KPI summary statistics")
    public ResponseEntity<ApiResponse<DashboardDto.SummaryResponse>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getSummary()));
    }

    @GetMapping("/inventory-overview")
    @Operation(summary = "Get comprehensive dashboard overview including charts and recent feeds")
    public ResponseEntity<ApiResponse<DashboardDto.DashboardOverviewResponse>> getOverview() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getDashboardOverview()));
    }

    @GetMapping("/stock-movement")
    @Operation(summary = "Get monthly stock-in vs stock-out movement trend")
    public ResponseEntity<ApiResponse<List<DashboardDto.MonthlyMovement>>> getStockMovement() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getMonthlyMovements()));
    }

    @GetMapping("/category-distribution")
    @Operation(summary = "Get product count and valuation breakdown by category")
    public ResponseEntity<ApiResponse<List<DashboardDto.CategoryDistribution>>> getCategoryDistribution() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getCategoryDistribution()));
    }

    @GetMapping("/recent-transactions")
    @Operation(summary = "Get recent stock transactions for dashboard feed")
    public ResponseEntity<ApiResponse<Page<StockDto.StockTransactionResponse>>> getRecentTransactions() {
        Page<StockDto.StockTransactionResponse> transactions = stockService.getTransactions(
                null, null, null, null, null, 0, 10, "transactionDate", "desc"
        );
        return ResponseEntity.ok(ApiResponse.success(transactions));
    }
}

