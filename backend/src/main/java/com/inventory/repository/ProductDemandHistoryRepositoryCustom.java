package com.inventory.repository;

import com.inventory.entity.ProductDemandHistory;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ProductDemandHistoryRepositoryCustom {
    Optional<ProductDemandHistory> findByProductIdAndDemandDate(Long productId, LocalDate demandDate);
    List<ProductDemandHistory> findByProductIdOrderByDemandDateAsc(Long productId);
    List<ProductDemandHistory> findRecentDemandByProduct(Long productId, LocalDate since);
    List<ProductDemandHistory> findAllRecentDemand(LocalDate since);
}

