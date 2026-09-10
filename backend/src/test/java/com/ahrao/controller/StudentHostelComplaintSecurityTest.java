package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.student.hostel.complaint.CreateStudentHostelComplaint;
import com.ahrao.dto.student.hostel.complaint.StudentHostelComplaintDto;
import com.ahrao.dto.student.hostel.complaint.StudentHostelComplaintSummaryCountsDto;
import com.ahrao.entity.enums.ComplaintStatus;
import com.ahrao.entity.enums.PriorityLevel;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.student.StudentHostelComplaintService;
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

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentHostelComplaintSecurityTest {

    @Mock
    private StudentHostelComplaintService complaintService;

    @Mock
    private HttpServletRequest httpServletRequest;

    @InjectMocks
    private StudentHostelComplaintController controller;

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
    @DisplayName("StudentHostelComplaintController must have @PreAuthorize('hasRole(\\'STUDENT\\')')")
    void testControllerPreAuthorizeAnnotation() {
        PreAuthorize preAuth = StudentHostelComplaintController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(preAuth, "Controller must have @PreAuthorize annotation");
        assertEquals("hasRole('STUDENT')", preAuth.value());
    }

    @Test
    @DisplayName("Authenticated STUDENT can query their complaints")
    void testGetMyComplaintsSuccess() {
        authenticateAs("STUDENT", 50L);

        PagedResponse<StudentHostelComplaintDto> mockPaged = new PagedResponse<>(
                Collections.emptyList(), 0, 20, 0, 0, true, true);
        when(complaintService.getMyComplaints(eq(50L), any(), any(), any(), eq(0), eq(20), eq("createdAt"), eq("desc")))
                .thenReturn(mockPaged);

        ResponseEntity<ApiResponse<PagedResponse<StudentHostelComplaintDto>>> response =
                controller.getMyComplaints(null, null, null, 0, 20, "createdAt", "desc");

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        verify(complaintService, times(1)).getMyComplaints(eq(50L), any(), any(), any(), eq(0), eq(20), eq("createdAt"), eq("desc"));
    }

    @Test
    @DisplayName("Unauthenticated request to getMyComplaints throws UnauthorizedException")
    void testUnauthenticatedGetMyComplaintsThrows() {
        SecurityContextHolder.clearContext();

        assertThrows(UnauthorizedException.class, () ->
                controller.getMyComplaints(null, null, null, 0, 20, "createdAt", "desc"));
        verifyNoInteractions(complaintService);
    }

    @Test
    @DisplayName("Authenticated STUDENT can submit a hostel complaint")
    void testCreateComplaintSuccess() {
        authenticateAs("STUDENT", 50L);

        CreateStudentHostelComplaint createReq = new CreateStudentHostelComplaint(
                "ROOM", "Water tap leaking", "The bathroom tap is leaking continuously.", PriorityLevel.HIGH);

        StudentHostelComplaintDto mockDto = new StudentHostelComplaintDto();
        mockDto.setId(301L);
        mockDto.setTitle("Water tap leaking");
        mockDto.setStatus(ComplaintStatus.OPEN);

        lenient().when(httpServletRequest.getRemoteAddr()).thenReturn("127.0.0.1");
        lenient().when(httpServletRequest.getHeader(anyString())).thenReturn("TestBrowser/1.0");
        when(complaintService.createComplaint(eq(50L), any(CreateStudentHostelComplaint.class), any(), any()))
                .thenReturn(mockDto);

        ResponseEntity<ApiResponse<StudentHostelComplaintDto>> response = controller.createComplaint(createReq, httpServletRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(301L, response.getBody().getData().getId());
        verify(complaintService, times(1)).createComplaint(eq(50L), any(), any(), any());
    }

    @Test
    @DisplayName("Authenticated STUDENT can fetch complaint summary counts")
    void testGetSummaryCountsSuccess() {
        authenticateAs("STUDENT", 50L);

        StudentHostelComplaintSummaryCountsDto counts = new StudentHostelComplaintSummaryCountsDto(3, 1, 1, 1, 0, 0);
        when(complaintService.getComplaintCounts(50L)).thenReturn(counts);

        ResponseEntity<ApiResponse<StudentHostelComplaintSummaryCountsDto>> response = controller.getComplaintCounts();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(3, response.getBody().getData().getTotal());
        assertEquals(1, response.getBody().getData().getOpen());
    }
}
