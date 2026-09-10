package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.student.resource.CreateStudentResourceRequest;
import com.ahrao.dto.student.resource.StudentResourceRequestDto;
import com.ahrao.dto.student.resource.StudentResourceRequestSummaryCountsDto;
import com.ahrao.entity.enums.PriorityLevel;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.student.StudentResourceRequestService;
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

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentResourceRequestSecurityTest {

    @Mock
    private StudentResourceRequestService requestService;

    @Mock
    private HttpServletRequest httpServletRequest;

    @InjectMocks
    private StudentResourceRequestController controller;

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
    @DisplayName("StudentResourceRequestController must have @PreAuthorize('hasRole(\\'STUDENT\\')')")
    void testControllerPreAuthorizeAnnotation() {
        PreAuthorize preAuth = StudentResourceRequestController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(preAuth, "Controller must have @PreAuthorize annotation");
        assertEquals("hasRole('STUDENT')", preAuth.value());
    }

    @Test
    @DisplayName("Authenticated STUDENT can query their requests")
    void testGetMyRequestsSuccess() {
        authenticateAs("STUDENT", 50L);

        PagedResponse<StudentResourceRequestDto> mockPaged = new PagedResponse<>(
                Collections.emptyList(), 0, 20, 0, 0, true, true);
        when(requestService.getMyRequests(eq(50L), any(), any(), any(), any(), eq(0), eq(20), eq("createdAt"), eq("desc")))
                .thenReturn(mockPaged);

        ResponseEntity<ApiResponse<PagedResponse<StudentResourceRequestDto>>> response =
                controller.getMyRequests(null, null, null, null, 0, 20, "createdAt", "desc");

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        verify(requestService, times(1)).getMyRequests(eq(50L), any(), any(), any(), any(), eq(0), eq(20), eq("createdAt"), eq("desc"));
    }

    @Test
    @DisplayName("Unauthenticated request to getMyRequests throws UnauthorizedException")
    void testUnauthenticatedGetMyRequestsThrows() {
        SecurityContextHolder.clearContext();

        assertThrows(UnauthorizedException.class, () ->
                controller.getMyRequests(null, null, null, null, 0, 20, "createdAt", "desc"));
        verifyNoInteractions(requestService);
    }

    @Test
    @DisplayName("Authenticated STUDENT can submit a resource request")
    void testCreateRequestSuccess() {
        authenticateAs("STUDENT", 50L);

        CreateStudentResourceRequest createReq = new CreateStudentResourceRequest(
                10L, LocalDate.now().plusDays(2), LocalTime.of(10, 0), LocalTime.of(12, 0),
                "Project demonstration session", PriorityLevel.MEDIUM);

        StudentResourceRequestDto mockDto = new StudentResourceRequestDto();
        mockDto.setId(101L);
        mockDto.setPurpose("Project demonstration session");
        mockDto.setStatus(RequestStatus.PENDING);

        lenient().when(httpServletRequest.getRemoteAddr()).thenReturn("127.0.0.1");
        lenient().when(httpServletRequest.getHeader(anyString())).thenReturn("TestBrowser/1.0");
        when(requestService.createRequest(eq(50L), any(CreateStudentResourceRequest.class), any(), any()))
                .thenReturn(mockDto);

        ResponseEntity<ApiResponse<StudentResourceRequestDto>> response = controller.createRequest(createReq, httpServletRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(101L, response.getBody().getData().getId());
        verify(requestService, times(1)).createRequest(eq(50L), any(), any(), any());
    }

    @Test
    @DisplayName("Authenticated STUDENT can cancel a pending request")
    void testCancelRequestSuccess() {
        authenticateAs("STUDENT", 50L);

        StudentResourceRequestDto mockDto = new StudentResourceRequestDto();
        mockDto.setId(101L);
        mockDto.setStatus(RequestStatus.CANCELLED);

        lenient().when(httpServletRequest.getRemoteAddr()).thenReturn("127.0.0.1");
        lenient().when(httpServletRequest.getHeader(anyString())).thenReturn("TestBrowser/1.0");
        when(requestService.cancelRequest(eq(50L), eq(101L), any(), any()))
                .thenReturn(mockDto);

        ResponseEntity<ApiResponse<StudentResourceRequestDto>> response = controller.cancelRequest(101L, httpServletRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(RequestStatus.CANCELLED, response.getBody().getData().getStatus());
        verify(requestService, times(1)).cancelRequest(eq(50L), eq(101L), any(), any());
    }

    @Test
    @DisplayName("Authenticated STUDENT can fetch request summary counts")
    void testGetSummaryCountsSuccess() {
        authenticateAs("STUDENT", 50L);

        StudentResourceRequestSummaryCountsDto counts = new StudentResourceRequestSummaryCountsDto(5, 2, 2, 1, 0, 0);
        when(requestService.getRequestCounts(50L)).thenReturn(counts);

        ResponseEntity<ApiResponse<StudentResourceRequestSummaryCountsDto>> response = controller.getRequestCounts();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(5, response.getBody().getData().getTotal());
        assertEquals(2, response.getBody().getData().getPending());
    }
}
