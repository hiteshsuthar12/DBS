package com.inventory.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class AiDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StockOutPredictionResponse {
        private Long productId;
        private String productName;
        private String sku;
        private Integer currentStock;
        private Double averageDailyDemand;
        private LocalDate predictedStockOutDate;
        private Integer estimatedDaysRemaining;
        private Double confidenceScore;
        private String riskLevel; // HEALTHY, LOW, MEDIUM, HIGH, CRITICAL
        private Boolean isBaseline;
        private String explanation;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReorderRecommendationResponse {
        private Long productId;
        private String productName;
        private String sku;
        private Integer currentStock;
        private Integer reorderLevel;
        private Integer recommendedReorderQuantity;
        private Integer leadTimeDays;
        private Double safetyStock;
        private Double targetInventoryLevel;
        private String explanation;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ForecastDataPoint {
        private String date;
        private Double quantity;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DemandForecastResponse {
        private Long productId;
        private String productName;
        private String sku;
        private Integer horizonDays; // 7, 15, 30
        private List<ForecastDataPoint> historicalDemand;
        private List<ForecastDataPoint> forecastedDemand;
        private String modelType;
        private String accuracyMetric;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RiskClassificationResponse {
        private Long productId;
        private String productName;
        private String sku;
        private Integer currentStock;
        private String riskLevel; // HEALTHY, LOW_RISK, MEDIUM_RISK, HIGH_RISK, CRITICAL
        private List<String> riskFactors;
        private String actionRecommendation;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AiOverviewResponse {
        private long totalEvaluated;
        private long criticalCount;
        private long highRiskCount;
        private long mediumRiskCount;
        private long healthyCount;
        private List<StockOutPredictionResponse> topRisks;
        private List<ReorderRecommendationResponse> topRecommendations;
    }
}

