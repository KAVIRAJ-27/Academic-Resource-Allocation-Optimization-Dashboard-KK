package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.student.hostel.StudentHostelAllocationDto;
import com.ahrao.dto.student.hostel.StudentHostelAllocationHistoryDto;
import com.ahrao.dto.student.hostel.StudentHostelResponse;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.student.StudentHostelService;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentHostelSecurityTest {

    @Mock
    private StudentHostelService studentHostelService;

    @InjectMocks
    private StudentHostelController controller;

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
    @DisplayName("StudentHostelController must have @PreAuthorize('hasRole(\\'STUDENT\\')')")
    void testControllerPreAuthorizeAnnotation() {
        PreAuthorize preAuth = StudentHostelController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(preAuth, "Controller must have @PreAuthorize annotation");
        assertEquals("hasRole('STUDENT')", preAuth.value());
    }

    @Test
    @DisplayName("Authenticated STUDENT can fetch their hostel details")
    void testGetStudentHostelSuccess() {
        authenticateAs("STUDENT", 50L);

        StudentHostelResponse mockResponse = new StudentHostelResponse();
        mockResponse.setAllocated(true);
        StudentHostelAllocationDto alloc = new StudentHostelAllocationDto();
        alloc.setId(10L);
        alloc.setStatus("ACTIVE");
        mockResponse.setCurrentAllocation(alloc);

        when(studentHostelService.getStudentHostel(50L)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<StudentHostelResponse>> response = controller.getStudentHostel();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertTrue(response.getBody().getData().isAllocated());
        assertEquals(10L, response.getBody().getData().getCurrentAllocation().getId());
        verify(studentHostelService, times(1)).getStudentHostel(50L);
    }

    @Test
    @DisplayName("Unauthenticated request to getStudentHostel throws UnauthorizedException")
    void testUnauthenticatedGetStudentHostelThrows() {
        SecurityContextHolder.clearContext();

        assertThrows(UnauthorizedException.class, () -> controller.getStudentHostel());
        verifyNoInteractions(studentHostelService);
    }

    @Test
    @DisplayName("Authenticated STUDENT can fetch allocation history")
    void testGetStudentHostelHistorySuccess() {
        authenticateAs("STUDENT", 50L);

        when(studentHostelService.getStudentHostelHistory(50L)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<StudentHostelAllocationHistoryDto>>> response =
                controller.getStudentHostelHistory();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        verify(studentHostelService, times(1)).getStudentHostelHistory(50L);
    }
}
