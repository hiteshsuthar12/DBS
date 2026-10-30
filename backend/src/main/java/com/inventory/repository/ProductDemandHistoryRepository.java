package com.inventory.repository;

import com.inventory.entity.ProductDemandHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductDemandHistoryRepository extends JpaRepository<ProductDemandHistory, Long> {

    Optional<ProductDemandHistory> findByProductIdAndDemandDate(Long productId, LocalDate demandDate);

    List<ProductDemandHistory> findByProductIdOrderByDemandDateAsc(Long productId);

    @Query("SELECT h FROM ProductDemandHistory h WHERE h.product.id = :productId AND h.demandDate >= :since ORDER BY h.demandDate ASC")
    List<ProductDemandHistory> findRecentDemandByProduct(@Param("productId") Long productId, @Param("since") LocalDate since);

    @Query("SELECT h FROM ProductDemandHistory h WHERE h.demandDate >= :since ORDER BY h.demandDate ASC")
    List<ProductDemandHistory> findAllRecentDemand(@Param("since") LocalDate since);
}
