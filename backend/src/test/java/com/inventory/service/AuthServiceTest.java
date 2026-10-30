package com.inventory.service;

import com.inventory.dto.AuthDto;
import com.inventory.entity.Role;
import com.inventory.entity.User;
import com.inventory.exception.DuplicateResourceException;
import com.inventory.mapper.EntityDtoMapper;
import com.inventory.repository.RoleRepository;
import com.inventory.repository.UserRepository;
import com.inventory.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private EntityDtoMapper mapper;

    @InjectMocks
    private AuthService authService;

    private Role staffRole;
    private User testUser;

    @BeforeEach
    void setUp() {
        staffRole = Role.builder().id(3L).name("ROLE_STAFF").description("Staff Role").build();
        testUser = User.builder()
                .id(1L)
                .username("john_doe")
                .email("john@example.com")
                .password("encoded_pass")
                .fullName("John Doe")
                .role(staffRole)
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("Should successfully authenticate user and return JWT token")
    void login_Success() {
        AuthDto.LoginRequest request = AuthDto.LoginRequest.builder()
                .username("john_doe")
                .password("Password@123")
                .build();

        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("mock.jwt.token");
        when(userRepository.findByUsername("john_doe")).thenReturn(Optional.of(testUser));
        when(mapper.toUserDto(testUser)).thenReturn(AuthDto.UserDto.builder()
                .id(1L)
                .username("john_doe")
                .email("john@example.com")
                .role("ROLE_STAFF")
                .build());

        AuthDto.AuthResponse response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mock.jwt.token");
        assertThat(response.getUser().getUsername()).isEqualTo("john_doe");
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    @DisplayName("Should register new user successfully")
    void register_Success() {
        AuthDto.RegisterRequest request = AuthDto.RegisterRequest.builder()
                .username("new_user")
                .email("new@example.com")
                .password("Password@123")
                .fullName("New User")
                .role("ROLE_STAFF")
                .build();

        when(userRepository.existsByUsername("new_user")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(roleRepository.findByName("ROLE_STAFF")).thenReturn(Optional.of(staffRole));
        when(passwordEncoder.encode("Password@123")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("mock.registered.token");
        when(mapper.toUserDto(testUser)).thenReturn(AuthDto.UserDto.builder()
                .id(1L)
                .username("new_user")
                .email("new@example.com")
                .build());

        AuthDto.AuthResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mock.registered.token");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when registering existing username")
    void register_DuplicateUsername_ThrowsException() {
        AuthDto.RegisterRequest request = AuthDto.RegisterRequest.builder()
                .username("john_doe")
                .email("another@example.com")
                .password("Password@123")
                .build();

        when(userRepository.existsByUsername("john_doe")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Username 'john_doe' is already taken");

        verify(userRepository, never()).save(any(User.class));
    }
}
