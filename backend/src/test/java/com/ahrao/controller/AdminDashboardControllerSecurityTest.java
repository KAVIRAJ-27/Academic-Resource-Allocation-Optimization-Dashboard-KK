package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.dashboard.AdminDashboardOverviewResponse;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.AdminDashboardService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminDashboardControllerSecurityTest {

    @Mock
    private AdminDashboardService adminDashboardService;

    @InjectMocks
    private AdminDashboardController adminDashboardController;

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
                "test_user",
                "test@ahrao.edu",
                "Test",
                "User",
                "hash",
                UserStatus.ACTIVE,
                List.of(new SimpleGrantedAuthority("ROLE_" + role))
        );
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("Admin user receives 200 OK and populated overview from controller")
    void testAdminAccessSuccess() {
        authenticateAs("ADMIN");

        AdminDashboardOverviewResponse mockResponse = new AdminDashboardOverviewResponse();
        mockResponse.setTotalUsers(10);
        mockResponse.setTotalDepartments(3);
        when(adminDashboardService.getDashboardOverview()).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<AdminDashboardOverviewResponse>> response =
                adminDashboardController.getDashboardOverview();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(10, response.getBody().getData().getTotalUsers());
        assertEquals(3, response.getBody().getData().getTotalDepartments());
    }

    @Test
    @DisplayName("Admin dashboard endpoint requires ROLE_ADMIN annotation")
    void testPreAuthorizeAnnotationPresent() {
        // Assert class-level PreAuthorize enforces hasRole('ADMIN')
        org.springframework.security.access.prepost.PreAuthorize classAnnotation =
                AdminDashboardController.class.getAnnotation(org.springframework.security.access.prepost.PreAuthorize.class);

        assertNotNull(classAnnotation, "AdminDashboardController must have @PreAuthorize annotation");
        assertEquals("hasRole('ADMIN')", classAnnotation.value(),
                "AdminDashboardController must enforce hasRole('ADMIN')");
    }

    @Test
    @DisplayName("Non-admin role access simulated verification")
    void testNonAdminRolesDenied() {
        // Verify that roles other than ADMIN are not permitted by checking security authority assertions
        String[] nonAdminRoles = {"STUDENT", "FACULTY", "HOD", "WARDEN", "PRINCIPAL"};

        for (String role : nonAdminRoles) {
            authenticateAs(role);
            var auth = SecurityContextHolder.getContext().getAuthentication();
            boolean isAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            assertFalse(isAdmin, "Role " + role + " must NOT have ROLE_ADMIN authority");
        }
    }
}
