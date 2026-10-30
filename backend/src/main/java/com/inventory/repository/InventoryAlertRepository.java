package com.inventory.repository;

import com.inventory.entity.InventoryAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryAlertRepository extends JpaRepository<InventoryAlert, Long> {

    List<InventoryAlert> findByStatusOrderByCreatedAtDesc(String status);

    @Query("SELECT a FROM InventoryAlert a WHERE " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:alertType IS NULL OR a.alertType = :alertType) " +
           "ORDER BY a.createdAt DESC")
    Page<InventoryAlert> filterAlerts(@Param("status") String status,
                                      @Param("alertType") String alertType,
                                      Pageable pageable);

    @Query("SELECT a FROM InventoryAlert a WHERE a.product.id = :productId AND a.status = 'ACTIVE'")
    List<InventoryAlert> findActiveAlertsByProductId(@Param("productId") Long productId);

    @Query("SELECT a FROM InventoryAlert a WHERE a.product.id = :productId AND a.alertType = :alertType AND a.status = 'ACTIVE'")
    Optional<InventoryAlert> findActiveAlertByProductAndType(@Param("productId") Long productId,
                                                            @Param("alertType") String alertType);

    long countByStatus(String status);
}
