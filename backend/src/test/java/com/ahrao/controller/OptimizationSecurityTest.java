package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.optimization.AcademicOptimizationRequestDto;
import com.ahrao.dto.optimization.HostelOptimizationRequestDto;
import com.ahrao.dto.optimization.OptimizationResultDto;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.entity.user.User;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.academic.allocation.AcademicAllocationService;
import com.ahrao.service.hostel.HostelResourceAllocationService;
import com.ahrao.service.optimization.AcademicAllocationOptimizer;
import com.ahrao.service.optimization.HostelAllocationOptimizer;
import com.ahrao.service.approval.AllocationTrackingService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OptimizationSecurityTest {

    @Mock
    private AcademicAllocationService academicAllocationService;
    @Mock
    private AcademicAllocationOptimizer academicOptimizer;
    @Mock
    private HostelResourceAllocationService hostelAllocationService;
    @Mock
    private HostelAllocationOptimizer hostelOptimizer;
    @Mock
    private AllocationTrackingService trackingService;
    @Mock
    private UserRepository userRepository;

    private AcademicAllocationController academicController;
    private HostelResourceAllocationController hostelController;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        academicController = new AcademicAllocationController(academicAllocationService, academicOptimizer, trackingService, userRepository);
        hostelController = new HostelResourceAllocationController(hostelAllocationService, hostelOptimizer, trackingService, userRepository);
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
                "encoded_password",
                UserStatus.ACTIVE,
                Collections.singleton(new SimpleGrantedAuthority(role))
        );
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("Should verify controller-level PreAuthorize security annotations")
    void testSecurityAnnotationsPresent() {
        PreAuthorize academicClassAuth = AcademicAllocationController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(academicClassAuth, "AcademicAllocationController must declare class-level @PreAuthorize");
        assertTrue(academicClassAuth.value().contains("ADMIN"));
        assertTrue(academicClassAuth.value().contains("PRINCIPAL"));
        assertTrue(academicClassAuth.value().contains("HOD"));
        assertTrue(academicClassAuth.value().contains("FACULTY"));
        assertFalse(academicClassAuth.value().contains("STUDENT"), "STUDENT must NOT have administrative academic access");

        PreAuthorize hostelClassAuth = HostelResourceAllocationController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(hostelClassAuth, "HostelResourceAllocationController must declare class-level @PreAuthorize");
        assertTrue(hostelClassAuth.value().contains("ADMIN"));
        assertTrue(hostelClassAuth.value().contains("PRINCIPAL"));
        assertTrue(hostelClassAuth.value().contains("HOD"));
        assertTrue(hostelClassAuth.value().contains("WARDEN"));
        assertFalse(hostelClassAuth.value().contains("STUDENT"), "STUDENT must NOT have administrative hostel access");
    }

    @Test
    @DisplayName("Academic optimize should block unauthenticated request")
    void testAcademicOptimize_UnauthenticatedThrows() {
        AcademicOptimizationRequestDto req = new AcademicOptimizationRequestDto(101L);
        assertThrows(UnauthorizedException.class, () -> {
            academicController.optimizeAllocation(req);
        });
        verifyNoInteractions(academicOptimizer);
    }

    @Test
    @DisplayName("Academic optimize should allow authorized user and delegate to optimizer")
    void testAcademicOptimize_AuthorizedSuccess() {
        authenticateAs("ROLE_HOD", 5L);
        User hod = new User();
        hod.setId(5L);
        hod.setUsername("hod_user");
        when(userRepository.findById(5L)).thenReturn(Optional.of(hod));

        OptimizationResultDto expectedResult = OptimizationResultDto.success(101L, 5, Collections.emptyList(), "Success");
        when(academicOptimizer.optimizeAcademicAllocation(any(), eq(hod))).thenReturn(expectedResult);

        AcademicOptimizationRequestDto req = new AcademicOptimizationRequestDto(101L);
        ResponseEntity<ApiResponse<OptimizationResultDto>> response = academicController.optimizeAllocation(req);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        verify(academicOptimizer).optimizeAcademicAllocation(any(), eq(hod));
    }

    @Test
    @DisplayName("Hostel optimize should block unauthenticated request")
    void testHostelOptimize_UnauthenticatedThrows() {
        HostelOptimizationRequestDto req = new HostelOptimizationRequestDto(201L);
        assertThrows(UnauthorizedException.class, () -> {
            hostelController.optimizeAllocation(req);
        });
        verifyNoInteractions(hostelOptimizer);
    }

    @Test
    @DisplayName("Hostel optimize should allow authorized warden and delegate to optimizer")
    void testHostelOptimize_AuthorizedSuccess() {
        authenticateAs("ROLE_WARDEN", 8L);
        User warden = new User();
        warden.setId(8L);
        warden.setUsername("warden_user");
        when(userRepository.findById(8L)).thenReturn(Optional.of(warden));

        OptimizationResultDto expectedResult = OptimizationResultDto.success(201L, 10, Collections.emptyList(), "Success");
        when(hostelOptimizer.optimizeHostelAllocation(any(), eq(warden))).thenReturn(expectedResult);

        HostelOptimizationRequestDto req = new HostelOptimizationRequestDto(201L);
        ResponseEntity<ApiResponse<OptimizationResultDto>> response = hostelController.optimizeAllocation(req);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        verify(hostelOptimizer).optimizeHostelAllocation(any(), eq(warden));
    }
}
