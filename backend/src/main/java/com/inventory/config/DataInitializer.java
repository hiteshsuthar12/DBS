package com.inventory.config;

import com.inventory.entity.*;
import com.inventory.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneOffset;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final InventoryAlertRepository alertRepository;
    private final ProductDemandHistoryRepository demandHistoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking system roles and initial seed users...");

        Role adminRole = getOrCreateRole("ROLE_ADMIN", "Administrator with full system privileges");
        Role managerRole = getOrCreateRole("ROLE_INVENTORY_MANAGER", "Inventory Manager with product and stock operations");
        Role staffRole = getOrCreateRole("ROLE_STAFF", "Operations Staff with permitted stock operations");

        getOrCreateUser("admin", "admin@inventory.smart", "Admin@123", "System Administrator", adminRole);
        getOrCreateUser("manager", "manager@inventory.smart", "Manager@123", "Inventory Manager", managerRole);
        getOrCreateUser("staff", "staff@inventory.smart", "Staff@123", "Operations Staff", staffRole);

        ensureCategories();
        ensureSuppliers();
        ensureProducts();
        log.info("System data verification completed successfully.");
    }

    private Role getOrCreateRole(String name, String description) {
        return roleRepository.findByName(name).orElseGet(() -> {
            Role role = Role.builder().name(name).description(description).build();
            return roleRepository.save(role);
        });
    }

    private void getOrCreateUser(String username, String email, String rawPassword, String fullName, Role role) {
        if (!userRepository.existsByUsername(username)) {
            User user = User.builder()
                    .username(username)
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .fullName(fullName)
                    .role(role)
                    .isActive(true)
                    .build();
            userRepository.save(user);
            log.info("Initialized default user: {} with role: {}", username, role.getName());
        }
    }

    private void ensureCategories() {
        if (categoryRepository.count() == 0) {
            categoryRepository.save(Category.builder().name("Electronics").description("Electronic components and sensors").build());
            categoryRepository.save(Category.builder().name("Industrial Hardware").description("Fasteners and mechanical hardware").build());
            categoryRepository.save(Category.builder().name("Power & Electrical").description("Electrical cables and power units").build());
            categoryRepository.save(Category.builder().name("Tools & Instruments").description("Measurement tools and equipment").build());
            categoryRepository.save(Category.builder().name("Packaging & Logistics").description("Packaging materials and boxes").build());
            categoryRepository.save(Category.builder().name("Office & Workspace").description("Office equipment and chairs").build());
            log.info("Initialized default product categories.");
        }
    }

    private void ensureSuppliers() {
        if (supplierRepository.count() == 0) {
            supplierRepository.save(Supplier.builder()
                    .supplierName("TechSource Global")
                    .companyName("TechSource Global Solutions Pvt Ltd")
                    .email("procurement@techsource.com")
                    .phone("+91 98765 43210")
                    .address("Block B, Sector 62, Electronic City, Bengaluru, Karnataka 560100")
                    .contactPerson("Rajesh Sharma")
                    .gstNumber("29AABCT1332L1Z5")
                    .status("ACTIVE")
                    .build());

            supplierRepository.save(Supplier.builder()
                    .supplierName("Apex Industrial")
                    .companyName("Apex Industrial Fasteners Ltd")
                    .email("sales@apexindustrial.com")
                    .phone("+91 98220 11223")
                    .address("Plot 45, MIDC, Chakan, Pune, Maharashtra 410501")
                    .contactPerson("Sunita Deshmukh")
                    .gstNumber("27AAACA9876D1Z2")
                    .status("ACTIVE")
                    .build());

            supplierRepository.save(Supplier.builder()
                    .supplierName("Voltaic Systems")
                    .companyName("Voltaic Electrical Technologies Inc")
                    .email("orders@voltaicsys.com")
                    .phone("+91 94440 99887")
                    .address("Phase II, Guindy, Chennai, Tamil Nadu 600032")
                    .contactPerson("Arun Karthik")
                    .gstNumber("33AABCV5544K1ZR")
                    .status("ACTIVE")
                    .build());

            supplierRepository.save(Supplier.builder()
                    .supplierName("Precision Instruments")
                    .companyName("Precision Tools & Metrology Pvt Ltd")
                    .email("support@precisiontools.in")
                    .phone("+91 99100 55443")
                    .address("Udyog Vihar Phase 4, Gurugram, Haryana 122015")
                    .contactPerson("Vikram Malhotra")
                    .gstNumber("06AAACP4433P1Z9")
                    .status("ACTIVE")
                    .build());

            log.info("Initialized default suppliers.");
        }
    }

    private void ensureProducts() {
        if (productRepository.count() == 0) {
            Category c1 = categoryRepository.findByName("Electronics").orElse(null);
            Category c2 = categoryRepository.findByName("Industrial Hardware").orElse(null);
            Category c3 = categoryRepository.findByName("Power & Electrical").orElse(null);
            Category c4 = categoryRepository.findByName("Tools & Instruments").orElse(null);
            Category fallbackCat = categoryRepository.findAll().isEmpty() ? null : categoryRepository.findAll().get(0);

            Supplier s1 = supplierRepository.findAll().stream()
                    .filter(s -> s.getSupplierName() != null && s.getSupplierName().contains("TechSource"))
                    .findFirst().orElse(null);
            Supplier s2 = supplierRepository.findAll().stream()
                    .filter(s -> s.getSupplierName() != null && s.getSupplierName().contains("Apex"))
                    .findFirst().orElse(null);
            Supplier s3 = supplierRepository.findAll().stream()
                    .filter(s -> s.getSupplierName() != null && s.getSupplierName().contains("Voltaic"))
                    .findFirst().orElse(null);
            Supplier s4 = supplierRepository.findAll().stream()
                    .filter(s -> s.getSupplierName() != null && s.getSupplierName().contains("Precision"))
                    .findFirst().orElse(null);

            Supplier fallbackSupplier = supplierRepository.findAll().isEmpty() ? null : supplierRepository.findAll().get(0);

            Product p1 = productRepository.save(Product.builder()
                    .name("Microcontroller STM32F4 Cortex-M4")
                    .sku("ELEC-MCU-3201")
                    .description("32-bit ARM Cortex-M4 MCU with 512KB Flash, 168 MHz high-performance processor")
                    .category(c1 != null ? c1 : fallbackCat)
                    .unit("PCS")
                    .purchasePrice(new BigDecimal("650.00"))
                    .sellingPrice(new BigDecimal("950.00"))
                    .currentStock(140)
                    .minimumStockLevel(25)
                    .maximumStockLevel(500)
                    .reorderLevel(50)
                    .supplier(s1 != null ? s1 : fallbackSupplier)
                    .build());

            Product p2 = productRepository.save(Product.builder()
                    .name("Industrial Power Supply 24V 10A DIN Rail")
                    .sku("PWR-DR24-1002")
                    .description("Ultra-slim 240W DIN-rail industrial power supply with overload protection")
                    .category(c3 != null ? c3 : fallbackCat)
                    .unit("PCS")
                    .purchasePrice(new BigDecimal("2200.00"))
                    .sellingPrice(new BigDecimal("3100.00"))
                    .currentStock(18)
                    .minimumStockLevel(10)
                    .maximumStockLevel(100)
                    .reorderLevel(25)
                    .supplier(s3 != null ? s3 : fallbackSupplier)
                    .build());

            Product p3 = productRepository.save(Product.builder()
                    .name("Stainless Steel Hex Bolt M8 x 40mm (Pack of 100)")
                    .sku("HDW-BLT-M804")
                    .description("Grade 304 corrosion-resistant stainless steel hex head machine screws")
                    .category(c2 != null ? c2 : fallbackCat)
                    .unit("BOX")
                    .purchasePrice(new BigDecimal("420.00"))
                    .sellingPrice(new BigDecimal("680.00"))
                    .currentStock(12)
                    .minimumStockLevel(15)
                    .maximumStockLevel(300)
                    .reorderLevel(30)
                    .supplier(s2 != null ? s2 : fallbackSupplier)
                    .build());

            Product p4 = productRepository.save(Product.builder()
                    .name("Soldering Station 90W ESD Safe with Display")
                    .sku("TOOL-SLD-9006")
                    .description("Microprocessor-controlled PID precision soldering station with sleep mode")
                    .category(c4 != null ? c4 : fallbackCat)
                    .unit("PCS")
                    .purchasePrice(new BigDecimal("4500.00"))
                    .sellingPrice(new BigDecimal("6200.00"))
                    .currentStock(3)
                    .minimumStockLevel(5)
                    .maximumStockLevel(50)
                    .reorderLevel(12)
                    .supplier(s4 != null ? s4 : fallbackSupplier)
                    .build());

            Product p5 = productRepository.save(Product.builder()
                    .name("Anti-Static ESD Bubble Wrap Roll 50m x 1m")
                    .sku("PKG-ESD-5008")
                    .description("Dissipative pink cushioning material for safe transportation of sensitive components")
                    .category(c1 != null ? c1 : fallbackCat)
                    .unit("PCS")
                    .purchasePrice(new BigDecimal("1250.00"))
                    .sellingPrice(new BigDecimal("1800.00"))
                    .currentStock(0)
                    .minimumStockLevel(5)
                    .maximumStockLevel(60)
                    .reorderLevel(15)
                    .supplier(s1 != null ? s1 : fallbackSupplier)
                    .build());

            // Seed Alerts
            alertRepository.save(InventoryAlert.builder()
                    .product(p3)
                    .alertType("LOW_STOCK")
                    .currentStock(12)
                    .thresholdStock(30)
                    .status("ACTIVE")
                    .message("Product stock (12) is below reorder level (30). Trigger reorder with Apex Industrial.")
                    .build());

            alertRepository.save(InventoryAlert.builder()
                    .product(p4)
                    .alertType("CRITICAL_STOCK")
                    .currentStock(3)
                    .thresholdStock(12)
                    .status("ACTIVE")
                    .message("Critical stock level (3 units) remaining. Reorder threshold is 12.")
                    .build());

            alertRepository.save(InventoryAlert.builder()
                    .product(p5)
                    .alertType("OUT_OF_STOCK")
                    .currentStock(0)
                    .thresholdStock(15)
                    .status("ACTIVE")
                    .message("Product is completely OUT OF STOCK (0 units). Customer orders will be blocked.")
                    .build());

            // Seed Demand History for AI engine
            LocalDate today = LocalDate.now(ZoneOffset.UTC);
            for (int i = 14; i >= 1; i--) {
                LocalDate d = today.minusDays(i);
                demandHistoryRepository.save(ProductDemandHistory.builder()
                        .product(p1)
                        .demandDate(d)
                        .quantityDemanded(4 + (i % 3))
                        .transactionCount(2)
                        .build());

                demandHistoryRepository.save(ProductDemandHistory.builder()
                        .product(p2)
                        .demandDate(d)
                        .quantityDemanded(1 + (i % 2))
                        .transactionCount(1)
                        .build());
            }

            log.info("Initialized default products, active alerts, and demand history.");
        }
    }
}
