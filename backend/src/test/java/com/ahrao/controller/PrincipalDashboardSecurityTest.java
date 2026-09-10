package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.principal.dashboard.PrincipalDashboardResponse;
import com.ahrao.dto.principal.dashboard.PrincipalInstitutionDto;
import com.ahrao.dto.principal.dashboard.PrincipalKpiSummaryDto;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.principal.PrincipalDashboardService;
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
class PrincipalDashboardSecurityTest {

    @Mock
    private PrincipalDashboardService principalDashboardService;

    @InjectMocks
    private PrincipalDashboardController principalDashboardController;

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
                "principal_user",
                "principal@univ.edu",
                "Jane",
                "Doe",
                "encodedPassword",
                UserStatus.ACTIVE,
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + role))
        );
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @Test
    @DisplayName("Authenticated Principal can access institution dashboard successfully")
    void testGetPrincipalDashboardSuccess() {
        authenticateAs("PRINCIPAL", 101L);

        PrincipalInstitutionDto institutionDto = new PrincipalInstitutionDto();
        institutionDto.setId(1L);
        institutionDto.setName("Apex Institute of Technology");
        institutionDto.setCode("AIT");
        institutionDto.setDepartmentCount(5L);
        institutionDto.setProgramCount(12L);
        institutionDto.setStudentCount(1200L);
        institutionDto.setFacultyCount(85L);

        PrincipalKpiSummaryDto kpiDto = new PrincipalKpiSummaryDto();
        kpiDto.setTotalDepartments(5L);
        kpiDto.setTotalStudents(1200L);
        kpiDto.setTotalFaculty(85L);
        kpiDto.setTotalPrograms(12L);
        kpiDto.setAcademicResources(45L);
        kpiDto.setPendingResourceRequests(3L);
        kpiDto.setActiveAllocations(18L);
        kpiDto.setTotalHostelBeds(400L);
        kpiDto.setOccupiedHostelBeds(320L);

        PrincipalDashboardResponse mockResponse = new PrincipalDashboardResponse();
        mockResponse.setInstitution(institutionDto);
        mockResponse.setKpiSummary(kpiDto);

        when(principalDashboardService.getDashboard(101L)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<PrincipalDashboardResponse>> response = principalDashboardController.getPrincipalDashboard();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("AIT", response.getBody().getData().getInstitution().getCode());
        assertEquals(1200L, response.getBody().getData().getKpiSummary().getTotalStudents());
        verify(principalDashboardService, times(1)).getDashboard(101L);
    }

    @Test
    @DisplayName("Unauthenticated request to getPrincipalDashboard throws UnauthorizedException")
    void testUnauthenticatedAccessThrowsUnauthorizedException() {
        SecurityContextHolder.clearContext();

        assertThrows(UnauthorizedException.class, () -> principalDashboardController.getPrincipalDashboard());
        verify(principalDashboardService, never()).getDashboard(anyLong());
    }
}
