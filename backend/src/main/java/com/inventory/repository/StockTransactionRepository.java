package com.inventory.repository;

import com.inventory.entity.StockTransaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockTransactionRepository extends MongoRepository<StockTransaction, Long>, StockTransactionRepositoryCustom {
}
