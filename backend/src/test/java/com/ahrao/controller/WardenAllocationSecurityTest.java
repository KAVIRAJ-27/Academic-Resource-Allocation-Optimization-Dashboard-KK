package com.ahrao.controller;

import com.ahrao.controller.warden.*;
import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.warden.CreateHostelAllocationRequest;
import com.ahrao.dto.warden.WardenAllocationDetailDto;
import com.ahrao.dto.warden.WardenAllocationSummaryDto;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.warden.WardenAllocationService;
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

import java.time.LocalDate;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WardenAllocationSecurityTest {

    @Mock
    private WardenAllocationService wardenAllocationService;

    @Mock
    private HttpServletRequest httpServletRequest;

    @InjectMocks
    private WardenAllocationController allocationController;

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
    @DisplayName("WardenAllocationController must have @PreAuthorize('hasRole(\\'WARDEN\\')')")
    void testAllocationControllerPreAuthorizeAnnotation() {
        PreAuthorize preAuth = WardenAllocationController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(preAuth, "Allocation controller must have @PreAuthorize annotation");
        assertEquals("hasRole('WARDEN')", preAuth.value());
    }

    @Test
    @DisplayName("WardenRoomController must have @PreAuthorize('hasRole(\\'WARDEN\\')')")
    void testRoomControllerPreAuthorizeAnnotation() {
        PreAuthorize preAuth = WardenRoomController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(preAuth, "Room controller must have @PreAuthorize annotation");
        assertEquals("hasRole('WARDEN')", preAuth.value());
    }

    @Test
    @DisplayName("WardenBedController must have @PreAuthorize('hasRole(\\'WARDEN\\')')")
    void testBedControllerPreAuthorizeAnnotation() {
        PreAuthorize preAuth = WardenBedController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(preAuth, "Bed controller must have @PreAuthorize annotation");
        assertEquals("hasRole('WARDEN')", preAuth.value());
    }

    @Test
    @DisplayName("WardenHostelController must have @PreAuthorize('hasRole(\\'WARDEN\\')')")
    void testHostelControllerPreAuthorizeAnnotation() {
        PreAuthorize preAuth = WardenHostelController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(preAuth, "Hostel controller must have @PreAuthorize annotation");
        assertEquals("hasRole('WARDEN')", preAuth.value());
    }

    @Test
    @DisplayName("WardenStudentController must have @PreAuthorize('hasRole(\\'WARDEN\\')')")
    void testStudentControllerPreAuthorizeAnnotation() {
        PreAuthorize preAuth = WardenStudentController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(preAuth, "Student controller must have @PreAuthorize annotation");
        assertEquals("hasRole('WARDEN')", preAuth.value());
    }

    @Test
    @DisplayName("Authenticated WARDEN can create bed allocation via controller")
    void testCreateAllocation_Success() {
        authenticateAs("WARDEN", 70L);
        CreateHostelAllocationRequest req = new CreateHostelAllocationRequest(100L, 50L, 1L, LocalDate.now(), null);
        WardenAllocationSummaryDto mockSummary = new WardenAllocationSummaryDto();
        mockSummary.setId(999L);

        when(httpServletRequest.getRemoteAddr()).thenReturn("127.0.0.1");
        when(httpServletRequest.getHeader("User-Agent")).thenReturn("Mozilla/5.0");
        when(wardenAllocationService.createAllocation(any(), eq("127.0.0.1"), eq("Mozilla/5.0")))
                .thenReturn(mockSummary);

        ResponseEntity<ApiResponse<WardenAllocationSummaryDto>> response =
                allocationController.createAllocation(req, httpServletRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(999L, response.getBody().getData().getId());
    }

    @Test
    @DisplayName("Authenticated WARDEN can release allocation via controller")
    void testReleaseAllocation_Success() {
        authenticateAs("WARDEN", 70L);
        WardenAllocationSummaryDto mockSummary = new WardenAllocationSummaryDto();
        mockSummary.setId(500L);

        when(httpServletRequest.getRemoteAddr()).thenReturn("127.0.0.1");
        when(httpServletRequest.getHeader("User-Agent")).thenReturn("Mozilla/5.0");
        when(wardenAllocationService.releaseAllocation(eq(500L), eq("127.0.0.1"), eq("Mozilla/5.0")))
                .thenReturn(mockSummary);

        ResponseEntity<ApiResponse<WardenAllocationSummaryDto>> response =
                allocationController.releaseAllocation(500L, httpServletRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(500L, response.getBody().getData().getId());
    }

    @Test
    @DisplayName("Authenticated WARDEN can fetch allocation details by ID")
    void testGetAllocationById_Success() {
        authenticateAs("WARDEN", 70L);
        WardenAllocationDetailDto mockDetail = new WardenAllocationDetailDto();
        mockDetail.setId(500L);

        when(wardenAllocationService.getAllocationById(500L)).thenReturn(mockDetail);

        ResponseEntity<ApiResponse<WardenAllocationDetailDto>> response =
                allocationController.getAllocationById(500L);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(500L, response.getBody().getData().getId());
    }
}
