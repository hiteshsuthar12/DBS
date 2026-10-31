package com.inventory.repository;

import com.inventory.entity.InventoryAlert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryAlertRepository extends MongoRepository<InventoryAlert, Long>, InventoryAlertRepositoryCustom {
    List<InventoryAlert> findByStatusOrderByCreatedAtDesc(String status);
    long countByStatus(String status);
}
