package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.student.StudentDashboardDto;
import com.ahrao.dto.student.StudentProfileDto;
import com.ahrao.dto.student.StudentProfileUpdateRequest;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.student.StudentDashboardService;
import com.ahrao.service.student.StudentProfileService;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentProfileSecurityTest {

    @Mock
    private StudentProfileService studentProfileService;

    @Mock
    private StudentDashboardService studentDashboardService;

    @Mock
    private HttpServletRequest httpServletRequest;

    @InjectMocks
    private StudentController studentController;

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
                "student_test",
                "student@univ.edu",
                "Jane",
                "Doe",
                "encodedPassword",
                UserStatus.ACTIVE,
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + role))
        );
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @Test
    @DisplayName("Authenticated STUDENT can access their own profile")
    void testGetStudentProfileSuccess() {
        authenticateAs("STUDENT", 25L);

        StudentProfileDto mockProfile = new StudentProfileDto();
        mockProfile.setUserId(25L);
        mockProfile.setFullName("Jane Doe");
        mockProfile.setRegisterNumber("REG-999");
        when(studentProfileService.getProfile(25L)).thenReturn(mockProfile);

        ResponseEntity<ApiResponse<StudentProfileDto>> response = studentController.getStudentProfile();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Jane Doe", response.getBody().getData().getFullName());
        verify(studentProfileService, times(1)).getProfile(25L);
    }

    @Test
    @DisplayName("Unauthenticated request to getProfile throws UnauthorizedException")
    void testUnauthenticatedProfileThrows() {
        SecurityContextHolder.clearContext();

        assertThrows(UnauthorizedException.class, () -> studentController.getStudentProfile());
        verifyNoInteractions(studentProfileService);
    }

    @Test
    @DisplayName("Authenticated STUDENT can update allowed personal profile fields")
    void testUpdateStudentProfileSuccess() {
        authenticateAs("STUDENT", 25L);

        StudentProfileUpdateRequest updateReq = new StudentProfileUpdateRequest("Jane", "Smith", "+1234567890");
        StudentProfileDto updatedDto = new StudentProfileDto();
        updatedDto.setUserId(25L);
        updatedDto.setFullName("Jane Smith");
        updatedDto.setPhone("+1234567890");

        lenient().when(httpServletRequest.getRemoteAddr()).thenReturn("127.0.0.1");
        lenient().when(httpServletRequest.getHeader(anyString())).thenReturn("TestBrowser/1.0");
        when(studentProfileService.updateProfile(eq(25L), any(StudentProfileUpdateRequest.class), any(), any()))
                .thenReturn(updatedDto);

        ResponseEntity<ApiResponse<StudentProfileDto>> response = studentController.updateStudentProfile(updateReq, httpServletRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Jane Smith", response.getBody().getData().getFullName());
        verify(studentProfileService, times(1)).updateProfile(eq(25L), any(), any(), any());
    }

    @Test
    @DisplayName("Authenticated STUDENT can access their dashboard")
    void testGetStudentDashboardSuccess() {
        authenticateAs("STUDENT", 25L);

        StudentDashboardDto mockDashboard = new StudentDashboardDto();
        when(studentDashboardService.getDashboard(25L)).thenReturn(mockDashboard);

        ResponseEntity<ApiResponse<StudentDashboardDto>> response = studentController.getStudentDashboard();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        verify(studentDashboardService, times(1)).getDashboard(25L);
    }

    @Test
    @DisplayName("Unauthenticated request to getDashboard throws UnauthorizedException")
    void testUnauthenticatedDashboardThrows() {
        SecurityContextHolder.clearContext();

        assertThrows(UnauthorizedException.class, () -> studentController.getStudentDashboard());
        verifyNoInteractions(studentDashboardService);
    }
}
