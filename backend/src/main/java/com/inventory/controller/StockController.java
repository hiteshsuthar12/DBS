package com.inventory.controller;

import com.inventory.dto.ApiResponse;
import com.inventory.dto.StockDto;
import com.inventory.entity.User;
import com.inventory.repository.UserRepository;
import com.inventory.security.CustomUserDetails;
import com.inventory.service.StockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
@Tag(name = "Stock Operations", description = "Endpoints for stock-in receipts, stock-out issues, and auditable transaction log")
public class StockController {

    private final StockService stockService;
    private final UserRepository userRepository;

    @PostMapping("/in")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER')")
    @Operation(summary = "Process stock receiving / replenishment workflow")
    public ResponseEntity<ApiResponse<StockDto.StockTransactionResponse>> processStockIn(
            @Valid @RequestBody StockDto.StockInRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User user = (userDetails != null) ? userRepository.findById(userDetails.getId()).orElse(null) : null;
        StockDto.StockTransactionResponse response = stockService.processStockIn(request, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Stock received and updated successfully"));
    }

    @PostMapping("/out")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER', 'ROLE_STAFF', 'STAFF')")
    @Operation(summary = "Process stock issue / sale workflow with insufficient-stock validation")
    public ResponseEntity<ApiResponse<StockDto.StockTransactionResponse>> processStockOut(
            @Valid @RequestBody StockDto.StockOutRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User user = (userDetails != null) ? userRepository.findById(userDetails.getId()).orElse(null) : null;
        StockDto.StockTransactionResponse response = stockService.processStockOut(request, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Stock issued and deducted successfully"));
    }

    @GetMapping("/history")
    @Operation(summary = "Query auditable stock transaction history with filtering and pagination")
    public ResponseEntity<ApiResponse<Page<StockDto.StockTransactionResponse>>> getHistory(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) String transactionType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "transactionDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Page<StockDto.StockTransactionResponse> history = stockService.getTransactions(
                productId, transactionType, startDate, endDate, search, page, size, sortBy, sortDir
        );
        return ResponseEntity.ok(ApiResponse.success(history));
    }
}
