package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.student.hostel.request.CreateStudentHostelRequest;
import com.ahrao.dto.student.hostel.request.StudentHostelRequestDto;
import com.ahrao.dto.student.hostel.request.StudentHostelRequestSummaryCountsDto;
import com.ahrao.entity.enums.PriorityLevel;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.student.StudentHostelRequestService;
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
class StudentHostelRequestSecurityTest {

    @Mock
    private StudentHostelRequestService requestService;

    @Mock
    private HttpServletRequest httpServletRequest;

    @InjectMocks
    private StudentHostelRequestController controller;

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
    @DisplayName("StudentHostelRequestController must have @PreAuthorize('hasRole(\\'STUDENT\\')')")
    void testControllerPreAuthorizeAnnotation() {
        PreAuthorize preAuth = StudentHostelRequestController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(preAuth, "Controller must have @PreAuthorize annotation");
        assertEquals("hasRole('STUDENT')", preAuth.value());
    }

    @Test
    @DisplayName("Authenticated STUDENT can query their requests")
    void testGetMyRequestsSuccess() {
        authenticateAs("STUDENT", 50L);

        PagedResponse<StudentHostelRequestDto> mockPaged = new PagedResponse<>(
                Collections.emptyList(), 0, 20, 0, 0, true, true);
        when(requestService.getMyRequests(eq(50L), any(), any(), any(), eq(0), eq(20), eq("createdAt"), eq("desc")))
                .thenReturn(mockPaged);

        ResponseEntity<ApiResponse<PagedResponse<StudentHostelRequestDto>>> response =
                controller.getMyRequests(null, null, null, 0, 20, "createdAt", "desc");

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        verify(requestService, times(1)).getMyRequests(eq(50L), any(), any(), any(), eq(0), eq(20), eq("createdAt"), eq("desc"));
    }

    @Test
    @DisplayName("Unauthenticated request to getMyRequests throws UnauthorizedException")
    void testUnauthenticatedGetMyRequestsThrows() {
        SecurityContextHolder.clearContext();

        assertThrows(UnauthorizedException.class, () ->
                controller.getMyRequests(null, null, null, 0, 20, "createdAt", "desc"));
        verifyNoInteractions(requestService);
    }

    @Test
    @DisplayName("Authenticated STUDENT can submit a hostel request")
    void testCreateRequestSuccess() {
        authenticateAs("STUDENT", 50L);

        CreateStudentHostelRequest createReq = new CreateStudentHostelRequest(
                "ROOM_CHANGE", "Requesting room transfer to 2nd floor", PriorityLevel.HIGH);

        StudentHostelRequestDto mockDto = new StudentHostelRequestDto();
        mockDto.setId(201L);
        mockDto.setRequestType("ROOM_CHANGE");
        mockDto.setStatus(RequestStatus.PENDING);

        lenient().when(httpServletRequest.getRemoteAddr()).thenReturn("127.0.0.1");
        lenient().when(httpServletRequest.getHeader(anyString())).thenReturn("TestBrowser/1.0");
        when(requestService.createRequest(eq(50L), any(CreateStudentHostelRequest.class), any(), any()))
                .thenReturn(mockDto);

        ResponseEntity<ApiResponse<StudentHostelRequestDto>> response = controller.createRequest(createReq, httpServletRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(201L, response.getBody().getData().getId());
        verify(requestService, times(1)).createRequest(eq(50L), any(), any(), any());
    }

    @Test
    @DisplayName("Authenticated STUDENT can cancel a pending hostel request")
    void testCancelRequestSuccess() {
        authenticateAs("STUDENT", 50L);

        StudentHostelRequestDto mockDto = new StudentHostelRequestDto();
        mockDto.setId(201L);
        mockDto.setStatus(RequestStatus.CANCELLED);

        lenient().when(httpServletRequest.getRemoteAddr()).thenReturn("127.0.0.1");
        lenient().when(httpServletRequest.getHeader(anyString())).thenReturn("TestBrowser/1.0");
        when(requestService.cancelRequest(eq(50L), eq(201L), any(), any()))
                .thenReturn(mockDto);

        ResponseEntity<ApiResponse<StudentHostelRequestDto>> response = controller.cancelRequest(201L, httpServletRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(RequestStatus.CANCELLED, response.getBody().getData().getStatus());
        verify(requestService, times(1)).cancelRequest(eq(50L), eq(201L), any(), any());
    }

    @Test
    @DisplayName("Authenticated STUDENT can fetch request summary counts")
    void testGetSummaryCountsSuccess() {
        authenticateAs("STUDENT", 50L);

        StudentHostelRequestSummaryCountsDto counts = new StudentHostelRequestSummaryCountsDto(4, 1, 1, 1, 1, 0);
        when(requestService.getRequestCounts(50L)).thenReturn(counts);

        ResponseEntity<ApiResponse<StudentHostelRequestSummaryCountsDto>> response = controller.getRequestCounts();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(4, response.getBody().getData().getTotal());
        assertEquals(1, response.getBody().getData().getPending());
    }
}
