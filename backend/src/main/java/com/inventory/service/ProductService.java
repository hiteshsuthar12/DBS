package com.inventory.service;

import com.inventory.dto.ProductDto;
import com.inventory.entity.Category;
import com.inventory.entity.Product;
import com.inventory.entity.Supplier;
import com.inventory.exception.BadRequestException;
import com.inventory.exception.DuplicateResourceException;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.mapper.EntityDtoMapper;
import com.inventory.repository.CategoryRepository;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.StockTransactionRepository;
import com.inventory.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final StockTransactionRepository transactionRepository;
    private final EntityDtoMapper mapper;

    @Transactional(readOnly = true)
    public Page<ProductDto.ProductResponse> getAllProducts(String search,
                                                          Long categoryId,
                                                          Long supplierId,
                                                          String stockStatus,
                                                          int page,
                                                          int size,
                                                          String sortBy,
                                                          String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        PageRequest pageRequest = PageRequest.of(page, size, sort);

        Page<Product> productPage = productRepository.searchProducts(
                (search != null && !search.trim().isEmpty()) ? search.trim() : null,
                categoryId,
                supplierId,
                pageRequest
        );

        List<ProductDto.ProductResponse> responses = productPage.getContent().stream()
                .map(mapper::toProductResponse)
                .filter(p -> {
                    if (stockStatus == null || stockStatus.trim().isEmpty() || stockStatus.equalsIgnoreCase("ALL")) {
                        return true;
                    }
                    return p.getStockStatus().equalsIgnoreCase(stockStatus);
                })
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageRequest, productPage.getTotalElements());
    }

    @Transactional(readOnly = true)
    public ProductDto.ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapper.toProductResponse(product);
    }

    @Transactional
    public ProductDto.ProductResponse createProduct(ProductDto.ProductRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new DuplicateResourceException("Product SKU '" + request.getSku() + "' already exists");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId()));
        }

        if (request.getMinimumStockLevel() > request.getMaximumStockLevel()) {
            throw new BadRequestException("Minimum stock level cannot be greater than maximum stock level");
        }

        Product product = Product.builder()
                .name(request.getName())
                .sku(request.getSku())
                .description(request.getDescription())
                .category(category)
                .unit(request.getUnit() != null ? request.getUnit() : "PCS")
                .purchasePrice(request.getPurchasePrice())
                .sellingPrice(request.getSellingPrice())
                .currentStock(request.getCurrentStock() != null ? request.getCurrentStock() : 0)
                .minimumStockLevel(request.getMinimumStockLevel())
                .maximumStockLevel(request.getMaximumStockLevel())
                .reorderLevel(request.getReorderLevel())
                .supplier(supplier)
                .build();

        Product saved = productRepository.save(product);
        log.info("Created product: {} [SKU: {}]", saved.getName(), saved.getSku());
        return mapper.toProductResponse(saved);
    }

    @Transactional
    public ProductDto.ProductResponse updateProduct(Long id, ProductDto.ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (productRepository.existsBySkuAndIdNot(request.getSku(), id)) {
            throw new DuplicateResourceException("Another product already exists with SKU: " + request.getSku());
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId()));
        }

        if (request.getMinimumStockLevel() > request.getMaximumStockLevel()) {
            throw new BadRequestException("Minimum stock level cannot be greater than maximum stock level");
        }

        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setDescription(request.getDescription());
        product.setCategory(category);
        product.setUnit(request.getUnit());
        product.setPurchasePrice(request.getPurchasePrice());
        product.setSellingPrice(request.getSellingPrice());
        product.setMinimumStockLevel(request.getMinimumStockLevel());
        product.setMaximumStockLevel(request.getMaximumStockLevel());
        product.setReorderLevel(request.getReorderLevel());
        product.setSupplier(supplier);

        Product updated = productRepository.save(product);
        log.info("Updated product ID: {}", updated.getId());
        return mapper.toProductResponse(updated);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (!transactionRepository.findByProductIdOrderByTransactionDateDesc(id).isEmpty()) {
            throw new BadRequestException("Cannot delete product with existing stock transaction history. Consider archiving or marking inactive.");
        }

        productRepository.delete(product);
        log.info("Deleted product ID: {}", id);
    }

    @Transactional(readOnly = true)
    public List<ProductDto.ProductResponse> getLowStockProducts() {
        return productRepository.findLowStockProducts().stream()
                .map(mapper::toProductResponse)
                .collect(Collectors.toList());
    }
}

