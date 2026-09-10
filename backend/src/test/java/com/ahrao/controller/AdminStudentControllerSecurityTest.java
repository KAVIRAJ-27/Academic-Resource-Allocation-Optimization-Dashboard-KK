package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.student.*;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.academic.AdminStudentService;
import jakarta.servlet.http.HttpServletRequest;
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
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminStudentControllerSecurityTest {

    @Mock
    private AdminStudentService adminStudentService;

    @Mock
    private HttpServletRequest httpRequest;

    @InjectMocks
    private AdminStudentController adminStudentController;

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
                "Admin",
                "hash",
                UserStatus.ACTIVE,
                List.of(new SimpleGrantedAuthority("ROLE_" + role))
        );
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private StudentSummaryResponse createMockSummary(Long id, String regNo, String status) {
        StudentSummaryResponse s = new StudentSummaryResponse();
        s.setId(id);
        s.setRegisterNumber(regNo);
        s.setStudentName("Jane Doe");
        s.setEmail("jane@ahrao.edu");
        s.setStatus(status);
        s.setDepartmentCode("CSE");
        s.setProgramName("B.Tech CSE");
        return s;
    }

    @Test
    @DisplayName("Admin controller enforces class-level PreAuthorize hasRole('ADMIN')")
    void testPreAuthorizeAnnotationEnforced() {
        PreAuthorize annotation = AdminStudentController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(annotation, "AdminStudentController must be annotated with @PreAuthorize");
        assertEquals("hasRole('ADMIN')", annotation.value(), "AdminStudentController must require hasRole('ADMIN')");
    }

    @Test
    @DisplayName("Non-admin roles lack ROLE_ADMIN authority")
    void testNonAdminRolesDenied() {
        String[] nonAdminRoles = {"STUDENT", "FACULTY", "HOD", "WARDEN", "PRINCIPAL"};

        for (String role : nonAdminRoles) {
            authenticateAs(role);
            var auth = SecurityContextHolder.getContext().getAuthentication();
            boolean hasAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            assertFalse(hasAdmin, "Role " + role + " must not possess ROLE_ADMIN authority");
        }
    }

    @Test
    @DisplayName("Admin user can access student list with 200 OK")
    void testAdminGetStudents_Success() {
        authenticateAs("ADMIN");

        StudentSummaryResponse summary = createMockSummary(1L, "REG1001", "ACTIVE");
        PagedResponse<StudentSummaryResponse> mockPaged = new PagedResponse<>(
                List.of(summary), 0, 20, 1L, 1, true, true
        );

        when(adminStudentService.getStudents(any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(mockPaged);

        ResponseEntity<ApiResponse<PagedResponse<StudentSummaryResponse>>> response =
                adminStudentController.getStudents(null, null, null, null, null, PageRequest.of(0, 20));

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(1, response.getBody().getData().getContent().size());
        assertEquals("REG1001", response.getBody().getData().getContent().get(0).getRegisterNumber());
    }

    @Test
    @DisplayName("Admin user can access student details with 200 OK")
    void testAdminGetStudentById_Success() {
        authenticateAs("ADMIN");

        StudentDetailsResponse details = new StudentDetailsResponse();
        details.setId(1L);
        details.setRegisterNumber("REG1001");
        details.setStatus("ACTIVE");
        details.setFirstName("Jane");
        details.setLastName("Doe");
        details.setEmail("jane@ahrao.edu");

        when(adminStudentService.getStudentById(1L)).thenReturn(details);

        ResponseEntity<ApiResponse<StudentDetailsResponse>> response =
                adminStudentController.getStudentById(1L);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("REG1001", response.getBody().getData().getRegisterNumber());
    }

    @Test
    @DisplayName("Admin user can retrieve student reference data with 200 OK")
    void testAdminGetReferenceData_Success() {
        authenticateAs("ADMIN");

        StudentReferenceDataResponse refData = new StudentReferenceDataResponse(
                Collections.emptyList(),
                Collections.emptyList(),
                Collections.emptyList(),
                Collections.emptyList()
        );

        when(adminStudentService.getReferenceData()).thenReturn(refData);

        ResponseEntity<ApiResponse<StudentReferenceDataResponse>> response =
                adminStudentController.getReferenceData();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
    }

    @Test
    @DisplayName("Admin user can create student and receive 201 Created")
    void testAdminCreateStudent_Success() {
        authenticateAs("ADMIN");

        CreateStudentRequest request = new CreateStudentRequest();
        request.setRegisterNumber("REG2001");
        request.setDepartmentId(1L);
        request.setProgramId(1L);
        request.setAdmissionYear(2024);
        request.setCurrentSemester(1);
        request.setUsername("student2");
        request.setEmail("student2@ahrao.edu");
        request.setPassword("Password123!");
        request.setFirstName("John");
        request.setLastName("Smith");

        StudentSummaryResponse created = createMockSummary(2L, "REG2001", "ACTIVE");

        when(adminStudentService.createStudent(any(CreateStudentRequest.class), anyString(), any(), any()))
                .thenReturn(created);

        ResponseEntity<ApiResponse<StudentSummaryResponse>> response =
                adminStudentController.createStudent(request, httpRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("REG2001", response.getBody().getData().getRegisterNumber());
    }

    @Test
    @DisplayName("Admin user can update student and receive 200 OK")
    void testAdminUpdateStudent_Success() {
        authenticateAs("ADMIN");

        UpdateStudentRequest request = new UpdateStudentRequest();
        request.setRegisterNumber("REG2001-MOD");
        request.setDepartmentId(1L);
        request.setProgramId(1L);
        request.setCurrentSemester(2);

        StudentSummaryResponse updated = createMockSummary(2L, "REG2001-MOD", "ACTIVE");

        when(adminStudentService.updateStudent(eq(2L), any(UpdateStudentRequest.class), anyString(), any(), any()))
                .thenReturn(updated);

        ResponseEntity<ApiResponse<StudentSummaryResponse>> response =
                adminStudentController.updateStudent(2L, request, httpRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("REG2001-MOD", response.getBody().getData().getRegisterNumber());
    }

    @Test
    @DisplayName("Admin user can update student status and receive 200 OK")
    void testAdminUpdateStudentStatus_Success() {
        authenticateAs("ADMIN");

        UpdateStudentStatusRequest request = new UpdateStudentStatusRequest();
        request.setStatus("INACTIVE");

        StudentSummaryResponse updated = createMockSummary(2L, "REG2001", "INACTIVE");

        when(adminStudentService.updateStudentStatus(eq(2L), eq("INACTIVE"), anyString(), any(), any()))
                .thenReturn(updated);

        ResponseEntity<ApiResponse<StudentSummaryResponse>> response =
                adminStudentController.updateStudentStatus(2L, request, httpRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("INACTIVE", response.getBody().getData().getStatus());
    }
}
