package com.ahrao.security;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Objects;

/**
 * Reusable security evaluation service for ownership, scope, role, and permission authorization.
 * Accessible in Spring Security expressions via @securityEvaluationService.isOwner(...) or @security.
 */
@Service("securityEvaluationService")
public class SecurityEvaluationService {

    /**
     * Verifies if the authenticated user matches targetUserId or has global ADMIN privileges.
     */
    public boolean isOwner(Long targetUserId) {
        if (targetUserId == null) {
            return false;
        }
        if (SecurityUtils.hasRole("ADMIN")) {
            return true;
        }
        return SecurityUtils.getCurrentUserId()
                .map(currentId -> Objects.equals(currentId, targetUserId))
                .orElse(false);
    }

    /**
     * Verifies if the authenticated user matches targetUsername or has global ADMIN privileges.
     */
    public boolean isOwner(String targetUsername) {
        if (targetUsername == null || targetUsername.isBlank()) {
            return false;
        }
        if (SecurityUtils.hasRole("ADMIN")) {
            return true;
        }
        return SecurityUtils.getCurrentUsername()
                .map(currentUsername -> currentUsername.equalsIgnoreCase(targetUsername.trim()))
                .orElse(false);
    }

    /**
     * Verifies if current user has a specific role.
     */
    public boolean hasRole(String role) {
        return SecurityUtils.hasRole(role);
    }

    /**
     * Verifies if current user has any of the specified roles.
     */
    public boolean hasAnyRole(String... roles) {
        return SecurityUtils.hasAnyRole(roles);
    }

    /**
     * Verifies if current user has a fine-grained permission.
     */
    public boolean hasPermission(String permission) {
        if (SecurityUtils.hasRole("ADMIN")) {
            return true;
        }
        return SecurityUtils.hasAuthority(permission);
    }

    /**
     * Verifies if current user has any of the fine-grained permissions.
     */
    public boolean hasAnyPermission(String... permissions) {
        if (SecurityUtils.hasRole("ADMIN")) {
            return true;
        }
        return Arrays.stream(permissions).anyMatch(SecurityUtils::hasAuthority);
    }

    /**
     * Reusable check for institutional administrators (ADMIN or PRINCIPAL).
     */
    public boolean isInstitutionalAdmin() {
        return SecurityUtils.hasAnyRole("ADMIN", "PRINCIPAL");
    }

    /**
     * Reusable check for departmental authorities (ADMIN, PRINCIPAL, or HOD).
     */
    public boolean isDepartmentAuthority() {
        return SecurityUtils.hasAnyRole("ADMIN", "PRINCIPAL", "HOD");
    }

    /**
     * Departmental scope checker foundation for academic endpoints.
     */
    public boolean canAccessDepartment(Long departmentId) {
        if (departmentId == null) {
            return false;
        }
        // Institutional leadership has campus-wide departmental visibility
        if (isInstitutionalAdmin()) {
            return true;
        }
        // For HOD / Faculty, additional scoping will be integrated in Phase 4/5
        return SecurityUtils.hasAnyRole("HOD", "FACULTY");
    }

    /**
     * Residential scope checker foundation for hostel endpoints.
     */
    public boolean canAccessHostel(Long hostelId) {
        if (hostelId == null) {
            return false;
        }
        // Institutional leadership and Wardens have residential administration access
        if (SecurityUtils.hasAnyRole("ADMIN", "WARDEN", "PRINCIPAL")) {
            return true;
        }
        // Resident students have self-hostel access
        return SecurityUtils.hasRole("STUDENT");
    }
}
