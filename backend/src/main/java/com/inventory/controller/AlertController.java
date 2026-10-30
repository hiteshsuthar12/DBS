package com.inventory.controller;

import com.inventory.dto.AlertDto;
import com.inventory.dto.ApiResponse;
import com.inventory.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
@Tag(name = "Low-Stock Alerts", description = "Endpoints for inventory alert monitoring and status lifecycle")
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    @Operation(summary = "Get paginated alerts with status and type filters")
    public ResponseEntity<ApiResponse<Page<AlertDto.AlertResponse>>> getAlerts(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String alertType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<AlertDto.AlertResponse> alerts = alertService.getAlerts(status, alertType, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @GetMapping("/active")
    @Operation(summary = "Get list of all active unresolved alerts")
    public ResponseEntity<ApiResponse<List<AlertDto.AlertResponse>>> getActiveAlerts() {
        return ResponseEntity.ok(ApiResponse.success(alertService.getActiveAlerts()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER')")
    @Operation(summary = "Update alert lifecycle status (ACKNOWLEDGED, RESOLVED)")
    public ResponseEntity<ApiResponse<AlertDto.AlertResponse>> updateAlertStatus(
            @PathVariable Long id,
            @Valid @RequestBody AlertDto.AlertStatusUpdateRequest request
    ) {
        AlertDto.AlertResponse updated = alertService.updateAlertStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success(updated, "Alert status updated"));
    }
}
