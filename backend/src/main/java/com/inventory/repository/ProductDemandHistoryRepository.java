package com.inventory.repository;

import com.inventory.entity.ProductDemandHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductDemandHistoryRepository extends MongoRepository<ProductDemandHistory, Long>, ProductDemandHistoryRepositoryCustom {
}
