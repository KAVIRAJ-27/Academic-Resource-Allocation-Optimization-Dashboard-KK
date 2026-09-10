package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.staff.FacultySummaryResponse;
import com.ahrao.dto.staff.HodSummaryResponse;
import com.ahrao.dto.staff.PrincipalResponse;
import com.ahrao.dto.staff.WardenSummaryResponse;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.staff.*;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminStaffControllerSecurityTest {

    @Mock
    private FacultyManagementService facultyManagementService;
    @Mock
    private HodManagementService hodManagementService;
    @Mock
    private PrincipalManagementService principalManagementService;
    @Mock
    private WardenManagementService wardenManagementService;
    @Mock
    private StaffReferenceService staffReferenceService;

    @InjectMocks
    private AdminFacultyController adminFacultyController;
    @InjectMocks
    private AdminHodController adminHodController;
    @InjectMocks
    private AdminPrincipalController adminPrincipalController;
    @InjectMocks
    private AdminWardenController adminWardenController;
    @InjectMocks
    private AdminStaffReferenceController adminStaffReferenceController;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(String role) {
        CustomUserDetails userDetails = new CustomUserDetails(
                1L,
                "admin",
                "admin@ahrao.edu",
                "System",
                "Administrator",
                "encodedPassword",
                UserStatus.ACTIVE,
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + role))
        );
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @Test
    @DisplayName("AdminStaff Controllers must have @PreAuthorize('hasRole(\\'ADMIN\\')') at class level")
    void testPreAuthorizeAnnotationPresentOnAllStaffControllers() {
        PreAuthorize facultyPreAuth = AdminFacultyController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(facultyPreAuth, "AdminFacultyController must have @PreAuthorize");
        assertEquals("hasRole('ADMIN')", facultyPreAuth.value());

        PreAuthorize hodPreAuth = AdminHodController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(hodPreAuth, "AdminHodController must have @PreAuthorize");
        assertEquals("hasRole('ADMIN')", hodPreAuth.value());

        PreAuthorize principalPreAuth = AdminPrincipalController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(principalPreAuth, "AdminPrincipalController must have @PreAuthorize");
        assertEquals("hasRole('ADMIN')", principalPreAuth.value());

        PreAuthorize wardenPreAuth = AdminWardenController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(wardenPreAuth, "AdminWardenController must have @PreAuthorize");
        assertEquals("hasRole('ADMIN')", wardenPreAuth.value());

        PreAuthorize refPreAuth = AdminStaffReferenceController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(refPreAuth, "AdminStaffReferenceController must have @PreAuthorize");
        assertEquals("hasRole('ADMIN')", refPreAuth.value());
    }

    @Test
    @DisplayName("Authenticated ADMIN can invoke getFaculty successfully")
    void testGetFaculty_AsAdmin_Success() {
        authenticateAs("ADMIN");

        PagedResponse<FacultySummaryResponse> paged = new PagedResponse<>(
                Collections.emptyList(), 0, 20, 0, 0, true, true);
        when(facultyManagementService.getFaculty(isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(paged);

        ResponseEntity<ApiResponse<PagedResponse<FacultySummaryResponse>>> response =
                adminFacultyController.getFaculty(null, null, null, PageRequest.of(0, 20));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
    }

    @Test
    @DisplayName("Authenticated ADMIN can invoke getHods successfully")
    void testGetHods_AsAdmin_Success() {
        authenticateAs("ADMIN");

        PagedResponse<HodSummaryResponse> paged = new PagedResponse<>(
                Collections.emptyList(), 0, 20, 0, 0, true, true);
        when(hodManagementService.getHods(isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(paged);

        ResponseEntity<ApiResponse<PagedResponse<HodSummaryResponse>>> response =
                adminHodController.getHods(null, null, null, PageRequest.of(0, 20));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
    }

    @Test
    @DisplayName("Authenticated ADMIN can invoke getWardens successfully")
    void testGetWardens_AsAdmin_Success() {
        authenticateAs("ADMIN");

        PagedResponse<WardenSummaryResponse> paged = new PagedResponse<>(
                Collections.emptyList(), 0, 20, 0, 0, true, true);
        when(wardenManagementService.getWardens(isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(paged);

        ResponseEntity<ApiResponse<PagedResponse<WardenSummaryResponse>>> response =
                adminWardenController.getWardens(null, null, null, PageRequest.of(0, 20));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
    }

    @Test
    @DisplayName("Authenticated ADMIN can invoke getCurrentPrincipal successfully")
    void testGetCurrentPrincipal_AsAdmin_Success() {
        authenticateAs("ADMIN");

        PrincipalResponse principal = new PrincipalResponse();
        principal.setFacultyName("Dr. Grace Hopper");
        when(principalManagementService.getCurrentPrincipal()).thenReturn(principal);

        ResponseEntity<ApiResponse<PrincipalResponse>> response =
                adminPrincipalController.getCurrentPrincipal();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Dr. Grace Hopper", response.getBody().getData().getFacultyName());
    }
}
