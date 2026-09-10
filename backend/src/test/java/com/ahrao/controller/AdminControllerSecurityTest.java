package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.user.CreateUserRequest;
import com.ahrao.dto.user.UpdateUserRequest;
import com.ahrao.dto.user.UserSummaryResponse;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminControllerSecurityTest {

    @Mock
    private UserService userService;

    @Mock
    private HttpServletRequest httpRequest;

    @InjectMocks
    private AdminController adminController;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(String role) {
        CustomUserDetails userDetails = new CustomUserDetails(
                1L,
                "admin",
                "admin@ahrao.edu",
                "System",
                "Admin",
                "hash",
                UserStatus.ACTIVE,
                List.of(new SimpleGrantedAuthority("ROLE_" + role))
        );
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("Admin user can access user list with 200 OK")
    void testAdminGetUsers_Success() {
        authenticateAs("ADMIN");

        UserSummaryResponse summary = new UserSummaryResponse(
                1L, "admin", "admin@ahrao.edu", "System", "Admin", null,
                UserStatus.ACTIVE, List.of("ADMIN"), List.of("USER_READ"),
                Instant.now(), Instant.now(), null
        );
        PagedResponse<UserSummaryResponse> mockPaged = new PagedResponse<>(
                List.of(summary), 0, 20, 1L, 1, true, true
        );

        when(userService.getUsers(any(), any(), any(), any(Pageable.class))).thenReturn(mockPaged);

        ResponseEntity<ApiResponse<PagedResponse<UserSummaryResponse>>> response =
                adminController.getUsers(null, null, null, PageRequest.of(0, 20));

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(1, response.getBody().getData().getContent().size());
        assertEquals("admin", response.getBody().getData().getContent().get(0).getUsername());
    }

    @Test
    @DisplayName("Admin controller enforces class-level PreAuthorize hasRole('ADMIN')")
    void testPreAuthorizeAnnotationEnforced() {
        PreAuthorize annotation = AdminController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(annotation, "AdminController must be annotated with @PreAuthorize");
        assertEquals("hasRole('ADMIN')", annotation.value(), "AdminController must require hasRole('ADMIN')");
    }

    @Test
    @DisplayName("Non-admin roles lack ROLE_ADMIN authority")
    void testNonAdminRolesDenied() {
        String[] nonAdminRoles = {"STUDENT", "FACULTY", "HOD", "WARDEN", "PRINCIPAL"};

        for (String role : nonAdminRoles) {
            authenticateAs(role);
            var auth = SecurityContextHolder.getContext().getAuthentication();
            boolean hasAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            assertFalse(hasAdmin, "Role " + role + " must not possess ROLE_ADMIN authority");
        }
    }

    @Test
    @DisplayName("Admin user can create user and receive 201 Created")
    void testAdminCreateUser_Success() {
        authenticateAs("ADMIN");

        CreateUserRequest request = new CreateUserRequest();
        request.setUsername("newuser");
        request.setEmail("newuser@ahrao.edu");
        request.setPassword("Password123!");
        request.setFirstName("New");
        request.setLastName("User");
        request.setRoles(Collections.singleton("STUDENT"));

        UserSummaryResponse created = new UserSummaryResponse(
                2L, "newuser", "newuser@ahrao.edu", "New", "User", null,
                UserStatus.ACTIVE, List.of("STUDENT"), Collections.emptyList(),
                Instant.now(), Instant.now(), null
        );

        when(userService.createUser(any(CreateUserRequest.class), anyString(), any(), any())).thenReturn(created);

        ResponseEntity<ApiResponse<UserSummaryResponse>> response = adminController.createUser(request, httpRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("newuser", response.getBody().getData().getUsername());
    }

    @Test
    @DisplayName("Admin user can update user and receive 200 OK")
    void testAdminUpdateUser_Success() {
        authenticateAs("ADMIN");

        UpdateUserRequest request = new UpdateUserRequest();
        request.setEmail("updated@ahrao.edu");
        request.setFirstName("Updated");
        request.setLastName("User");

        UserSummaryResponse updated = new UserSummaryResponse(
                2L, "user2", "updated@ahrao.edu", "Updated", "User", null,
                UserStatus.ACTIVE, List.of("STUDENT"), Collections.emptyList(),
                Instant.now(), Instant.now(), null
        );

        when(userService.updateUser(eq(2L), any(UpdateUserRequest.class), anyString(), any(), any())).thenReturn(updated);

        ResponseEntity<ApiResponse<UserSummaryResponse>> response = adminController.updateUser(2L, request, httpRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("updated@ahrao.edu", response.getBody().getData().getEmail());
    }
}
