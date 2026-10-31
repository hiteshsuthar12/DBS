package com.inventory.config;

import com.inventory.entity.*;
import com.inventory.service.SequenceGeneratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.BeforeConvertEvent;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class ModelListener extends AbstractMongoEventListener<Object> {

    private final SequenceGeneratorService sequenceGenerator;

    @Override
    public void onBeforeConvert(BeforeConvertEvent<Object> event) {
        Object source = event.getSource();

        if (source instanceof Role role) {
            if (role.getId() == null || role.getId() <= 0) {
                role.setId(sequenceGenerator.generateSequence("roles_sequence"));
            }
        } else if (source instanceof User user) {
            if (user.getId() == null || user.getId() <= 0) {
                user.setId(sequenceGenerator.generateSequence("users_sequence"));
            }
            if (user.getCreatedAt() == null) {
                user.setCreatedAt(Instant.now());
            }
            user.setUpdatedAt(Instant.now());
        } else if (source instanceof Category category) {
            if (category.getId() == null || category.getId() <= 0) {
                category.setId(sequenceGenerator.generateSequence("categories_sequence"));
            }
            if (category.getCreatedAt() == null) {
                category.setCreatedAt(Instant.now());
            }
        } else if (source instanceof Supplier supplier) {
            if (supplier.getId() == null || supplier.getId() <= 0) {
                supplier.setId(sequenceGenerator.generateSequence("suppliers_sequence"));
            }
            if (supplier.getCreatedAt() == null) {
                supplier.setCreatedAt(Instant.now());
            }
            supplier.setUpdatedAt(Instant.now());
        } else if (source instanceof Product product) {
            if (product.getId() == null || product.getId() <= 0) {
                product.setId(sequenceGenerator.generateSequence("products_sequence"));
            }
            if (product.getCreatedAt() == null) {
                product.setCreatedAt(Instant.now());
            }
            product.setUpdatedAt(Instant.now());
        } else if (source instanceof StockTransaction transaction) {
            if (transaction.getId() == null || transaction.getId() <= 0) {
                transaction.setId(sequenceGenerator.generateSequence("stock_transactions_sequence"));
            }
            if (transaction.getCreatedAt() == null) {
                transaction.setCreatedAt(Instant.now());
            }
            if (transaction.getTransactionDate() == null) {
                transaction.setTransactionDate(Instant.now());
            }
        } else if (source instanceof InventoryAlert alert) {
            if (alert.getId() == null || alert.getId() <= 0) {
                alert.setId(sequenceGenerator.generateSequence("inventory_alerts_sequence"));
            }
            if (alert.getCreatedAt() == null) {
                alert.setCreatedAt(Instant.now());
            }
            alert.setUpdatedAt(Instant.now());
        } else if (source instanceof ProductDemandHistory demand) {
            if (demand.getId() == null || demand.getId() <= 0) {
                demand.setId(sequenceGenerator.generateSequence("product_demand_history_sequence"));
            }
            if (demand.getCreatedAt() == null) {
                demand.setCreatedAt(Instant.now());
            }
        } else if (source instanceof AuditLog auditLog) {
            if (auditLog.getId() == null || auditLog.getId() <= 0) {
                auditLog.setId(sequenceGenerator.generateSequence("audit_logs_sequence"));
            }
            if (auditLog.getCreatedAt() == null) {
                auditLog.setCreatedAt(Instant.now());
            }
        }
    }
}
