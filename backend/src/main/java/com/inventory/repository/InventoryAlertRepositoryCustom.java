package com.inventory.repository;

import com.inventory.entity.InventoryAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface InventoryAlertRepositoryCustom {
    Page<InventoryAlert> filterAlerts(String status, String alertType, Pageable pageable);
    List<InventoryAlert> findActiveAlertsByProductId(Long productId);
    Optional<InventoryAlert> findActiveAlertByProductAndType(Long productId, String alertType);
}

