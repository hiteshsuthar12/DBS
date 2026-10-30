package com.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.time.Instant;

public class AlertDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AlertResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String sku;
        private String alertType;
        private Integer currentStock;
        private Integer thresholdStock;
        private String status;
        private String message;
        private Instant resolvedAt;
        private Instant createdAt;
        private Instant updatedAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AlertStatusUpdateRequest {
        @NotBlank(message = "Status is required")
        @Pattern(regexp = "ACTIVE|ACKNOWLEDGED|RESOLVED", message = "Status must be ACTIVE, ACKNOWLEDGED, or RESOLVED")
        private String status;
    }
}
