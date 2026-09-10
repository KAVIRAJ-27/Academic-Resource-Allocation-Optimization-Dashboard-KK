package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.hod.HodFacultyDetailDto;
import com.ahrao.dto.hod.HodFacultySummaryDto;
import com.ahrao.dto.hod.HodUpdateFacultyRequest;
import com.ahrao.dto.hod.HodUpdateStatusRequest;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.hod.HodFacultyService;
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
class HodFacultySecurityTest {

    @Mock
    private HodFacultyService hodFacultyService;

    @InjectMocks
    private HodFacultyController hodFacultyController;

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
    @DisplayName("Authenticated HOD can access department faculty list")
    void testGetFaculty_Authenticated() {
        authenticateAs("HOD", 101L);

        PagedResponse<HodFacultySummaryDto> mockPaged = new PagedResponse<>(
                List.of(new HodFacultySummaryDto()), 0, 20, 1, 1, true, true
        );
        when(hodFacultyService.getFaculty(eq(101L), any(), any(), any(Pageable.class)))
                .thenReturn(mockPaged);

        ResponseEntity<ApiResponse<PagedResponse<HodFacultySummaryDto>>> response =
                hodFacultyController.getFaculty("Ada", "ACTIVE", PageRequest.of(0, 20));

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        verify(hodFacultyService, times(1)).getFaculty(eq(101L), eq("Ada"), eq("ACTIVE"), any(Pageable.class));
    }

    @Test
    @DisplayName("Unauthenticated request to getFaculty throws UnauthorizedException")
    void testGetFaculty_Unauthenticated() {
        SecurityContextHolder.clearContext();
        assertThrows(UnauthorizedException.class, () ->
                hodFacultyController.getFaculty(null, null, PageRequest.of(0, 20)));
    }

    @Test
    @DisplayName("Authenticated HOD can view single faculty details")
    void testGetFacultyById_Authenticated() {
        authenticateAs("HOD", 101L);

        HodFacultyDetailDto detail = new HodFacultyDetailDto();
        detail.setId(55L);
        detail.setFullName("Ada Lovelace");
        when(hodFacultyService.getFacultyById(101L, 55L)).thenReturn(detail);

        ResponseEntity<ApiResponse<HodFacultyDetailDto>> response = hodFacultyController.getFacultyById(55L);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Ada Lovelace", response.getBody().getData().getFullName());
    }

    @Test
    @DisplayName("Authenticated HOD can update faculty status")
    void testUpdateFacultyStatus_Authenticated() {
        authenticateAs("HOD", 101L);

        HodUpdateStatusRequest req = new HodUpdateStatusRequest("INACTIVE");
        HodFacultySummaryDto summary = new HodFacultySummaryDto();
        summary.setId(55L);
        summary.setStatus("INACTIVE");
        when(hodFacultyService.updateFacultyStatus(101L, 55L, req)).thenReturn(summary);

        ResponseEntity<ApiResponse<HodFacultySummaryDto>> response = hodFacultyController.updateFacultyStatus(55L, req);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("INACTIVE", response.getBody().getData().getStatus());
    }
}
