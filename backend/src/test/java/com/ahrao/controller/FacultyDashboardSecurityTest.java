package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.faculty.dashboard.FacultyDashboardDto;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.faculty.FacultyDashboardService;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FacultyDashboardSecurityTest {

    @Mock
    private FacultyDashboardService facultyDashboardService;

    @InjectMocks
    private FacultyDashboardController facultyDashboardController;

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
                "prof_hopper",
                "grace.hopper@univ.edu",
                "Grace",
                "Hopper",
                "encodedPassword",
                UserStatus.ACTIVE,
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + role))
        );
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @Test
    @DisplayName("Authenticated FACULTY can access their own dashboard telemetry")
    void testGetFacultyDashboardSuccess() {
        authenticateAs("FACULTY", 77L);

        FacultyDashboardDto mockDashboard = new FacultyDashboardDto();
        FacultyDashboardDto.FacultySummaryDto profile = new FacultyDashboardDto.FacultySummaryDto();
        profile.setFullName("Grace Hopper");
        profile.setEmployeeId("FAC-0077");
        mockDashboard.setProfile(profile);

        when(facultyDashboardService.getDashboard(77L)).thenReturn(mockDashboard);

        ResponseEntity<ApiResponse<FacultyDashboardDto>> response = facultyDashboardController.getDashboard();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Grace Hopper", response.getBody().getData().getProfile().getFullName());
        verify(facultyDashboardService, times(1)).getDashboard(77L);
    }

    @Test
    @DisplayName("Unauthenticated request to getDashboard throws UnauthorizedException")
    void testUnauthenticatedDashboardThrows() {
        SecurityContextHolder.clearContext();

        assertThrows(UnauthorizedException.class, () -> facultyDashboardController.getDashboard());
        verifyNoInteractions(facultyDashboardService);
    }
}
