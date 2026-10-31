package com.inventory.mapper;

import com.inventory.dto.*;
import com.inventory.entity.*;
import org.springframework.stereotype.Component;

@Component
public class EntityDtoMapper {

    public AuthDto.UserDto toUserDto(User user) {
        if (user == null) return null;
        return AuthDto.UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole() != null ? user.getRole().getName() : null)
                .isActive(user.getIsActive())
                .build();
    }

    public ProductDto.ProductResponse toProductResponse(Product product) {
        if (product == null) return null;

        String stockStatus;
        if (product.getCurrentStock() <= 0) {
            stockStatus = "OUT_OF_STOCK";
        } else if (product.getCurrentStock() <= product.getMinimumStockLevel()) {
            stockStatus = "CRITICAL";
        } else if (product.getCurrentStock() <= product.getReorderLevel()) {
            stockStatus = "LOW";
        } else {
            stockStatus = "HEALTHY";
        }

        return ProductDto.ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .sku(product.getSku())
                .description(product.getDescription())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .unit(product.getUnit())
                .purchasePrice(product.getPurchasePrice())
                .sellingPrice(product.getSellingPrice())
                .currentStock(product.getCurrentStock())
                .minimumStockLevel(product.getMinimumStockLevel())
                .maximumStockLevel(product.getMaximumStockLevel())
                .reorderLevel(product.getReorderLevel())
                .supplierId(product.getSupplier() != null ? product.getSupplier().getId() : null)
                .supplierName(product.getSupplier() != null ? product.getSupplier().getSupplierName() : null)
                .stockStatus(stockStatus)
                .version(product.getVersion() != null ? product.getVersion() : 0L)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    public SupplierDto.SupplierResponse toSupplierResponse(Supplier supplier, long totalProducts) {
        if (supplier == null) return null;
        return SupplierDto.SupplierResponse.builder()
                .id(supplier.getId())
                .supplierName(supplier.getSupplierName())
                .companyName(supplier.getCompanyName())
                .email(supplier.getEmail())
                .phone(supplier.getPhone())
                .address(supplier.getAddress())
                .contactPerson(supplier.getContactPerson())
                .gstNumber(supplier.getGstNumber())
                .status(supplier.getStatus())
                .totalProducts(totalProducts)
                .createdAt(supplier.getCreatedAt())
                .updatedAt(supplier.getUpdatedAt())
                .build();
    }

    public StockDto.StockTransactionResponse toTransactionResponse(StockTransaction transaction) {
        if (transaction == null) return null;
        return StockDto.StockTransactionResponse.builder()
                .id(transaction.getId())
                .productId(transaction.getProduct() != null ? transaction.getProduct().getId() : null)
                .productName(transaction.getProduct() != null ? transaction.getProduct().getName() : null)
                .sku(transaction.getProduct() != null ? transaction.getProduct().getSku() : null)
                .supplierId(transaction.getSupplier() != null ? transaction.getSupplier().getId() : null)
                .supplierName(transaction.getSupplier() != null ? transaction.getSupplier().getSupplierName() : null)
                .transactionType(transaction.getTransactionType())
                .quantity(transaction.getQuantity())
                .previousStock(transaction.getPreviousStock())
                .updatedStock(transaction.getUpdatedStock())
                .unitPrice(transaction.getUnitPrice())
                .referenceNumber(transaction.getReferenceNumber())
                .remarks(transaction.getRemarks())
                .performedBy(transaction.getPerformedByUser() != null ? transaction.getPerformedByUser().getFullName() : "System")
                .transactionDate(transaction.getTransactionDate())
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    public AlertDto.AlertResponse toAlertResponse(InventoryAlert alert) {
        if (alert == null) return null;
        return AlertDto.AlertResponse.builder()
                .id(alert.getId())
                .productId(alert.getProduct() != null ? alert.getProduct().getId() : null)
                .productName(alert.getProduct() != null ? alert.getProduct().getName() : null)
                .sku(alert.getProduct() != null ? alert.getProduct().getSku() : null)
                .alertType(alert.getAlertType())
                .currentStock(alert.getCurrentStock())
                .thresholdStock(alert.getThresholdStock())
                .status(alert.getStatus())
                .message(alert.getMessage())
                .resolvedAt(alert.getResolvedAt())
                .createdAt(alert.getCreatedAt())
                .updatedAt(alert.getUpdatedAt())
                .build();
    }
}

