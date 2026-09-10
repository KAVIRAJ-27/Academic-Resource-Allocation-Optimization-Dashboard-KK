package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.hod.HodStudentDetailDto;
import com.ahrao.dto.hod.HodStudentReferenceDataDto;
import com.ahrao.dto.hod.HodStudentSummaryDto;
import com.ahrao.dto.hod.HodUpdateStatusRequest;
import com.ahrao.dto.hod.HodUpdateStudentRequest;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.hod.HodStudentService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HodStudentSecurityTest {

    @Mock
    private HodStudentService hodStudentService;

    @InjectMocks
    private HodStudentController hodStudentController;

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
    @DisplayName("Authenticated HOD can access department student list")
    void testGetStudents_Authenticated() {
        authenticateAs("HOD", 101L);

        PagedResponse<HodStudentSummaryDto> mockPaged = new PagedResponse<>(
                List.of(new HodStudentSummaryDto()), 0, 20, 1, 1, true, true
        );
        when(hodStudentService.getStudents(eq(101L), any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(mockPaged);

        ResponseEntity<ApiResponse<PagedResponse<HodStudentSummaryDto>>> response =
                hodStudentController.getStudents("John", 1L, null, 3, "ACTIVE", PageRequest.of(0, 20));

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        verify(hodStudentService, times(1))
                .getStudents(eq(101L), eq("John"), eq(1L), isNull(), eq(3), eq("ACTIVE"), any(Pageable.class));
    }

    @Test
    @DisplayName("Unauthenticated request to getStudents throws UnauthorizedException")
    void testGetStudents_Unauthenticated() {
        SecurityContextHolder.clearContext();
        assertThrows(UnauthorizedException.class, () ->
                hodStudentController.getStudents(null, null, null, null, null, PageRequest.of(0, 20)));
    }

    @Test
    @DisplayName("Authenticated HOD can access student reference data")
    void testGetReferenceData_Authenticated() {
        authenticateAs("HOD", 101L);

        HodStudentReferenceDataDto refData = new HodStudentReferenceDataDto();
        when(hodStudentService.getReferenceData(101L)).thenReturn(refData);

        ResponseEntity<ApiResponse<HodStudentReferenceDataDto>> response = hodStudentController.getReferenceData();
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(hodStudentService, times(1)).getReferenceData(101L);
    }

    @Test
    @DisplayName("Authenticated HOD can update student status")
    void testUpdateStudentStatus_Authenticated() {
        authenticateAs("HOD", 101L);

        HodUpdateStatusRequest req = new HodUpdateStatusRequest("SUSPENDED");
        HodStudentSummaryDto summary = new HodStudentSummaryDto();
        summary.setId(77L);
        summary.setStatus("SUSPENDED");
        when(hodStudentService.updateStudentStatus(101L, 77L, req)).thenReturn(summary);

        ResponseEntity<ApiResponse<HodStudentSummaryDto>> response = hodStudentController.updateStudentStatus(77L, req);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("SUSPENDED", response.getBody().getData().getStatus());
    }
}
