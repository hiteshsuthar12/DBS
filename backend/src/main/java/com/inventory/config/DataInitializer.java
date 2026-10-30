package com.inventory.config;

import com.inventory.entity.Category;
import com.inventory.entity.Role;
import com.inventory.entity.User;
import com.inventory.repository.CategoryRepository;
import com.inventory.repository.RoleRepository;
import com.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
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
}
