package com.ahrao.security;

/**
 * System roles for AHRAO platform authorization.
 */
public enum Role {
    ADMIN("ROLE_ADMIN"),
    PRINCIPAL("ROLE_PRINCIPAL"),
    HOD("ROLE_HOD"),
    FACULTY("ROLE_FACULTY"),
    STUDENT("ROLE_STUDENT"),
    WARDEN("ROLE_WARDEN");

    private final String authority;

    Role(String authority) {
        this.authority = authority;
    }

    public String getAuthority() {
        return authority;
    }
}
