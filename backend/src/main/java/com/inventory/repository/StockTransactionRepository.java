package com.inventory.repository;

import com.inventory.entity.StockTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {

    @Query("SELECT t FROM StockTransaction t WHERE " +
           "(:productId IS NULL OR t.product.id = :productId) AND " +
           "(:transactionType IS NULL OR t.transactionType = :transactionType) AND " +
           "(:startDate IS NULL OR t.transactionDate >= :startDate) AND " +
           "(:endDate IS NULL OR t.transactionDate <= :endDate) AND " +
           "(:search IS NULL OR LOWER(t.referenceNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.product.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.product.sku) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<StockTransaction> filterTransactions(@Param("productId") Long productId,
                                              @Param("transactionType") String transactionType,
                                              @Param("startDate") Instant startDate,
                                              @Param("endDate") Instant endDate,
                                              @Param("search") String search,
                                              Pageable pageable);

    List<StockTransaction> findByProductIdOrderByTransactionDateDesc(Long productId);

    @Query("SELECT t FROM StockTransaction t ORDER BY t.transactionDate DESC")
    List<StockTransaction> findRecentTransactions(Pageable pageable);

    @Query("SELECT COALESCE(SUM(t.quantity), 0) FROM StockTransaction t " +
           "WHERE t.transactionType = 'IN' AND t.transactionDate >= :since")
    Long sumStockInSince(@Param("since") Instant since);

    @Query("SELECT COALESCE(SUM(t.quantity), 0) FROM StockTransaction t " +
           "WHERE t.transactionType IN ('SALE', 'DAMAGED', 'EXPIRED', 'INTERNAL_USAGE', 'OTHER') AND t.transactionDate >= :since")
    Long sumStockOutSince(@Param("since") Instant since);

    @Query("SELECT t.product.id, t.product.name, t.product.sku, SUM(t.quantity) as totalQty " +
           "FROM StockTransaction t " +
           "WHERE t.transactionType IN ('SALE', 'OUT') " +
           "GROUP BY t.product.id, t.product.name, t.product.sku " +
           "ORDER BY totalQty DESC")
    List<Object[]> findTopSellingProducts(Pageable pageable);
}

