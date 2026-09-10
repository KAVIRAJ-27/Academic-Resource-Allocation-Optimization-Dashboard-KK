package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.faculty.academic.*;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.faculty.FacultyAcademicService;
import com.ahrao.service.faculty.FacultySubjectService;
import com.ahrao.service.faculty.FacultyTimetableService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
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
class FacultyAcademicSecurityTest {

    @Mock
    private FacultyAcademicService facultyAcademicService;

    @Mock
    private FacultySubjectService facultySubjectService;

    @Mock
    private FacultyTimetableService facultyTimetableService;

    private FacultyAcademicController academicController;
    private FacultySubjectController subjectController;
    private FacultyTimetableController timetableController;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        academicController = new FacultyAcademicController(facultyAcademicService);
        subjectController = new FacultySubjectController(facultySubjectService);
        timetableController = new FacultyTimetableController(facultyTimetableService);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAsFaculty(Long userId) {
        CustomUserDetails userDetails = new CustomUserDetails(
                userId,
                "prof_turing",
                "alan.turing@univ.edu",
                "Alan",
                "Turing",
                "encodedPassword",
                UserStatus.ACTIVE,
                Collections.singleton(new SimpleGrantedAuthority("ROLE_FACULTY"))
        );
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @Test
    @DisplayName("Faculty academics overview succeeds for authenticated faculty")
    void testGetAcademicOverview_Authenticated() {
        authenticateAsFaculty(88L);
        FacultyAcademicOverviewDto overview = new FacultyAcademicOverviewDto();
        overview.setDepartmentName("Computer Science");
        when(facultyAcademicService.getAcademicOverview(88L)).thenReturn(overview);

        ResponseEntity<ApiResponse<FacultyAcademicOverviewDto>> response = academicController.getAcademicOverview();
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Computer Science", response.getBody().getData().getDepartmentName());
        verify(facultyAcademicService, times(1)).getAcademicOverview(88L);
    }

    @Test
    @DisplayName("Faculty academics overview throws UnauthorizedException when unauthenticated")
    void testGetAcademicOverview_Unauthenticated() {
        SecurityContextHolder.clearContext();
        assertThrows(UnauthorizedException.class, () -> academicController.getAcademicOverview());
        verifyNoInteractions(facultyAcademicService);
    }

    @Test
    @DisplayName("Faculty assigned courses succeeds for authenticated faculty")
    void testGetAssignedCourses_Authenticated() {
        authenticateAsFaculty(88L);
        FacultyCourseDto course = new FacultyCourseDto();
        course.setProgramCode("BT-CSE");
        when(facultyAcademicService.getAssignedCourses(88L)).thenReturn(List.of(course));

        ResponseEntity<ApiResponse<List<FacultyCourseDto>>> response = academicController.getAssignedCourses();
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
        verify(facultyAcademicService, times(1)).getAssignedCourses(88L);
    }

    @Test
    @DisplayName("Faculty subjects list succeeds for authenticated faculty")
    void testGetAssignedSubjects_Authenticated() {
        authenticateAsFaculty(88L);
        PagedResponse<FacultySubjectDto> paged = new PagedResponse<>(Collections.emptyList(), 0, 10, 0, 0, true, true);
        when(facultySubjectService.getAssignedSubjects(eq(88L), any(), any(), any(), any())).thenReturn(paged);

        ResponseEntity<ApiResponse<PagedResponse<FacultySubjectDto>>> response =
                subjectController.getAssignedSubjects(null, null, null, 0, 10);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(facultySubjectService, times(1)).getAssignedSubjects(eq(88L), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Faculty subjects throws UnauthorizedException when unauthenticated")
    void testGetAssignedSubjects_Unauthenticated() {
        SecurityContextHolder.clearContext();
        assertThrows(UnauthorizedException.class, () -> subjectController.getAssignedSubjects(null, null, null, 0, 10));
        verifyNoInteractions(facultySubjectService);
    }

    @Test
    @DisplayName("Faculty subject details succeeds for authenticated faculty")
    void testGetSubjectDetails_Authenticated() {
        authenticateAsFaculty(88L);
        FacultySubjectDetailsDto details = new FacultySubjectDetailsDto();
        details.setSubjectCode("CS301");
        when(facultySubjectService.getSubjectDetails(88L, 301L)).thenReturn(details);

        ResponseEntity<ApiResponse<FacultySubjectDetailsDto>> response = subjectController.getSubjectDetails(301L);
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("CS301", response.getBody().getData().getSubjectCode());
        verify(facultySubjectService, times(1)).getSubjectDetails(88L, 301L);
    }

    @Test
    @DisplayName("Faculty timetable succeeds for authenticated faculty")
    void testGetTimetable_Authenticated() {
        authenticateAsFaculty(88L);
        FacultyTimetableResponseDto timetable = new FacultyTimetableResponseDto();
        timetable.setTotalEntriesCount(5);
        when(facultyTimetableService.getTimetable(eq(88L), any(), any(), any(), anyBoolean())).thenReturn(timetable);

        ResponseEntity<ApiResponse<FacultyTimetableResponseDto>> response =
                timetableController.getTimetable(null, null, null, false);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(5, response.getBody().getData().getTotalEntriesCount());
        verify(facultyTimetableService, times(1)).getTimetable(eq(88L), any(), any(), any(), eq(false));
    }

    @Test
    @DisplayName("Faculty timetable throws UnauthorizedException when unauthenticated")
    void testGetTimetable_Unauthenticated() {
        SecurityContextHolder.clearContext();
        assertThrows(UnauthorizedException.class, () -> timetableController.getTimetable(null, null, null, false));
        verifyNoInteractions(facultyTimetableService);
    }

    @Test
    @DisplayName("Faculty today's classes succeeds for authenticated faculty")
    void testGetTodayClasses_Authenticated() {
        authenticateAsFaculty(88L);
        when(facultyTimetableService.getTodayClasses(88L)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<FacultyTimetableEntryDto>>> response = timetableController.getTodayClasses();
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(facultyTimetableService, times(1)).getTodayClasses(88L);
    }
}
