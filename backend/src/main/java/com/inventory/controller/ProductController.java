package com.inventory.controller;

import com.inventory.dto.ApiResponse;
import com.inventory.dto.ProductDto;
import com.inventory.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Product Management", description = "Endpoints for creating, querying, updating, and deleting products")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Search, filter, and paginate inventory products")
    public ResponseEntity<ApiResponse<Page<ProductDto.ProductResponse>>> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) String stockStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Page<ProductDto.ProductResponse> products = productService.getAllProducts(
                search, categoryId, supplierId, stockStatus, page, size, sortBy, sortDir
        );
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed product information by ID")
    public ResponseEntity<ApiResponse<ProductDto.ProductResponse>> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER')")
    @Operation(summary = "Create a new product with stock bounds")
    public ResponseEntity<ApiResponse<ProductDto.ProductResponse>> createProduct(@Valid @RequestBody ProductDto.ProductRequest request) {
        ProductDto.ProductResponse created = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Product created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER')")
    @Operation(summary = "Update an existing product")
    public ResponseEntity<ApiResponse<ProductDto.ProductResponse>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductDto.ProductRequest request
    ) {
        ProductDto.ProductResponse updated = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Product updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete product if permitted by business rules")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Product deleted successfully"));
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Get list of all products requiring reordering")
    public ResponseEntity<ApiResponse<List<ProductDto.ProductResponse>>> getLowStockProducts() {
        return ResponseEntity.ok(ApiResponse.success(productService.getLowStockProducts()));
    }
}

