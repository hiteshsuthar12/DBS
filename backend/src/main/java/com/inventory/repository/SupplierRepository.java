package com.inventory.repository;

import com.inventory.entity.Supplier;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierRepository extends MongoRepository<Supplier, Long>, SupplierRepositoryCustom {
    List<Supplier> findByStatus(String status);
}
