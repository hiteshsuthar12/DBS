package com.inventory.service;

import com.inventory.dto.DashboardDto;
import com.inventory.entity.Product;
import com.inventory.mapper.EntityDtoMapper;
import com.inventory.repository.InventoryAlertRepository;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.StockTransactionRepository;
import com.inventory.repository.SupplierRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private StockTransactionRepository transactionRepository;

    @Mock
    private InventoryAlertRepository alertRepository;

    @Mock
    private EntityDtoMapper mapper;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    @DisplayName("Should aggregate real dashboard KPI summary from repositories")
    void getSummary_CalculatesCorrectMetrics() {
        when(productRepository.count()).thenReturn(10L);
        when(supplierRepository.count()).thenReturn(5L);
        when(productRepository.calculateTotalStockQuantity()).thenReturn(450L);
        when(productRepository.calculateTotalInventoryValuation()).thenReturn(new BigDecimal("125000.50"));
        when(productRepository.findLowStockProducts()).thenReturn(Collections.singletonList(Product.builder().id(1L).build()));
        when(productRepository.findOutOfStockProducts()).thenReturn(Collections.emptyList());
        when(transactionRepository.sumStockInSince(any())).thenReturn(100L);
        when(transactionRepository.sumStockOutSince(any())).thenReturn(35L);
        when(alertRepository.countByStatus("ACTIVE")).thenReturn(2L);

        DashboardDto.SummaryResponse summary = dashboardService.getSummary();

        assertThat(summary.getTotalProducts()).isEqualTo(10L);
        assertThat(summary.getTotalSuppliers()).isEqualTo(5L);
        assertThat(summary.getTotalInventoryQuantity()).isEqualTo(450L);
        assertThat(summary.getTotalInventoryValuation()).isEqualTo(new BigDecimal("125000.50"));
        assertThat(summary.getLowStockProducts()).isEqualTo(1L);
        assertThat(summary.getOutOfStockProducts()).isEqualTo(0L);
        assertThat(summary.getStockInToday()).isEqualTo(100L);
        assertThat(summary.getStockOutToday()).isEqualTo(35L);
        assertThat(summary.getActiveAlerts()).isEqualTo(2L);
    }
}
