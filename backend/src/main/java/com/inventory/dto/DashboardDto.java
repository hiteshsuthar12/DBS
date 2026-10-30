package com.inventory.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

public class DashboardDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SummaryResponse {
        private long totalProducts;
        private long totalSuppliers;
        private long totalInventoryQuantity;
        private BigDecimal totalInventoryValuation;
        private long lowStockProducts;
        private long outOfStockProducts;
        private long stockInToday;
        private long stockOutToday;
        private long activeAlerts;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryDistribution {
        private String categoryName;
        private long productCount;
        private long stockQuantity;
        private BigDecimal valuation;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyMovement {
        private String month;
        private long stockIn;
        private long stockOut;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopSellingProduct {
        private Long productId;
        private String productName;
        private String sku;
        private long totalSold;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DashboardOverviewResponse {
        private SummaryResponse summary;
        private List<MonthlyMovement> monthlyMovements;
        private List<CategoryDistribution> categoryDistribution;
        private List<TopSellingProduct> topSellingProducts;
        private List<StockDto.StockTransactionResponse> recentTransactions;
        private List<AlertDto.AlertResponse> lowStockAlerts;
    }
}
