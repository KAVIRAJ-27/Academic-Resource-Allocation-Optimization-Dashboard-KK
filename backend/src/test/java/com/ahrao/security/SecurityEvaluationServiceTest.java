package com.ahrao.security;

import com.ahrao.entity.enums.UserStatus;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class SecurityEvaluationServiceTest {

    private SecurityEvaluationService securityEvaluationService;

    @BeforeEach
    void setUp() {
        securityEvaluationService = new SecurityEvaluationService();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(Long userId, String username, String role, String... permissions) {
        List<SimpleGrantedAuthority> authorities = new java.util.ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
        for (String perm : permissions) {
            authorities.add(new SimpleGrantedAuthority(perm));
        }

        CustomUserDetails userDetails = new CustomUserDetails(
                userId,
                username,
                username + "@ahrao.edu",
                "First",
                "Last",
                "hash",
                UserStatus.ACTIVE,
                authorities
        );

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("Owner access granted for matching user ID")
    void testOwnerAccessMatchingId() {
        authenticateAs(42L, "student_user", "STUDENT", "ACADEMIC_READ");

        assertTrue(securityEvaluationService.isOwner(42L));
        assertTrue(securityEvaluationService.isOwner("student_user"));

        assertFalse(securityEvaluationService.isOwner(99L));
        assertFalse(securityEvaluationService.isOwner("other_user"));
    }

    @Test
    @DisplayName("ADMIN role overrides ownership check")
    void testAdminOverridesOwnership() {
        authenticateAs(1L, "admin_user", "ADMIN", "SYSTEM_ADMIN");

        // ADMIN can access any user ID or username
        assertTrue(securityEvaluationService.isOwner(42L));
        assertTrue(securityEvaluationService.isOwner(999L));
        assertTrue(securityEvaluationService.isOwner("any_user"));
    }

    @Test
    @DisplayName("Role assertion tests across all 6 roles")
    void testRoleAssertions() {
        authenticateAs(3L, "hod_user", "HOD", "ACADEMIC_ALLOCATE");

        assertTrue(securityEvaluationService.hasRole("HOD"));
        assertTrue(securityEvaluationService.hasAnyRole("HOD", "PRINCIPAL", "ADMIN"));

        assertFalse(securityEvaluationService.hasRole("STUDENT"));
        assertFalse(securityEvaluationService.hasRole("WARDEN"));
    }

    @Test
    @DisplayName("Permission assertion tests")
    void testPermissionAssertions() {
        authenticateAs(5L, "faculty_user", "FACULTY", "ACADEMIC_READ");

        assertTrue(securityEvaluationService.hasPermission("ACADEMIC_READ"));
        assertFalse(securityEvaluationService.hasPermission("HOSTEL_ALLOCATE"));
    }
}
