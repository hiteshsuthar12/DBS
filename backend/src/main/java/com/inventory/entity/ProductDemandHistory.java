package com.inventory.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;

@Document(collection = "product_demand_history")
@CompoundIndex(name = "uq_product_demand_date", def = "{'product': 1, 'demandDate': 1}", unique = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDemandHistory {

    @Id
    private Long id;

    @DBRef
    private Product product;

    @Indexed
    private LocalDate demandDate;

    @Builder.Default
    private Integer quantityDemanded = 0;

    @Builder.Default
    private Integer transactionCount = 0;

    @CreatedDate
    private Instant createdAt;
}
