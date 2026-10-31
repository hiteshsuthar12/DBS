package com.inventory.repository;

import com.inventory.entity.Product;
import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.*;
import java.util.regex.Pattern;

@Repository
@RequiredArgsConstructor
public class ProductRepositoryCustomImpl implements ProductRepositoryCustom {

    private final MongoTemplate mongoTemplate;

    @Override
    public Page<Product> searchProducts(String search, Long categoryId, Long supplierId, Pageable pageable) {
        Query query = new Query();
        List<Criteria> criteriaList = new ArrayList<>();

        if (search != null && !search.trim().isEmpty()) {
            String pattern = Pattern.quote(search.trim());
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("name").regex(pattern, "i"),
                    Criteria.where("sku").regex(pattern, "i"),
                    Criteria.where("description").regex(pattern, "i")
            ));
        }

        if (categoryId != null) {
            criteriaList.add(Criteria.where("category.$id").is(categoryId));
        }

        if (supplierId != null) {
            criteriaList.add(Criteria.where("supplier.$id").is(supplierId));
        }

        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        long total = mongoTemplate.count(query, Product.class);
        query.with(pageable);
        List<Product> products = mongoTemplate.find(query, Product.class);

        return new PageImpl<>(products, pageable, total);
    }

    @Override
    public List<Product> findLowStockProducts() {
        Query query = new Query(Criteria.where("$expr").is(new Document("$lte", Arrays.asList("$currentStock", "$reorderLevel"))));
        query.with(Sort.by(Sort.Direction.ASC, "currentStock"));
        return mongoTemplate.find(query, Product.class);
    }

    @Override
    public List<Product> findOutOfStockProducts() {
        Query query = new Query(Criteria.where("currentStock").lte(0));
        return mongoTemplate.find(query, Product.class);
    }

    @Override
    public Long calculateTotalStockQuantity() {
        Aggregation agg = Aggregation.newAggregation(
                Aggregation.group().sum("currentStock").as("total")
        );
        AggregationResults<Document> results = mongoTemplate.aggregate(agg, "products", Document.class);
        Document doc = results.getUniqueMappedResult();
        if (doc != null && doc.get("total") != null) {
            Number num = (Number) doc.get("total");
            return num.longValue();
        }
        return 0L;
    }

    @Override
    public BigDecimal calculateTotalInventoryValuation() {
        try {
            AggregationOperation project = ctx -> new Document("$project",
                    new Document("val", new Document("$multiply", Arrays.asList("$currentStock", "$purchasePrice"))));
            AggregationOperation group = ctx -> new Document("$group",
                    new Document("_id", null).append("totalValuation", new Document("$sum", "$val")));

            Aggregation agg = Aggregation.newAggregation(project, group);
            AggregationResults<Document> results = mongoTemplate.aggregate(agg, "products", Document.class);
            Document doc = results.getUniqueMappedResult();
            if (doc != null && doc.get("totalValuation") != null) {
                Object val = doc.get("totalValuation");
                if (val instanceof Number num) {
                    return BigDecimal.valueOf(num.doubleValue());
                } else if (val instanceof org.bson.types.Decimal128 d128) {
                    return d128.bigDecimalValue();
                }
            }
        } catch (Exception ignored) {
        }

        // Fallback calculation in-memory if needed
        List<Product> products = mongoTemplate.findAll(Product.class);
        BigDecimal total = BigDecimal.ZERO;
        for (Product p : products) {
            if (p.getCurrentStock() != null && p.getPurchasePrice() != null) {
                total = total.add(p.getPurchasePrice().multiply(BigDecimal.valueOf(p.getCurrentStock())));
            }
        }
        return total;
    }

    @Override
    public List<Object[]> getCategoryStockDistribution() {
        List<Product> products = mongoTemplate.findAll(Product.class);
        Map<String, CategoryStats> statsMap = new LinkedHashMap<>();

        for (Product p : products) {
            String catName = (p.getCategory() != null && p.getCategory().getName() != null)
                    ? p.getCategory().getName()
                    : "Uncategorized";

            CategoryStats stats = statsMap.computeIfAbsent(catName, k -> new CategoryStats());
            stats.count++;
            int stock = p.getCurrentStock() != null ? p.getCurrentStock() : 0;
            stats.totalQuantity += stock;
            if (p.getPurchasePrice() != null) {
                stats.totalValuation = stats.totalValuation.add(p.getPurchasePrice().multiply(BigDecimal.valueOf(stock)));
            }
        }

        List<Object[]> rows = new ArrayList<>();
        for (Map.Entry<String, CategoryStats> entry : statsMap.entrySet()) {
            CategoryStats s = entry.getValue();
            rows.add(new Object[]{entry.getKey(), s.count, s.totalQuantity, s.totalValuation.doubleValue()});
        }
        return rows;
    }

    @Override
    public List<Product> findByCategoryId(Long categoryId) {
        if (categoryId == null) return Collections.emptyList();
        Query query = new Query(Criteria.where("category.$id").is(categoryId));
        return mongoTemplate.find(query, Product.class);
    }

    @Override
    public List<Product> findBySupplierId(Long supplierId) {
        if (supplierId == null) return Collections.emptyList();
        Query query = new Query(Criteria.where("supplier.$id").is(supplierId));
        return mongoTemplate.find(query, Product.class);
    }

    private static class CategoryStats {
        long count = 0;
        long totalQuantity = 0;
        BigDecimal totalValuation = BigDecimal.ZERO;
    }
}

