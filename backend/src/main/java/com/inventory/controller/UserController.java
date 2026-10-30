package com.inventory.controller;

import com.inventory.dto.ApiResponse;
import com.inventory.dto.AuthDto;
import com.inventory.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "User Management", description = "Admin-only endpoints for managing user access and system roles")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "List all registered system users")
    public ResponseEntity<ApiResponse<List<AuthDto.UserDto>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers()));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Enable or disable user account access")
    public ResponseEntity<ApiResponse<AuthDto.UserDto>> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> payload
    ) {
        boolean isActive = payload.getOrDefault("isActive", true);
        AuthDto.UserDto updated = userService.updateUserStatus(id, isActive);
        return ResponseEntity.ok(ApiResponse.success(updated, "User status updated"));
    }

    @PatchMapping("/{id}/role")
    @Operation(summary = "Assign role to user")
    public ResponseEntity<ApiResponse<AuthDto.UserDto>> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload
    ) {
        String roleName = payload.get("role");
        AuthDto.UserDto updated = userService.updateUserRole(id, roleName);
        return ResponseEntity.ok(ApiResponse.success(updated, "User role updated"));
    }
}

