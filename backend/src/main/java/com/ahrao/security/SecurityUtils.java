package com.ahrao.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Arrays;
import java.util.Optional;

/**
 * Utility helper for accessing SecurityContext, current authenticated principal, roles, and permissions.
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static Optional<Authentication> getAuthentication() {
        return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication());
    }

    public static Optional<CustomUserDetails> getCurrentUserDetails() {
        return getAuthentication()
                .filter(Authentication::isAuthenticated)
                .map(Authentication::getPrincipal)
                .filter(principal -> principal instanceof CustomUserDetails)
                .map(principal -> (CustomUserDetails) principal);
    }

    public static Optional<String> getCurrentUsername() {
        return getCurrentUserDetails().map(CustomUserDetails::getUsername);
    }

    public static Optional<Long> getCurrentUserId() {
        return getCurrentUserDetails().map(CustomUserDetails::getId);
    }

    public static boolean hasRole(String role) {
        String roleName = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        return getAuthentication()
                .filter(Authentication::isAuthenticated)
                .map(Authentication::getAuthorities)
                .map(authorities -> authorities.stream()
                        .map(GrantedAuthority::getAuthority)
                        .anyMatch(auth -> auth.equals(roleName)))
                .orElse(false);
    }

    public static boolean hasAnyRole(String... roles) {
        return Arrays.stream(roles).anyMatch(SecurityUtils::hasRole);
    }

    public static boolean hasAuthority(String authority) {
        return getAuthentication()
                .filter(Authentication::isAuthenticated)
                .map(Authentication::getAuthorities)
                .map(authorities -> authorities.stream()
                        .map(GrantedAuthority::getAuthority)
                        .anyMatch(auth -> auth.equals(authority)))
                .orElse(false);
    }
}
