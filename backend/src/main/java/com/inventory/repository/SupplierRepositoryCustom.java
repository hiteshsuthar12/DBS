package com.inventory.repository;

import com.inventory.entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SupplierRepositoryCustom {
    Page<Supplier> searchSuppliers(String search, String status, Pageable pageable);
    long countProductsBySupplierId(Long supplierId);
}

