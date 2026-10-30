package com.inventory.scheduler;

import com.inventory.entity.Product;
import com.inventory.repository.ProductRepository;
import com.inventory.service.AlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class LowStockScheduler {

    private final ProductRepository productRepository;
    private final AlertService alertService;

    // Run every 30 minutes to ensure all stock boundaries have synchronized alerts
    @Scheduled(fixedRate = 1800000, initialDelay = 60000)
    public void synchronizeStockAlerts() {
        log.info("Starting scheduled inventory stock alert synchronization...");
        List<Product> products = productRepository.findAll();
        for (Product product : products) {
            try {
                alertService.evaluateStockAlerts(product);
            } catch (Exception e) {
                log.error("Failed to evaluate stock alert for product {}: {}", product.getId(), e.getMessage());
            }
        }
        log.info("Completed scheduled inventory stock alert synchronization across {} products.", products.size());
    }
}
