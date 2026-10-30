package com.inventory.service;

import com.inventory.dto.AlertDto;
import com.inventory.entity.InventoryAlert;
import com.inventory.entity.Product;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.mapper.EntityDtoMapper;
import com.inventory.repository.InventoryAlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final InventoryAlertRepository alertRepository;
    private final EntityDtoMapper mapper;

    @Transactional(readOnly = true)
    public List<AlertDto.AlertResponse> getActiveAlerts() {
        return alertRepository.findByStatusOrderByCreatedAtDesc("ACTIVE").stream()
                .map(mapper::toAlertResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<AlertDto.AlertResponse> getAlerts(String status, String alertType, Pageable pageable) {
        String finalStatus = (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) ? status : null;
        String finalType = (alertType != null && !alertType.trim().isEmpty() && !alertType.equalsIgnoreCase("ALL")) ? alertType : null;
        return alertRepository.filterAlerts(finalStatus, finalType, pageable).map(mapper::toAlertResponse);
    }

    @Transactional
    public AlertDto.AlertResponse updateAlertStatus(Long id, String status) {
        InventoryAlert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with id: " + id));

        alert.setStatus(status.toUpperCase());
        if ("RESOLVED".equalsIgnoreCase(status)) {
            alert.setResolvedAt(Instant.now());
        } else {
            alert.setResolvedAt(null);
        }

        InventoryAlert updated = alertRepository.save(alert);
        log.info("Updated alert ID {} status to {}", id, status);
        return mapper.toAlertResponse(updated);
    }

    @Transactional
    public void evaluateStockAlerts(Product product) {
        int stock = product.getCurrentStock();
        int minLevel = product.getMinimumStockLevel();
        int reorderLevel = product.getReorderLevel();

        String targetAlertType = null;
        int threshold = 0;
        String message = null;

        if (stock == 0) {
            targetAlertType = "OUT_OF_STOCK";
            threshold = 0;
            message = String.format("Product '%s' (SKU: %s) is completely OUT OF STOCK (0 units). Customer orders will be rejected.",
                    product.getName(), product.getSku());
        } else if (stock <= minLevel) {
            targetAlertType = "CRITICAL_STOCK";
            threshold = minLevel;
            message = String.format("Product '%s' (SKU: %s) has reached CRITICAL stock: %d remaining (threshold: %d). Immediate procurement required.",
                    product.getName(), product.getSku(), stock, minLevel);
        } else if (stock <= reorderLevel) {
            targetAlertType = "LOW_STOCK";
            threshold = reorderLevel;
            message = String.format("Product '%s' (SKU: %s) is at LOW stock: %d remaining (reorder level: %d). Initiate reorder.",
                    product.getName(), product.getSku(), stock, reorderLevel);
        }

        List<InventoryAlert> activeAlerts = alertRepository.findActiveAlertsByProductId(product.getId());

        if (targetAlertType != null) {
            final String fTargetAlertType = targetAlertType;
            Optional<InventoryAlert> existingActive = activeAlerts.stream()
                    .filter(a -> a.getAlertType().equalsIgnoreCase(fTargetAlertType))
                    .findFirst();

            if (existingActive.isEmpty()) {
                // Resolve other mismatched active alerts for this product
                for (InventoryAlert active : activeAlerts) {
                    active.setStatus("RESOLVED");
                    active.setResolvedAt(Instant.now());
                    alertRepository.save(active);
                }

                InventoryAlert newAlert = InventoryAlert.builder()
                        .product(product)
                        .alertType(targetAlertType)
                        .currentStock(stock)
                        .thresholdStock(threshold)
                        .status("ACTIVE")
                        .message(message)
                        .build();

                alertRepository.save(newAlert);
                log.info("Raised new active {} alert for product: {}", targetAlertType, product.getName());
            } else {
                // Update current stock in existing alert
                InventoryAlert alert = existingActive.get();
                alert.setCurrentStock(stock);
                alert.setMessage(message);
                alertRepository.save(alert);
            }
        } else {
            // Stock is healthy -> resolve any active alerts
            for (InventoryAlert active : activeAlerts) {
                active.setStatus("RESOLVED");
                active.setResolvedAt(Instant.now());
                alertRepository.save(active);
                log.info("Resolved active {} alert for product {} as stock reached healthy level: {}",
                        active.getAlertType(), product.getName(), stock);
            }
        }
    }
}

