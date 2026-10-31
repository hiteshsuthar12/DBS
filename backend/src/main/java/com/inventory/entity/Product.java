package com.inventory.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Document(collection = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    private Long id;

    @Indexed
    private String name;

    @Indexed(unique = true)
    private String sku;

    private String description;

    @DBRef
    private Category category;

    @Builder.Default
    private String unit = "PCS";

    private BigDecimal purchasePrice;

    private BigDecimal sellingPrice;

    @Builder.Default
    private Integer currentStock = 0;

    @Builder.Default
    private Integer minimumStockLevel = 10;

    @Builder.Default
    private Integer maximumStockLevel = 500;

    @Builder.Default
    private Integer reorderLevel = 20;

    @DBRef
    private Supplier supplier;

    @Version
    private Long version;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
