package com.inventory.repository;

import com.inventory.entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    List<Supplier> findByStatus(String status);

    @Query("SELECT s FROM Supplier s WHERE " +
           "(:search IS NULL OR LOWER(s.supplierName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.companyName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.contactPerson) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.email) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR s.status = :status)")
    Page<Supplier> searchSuppliers(@Param("search") String search, @Param("status") String status, Pageable pageable);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.supplier.id = :supplierId")
    long countProductsBySupplierId(@Param("supplierId") Long supplierId);
}
