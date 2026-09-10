package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.principal.dashboard.PrincipalInstitutionDto;
import com.ahrao.dto.principal.monitoring.PrincipalMonitoringResponse;
import com.ahrao.dto.principal.monitoring.PrincipalMonitoringSummaryDto;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.principal.PrincipalMonitoringService;
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
class PrincipalMonitoringSecurityTest {

    @Mock
    private PrincipalMonitoringService principalMonitoringService;

    @InjectMocks
    private PrincipalMonitoringController principalMonitoringController;

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
    @DisplayName("Authenticated Principal can access institution monitoring overview")
    void testGetPrincipalMonitoringSuccess() {
        authenticateAs("PRINCIPAL", 101L);

        PrincipalMonitoringSummaryDto summaryDto = new PrincipalMonitoringSummaryDto();
        summaryDto.setTotalDepartments(5L);
        summaryDto.setTotalStudents(1200L);
        summaryDto.setTotalFaculty(85L);
        summaryDto.setPendingApprovals(2L);
        summaryDto.setPendingRequests(4L);
        summaryDto.setActiveAllocations(10L);

        PrincipalMonitoringResponse mockResponse = new PrincipalMonitoringResponse();
        mockResponse.setSummary(summaryDto);

        when(principalMonitoringService.getMonitoring(101L)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<PrincipalMonitoringResponse>> response = principalMonitoringController.getMonitoringOverview();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(5L, response.getBody().getData().getSummary().getTotalDepartments());

        verify(principalMonitoringService, times(1)).getMonitoring(101L);
    }

    @Test
    @DisplayName("Unauthenticated request throws UnauthorizedException")
    void testGetPrincipalMonitoringUnauthenticatedThrows() {
        assertThrows(UnauthorizedException.class, () -> {
            principalMonitoringController.getMonitoringOverview();
        });

        verifyNoInteractions(principalMonitoringService);
    }
}
