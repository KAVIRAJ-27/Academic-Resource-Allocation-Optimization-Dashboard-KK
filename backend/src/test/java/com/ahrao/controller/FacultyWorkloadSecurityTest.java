package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.faculty.workload.FacultyWorkloadResponseDto;
import com.ahrao.dto.faculty.workload.FacultyWorkloadSummaryDto;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.faculty.FacultyWorkloadService;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FacultyWorkloadSecurityTest {

    @Mock
    private FacultyWorkloadService workloadService;

    @InjectMocks
    private FacultyWorkloadController controller;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAsFaculty(Long userId) {
        CustomUserDetails userDetails = new CustomUserDetails(
                userId,
                "prof_hopper",
                "grace.hopper@univ.edu",
                "Grace",
                "Hopper",
                "encodedPassword",
                UserStatus.ACTIVE,
                Collections.singleton(new SimpleGrantedAuthority("ROLE_FACULTY"))
        );
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @Test
    @DisplayName("FacultyWorkloadController must have @PreAuthorize('hasRole(\\'FACULTY\\')')")
    void testControllerPreAuthorizeAnnotation() {
        PreAuthorize preAuth = FacultyWorkloadController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(preAuth, "Controller must have @PreAuthorize annotation");
        assertEquals("hasRole('FACULTY')", preAuth.value(), "Annotation must restrict to ROLE_FACULTY");
    }

    @Test
    @DisplayName("Unauthenticated request to get workload must throw UnauthorizedException")
    void testGetWorkload_Unauthenticated_ThrowsUnauthorized() {
        assertThrows(UnauthorizedException.class, () -> controller.getMyWorkload());
        verifyNoInteractions(workloadService);
    }

    @Test
    @DisplayName("Authenticated faculty retrieves own workload derived from Security Context")
    void testGetWorkload_Authenticated_Success() {
        Long facultyUserId = 42L;
        authenticateAsFaculty(facultyUserId);

        FacultyWorkloadResponseDto mockResponse = new FacultyWorkloadResponseDto();
        FacultyWorkloadSummaryDto summary = new FacultyWorkloadSummaryDto();
        summary.setTotalHours(java.math.BigDecimal.valueOf(16.0));
        summary.setTeachingHours(java.math.BigDecimal.valueOf(12.0));
        summary.setLabHours(java.math.BigDecimal.valueOf(4.0));
        summary.setOtherHours(java.math.BigDecimal.ZERO);
        summary.setWorkloadStatus("BALANCED");
        summary.setAssignedSubjectsCount(3);
        summary.setAssignedSectionsCount(4);
        summary.setAcademicYearName("2024-2025");
        summary.setSemesterName("Semester 1");
        mockResponse.setSummary(summary);

        when(workloadService.getWorkload(eq(facultyUserId))).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<FacultyWorkloadResponseDto>> response = controller.getMyWorkload();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(java.math.BigDecimal.valueOf(16.0), response.getBody().getData().getSummary().getTotalHours());
        assertEquals("BALANCED", response.getBody().getData().getSummary().getWorkloadStatus());

        verify(workloadService, times(1)).getWorkload(eq(facultyUserId));
    }

    @Test
    @DisplayName("Endpoint does not accept client-provided facultyId - always derives from token")
    void testGetWorkload_DerivesFromToken_NeverClientProvided() {
        Long authenticatedFacultyId = 99L;
        authenticateAsFaculty(authenticatedFacultyId);

        when(workloadService.getWorkload(eq(authenticatedFacultyId))).thenReturn(new FacultyWorkloadResponseDto());

        controller.getMyWorkload();

        // Verify service was called with token's authenticated ID 99L
        verify(workloadService).getWorkload(eq(authenticatedFacultyId));
        verify(workloadService, never()).getWorkload(eq(100L));
    }
}
