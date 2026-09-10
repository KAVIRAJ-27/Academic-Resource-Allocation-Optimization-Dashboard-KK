package com.ahrao.security;

import com.ahrao.dto.auth.LoginRequest;
import com.ahrao.dto.auth.LoginResponse;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.entity.user.Permission;
import com.ahrao.entity.user.Role;
import com.ahrao.entity.user.User;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.user.RoleRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceSecurityTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        authService = new AuthServiceImpl(
                userRepository,
                roleRepository,
                auditLogRepository,
                passwordEncoder,
                tokenProvider
        );
    }

    private User createMockUser(String username, UserStatus status) {
        User user = new User();
        user.setId(10L);
        user.setUsername(username);
        user.setEmail(username + "@ahrao.edu");
        user.setPasswordHash("$2a$10$encodedHash");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setStatus(status);

        Role role = new Role("FACULTY", "Faculty role");
        Permission perm = new Permission("ACADEMIC_READ", "Read academic info");
        role.setPermissions(Set.of(perm));
        user.setRoles(Set.of(role));

        return user;
    }

    @Test
    @DisplayName("Valid login succeeds, generates JWT, and records audit log")
    void testSuccessfulLogin() {
        User user = createMockUser("prof_smith", UserStatus.ACTIVE);
        when(userRepository.findByIdentifierWithRoles("prof_smith")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Prof@123", user.getPasswordHash())).thenReturn(true);
        when(tokenProvider.generateTokenFromUserDetails(any())).thenReturn("mock-valid-jwt");
        when(tokenProvider.getJwtExpirationMs()).thenReturn(86400000L);

        LoginRequest request = new LoginRequest();
        request.setUsernameOrEmail("prof_smith");
        request.setPassword("Prof@123");

        LoginResponse response = authService.login(request, "127.0.0.1", "JUnit-Client");

        assertNotNull(response);
        assertEquals("mock-valid-jwt", response.getAccessToken());
        assertEquals("prof_smith", response.getUsername());
        assertTrue(response.getRoles().contains("FACULTY"));
        assertTrue(response.getPermissions().contains("ACADEMIC_READ"));

        verify(auditLogRepository, atLeastOnce()).save(any());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    @DisplayName("Login with invalid password throws BadCredentialsException")
    void testInvalidPasswordThrowsBadCredentials() {
        User user = createMockUser("prof_smith", UserStatus.ACTIVE);
        when(userRepository.findByIdentifierWithRoles("prof_smith")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword", user.getPasswordHash())).thenReturn(false);

        LoginRequest request = new LoginRequest();
        request.setUsernameOrEmail("prof_smith");
        request.setPassword("WrongPassword");

        assertThrows(BadCredentialsException.class, () -> {
            authService.login(request, "127.0.0.1", "JUnit-Client");
        });

        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Login with nonexistent user throws BadCredentialsException")
    void testNonexistentUserThrowsBadCredentials() {
        when(userRepository.findByIdentifierWithRoles("nonexistent")).thenReturn(Optional.empty());

        LoginRequest request = new LoginRequest();
        request.setUsernameOrEmail("nonexistent");
        request.setPassword("Password@123");

        assertThrows(BadCredentialsException.class, () -> {
            authService.login(request, "127.0.0.1", "JUnit-Client");
        });

        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Login on SUSPENDED account throws LockedException")
    void testSuspendedUserThrowsLockedException() {
        User user = createMockUser("bad_actor", UserStatus.SUSPENDED);
        when(userRepository.findByIdentifierWithRoles("bad_actor")).thenReturn(Optional.of(user));

        LoginRequest request = new LoginRequest();
        request.setUsernameOrEmail("bad_actor");
        request.setPassword("AnyPassword");

        assertThrows(LockedException.class, () -> {
            authService.login(request, "127.0.0.1", "JUnit-Client");
        });

        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Login on INACTIVE account throws DisabledException")
    void testInactiveUserThrowsDisabledException() {
        User user = createMockUser("dormant_user", UserStatus.INACTIVE);
        when(userRepository.findByIdentifierWithRoles("dormant_user")).thenReturn(Optional.of(user));

        LoginRequest request = new LoginRequest();
        request.setUsernameOrEmail("dormant_user");
        request.setPassword("AnyPassword");

        assertThrows(DisabledException.class, () -> {
            authService.login(request, "127.0.0.1", "JUnit-Client");
        });

        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Login on PENDING account throws DisabledException")
    void testPendingUserThrowsDisabledException() {
        User user = createMockUser("new_user", UserStatus.PENDING);
        when(userRepository.findByIdentifierWithRoles("new_user")).thenReturn(Optional.of(user));

        LoginRequest request = new LoginRequest();
        request.setUsernameOrEmail("new_user");
        request.setPassword("AnyPassword");

        assertThrows(DisabledException.class, () -> {
            authService.login(request, "127.0.0.1", "JUnit-Client");
        });

        verify(auditLogRepository, times(1)).save(any());
    }
}
