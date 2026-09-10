package com.ahrao.security;

/**
 * Security constants for JWT headers, token prefix, and common endpoints.
 */
public final class SecurityConstants {

    private SecurityConstants() {
        // Prevent instantiation
    }

    public static final String TOKEN_HEADER = "Authorization";
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String ROLE_CLAIM = "role";

    public static final String[] PUBLIC_URLS = {
        "/api/health/**",
        "/api/health",
        "/health/**",
        "/health",
        "/api/auth/**",
        "/actuator/**",
        "/actuator/health/**",
        "/error"
    };

    public static final String[] ADMIN_URLS = {
        "/api/admin/**"
    };

    public static final String[] PRINCIPAL_URLS = {
        "/api/principal/**"
    };

    public static final String[] HOD_URLS = {
        "/api/hod/**"
    };

    public static final String[] FACULTY_URLS = {
        "/api/faculty/**"
    };

    public static final String[] STUDENT_URLS = {
        "/api/student/**"
    };

    public static final String[] WARDEN_URLS = {
        "/api/warden/**"
    };
}
