package com.inventory.controller;

import com.inventory.dto.AiDto;
import com.inventory.dto.ApiResponse;
import com.inventory.service.AiIntegrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Inventory Intelligence", description = "Endpoints for intelligent forecasting, stock-out prediction, and reorder optimization")
public class AiController {

    private final AiIntegrationService aiService;

    @GetMapping("/predictions")
    @Operation(summary = "Get inventory-wide AI intelligence overview and priority recommendations")
    public ResponseEntity<ApiResponse<AiDto.AiOverviewResponse>> getOverview() {
        return ResponseEntity.ok(ApiResponse.success(aiService.getOverview()));
    }

    @GetMapping("/stock-out/{productId}")
    @Operation(summary = "Predict estimated runway and stock-out date for a product")
    public ResponseEntity<ApiResponse<AiDto.StockOutPredictionResponse>> predictStockOut(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(aiService.predictStockOut(productId)));
    }

    @GetMapping("/reorder/{productId}")
    @Operation(summary = "Calculate intelligent recommended reorder quantity using safety stock & lead time")
    public ResponseEntity<ApiResponse<AiDto.ReorderRecommendationResponse>> recommendReorder(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(aiService.recommendReorder(productId)));
    }

    @GetMapping("/demand-forecast/{productId}")
    @Operation(summary = "Forecast product demand for 7, 15, or 30 days horizon")
    public ResponseEntity<ApiResponse<AiDto.DemandForecastResponse>> forecastDemand(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "15") int horizonDays
    ) {
        int validDays = (horizonDays == 7 || horizonDays == 30) ? horizonDays : 15;
        return ResponseEntity.ok(ApiResponse.success(aiService.forecastDemand(productId, validDays)));
    }

    @GetMapping("/risk/{productId}")
    @Operation(summary = "Classify inventory risk level and action steps")
    public ResponseEntity<ApiResponse<AiDto.RiskClassificationResponse>> classifyRisk(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(aiService.classifyRisk(productId)));
    }
}
