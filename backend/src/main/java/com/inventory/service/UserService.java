package com.inventory.service;

import com.inventory.dto.AuthDto;
import com.inventory.entity.Role;
import com.inventory.entity.User;
import com.inventory.exception.BadRequestException;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.mapper.EntityDtoMapper;
import com.inventory.repository.RoleRepository;
import com.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EntityDtoMapper mapper;

    @Transactional(readOnly = true)
    public List<AuthDto.UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(mapper::toUserDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AuthDto.UserDto updateUserStatus(Long id, boolean isActive) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setIsActive(isActive);
        User saved = userRepository.save(user);
        log.info("Updated user {} active status to {}", user.getUsername(), isActive);
        return mapper.toUserDto(saved);
    }

    @Transactional
    public AuthDto.UserDto updateUserRole(Long id, String roleName) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        String targetRole = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;
        Role role = roleRepository.findByName(targetRole)
                .orElseThrow(() -> new BadRequestException("Role not found: " + targetRole));

        user.setRole(role);
        User saved = userRepository.save(user);
        log.info("Updated user {} role to {}", user.getUsername(), targetRole);
        return mapper.toUserDto(saved);
    }
}

