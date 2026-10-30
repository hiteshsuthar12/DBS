package com.inventory.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

public class StockDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StockInRequest {
        @NotNull(message = "Product ID is required")
        private Long productId;

        private Long supplierId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be greater than zero")
        private Integer quantity;

        @DecimalMin(value = "0.0", inclusive = true, message = "Purchase price cannot be negative")
        private BigDecimal purchasePrice;

        @NotBlank(message = "Reference / Invoice number is required")
        private String referenceNumber;

        private String remarks;

        private Instant transactionDate;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StockOutRequest {
        @NotNull(message = "Product ID is required")
        private Long productId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be greater than zero")
        private Integer quantity;

        @NotBlank(message = "Transaction type is required")
        @Pattern(regexp = "SALE|DAMAGED|EXPIRED|INTERNAL_USAGE|OTHER",
                 message = "Transaction type must be one of: SALE, DAMAGED, EXPIRED, INTERNAL_USAGE, OTHER")
        private String transactionType;

        @NotBlank(message = "Reference number is required")
        private String referenceNumber;

        private String remarks;

        private Instant transactionDate;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StockTransactionResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String sku;
        private Long supplierId;
        private String supplierName;
        private String transactionType;
        private Integer quantity;
        private Integer previousStock;
        private Integer updatedStock;
        private BigDecimal unitPrice;
        private String referenceNumber;
        private String remarks;
        private String performedBy;
        private Instant transactionDate;
        private Instant createdAt;
    }
}
