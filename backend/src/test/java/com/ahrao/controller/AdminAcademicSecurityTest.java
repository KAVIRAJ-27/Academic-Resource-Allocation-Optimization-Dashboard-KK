package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.academic.AcademicReferenceDataResponse;
import com.ahrao.dto.academic.DepartmentSummaryResponse;
import com.ahrao.dto.academic.InstitutionResponse;
import com.ahrao.dto.academic.ProgramSummaryResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.academic.*;
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
class AdminAcademicSecurityTest {

    @Mock
    private InstitutionManagementService institutionManagementService;
    @Mock
    private DepartmentManagementService departmentManagementService;
    @Mock
    private AcademicYearManagementService academicYearManagementService;
    @Mock
    private SemesterManagementService semesterManagementService;
    @Mock
    private ProgramManagementService programManagementService;
    @Mock
    private SubjectManagementService subjectManagementService;
    @Mock
    private SectionManagementService sectionManagementService;
    @Mock
    private AcademicReferenceService academicReferenceService;

    @InjectMocks
    private AdminInstitutionController adminInstitutionController;
    @InjectMocks
    private AdminDepartmentController adminDepartmentController;
    @InjectMocks
    private AdminAcademicYearController adminAcademicYearController;
    @InjectMocks
    private AdminSemesterController adminSemesterController;
    @InjectMocks
    private AdminProgramController adminProgramController;
    @InjectMocks
    private AdminSubjectController adminSubjectController;
    @InjectMocks
    private AdminSectionController adminSectionController;
    @InjectMocks
    private AdminAcademicReferenceController adminAcademicReferenceController;

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
    @DisplayName("All Academic Controllers must have @PreAuthorize('hasRole(\\'ADMIN\\')') at class level")
    void testPreAuthorizeAnnotationPresentOnAllAcademicControllers() {
        PreAuthorize instPreAuth = AdminInstitutionController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(instPreAuth);
        assertEquals("hasRole('ADMIN')", instPreAuth.value());

        PreAuthorize deptPreAuth = AdminDepartmentController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(deptPreAuth);
        assertEquals("hasRole('ADMIN')", deptPreAuth.value());

        PreAuthorize yearPreAuth = AdminAcademicYearController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(yearPreAuth);
        assertEquals("hasRole('ADMIN')", yearPreAuth.value());

        PreAuthorize semPreAuth = AdminSemesterController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(semPreAuth);
        assertEquals("hasRole('ADMIN')", semPreAuth.value());

        PreAuthorize progPreAuth = AdminProgramController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(progPreAuth);
        assertEquals("hasRole('ADMIN')", progPreAuth.value());

        PreAuthorize subjPreAuth = AdminSubjectController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(subjPreAuth);
        assertEquals("hasRole('ADMIN')", subjPreAuth.value());

        PreAuthorize secPreAuth = AdminSectionController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(secPreAuth);
        assertEquals("hasRole('ADMIN')", secPreAuth.value());

        PreAuthorize refPreAuth = AdminAcademicReferenceController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(refPreAuth);
        assertEquals("hasRole('ADMIN')", refPreAuth.value());
    }

    @Test
    @DisplayName("Authenticated ADMIN can invoke getInstitution successfully")
    void testGetInstitution_AsAdmin_Success() {
        authenticateAs("ADMIN");

        InstitutionResponse inst = new InstitutionResponse();
        inst.setName("AHRAO Tech");
        when(institutionManagementService.getInstitution()).thenReturn(inst);

        ResponseEntity<ApiResponse<InstitutionResponse>> response =
                adminInstitutionController.getInstitution();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("AHRAO Tech", response.getBody().getData().getName());
    }

    @Test
    @DisplayName("Authenticated ADMIN can invoke getDepartments successfully")
    void testGetDepartments_AsAdmin_Success() {
        authenticateAs("ADMIN");

        PagedResponse<DepartmentSummaryResponse> paged = new PagedResponse<>(
                Collections.emptyList(), 0, 20, 0, 0, true, true);
        when(departmentManagementService.getDepartments(isNull(), isNull(), any(Pageable.class)))
                .thenReturn(paged);

        ResponseEntity<ApiResponse<PagedResponse<DepartmentSummaryResponse>>> response =
                adminDepartmentController.getDepartments(null, null, PageRequest.of(0, 20));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
    }

    @Test
    @DisplayName("Authenticated ADMIN can invoke getPrograms successfully")
    void testGetPrograms_AsAdmin_Success() {
        authenticateAs("ADMIN");

        PagedResponse<ProgramSummaryResponse> paged = new PagedResponse<>(
                Collections.emptyList(), 0, 20, 0, 0, true, true);
        when(programManagementService.getPrograms(isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(paged);

        ResponseEntity<ApiResponse<PagedResponse<ProgramSummaryResponse>>> response =
                adminProgramController.getPrograms(null, null, null, PageRequest.of(0, 20));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
    }

    @Test
    @DisplayName("Authenticated ADMIN can invoke getReferenceData successfully")
    void testGetReferenceData_AsAdmin_Success() {
        authenticateAs("ADMIN");

        AcademicReferenceDataResponse refData = new AcademicReferenceDataResponse();
        when(academicReferenceService.getReferenceData()).thenReturn(refData);

        ResponseEntity<ApiResponse<AcademicReferenceDataResponse>> response =
                adminAcademicReferenceController.getReferenceData();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
    }
}
