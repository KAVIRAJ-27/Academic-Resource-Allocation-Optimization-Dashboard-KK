package com.ahrao.security;

import com.ahrao.entity.enums.UserStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;
    private final String testSecret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private final long testExpiration = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(tokenProvider, "jwtSecret", testSecret);
        ReflectionTestUtils.setField(tokenProvider, "jwtExpirationMs", testExpiration);
    }

    private CustomUserDetails createTestUserDetails(String username, String role, String permission) {
        return new CustomUserDetails(
                101L,
                username,
                username + "@ahrao.edu",
                "Test",
                "User",
                "$2a$10$encodedPassword",
                UserStatus.ACTIVE,
                List.of(new SimpleGrantedAuthority("ROLE_" + role), new SimpleGrantedAuthority(permission))
        );
    }

    @Test
    @DisplayName("Generate valid JWT and verify claims")
    void testGenerateAndValidateToken() {
        CustomUserDetails userDetails = createTestUserDetails("test_faculty", "FACULTY", "ACADEMIC_READ");

        String token = tokenProvider.generateTokenFromUserDetails(userDetails);
        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));

        assertEquals("test_faculty", tokenProvider.getUsernameFromToken(token));
        assertEquals(101L, tokenProvider.getUserIdFromToken(token));
        assertTrue(tokenProvider.getRolesFromToken(token).contains("FACULTY"));
        assertTrue(tokenProvider.getPermissionsFromToken(token).contains("ACADEMIC_READ"));
    }

    @Test
    @DisplayName("Validate all six roles are serializable into JWT claims")
    void testSixRolesClaims() {
        String[] sixRoles = {"ADMIN", "PRINCIPAL", "HOD", "FACULTY", "STUDENT", "WARDEN"};

        for (String role : sixRoles) {
            CustomUserDetails userDetails = createTestUserDetails("user_" + role.toLowerCase(), role, "USER_READ");
            String token = tokenProvider.generateTokenFromUserDetails(userDetails);

            assertTrue(tokenProvider.validateToken(token));
            assertTrue(tokenProvider.getRolesFromToken(token).contains(role));
        }
    }

    @Test
    @DisplayName("Reject invalid / malformed JWT token")
    void testInvalidToken() {
        assertFalse(tokenProvider.validateToken("invalid.jwt.token"));
        assertFalse(tokenProvider.validateToken(""));
        assertFalse(tokenProvider.validateToken(null));
    }

    @Test
    @DisplayName("Reject expired JWT token")
    void testExpiredToken() {
        // Configure expiration to -1000ms (already expired)
        ReflectionTestUtils.setField(tokenProvider, "jwtExpirationMs", -1000L);

        CustomUserDetails userDetails = createTestUserDetails("expired_user", "STUDENT", "ACADEMIC_READ");
        String expiredToken = tokenProvider.generateTokenFromUserDetails(userDetails);

        assertFalse(tokenProvider.validateToken(expiredToken));
    }

    @Test
    @DisplayName("Reject token signed with different secret")
    void testTamperedSecretToken() {
        JwtTokenProvider maliciousProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(maliciousProvider, "jwtSecret", "differentSecretKeyDifferentSecretKeyDifferentSecretKey1234");
        ReflectionTestUtils.setField(maliciousProvider, "jwtExpirationMs", 3600000L);

        CustomUserDetails userDetails = createTestUserDetails("attacker", "ADMIN", "SYSTEM_ADMIN");
        String forgedToken = maliciousProvider.generateTokenFromUserDetails(userDetails);

        assertFalse(tokenProvider.validateToken(forgedToken));
    }
}
