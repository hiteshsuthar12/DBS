package com.inventory.repository;

import com.inventory.entity.Product;
import com.inventory.entity.StockTransaction;
import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.*;
import java.util.regex.Pattern;

@Repository
@RequiredArgsConstructor
public class StockTransactionRepositoryCustomImpl implements StockTransactionRepositoryCustom {

    private final MongoTemplate mongoTemplate;

    @Override
    public Page<StockTransaction> filterTransactions(Long productId,
                                                      String transactionType,
                                                      Instant startDate,
                                                      Instant endDate,
                                                      String search,
                                                      Pageable pageable) {
        Query query = new Query();
        List<Criteria> criteriaList = new ArrayList<>();

        if (productId != null) {
            criteriaList.add(Criteria.where("product.$id").is(productId));
        }

        if (transactionType != null && !transactionType.trim().isEmpty() && !transactionType.equalsIgnoreCase("ALL")) {
            criteriaList.add(Criteria.where("transactionType").is(transactionType.toUpperCase()));
        }

        if (startDate != null && endDate != null) {
            criteriaList.add(Criteria.where("transactionDate").gte(startDate).lte(endDate));
        } else if (startDate != null) {
            criteriaList.add(Criteria.where("transactionDate").gte(startDate));
        } else if (endDate != null) {
            criteriaList.add(Criteria.where("transactionDate").lte(endDate));
        }

        if (search != null && !search.trim().isEmpty()) {
            String pattern = Pattern.quote(search.trim());
            // match on referenceNumber
            criteriaList.add(Criteria.where("referenceNumber").regex(pattern, "i"));
        }

        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        long total = mongoTemplate.count(query, StockTransaction.class);
        query.with(pageable);
        List<StockTransaction> list = mongoTemplate.find(query, StockTransaction.class);

        return new PageImpl<>(list, pageable, total);
    }

    @Override
    public List<StockTransaction> findByProductIdOrderByTransactionDateDesc(Long productId) {
        if (productId == null) return Collections.emptyList();
        Query query = new Query(Criteria.where("product.$id").is(productId));
        query.with(Sort.by(Sort.Direction.DESC, "transactionDate"));
        return mongoTemplate.find(query, StockTransaction.class);
    }

    @Override
    public List<StockTransaction> findRecentTransactions(Pageable pageable) {
        Query query = new Query();
        query.with(Sort.by(Sort.Direction.DESC, "transactionDate"));
        query.with(pageable);
        return mongoTemplate.find(query, StockTransaction.class);
    }

    @Override
    public Long sumStockInSince(Instant since) {
        Criteria criteria = Criteria.where("transactionType").is("IN");
        if (since != null) {
            criteria = criteria.and("transactionDate").gte(since);
        }

        Aggregation agg = Aggregation.newAggregation(
                Aggregation.match(criteria),
                Aggregation.group().sum("quantity").as("total")
        );

        AggregationResults<Document> results = mongoTemplate.aggregate(agg, "stock_transactions", Document.class);
        Document doc = results.getUniqueMappedResult();
        if (doc != null && doc.get("total") != null) {
            return ((Number) doc.get("total")).longValue();
        }
        return 0L;
    }

    @Override
    public Long sumStockOutSince(Instant since) {
        List<String> types = Arrays.asList("SALE", "DAMAGED", "EXPIRED", "INTERNAL_USAGE", "OTHER", "OUT");
        Criteria criteria = Criteria.where("transactionType").in(types);
        if (since != null) {
            criteria = criteria.and("transactionDate").gte(since);
        }

        Aggregation agg = Aggregation.newAggregation(
                Aggregation.match(criteria),
                Aggregation.group().sum("quantity").as("total")
        );

        AggregationResults<Document> results = mongoTemplate.aggregate(agg, "stock_transactions", Document.class);
        Document doc = results.getUniqueMappedResult();
        if (doc != null && doc.get("total") != null) {
            return ((Number) doc.get("total")).longValue();
        }
        return 0L;
    }

    @Override
    public List<Object[]> findTopSellingProducts(Pageable pageable) {
        Query query = new Query(Criteria.where("transactionType").in("SALE", "OUT"));
        List<StockTransaction> sales = mongoTemplate.find(query, StockTransaction.class);

        Map<Long, ProductSalesSummary> summaryMap = new HashMap<>();
        for (StockTransaction st : sales) {
            Product p = st.getProduct();
            if (p != null && p.getId() != null) {
                ProductSalesSummary summary = summaryMap.computeIfAbsent(p.getId(), k ->
                        new ProductSalesSummary(p.getId(), p.getName(), p.getSku(), 0L));
                summary.totalSold += (st.getQuantity() != null ? st.getQuantity() : 0);
            }
        }

        List<ProductSalesSummary> list = new ArrayList<>(summaryMap.values());
        list.sort((a, b) -> Long.compare(b.totalSold, a.totalSold));

        int limit = pageable.getPageSize() > 0 ? pageable.getPageSize() : 5;
        List<Object[]> rows = new ArrayList<>();
        for (int i = 0; i < Math.min(limit, list.size()); i++) {
            ProductSalesSummary s = list.get(i);
            rows.add(new Object[]{s.productId, s.productName, s.sku, s.totalSold});
        }
        return rows;
    }

    private static class ProductSalesSummary {
        Long productId;
        String productName;
        String sku;
        long totalSold;

        ProductSalesSummary(Long productId, String productName, String sku, long totalSold) {
            this.productId = productId;
            this.productName = productName;
            this.sku = sku;
            this.totalSold = totalSold;
        }
    }
}

