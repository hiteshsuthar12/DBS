package com.inventory.repository;

import com.inventory.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySku(String sku);
    boolean existsBySku(String sku);
    boolean existsBySkuAndIdNot(String sku, Long id);

    @Query("SELECT p FROM Product p WHERE " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:supplierId IS NULL OR p.supplier.id = :supplierId)")
    Page<Product> searchProducts(@Param("search") String search,
                                 @Param("categoryId") Long categoryId,
                                 @Param("supplierId") Long supplierId,
                                 Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.currentStock <= p.reorderLevel ORDER BY p.currentStock ASC")
    List<Product> findLowStockProducts();

    @Query("SELECT p FROM Product p WHERE p.currentStock = 0")
    List<Product> findOutOfStockProducts();

    @Query("SELECT COALESCE(SUM(p.currentStock), 0) FROM Product p")
    Long calculateTotalStockQuantity();

    @Query("SELECT COALESCE(SUM(p.currentStock * p.purchasePrice), 0.0) FROM Product p")
    BigDecimal calculateTotalInventoryValuation();

    @Query("SELECT p.category.name, COUNT(p), COALESCE(SUM(p.currentStock), 0), COALESCE(SUM(p.currentStock * p.purchasePrice), 0.0) " +
           "FROM Product p GROUP BY p.category.name")
    List<Object[]> getCategoryStockDistribution();

    List<Product> findByCategoryId(Long categoryId);
    List<Product> findBySupplierId(Long supplierId);
}

