package com.inventory.service;

import com.inventory.dto.StockDto;
import com.inventory.entity.*;
import com.inventory.exception.InsufficientStockException;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.mapper.EntityDtoMapper;
import com.inventory.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockService {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final StockTransactionRepository transactionRepository;
    private final ProductDemandHistoryRepository demandHistoryRepository;
    private final AuditLogRepository auditLogRepository;
    private final AlertService alertService;
    private final EntityDtoMapper mapper;

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public StockDto.StockTransactionResponse processStockIn(StockDto.StockInRequest request, User performedBy) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId()));
        } else if (product.getSupplier() != null) {
            supplier = product.getSupplier();
        }

        int previousStock = product.getCurrentStock();
        int updatedStock = previousStock + request.getQuantity();

        product.setCurrentStock(updatedStock);
        if (request.getPurchasePrice() != null && request.getPurchasePrice().compareTo(BigDecimal.ZERO) > 0) {
            product.setPurchasePrice(request.getPurchasePrice());
        }
        productRepository.save(product);

        BigDecimal unitPrice = request.getPurchasePrice() != null ? request.getPurchasePrice() : product.getPurchasePrice();

        StockTransaction transaction = StockTransaction.builder()
                .product(product)
                .supplier(supplier)
                .transactionType("IN")
                .quantity(request.getQuantity())
                .previousStock(previousStock)
                .updatedStock(updatedStock)
                .unitPrice(unitPrice)
                .referenceNumber(request.getReferenceNumber())
                .remarks(request.getRemarks())
                .performedByUser(performedBy)
                .transactionDate(request.getTransactionDate() != null ? request.getTransactionDate() : Instant.now())
                .build();

        StockTransaction savedTransaction = transactionRepository.save(transaction);

        // Record audit log
        auditLogRepository.save(AuditLog.builder()
                .action("STOCK_IN")
                .entityName("PRODUCT")
                .entityId(product.getId().toString())
                .performedBy(performedBy != null ? performedBy.getUsername() : "SYSTEM")
                .details(String.format("Added %d units to product '%s'. Stock: %d -> %d. Ref: %s",
                        request.getQuantity(), product.getName(), previousStock, updatedStock, request.getReferenceNumber()))
                .build());

        // Re-evaluate alerts (may resolve low-stock alert)
        alertService.evaluateStockAlerts(product);

        log.info("Processed STOCK_IN for product {}: +{} units (Ref: {})",
                product.getName(), request.getQuantity(), request.getReferenceNumber());

        return mapper.toTransactionResponse(savedTransaction);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public StockDto.StockTransactionResponse processStockOut(StockDto.StockOutRequest request, User performedBy) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        int previousStock = product.getCurrentStock();
        int requestedQty = request.getQuantity();

        if (previousStock < requestedQty) {
            throw new InsufficientStockException(String.format(
                    "Insufficient stock for product '%s' (SKU: %s): Requested %d, but only %d units are available in inventory.",
                    product.getName(), product.getSku(), requestedQty, previousStock
            ));
        }

        int updatedStock = previousStock - requestedQty;
        product.setCurrentStock(updatedStock);
        productRepository.save(product);

        StockTransaction transaction = StockTransaction.builder()
                .product(product)
                .supplier(product.getSupplier())
                .transactionType(request.getTransactionType().toUpperCase())
                .quantity(requestedQty)
                .previousStock(previousStock)
                .updatedStock(updatedStock)
                .unitPrice(product.getSellingPrice())
                .referenceNumber(request.getReferenceNumber())
                .remarks(request.getRemarks())
                .performedByUser(performedBy)
                .transactionDate(request.getTransactionDate() != null ? request.getTransactionDate() : Instant.now())
                .build();

        StockTransaction savedTransaction = transactionRepository.save(transaction);

        // Record daily demand history if transaction is a SALE or OUT
        if ("SALE".equalsIgnoreCase(request.getTransactionType()) || "OTHER".equalsIgnoreCase(request.getTransactionType())) {
            LocalDate today = LocalDate.now(ZoneId.of("UTC"));
            ProductDemandHistory demand = demandHistoryRepository.findByProductIdAndDemandDate(product.getId(), today)
                    .orElseGet(() -> ProductDemandHistory.builder()
                            .product(product)
                            .demandDate(today)
                            .quantityDemanded(0)
                            .transactionCount(0)
                            .build());

            demand.setQuantityDemanded(demand.getQuantityDemanded() + requestedQty);
            demand.setTransactionCount(demand.getTransactionCount() + 1);
            demandHistoryRepository.save(demand);
        }

        // Record audit log
        auditLogRepository.save(AuditLog.builder()
                .action("STOCK_OUT_" + request.getTransactionType().toUpperCase())
                .entityName("PRODUCT")
                .entityId(product.getId().toString())
                .performedBy(performedBy != null ? performedBy.getUsername() : "SYSTEM")
                .details(String.format("Deducted %d units from product '%s'. Stock: %d -> %d. Type: %s. Ref: %s",
                        requestedQty, product.getName(), previousStock, updatedStock, request.getTransactionType(), request.getReferenceNumber()))
                .build());

        // Re-evaluate alerts (may trigger low-stock, critical, or out-of-stock)
        alertService.evaluateStockAlerts(product);

        log.info("Processed STOCK_OUT ({}) for product {}: -{} units (Ref: {})",
                request.getTransactionType(), product.getName(), requestedQty, request.getReferenceNumber());

        return mapper.toTransactionResponse(savedTransaction);
    }

    @Transactional(readOnly = true)
    public Page<StockDto.StockTransactionResponse> getTransactions(Long productId,
                                                                   String transactionType,
                                                                   Instant startDate,
                                                                   Instant endDate,
                                                                   String search,
                                                                   int page,
                                                                   int size,
                                                                   String sortBy,
                                                                   String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        PageRequest pageRequest = PageRequest.of(page, size, sort);

        String fType = (transactionType != null && !transactionType.trim().isEmpty() && !transactionType.equalsIgnoreCase("ALL"))
                ? transactionType.toUpperCase() : null;
        String fSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        return transactionRepository.filterTransactions(productId, fType, startDate, endDate, fSearch, pageRequest)
                .map(mapper::toTransactionResponse);
    }
}

