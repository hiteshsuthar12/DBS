package com.inventory.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "inventory_alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryAlert {

    @Id
    private Long id;

    @DBRef
    private Product product;

    @Indexed
    private String alertType; // LOW_STOCK, CRITICAL_STOCK, OUT_OF_STOCK, REORDER_REQUIRED

    private Integer currentStock;

    private Integer thresholdStock;

    @Indexed
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, ACKNOWLEDGED, RESOLVED

    private String message;

    private Instant resolvedAt;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
