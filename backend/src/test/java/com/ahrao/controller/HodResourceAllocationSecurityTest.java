package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.hod.resource.HodResourceAllocationDetailDto;
import com.ahrao.dto.hod.resource.HodResourceAllocationOverviewKpiDto;
import com.ahrao.dto.hod.resource.HodResourceAllocationSummaryDto;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.hod.HodResourceAllocationService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HodResourceAllocationSecurityTest {

    @Mock
    private HodResourceAllocationService allocationService;

    @InjectMocks
    private HodResourceAllocationController controller;

    private static final Long HOD_USER_ID = 101L;

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
    @DisplayName("Authenticated HOD can fetch department allocations")
    void testGetDepartmentAllocations() {
        authenticateAs("HOD", HOD_USER_ID);

        PagedResponse<HodResourceAllocationSummaryDto> mockPaged = new PagedResponse<>(
                List.of(new HodResourceAllocationSummaryDto()), 0, 10, 1, 1, true, true
        );
        when(allocationService.getDepartmentAllocations(
                eq(HOD_USER_ID), eq(5L), eq(10L), eq(AllocationStatus.ACTIVE), any(LocalDate.class), any(LocalDate.class), any(Pageable.class)
        )).thenReturn(mockPaged);

        ResponseEntity<ApiResponse<PagedResponse<HodResourceAllocationSummaryDto>>> response =
                controller.getDepartmentAllocations(5L, 10L, AllocationStatus.ACTIVE, LocalDate.now(), LocalDate.now(), 0, 10, "id,desc");

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
    }

    @Test
    @DisplayName("Unauthenticated request to getDepartmentAllocations throws UnauthorizedException")
    void testGetDepartmentAllocations_Unauthenticated() {
        SecurityContextHolder.clearContext();
        assertThrows(UnauthorizedException.class, () ->
                controller.getDepartmentAllocations(null, null, null, null, null, 0, 10, "id,desc"));
    }

    @Test
    @DisplayName("Authenticated HOD can fetch allocation summary KPIs")
    void testGetAllocationSummary() {
        authenticateAs("HOD", HOD_USER_ID);

        HodResourceAllocationOverviewKpiDto mockKpi = new HodResourceAllocationOverviewKpiDto();
        mockKpi.setTotalAllocations(25);
        mockKpi.setActiveAllocations(15);
        when(allocationService.getAllocationSummary(HOD_USER_ID)).thenReturn(mockKpi);

        ResponseEntity<ApiResponse<HodResourceAllocationOverviewKpiDto>> response = controller.getAllocationSummary();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(25, response.getBody().getData().getTotalAllocations());
        assertEquals(15, response.getBody().getData().getActiveAllocations());
    }

    @Test
    @DisplayName("Authenticated HOD can fetch allocation details")
    void testGetAllocationDetails() {
        authenticateAs("HOD", HOD_USER_ID);

        HodResourceAllocationDetailDto detail = new HodResourceAllocationDetailDto();
        detail.setId(50L);
        detail.setPurpose("Semester lab practicals");
        when(allocationService.getAllocationDetails(HOD_USER_ID, 50L)).thenReturn(detail);

        ResponseEntity<ApiResponse<HodResourceAllocationDetailDto>> response = controller.getAllocationDetails(50L);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Semester lab practicals", response.getBody().getData().getPurpose());
    }
}
