package com.inventory.repository;

import com.inventory.entity.Product;
import com.inventory.entity.Supplier;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Repository
@RequiredArgsConstructor
public class SupplierRepositoryCustomImpl implements SupplierRepositoryCustom {

    private final MongoTemplate mongoTemplate;

    @Override
    public Page<Supplier> searchSuppliers(String search, String status, Pageable pageable) {
        Query query = new Query();
        List<Criteria> criteriaList = new ArrayList<>();

        if (search != null && !search.trim().isEmpty()) {
            String pattern = Pattern.quote(search.trim());
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("supplierName").regex(pattern, "i"),
                    Criteria.where("companyName").regex(pattern, "i"),
                    Criteria.where("contactPerson").regex(pattern, "i"),
                    Criteria.where("email").regex(pattern, "i")
            ));
        }

        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
            criteriaList.add(Criteria.where("status").is(status));
        }

        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        long total = mongoTemplate.count(query, Supplier.class);
        query.with(pageable);
        List<Supplier> suppliers = mongoTemplate.find(query, Supplier.class);

        return new PageImpl<>(suppliers, pageable, total);
    }

    @Override
    public long countProductsBySupplierId(Long supplierId) {
        if (supplierId == null) return 0;
        Query query = new Query(Criteria.where("supplier.$id").is(supplierId));
        return mongoTemplate.count(query, Product.class);
    }
}

