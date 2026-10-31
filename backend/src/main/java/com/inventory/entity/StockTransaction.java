package com.inventory.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Document(collection = "stock_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockTransaction {

    @Id
    private Long id;

    @DBRef
    private Product product;

    @DBRef
    private Supplier supplier;

    @Indexed
    private String transactionType; // IN, SALE, DAMAGED, EXPIRED, INTERNAL_USAGE, OTHER

    private Integer quantity;

    private Integer previousStock;

    private Integer updatedStock;

    @Builder.Default
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Indexed
    private String referenceNumber;

    private String remarks;

    @DBRef
    private User performedByUser;

    @Indexed
    @Builder.Default
    private Instant transactionDate = Instant.now();

    @CreatedDate
    private Instant createdAt;
}
