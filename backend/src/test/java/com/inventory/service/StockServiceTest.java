package com.inventory.service;

import com.inventory.dto.StockDto;
import com.inventory.entity.Product;
import com.inventory.entity.StockTransaction;
import com.inventory.entity.Supplier;
import com.inventory.entity.User;
import com.inventory.exception.InsufficientStockException;
import com.inventory.mapper.EntityDtoMapper;
import com.inventory.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StockServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private StockTransactionRepository transactionRepository;

    @Mock
    private ProductDemandHistoryRepository demandHistoryRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private AlertService alertService;

    @Mock
    private EntityDtoMapper mapper;

    @InjectMocks
    private StockService stockService;

    private Product testProduct;
    private Supplier testSupplier;
    private User testUser;

    @BeforeEach
    void setUp() {
        testSupplier = Supplier.builder().id(1L).supplierName("Alpha Tech").build();
        testProduct = Product.builder()
                .id(1L)
                .name("Industrial Sensor")
                .sku("IND-SEN-01")
                .currentStock(20)
                .minimumStockLevel(10)
                .reorderLevel(25)
                .maximumStockLevel(100)
                .purchasePrice(new BigDecimal("100.00"))
                .sellingPrice(new BigDecimal("160.00"))
                .supplier(testSupplier)
                .build();

        testUser = User.builder().id(1L).username("operator").fullName("Inventory Operator").build();
    }

    @Test
    @DisplayName("Should process stock-in and increment product inventory correctly")
    void processStockIn_IncrementsStock() {
        StockDto.StockInRequest request = StockDto.StockInRequest.builder()
                .productId(1L)
                .supplierId(1L)
                .quantity(30)
                .purchasePrice(new BigDecimal("105.00"))
                .referenceNumber("INV-2026-001")
                .remarks("Batch shipment received")
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(testSupplier));
        when(transactionRepository.save(any(StockTransaction.class))).thenAnswer(i -> i.getArgument(0));
        when(mapper.toTransactionResponse(any(StockTransaction.class))).thenReturn(
                StockDto.StockTransactionResponse.builder()
                        .productId(1L)
                        .quantity(30)
                        .previousStock(20)
                        .updatedStock(50)
                        .build()
        );

        StockDto.StockTransactionResponse response = stockService.processStockIn(request, testUser);

        assertThat(response.getUpdatedStock()).isEqualTo(50);
        assertThat(testProduct.getCurrentStock()).isEqualTo(50);
        verify(productRepository).save(testProduct);
        verify(alertService).evaluateStockAlerts(testProduct);
    }

    @Test
    @DisplayName("Should process stock-out and decrement product inventory correctly")
    void processStockOut_DecrementsStock() {
        StockDto.StockOutRequest request = StockDto.StockOutRequest.builder()
                .productId(1L)
                .quantity(15)
                .transactionType("SALE")
                .referenceNumber("ORD-8891")
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(transactionRepository.save(any(StockTransaction.class))).thenAnswer(i -> i.getArgument(0));
        when(demandHistoryRepository.findByProductIdAndDemandDate(any(), any())).thenReturn(Optional.empty());
        when(mapper.toTransactionResponse(any(StockTransaction.class))).thenReturn(
                StockDto.StockTransactionResponse.builder()
                        .productId(1L)
                        .quantity(15)
                        .previousStock(20)
                        .updatedStock(5)
                        .build()
        );

        StockDto.StockTransactionResponse response = stockService.processStockOut(request, testUser);

        assertThat(response.getUpdatedStock()).isEqualTo(5);
        assertThat(testProduct.getCurrentStock()).isEqualTo(5);
        verify(productRepository).save(testProduct);
        verify(alertService).evaluateStockAlerts(testProduct);
    }

    @Test
    @DisplayName("Should throw InsufficientStockException when requested stock-out exceeds inventory")
    void processStockOut_InsufficientStock_ThrowsException() {
        StockDto.StockOutRequest request = StockDto.StockOutRequest.builder()
                .productId(1L)
                .quantity(50) // only 20 in stock
                .transactionType("SALE")
                .referenceNumber("ORD-OVERFLOW")
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        assertThatThrownBy(() -> stockService.processStockOut(request, testUser))
                .isInstanceOf(InsufficientStockException.class)
                .hasMessageContaining("Insufficient stock for product 'Industrial Sensor'");

        verify(productRepository, never()).save(any(Product.class));
        verify(transactionRepository, never()).save(any(StockTransaction.class));
    }
}

