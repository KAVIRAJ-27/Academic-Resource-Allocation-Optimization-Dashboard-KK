package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.hod.resource.HodApprovalActionRequest;
import com.ahrao.dto.hod.resource.HodResourceRequestDetailDto;
import com.ahrao.dto.hod.resource.HodResourceRequestOverviewKpiDto;
import com.ahrao.dto.hod.resource.HodResourceRequestSummaryDto;
import com.ahrao.entity.enums.PriorityLevel;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.hod.HodResourceRequestService;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HodResourceRequestSecurityTest {

    @Mock
    private HodResourceRequestService resourceRequestService;

    @InjectMocks
    private HodResourceRequestController controller;

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
    @DisplayName("Authenticated HOD can fetch department requests")
    void testGetDepartmentRequests() {
        authenticateAs("HOD", HOD_USER_ID);

        PagedResponse<HodResourceRequestSummaryDto> mockPaged = new PagedResponse<>(
                List.of(new HodResourceRequestSummaryDto()), 0, 10, 1, 1, true, true
        );
        when(resourceRequestService.getDepartmentRequests(
                eq(HOD_USER_ID), eq(1L), eq(2L), eq(RequestStatus.PENDING), eq(PriorityLevel.HIGH),
                eq("lab"), any(LocalDate.class), any(LocalDate.class), any(Pageable.class)
        )).thenReturn(mockPaged);

        ResponseEntity<ApiResponse<PagedResponse<HodResourceRequestSummaryDto>>> response =
                controller.getDepartmentRequests(
                        1L, 2L, RequestStatus.PENDING, PriorityLevel.HIGH, "lab",
                        LocalDate.now(), LocalDate.now(), 0, 10, "id,desc"
                );

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(1, response.getBody().getData().getContent().size());
    }

    @Test
    @DisplayName("Unauthenticated request to getDepartmentRequests throws UnauthorizedException")
    void testGetDepartmentRequests_Unauthenticated() {
        SecurityContextHolder.clearContext();
        assertThrows(UnauthorizedException.class, () ->
                controller.getDepartmentRequests(null, null, null, null, null, null, null, 0, 10, "id,desc"));
    }

    @Test
    @DisplayName("Authenticated HOD can fetch request summary KPIs")
    void testGetRequestSummary() {
        authenticateAs("HOD", HOD_USER_ID);

        HodResourceRequestOverviewKpiDto mockKpi = new HodResourceRequestOverviewKpiDto();
        mockKpi.setPendingCount(5);
        mockKpi.setApprovedCount(10);
        when(resourceRequestService.getRequestSummary(HOD_USER_ID)).thenReturn(mockKpi);

        ResponseEntity<ApiResponse<HodResourceRequestOverviewKpiDto>> response = controller.getRequestSummary();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(5, response.getBody().getData().getPendingCount());
        assertEquals(10, response.getBody().getData().getApprovedCount());
    }

    @Test
    @DisplayName("Authenticated HOD can fetch request details")
    void testGetRequestDetails() {
        authenticateAs("HOD", HOD_USER_ID);

        HodResourceRequestDetailDto detail = new HodResourceRequestDetailDto();
        detail.setId(100L);
        detail.setPurpose("Database practical exam");
        when(resourceRequestService.getRequestDetails(HOD_USER_ID, 100L)).thenReturn(detail);

        ResponseEntity<ApiResponse<HodResourceRequestDetailDto>> response = controller.getRequestDetails(100L);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Database practical exam", response.getBody().getData().getPurpose());
    }

    @Test
    @DisplayName("Authenticated HOD can approve request")
    void testApproveRequest() {
        authenticateAs("HOD", HOD_USER_ID);

        HodApprovalActionRequest actionReq = new HodApprovalActionRequest("Approved for midterm");
        HodResourceRequestDetailDto detail = new HodResourceRequestDetailDto();
        detail.setId(100L);
        detail.setStatus(RequestStatus.APPROVED);
        when(resourceRequestService.approveRequest(HOD_USER_ID, 100L, actionReq)).thenReturn(detail);

        ResponseEntity<ApiResponse<HodResourceRequestDetailDto>> response = controller.approveRequest(100L, actionReq);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(RequestStatus.APPROVED, response.getBody().getData().getStatus());
    }

    @Test
    @DisplayName("Authenticated HOD can reject request")
    void testRejectRequest() {
        authenticateAs("HOD", HOD_USER_ID);

        HodApprovalActionRequest actionReq = new HodApprovalActionRequest("Lab maintenance");
        HodResourceRequestDetailDto detail = new HodResourceRequestDetailDto();
        detail.setId(100L);
        detail.setStatus(RequestStatus.REJECTED);
        when(resourceRequestService.rejectRequest(HOD_USER_ID, 100L, actionReq)).thenReturn(detail);

        ResponseEntity<ApiResponse<HodResourceRequestDetailDto>> response = controller.rejectRequest(100L, actionReq);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(RequestStatus.REJECTED, response.getBody().getData().getStatus());
    }
}
