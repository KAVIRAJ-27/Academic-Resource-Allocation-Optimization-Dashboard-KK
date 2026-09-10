package com.ahrao.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;

class PasswordSecurityTest {

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Test
    @DisplayName("BCrypt hashing creates distinct salts and verifies correctly")
    void testBCryptHashingAndVerification() {
        String rawPassword = "SecurePassword@2026";

        String hash1 = passwordEncoder.encode(rawPassword);
        String hash2 = passwordEncoder.encode(rawPassword);

        // Assert BCrypt salt diversity
        assertNotEquals(hash1, hash2, "BCrypt must produce distinct salt hashes for same password");

        // Verify valid match
        assertTrue(passwordEncoder.matches(rawPassword, hash1));
        assertTrue(passwordEncoder.matches(rawPassword, hash2));

        // Reject invalid match
        assertFalse(passwordEncoder.matches("WrongPassword@2026", hash1));
        assertFalse(passwordEncoder.matches("securepassword@2026", hash1)); // Case sensitivity
    }

    @Test
    @DisplayName("Reject plaintext passwords and verify hash format")
    void testBCryptPrefixFormat() {
        String rawPassword = "Admin@123";
        String encoded = passwordEncoder.encode(rawPassword);

        // Standard BCrypt format starts with $2a$ or $2b$
        assertTrue(encoded.startsWith("$2a$") || encoded.startsWith("$2b$"));
        assertEquals(60, encoded.length(), "BCrypt hash must be 60 characters long");
    }
}
