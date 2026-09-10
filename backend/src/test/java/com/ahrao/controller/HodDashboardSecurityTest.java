package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.hod.dashboard.HodDashboardResponse;
import com.ahrao.dto.hod.dashboard.HodDepartmentInfoDto;
import com.ahrao.dto.hod.dashboard.HodDepartmentSummaryKpiDto;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.hod.HodDashboardService;
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
class HodDashboardSecurityTest {

    @Mock
    private HodDashboardService hodDashboardService;

    @InjectMocks
    private HodDashboardController hodDashboardController;

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
                "dr_alan_turing",
                "alan.turing@univ.edu",
                "Alan",
                "Turing",
                "encodedPassword",
                UserStatus.ACTIVE,
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + role))
        );
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @Test
    @DisplayName("Authenticated HOD can access department dashboard successfully")
    void testGetHodDashboardSuccess() {
        authenticateAs("HOD", 99L);

        HodDashboardResponse mockResponse = new HodDashboardResponse();
        HodDepartmentInfoDto deptInfo = new HodDepartmentInfoDto();
        deptInfo.setId(10L);
        deptInfo.setName("Computer Science & Engineering");
        deptInfo.setCode("CSE");
        deptInfo.setHodName("Alan Turing");
        mockResponse.setDepartment(deptInfo);

        HodDepartmentSummaryKpiDto kpi = new HodDepartmentSummaryKpiDto();
        kpi.setTotalStudents(250L);
        kpi.setTotalFaculty(18L);
        mockResponse.setSummary(kpi);

        when(hodDashboardService.getHodDashboard(99L)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<HodDashboardResponse>> response = hodDashboardController.getHodDashboard();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("CSE", response.getBody().getData().getDepartment().getCode());
        assertEquals(250L, response.getBody().getData().getSummary().getTotalStudents());
        verify(hodDashboardService, times(1)).getHodDashboard(99L);
    }

    @Test
    @DisplayName("Unauthenticated request to getHodDashboard throws UnauthorizedException")
    void testUnauthenticatedAccessDenied() {
        SecurityContextHolder.clearContext();

        assertThrows(UnauthorizedException.class, () -> hodDashboardController.getHodDashboard());
        verify(hodDashboardService, never()).getHodDashboard(anyLong());
    }
}
