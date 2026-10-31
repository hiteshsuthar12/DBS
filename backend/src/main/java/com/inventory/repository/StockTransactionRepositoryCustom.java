package com.inventory.repository;

import com.inventory.entity.StockTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;

public interface StockTransactionRepositoryCustom {
    Page<StockTransaction> filterTransactions(Long productId,
                                              String transactionType,
                                              Instant startDate,
                                              Instant endDate,
                                              String search,
                                              Pageable pageable);

    List<StockTransaction> findByProductIdOrderByTransactionDateDesc(Long productId);
    List<StockTransaction> findRecentTransactions(Pageable pageable);
    Long sumStockInSince(Instant since);
    Long sumStockOutSince(Instant since);
    List<Object[]> findTopSellingProducts(Pageable pageable);
}

