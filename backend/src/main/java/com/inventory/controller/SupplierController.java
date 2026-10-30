package com.inventory.controller;

import com.inventory.dto.ApiResponse;
import com.inventory.dto.ProductDto;
import com.inventory.dto.SupplierDto;
import com.inventory.service.SupplierService;
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
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
@Tag(name = "Supplier Management", description = "Endpoints for managing vendors, suppliers, and procurement partnerships")
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    @Operation(summary = "Get list of suppliers with search and pagination")
    public ResponseEntity<ApiResponse<Page<SupplierDto.SupplierResponse>>> getAllSuppliers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<SupplierDto.SupplierResponse> suppliers = supplierService.getAllSuppliers(search, status, page, size);
        return ResponseEntity.ok(ApiResponse.success(suppliers));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get supplier details by ID")
    public ResponseEntity<ApiResponse<SupplierDto.SupplierResponse>> getSupplierById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.getSupplierById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER')")
    @Operation(summary = "Register new supplier vendor")
    public ResponseEntity<ApiResponse<SupplierDto.SupplierResponse>> createSupplier(@Valid @RequestBody SupplierDto.SupplierRequest request) {
        SupplierDto.SupplierResponse created = supplierService.createSupplier(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Supplier registered successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER')")
    @Operation(summary = "Update supplier details")
    public ResponseEntity<ApiResponse<SupplierDto.SupplierResponse>> updateSupplier(
            @PathVariable Long id,
            @Valid @RequestBody SupplierDto.SupplierRequest request
    ) {
        SupplierDto.SupplierResponse updated = supplierService.updateSupplier(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Supplier updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete supplier if no active products are associated")
    public ResponseEntity<ApiResponse<Void>> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Supplier deleted successfully"));
    }

    @GetMapping("/{id}/products")
    @Operation(summary = "Get all products supplied by this vendor")
    public ResponseEntity<ApiResponse<List<ProductDto.ProductResponse>>> getSupplierProducts(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.getSupplierProducts(id)));
    }
}
