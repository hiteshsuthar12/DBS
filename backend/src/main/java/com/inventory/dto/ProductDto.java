package com.inventory.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

public class ProductDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductRequest {
        @NotBlank(message = "Product name is required")
        @Size(max = 150, message = "Product name must not exceed 150 characters")
        private String name;

        @NotBlank(message = "SKU is required")
        @Size(max = 50, message = "SKU must not exceed 50 characters")
        private String sku;

        private String description;

        @NotNull(message = "Category ID is required")
        private Long categoryId;

        @NotBlank(message = "Unit is required")
        private String unit;

        @NotNull(message = "Purchase price is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Purchase price cannot be negative")
        private BigDecimal purchasePrice;

        @NotNull(message = "Selling price is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Selling price cannot be negative")
        private BigDecimal sellingPrice;

        @NotNull(message = "Current stock is required")
        @Min(value = 0, message = "Current stock cannot be negative")
        private Integer currentStock;

        @NotNull(message = "Minimum stock level is required")
        @Min(value = 0, message = "Minimum stock level cannot be negative")
        private Integer minimumStockLevel;

        @NotNull(message = "Maximum stock level is required")
        @Min(value = 0, message = "Maximum stock level cannot be negative")
        private Integer maximumStockLevel;

        @NotNull(message = "Reorder level is required")
        @Min(value = 0, message = "Reorder level cannot be negative")
        private Integer reorderLevel;

        private Long supplierId;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductResponse {
        private Long id;
        private String name;
        private String sku;
        private String description;
        private Long categoryId;
        private String categoryName;
        private String unit;
        private BigDecimal purchasePrice;
        private BigDecimal sellingPrice;
        private Integer currentStock;
        private Integer minimumStockLevel;
        private Integer maximumStockLevel;
        private Integer reorderLevel;
        private Long supplierId;
        private String supplierName;
        private String stockStatus; // HEALTHY, LOW, CRITICAL, OUT_OF_STOCK
        private Long version;
        private Instant createdAt;
        private Instant updatedAt;
    }
}
