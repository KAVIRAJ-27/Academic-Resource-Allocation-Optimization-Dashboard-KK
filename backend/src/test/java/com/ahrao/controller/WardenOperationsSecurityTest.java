package com.ahrao.controller;

import com.ahrao.controller.warden.*;
import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.warden.*;
import com.ahrao.entity.enums.ComplaintStatus;
import com.ahrao.entity.enums.MaintenanceStatus;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.warden.*;
import jakarta.servlet.http.HttpServletRequest;
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
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WardenOperationsSecurityTest {

    @Mock
    private WardenResourceService wardenResourceService;

    @Mock
    private WardenComplaintService wardenComplaintService;

    @Mock
    private WardenMaintenanceService wardenMaintenanceService;

    @Mock
    private WardenOverviewService wardenOverviewService;

    @Mock
    private HttpServletRequest httpServletRequest;

    @InjectMocks
    private WardenResourceController resourceController;

    @InjectMocks
    private WardenComplaintController complaintController;

    @InjectMocks
    private WardenMaintenanceController maintenanceController;

    @InjectMocks
    private WardenController wardenController;

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
                "warden_test",
                "warden@univ.edu",
                "John",
                "Warden",
                "encodedPassword",
                UserStatus.ACTIVE,
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + role))
        );
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @Test
    @DisplayName("WardenResourceController must have @PreAuthorize('hasRole(\\'WARDEN\\')')")
    void testResourceControllerPreAuthorizeAnnotation() {
        PreAuthorize preAuth = WardenResourceController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(preAuth, "Resource controller must have @PreAuthorize annotation");
        assertEquals("hasRole('WARDEN')", preAuth.value());
    }

    @Test
    @DisplayName("WardenComplaintController must have @PreAuthorize('hasRole(\\'WARDEN\\')')")
    void testComplaintControllerPreAuthorizeAnnotation() {
        PreAuthorize preAuth = WardenComplaintController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(preAuth, "Complaint controller must have @PreAuthorize annotation");
        assertEquals("hasRole('WARDEN')", preAuth.value());
    }

    @Test
    @DisplayName("WardenMaintenanceController must have @PreAuthorize('hasRole(\\'WARDEN\\')')")
    void testMaintenanceControllerPreAuthorizeAnnotation() {
        PreAuthorize preAuth = WardenMaintenanceController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(preAuth, "Maintenance controller must have @PreAuthorize annotation");
        assertEquals("hasRole('WARDEN')", preAuth.value());
    }

    @Test
    @DisplayName("WardenController must have @PreAuthorize('hasAnyRole(\\'WARDEN\\', \\'ADMIN\\')')")
    void testWardenControllerPreAuthorizeAnnotation() {
        PreAuthorize preAuth = WardenController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(preAuth, "Warden controller must have @PreAuthorize annotation");
        assertEquals("hasAnyRole('WARDEN', 'ADMIN')", preAuth.value());
    }

    @Test
    @DisplayName("Authenticated WARDEN can list facilities via resource controller")
    void testGetFacilities_Success() {
        authenticateAs("WARDEN", 70L);
        when(wardenResourceService.getFacilities(any(), any(), any(), anyInt(), anyInt(), anyString(), anyString()))
                .thenReturn(new PagedResponse<>(List.of(new WardenFacilitySummaryDto()), 0, 15, 1, 1, true, true));

        ResponseEntity<ApiResponse<PagedResponse<WardenFacilitySummaryDto>>> response =
                resourceController.getFacilities(10L, "ACTIVE", null, 0, 15, "name", "asc");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(1, response.getBody().getData().getContent().size());
    }

    @Test
    @DisplayName("Authenticated WARDEN can update complaint status via complaint controller")
    void testUpdateComplaintStatus_Success() {
        authenticateAs("WARDEN", 70L);
        when(httpServletRequest.getRemoteAddr()).thenReturn("127.0.0.1");
        when(httpServletRequest.getHeader("User-Agent")).thenReturn("TestClient");

        UpdateComplaintStatusRequest req = new UpdateComplaintStatusRequest();
        req.setStatus(ComplaintStatus.IN_PROGRESS);

        WardenComplaintDetailDto mockDetail = new WardenComplaintDetailDto();
        mockDetail.setId(55L);
        mockDetail.setStatus(ComplaintStatus.IN_PROGRESS);

        when(wardenComplaintService.updateComplaintStatus(eq(55L), any(), any(), any())).thenReturn(mockDetail);

        ResponseEntity<ApiResponse<WardenComplaintDetailDto>> response =
                complaintController.updateComplaintStatus(55L, req, httpServletRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(ComplaintStatus.IN_PROGRESS, response.getBody().getData().getStatus());
    }

    @Test
    @DisplayName("Authenticated WARDEN can update maintenance status via maintenance controller")
    void testUpdateMaintenanceStatus_Success() {
        authenticateAs("WARDEN", 70L);
        when(httpServletRequest.getRemoteAddr()).thenReturn("127.0.0.1");
        when(httpServletRequest.getHeader("User-Agent")).thenReturn("TestClient");

        UpdateMaintenanceStatusRequest req = new UpdateMaintenanceStatusRequest();
        req.setStatus(MaintenanceStatus.IN_PROGRESS);

        WardenMaintenanceDetailDto mockDetail = new WardenMaintenanceDetailDto();
        mockDetail.setId(88L);
        mockDetail.setStatus(MaintenanceStatus.IN_PROGRESS);

        when(wardenMaintenanceService.updateMaintenanceStatus(eq(88L), any(), any(), any())).thenReturn(mockDetail);

        ResponseEntity<ApiResponse<WardenMaintenanceDetailDto>> response =
                maintenanceController.updateMaintenanceStatus(88L, req, httpServletRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(MaintenanceStatus.IN_PROGRESS, response.getBody().getData().getStatus());
    }

    @Test
    @DisplayName("Authenticated WARDEN can retrieve real overview metrics")
    void testGetWardenOverview_Success() {
        authenticateAs("WARDEN", 70L);
        WardenOverviewDto mockOverview = new WardenOverviewDto();
        mockOverview.setTotalBeds(150L);
        mockOverview.setOccupiedBeds(90L);

        when(wardenOverviewService.getWardenOverview(any())).thenReturn(mockOverview);

        ResponseEntity<ApiResponse<WardenOverviewDto>> response =
                wardenController.getWardenOverview(null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(150L, response.getBody().getData().getTotalBeds());
        assertEquals(90L, response.getBody().getData().getOccupiedBeds());
    }
}
