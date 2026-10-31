package com.inventory.repository;

import com.inventory.entity.InventoryAlert;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class InventoryAlertRepositoryCustomImpl implements InventoryAlertRepositoryCustom {

    private final MongoTemplate mongoTemplate;

    @Override
    public Page<InventoryAlert> filterAlerts(String status, String alertType, Pageable pageable) {
        Query query = new Query();
        List<Criteria> criteriaList = new ArrayList<>();

        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
            criteriaList.add(Criteria.where("status").is(status));
        }

        if (alertType != null && !alertType.trim().isEmpty() && !alertType.equalsIgnoreCase("ALL")) {
            criteriaList.add(Criteria.where("alertType").is(alertType));
        }

        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        long total = mongoTemplate.count(query, InventoryAlert.class);
        query.with(Sort.by(Sort.Direction.DESC, "createdAt"));
        query.with(pageable);
        List<InventoryAlert> list = mongoTemplate.find(query, InventoryAlert.class);

        return new PageImpl<>(list, pageable, total);
    }

    @Override
    public List<InventoryAlert> findActiveAlertsByProductId(Long productId) {
        if (productId == null) return Collections.emptyList();
        Query query = new Query(Criteria.where("product.$id").is(productId).and("status").is("ACTIVE"));
        return mongoTemplate.find(query, InventoryAlert.class);
    }

    @Override
    public Optional<InventoryAlert> findActiveAlertByProductAndType(Long productId, String alertType) {
        if (productId == null || alertType == null) return Optional.empty();
        Query query = new Query(Criteria.where("product.$id").is(productId)
                .and("alertType").is(alertType)
                .and("status").is("ACTIVE"));
        InventoryAlert alert = mongoTemplate.findOne(query, InventoryAlert.class);
        return Optional.ofNullable(alert);
    }
}

