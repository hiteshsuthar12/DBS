package com.inventory.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;

public class SupplierDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SupplierRequest {
        @NotBlank(message = "Supplier name is required")
        @Size(max = 100)
        private String supplierName;

        @NotBlank(message = "Company name is required")
        @Size(max = 150)
        private String companyName;

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        private String email;

        @NotBlank(message = "Phone number is required")
        private String phone;

        @NotBlank(message = "Address is required")
        private String address;

        @NotBlank(message = "Contact person is required")
        private String contactPerson;

        private String gstNumber;

        @Builder.Default
        private String status = "ACTIVE"; // ACTIVE, INACTIVE
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SupplierResponse {
        private Long id;
        private String supplierName;
        private String companyName;
        private String email;
        private String phone;
        private String address;
        private String contactPerson;
        private String gstNumber;
        private String status;
        private long totalProducts;
        private Instant createdAt;
        private Instant updatedAt;
    }
}
