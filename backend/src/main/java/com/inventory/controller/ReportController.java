package com.inventory.controller;

import com.inventory.dto.ApiResponse;
import com.inventory.dto.DashboardDto;
import com.inventory.service.DashboardService;
import com.inventory.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports & Analytics", description = "Endpoints for inventory analytics, stock valuation, and CSV data exports")
public class ReportController {

    private final ReportService reportService;
    private final DashboardService dashboardService;

    @GetMapping("/inventory")
    @Operation(summary = "Get inventory valuation and category distribution statistics")
    public ResponseEntity<ApiResponse<List<DashboardDto.CategoryDistribution>>> getInventoryReport() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getCategoryDistribution()));
    }

    @GetMapping("/stock-movement")
    @Operation(summary = "Get monthly stock movement metrics")
    public ResponseEntity<ApiResponse<List<DashboardDto.MonthlyMovement>>> getStockMovementReport() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getMonthlyMovements()));
    }

    @GetMapping("/export/inventory")
    @Operation(summary = "Export full product inventory list as CSV")
    public ResponseEntity<InputStreamResource> exportInventoryCsv() {
        ByteArrayInputStream stream = reportService.exportInventoryCsv();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=inventory_report.csv");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(new InputStreamResource(stream));
    }

    @GetMapping("/export/transactions")
    @Operation(summary = "Export stock transaction history as CSV with optional date filtering")
    public ResponseEntity<InputStreamResource> exportTransactionsCsv(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate
    ) {
        ByteArrayInputStream stream = reportService.exportTransactionsCsv(startDate, endDate);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=transactions_history.csv");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(new InputStreamResource(stream));
    }
}
