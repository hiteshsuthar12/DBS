package com.inventory.repository;

import com.inventory.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface ProductRepositoryCustom {
    Page<Product> searchProducts(String search, Long categoryId, Long supplierId, Pageable pageable);
    List<Product> findLowStockProducts();
    List<Product> findOutOfStockProducts();
    Long calculateTotalStockQuantity();
    BigDecimal calculateTotalInventoryValuation();
    List<Object[]> getCategoryStockDistribution();
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findBySupplierId(Long supplierId);
}

