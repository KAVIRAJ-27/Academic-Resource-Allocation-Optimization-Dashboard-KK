package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.academic.allocation.AcademicAllocationDetailDto;
import com.ahrao.dto.academic.allocation.CreateAcademicAllocationRequest;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.entity.user.User;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.academic.allocation.AcademicAllocationService;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AcademicAllocationSecurityTest {

    @Mock
    private AcademicAllocationService allocationService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AcademicAllocationController allocationController;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(String role, Long userId) {
        CustomUserDetails userDetails = new CustomUserDetails(
                userId,
                "test_user",
                "test@ahrao.edu",
                "Test",
                "User",
                "encodedPassword",
                UserStatus.ACTIVE,
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + role))
        );
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @Test
    @DisplayName("AcademicAllocationController must enforce @PreAuthorize on class level")
    void testControllerPreAuthorizeAnnotation() {
        PreAuthorize preAuth = AcademicAllocationController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(preAuth, "Controller must have @PreAuthorize annotation");
        assertEquals("hasAnyRole('ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY')", preAuth.value());
    }

    @Test
    @DisplayName("Allocate resource throws UnauthorizedException when unauthenticated")
    void testAllocateResource_Unauthenticated_ThrowsUnauthorized() {
        CreateAcademicAllocationRequest req = new CreateAcademicAllocationRequest(1L, 2L);
        assertThrows(UnauthorizedException.class, () -> allocationController.allocateResource(req));
    }

    @Test
    @DisplayName("Allocate resource succeeds for authenticated ADMIN")
    void testAllocateResource_Admin_Success() {
        authenticateAs("ADMIN", 100L);
        User user = new User();
        user.setId(100L);
        user.setEmail("admin@ahrao.edu");
        when(userRepository.findById(100L)).thenReturn(Optional.of(user));

        AcademicAllocationDetailDto mockDetail = new AcademicAllocationDetailDto();
        mockDetail.setId(555L);
        when(allocationService.allocateResource(any(), eq(user))).thenReturn(mockDetail);

        CreateAcademicAllocationRequest req = new CreateAcademicAllocationRequest(1L, 2L);
        ResponseEntity<ApiResponse<AcademicAllocationDetailDto>> response = allocationController.allocateResource(req);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(555L, response.getBody().getData().getId());
    }

    @Test
    @DisplayName("Allocate resource succeeds for authenticated HOD")
    void testAllocateResource_Hod_Success() {
        authenticateAs("HOD", 200L);
        User user = new User();
        user.setId(200L);
        user.setEmail("hod@ahrao.edu");
        when(userRepository.findById(200L)).thenReturn(Optional.of(user));

        AcademicAllocationDetailDto mockDetail = new AcademicAllocationDetailDto();
        mockDetail.setId(666L);
        when(allocationService.allocateResource(any(), eq(user))).thenReturn(mockDetail);

        CreateAcademicAllocationRequest req = new CreateAcademicAllocationRequest(1L, 2L);
        ResponseEntity<ApiResponse<AcademicAllocationDetailDto>> response = allocationController.allocateResource(req);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(666L, response.getBody().getData().getId());
    }

    @Test
    @DisplayName("Cancel allocation succeeds for authenticated FACULTY")
    void testCancelAllocation_Faculty_Success() {
        authenticateAs("FACULTY", 300L);
        User user = new User();
        user.setId(300L);
        user.setEmail("faculty@ahrao.edu");
        when(userRepository.findById(300L)).thenReturn(Optional.of(user));

        AcademicAllocationDetailDto mockDetail = new AcademicAllocationDetailDto();
        mockDetail.setId(777L);
        when(allocationService.cancelAllocation(eq(777L), any(), eq(user))).thenReturn(mockDetail);

        ResponseEntity<ApiResponse<AcademicAllocationDetailDto>> response = allocationController.cancelAllocation(777L, "Cancelled by faculty");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(777L, response.getBody().getData().getId());
    }
}
