package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.student.academic.StudentAcademicOverviewDto;
import com.ahrao.dto.student.academic.StudentAcademicResponse;
import com.ahrao.dto.student.academic.StudentSubjectDetailsDto;
import com.ahrao.dto.student.academic.StudentSubjectDto;
import com.ahrao.dto.student.academic.StudentTimetableEntryDto;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.student.StudentAcademicService;
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
class StudentAcademicSecurityTest {

    @Mock
    private StudentAcademicService studentAcademicService;

    @InjectMocks
    private StudentAcademicController studentAcademicController;

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
                "alex_student",
                "alex@univ.edu",
                "Alex",
                "Mercer",
                "encodedPassword",
                UserStatus.ACTIVE,
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + role))
        );
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @Test
    @DisplayName("StudentAcademicController must have @PreAuthorize('hasRole(\\'STUDENT\\')') annotation")
    void testPreAuthorizeAnnotationPresent() {
        PreAuthorize preAuth = StudentAcademicController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(preAuth, "StudentAcademicController must have @PreAuthorize");
        assertEquals("hasRole('STUDENT')", preAuth.value());
    }

    @Test
    @DisplayName("Authenticated STUDENT can access academic overview")
    void testGetAcademicOverviewSuccess() {
        authenticateAs("STUDENT", 10L);

        StudentAcademicResponse mockResponse = new StudentAcademicResponse(
                new StudentAcademicOverviewDto(), Collections.emptyList(), Collections.emptyList(), List.of(1, 2), 0);
        when(studentAcademicService.getAcademicOverview(10L)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<StudentAcademicResponse>> response = studentAcademicController.getAcademicOverview();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        verify(studentAcademicService, times(1)).getAcademicOverview(10L);
    }

    @Test
    @DisplayName("Unauthenticated request should throw UnauthorizedException")
    void testUnauthenticatedOverviewAccessThrows() {
        SecurityContextHolder.clearContext();

        assertThrows(UnauthorizedException.class, () -> studentAcademicController.getAcademicOverview());
        verifyNoInteractions(studentAcademicService);
    }

    @Test
    @DisplayName("Authenticated STUDENT can query subjects with pagination")
    void testGetSubjectsSuccess() {
        authenticateAs("STUDENT", 10L);

        PagedResponse<StudentSubjectDto> mockPaged = new PagedResponse<>(
                Collections.emptyList(), 0, 20, 0, 0, true, true);
        when(studentAcademicService.getStudentSubjects(eq(10L), any(), any(), any(), any(), any()))
                .thenReturn(mockPaged);

        ResponseEntity<ApiResponse<PagedResponse<StudentSubjectDto>>> response =
                studentAcademicController.getSubjects("CS", 6, null, "ACTIVE", 0, 20, "code", "asc");

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(studentAcademicService, times(1)).getStudentSubjects(eq(10L), eq("CS"), eq(6), any(), eq("ACTIVE"), any());
    }

    @Test
    @DisplayName("Authenticated STUDENT can query timetable")
    void testGetTimetableSuccess() {
        authenticateAs("STUDENT", 10L);

        when(studentAcademicService.getStudentTimetable(10L)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<StudentTimetableEntryDto>>> response =
                studentAcademicController.getTimetable();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(studentAcademicService, times(1)).getStudentTimetable(10L);
    }
}
