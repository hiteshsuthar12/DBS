package com.inventory.repository;

import com.inventory.entity.ProductDemandHistory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class ProductDemandHistoryRepositoryCustomImpl implements ProductDemandHistoryRepositoryCustom {

    private final MongoTemplate mongoTemplate;

    @Override
    public Optional<ProductDemandHistory> findByProductIdAndDemandDate(Long productId, LocalDate demandDate) {
        if (productId == null || demandDate == null) return Optional.empty();
        Query query = new Query(Criteria.where("product.$id").is(productId).and("demandDate").is(demandDate));
        ProductDemandHistory result = mongoTemplate.findOne(query, ProductDemandHistory.class);
        return Optional.ofNullable(result);
    }

    @Override
    public List<ProductDemandHistory> findByProductIdOrderByDemandDateAsc(Long productId) {
        if (productId == null) return Collections.emptyList();
        Query query = new Query(Criteria.where("product.$id").is(productId));
        query.with(Sort.by(Sort.Direction.ASC, "demandDate"));
        return mongoTemplate.find(query, ProductDemandHistory.class);
    }

    @Override
    public List<ProductDemandHistory> findRecentDemandByProduct(Long productId, LocalDate since) {
        if (productId == null) return Collections.emptyList();
        Criteria criteria = Criteria.where("product.$id").is(productId);
        if (since != null) {
            criteria = criteria.and("demandDate").gte(since);
        }
        Query query = new Query(criteria);
        query.with(Sort.by(Sort.Direction.ASC, "demandDate"));
        return mongoTemplate.find(query, ProductDemandHistory.class);
    }

    @Override
    public List<ProductDemandHistory> findAllRecentDemand(LocalDate since) {
        Query query = new Query();
        if (since != null) {
            query.addCriteria(Criteria.where("demandDate").gte(since));
        }
        query.with(Sort.by(Sort.Direction.ASC, "demandDate"));
        return mongoTemplate.find(query, ProductDemandHistory.class);
    }
}

