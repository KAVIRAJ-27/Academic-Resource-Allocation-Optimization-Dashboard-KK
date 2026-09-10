package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.hod.HodDepartmentAssignmentItemDto;
import com.ahrao.dto.hod.HodDepartmentWorkloadOverviewDto;
import com.ahrao.dto.hod.HodFacultyWorkloadDetailDto;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.hod.HodWorkloadService;
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
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HodWorkloadSecurityTest {

    @Mock
    private HodWorkloadService hodWorkloadService;

    @InjectMocks
    private HodWorkloadController hodWorkloadController;

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
                "dr_turing",
                "turing@univ.edu",
                "Alan",
                "Turing",
                "encodedPwd",
                UserStatus.ACTIVE,
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + role))
        );
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("Authenticated HOD can access department workload overview")
    void testGetWorkloadOverview_Authenticated() {
        authenticateAs("HOD", 101L);

        HodDepartmentWorkloadOverviewDto overview = new HodDepartmentWorkloadOverviewDto();
        overview.setTotalFaculty(10);
        when(hodWorkloadService.getWorkloadOverview(101L)).thenReturn(overview);

        ResponseEntity<ApiResponse<HodDepartmentWorkloadOverviewDto>> response =
                hodWorkloadController.getWorkloadOverview();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(10, response.getBody().getData().getTotalFaculty());
        verify(hodWorkloadService, times(1)).getWorkloadOverview(101L);
    }

    @Test
    @DisplayName("Unauthenticated request to getWorkloadOverview throws UnauthorizedException")
    void testGetWorkloadOverview_Unauthenticated() {
        SecurityContextHolder.clearContext();
        assertThrows(UnauthorizedException.class, () -> hodWorkloadController.getWorkloadOverview());
    }

    @Test
    @DisplayName("Authenticated HOD can access faculty workload detail")
    void testGetFacultyWorkloadDetail_Authenticated() {
        authenticateAs("HOD", 101L);

        HodFacultyWorkloadDetailDto detail = new HodFacultyWorkloadDetailDto();
        detail.setFacultyId(55L);
        when(hodWorkloadService.getFacultyWorkloadDetail(101L, 55L)).thenReturn(detail);

        ResponseEntity<ApiResponse<HodFacultyWorkloadDetailDto>> response =
                hodWorkloadController.getFacultyWorkloadDetail(55L);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(55L, response.getBody().getData().getFacultyId());
    }

    @Test
    @DisplayName("Authenticated HOD can access department assignments overview")
    void testGetDepartmentAssignments_Authenticated() {
        authenticateAs("HOD", 101L);

        when(hodWorkloadService.getDepartmentAssignments(101L))
                .thenReturn(List.of(new HodDepartmentAssignmentItemDto()));

        ResponseEntity<ApiResponse<List<HodDepartmentAssignmentItemDto>>> response =
                hodWorkloadController.getDepartmentAssignments();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
    }
}
