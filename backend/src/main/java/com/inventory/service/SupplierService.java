package com.inventory.service;

import com.inventory.dto.ProductDto;
import com.inventory.dto.SupplierDto;
import com.inventory.entity.Supplier;
import com.inventory.exception.BadRequestException;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.mapper.EntityDtoMapper;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final EntityDtoMapper mapper;

    @Transactional(readOnly = true)
    public Page<SupplierDto.SupplierResponse> getAllSuppliers(String search, String status, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("supplierName").ascending());
        Page<Supplier> supplierPage = supplierRepository.searchSuppliers(
                (search != null && !search.trim().isEmpty()) ? search.trim() : null,
                (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) ? status : null,
                pageRequest
        );

        return supplierPage.map(s -> {
            long productCount = supplierRepository.countProductsBySupplierId(s.getId());
            return mapper.toSupplierResponse(s, productCount);
        });
    }

    @Transactional(readOnly = true)
    public SupplierDto.SupplierResponse getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        long productCount = supplierRepository.countProductsBySupplierId(id);
        return mapper.toSupplierResponse(supplier, productCount);
    }

    @Transactional
    public SupplierDto.SupplierResponse createSupplier(SupplierDto.SupplierRequest request) {
        Supplier supplier = Supplier.builder()
                .supplierName(request.getSupplierName())
                .companyName(request.getCompanyName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .contactPerson(request.getContactPerson())
                .gstNumber(request.getGstNumber())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();

        Supplier saved = supplierRepository.save(supplier);
        log.info("Created supplier: {} [{}]", saved.getSupplierName(), saved.getCompanyName());
        return mapper.toSupplierResponse(saved, 0);
    }

    @Transactional
    public SupplierDto.SupplierResponse updateSupplier(Long id, SupplierDto.SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));

        supplier.setSupplierName(request.getSupplierName());
        supplier.setCompanyName(request.getCompanyName());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setGstNumber(request.getGstNumber());
        if (request.getStatus() != null) {
            supplier.setStatus(request.getStatus());
        }

        Supplier updated = supplierRepository.save(supplier);
        long productCount = supplierRepository.countProductsBySupplierId(id);
        log.info("Updated supplier ID: {}", updated.getId());
        return mapper.toSupplierResponse(updated, productCount);
    }

    @Transactional
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));

        long linkedProducts = supplierRepository.countProductsBySupplierId(id);
        if (linkedProducts > 0) {
            throw new BadRequestException("Cannot delete supplier: Associated with " + linkedProducts + " products. Reassign or delete products first.");
        }

        supplierRepository.delete(supplier);
        log.info("Deleted supplier ID: {}", id);
    }

    @Transactional(readOnly = true)
    public List<ProductDto.ProductResponse> getSupplierProducts(Long supplierId) {
        if (!supplierRepository.existsById(supplierId)) {
            throw new ResourceNotFoundException("Supplier not found with id: " + supplierId);
        }
        return productRepository.findBySupplierId(supplierId).stream()
                .map(mapper::toProductResponse)
                .collect(Collectors.toList());
    }
}
