package com.inventory.repository;

import com.inventory.entity.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepository extends MongoRepository<Category, Long> {
    Optional<Category> findByName(String name);
    boolean existsByName(String name);
}
