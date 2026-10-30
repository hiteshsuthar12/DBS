package com.inventory.service;

import com.inventory.dto.ProductDto;
import com.inventory.entity.Category;
import com.inventory.entity.Product;
import com.inventory.entity.Supplier;
import com.inventory.exception.DuplicateResourceException;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.mapper.EntityDtoMapper;
import com.inventory.repository.CategoryRepository;
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
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private StockTransactionRepository transactionRepository;

    @Mock
    private EntityDtoMapper mapper;

    @InjectMocks
    private ProductService productService;

    private Category category;
    private Supplier supplier;
    private Product product;

    @BeforeEach
    void setUp() {
        category = Category.builder().id(1L).name("Electronics").build();
        supplier = Supplier.builder().id(1L).supplierName("Apex Supplies").build();
        product = Product.builder()
                .id(100L)
                .name("Microcontroller X1")
                .sku("MCU-001")
                .category(category)
                .supplier(supplier)
                .purchasePrice(new BigDecimal("150.00"))
                .sellingPrice(new BigDecimal("220.00"))
                .currentStock(50)
                .minimumStockLevel(10)
                .reorderLevel(20)
                .maximumStockLevel(200)
                .build();
    }

    @Test
    @DisplayName("Should successfully create a valid product")
    void createProduct_Success() {
        ProductDto.ProductRequest request = ProductDto.ProductRequest.builder()
                .name("Microcontroller X1")
                .sku("MCU-001")
                .categoryId(1L)
                .supplierId(1L)
                .unit("PCS")
                .purchasePrice(new BigDecimal("150.00"))
                .sellingPrice(new BigDecimal("220.00"))
                .currentStock(50)
                .minimumStockLevel(10)
                .reorderLevel(20)
                .maximumStockLevel(200)
                .build();

        when(productRepository.existsBySku("MCU-001")).thenReturn(false);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(mapper.toProductResponse(product)).thenReturn(ProductDto.ProductResponse.builder()
                .id(100L)
                .name("Microcontroller X1")
                .sku("MCU-001")
                .currentStock(50)
                .build());

        ProductDto.ProductResponse response = productService.createProduct(request);

        assertThat(response).isNotNull();
        assertThat(response.getSku()).isEqualTo("MCU-001");
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("Should reject product creation with duplicate SKU")
    void createProduct_DuplicateSku_ThrowsException() {
        ProductDto.ProductRequest request = ProductDto.ProductRequest.builder()
                .sku("DUPLICATE-SKU")
                .name("Duplicate")
                .build();

        when(productRepository.existsBySku("DUPLICATE-SKU")).thenReturn(true);

        assertThatThrownBy(() -> productService.createProduct(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Product SKU 'DUPLICATE-SKU' already exists");

        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when product ID is invalid")
    void getProductById_NotFound_ThrowsException() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getProductById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Product not found with id: 999");
    }
}
