package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.faculty.resource.*;
import com.ahrao.entity.enums.PriorityLevel;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.faculty.FacultyResourceRequestService;
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
class FacultyResourceRequestSecurityTest {

    @Mock
    private FacultyResourceRequestService requestService;

    @Mock
    private HttpServletRequest httpServletRequest;

    @InjectMocks
    private FacultyResourceRequestController controller;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAsFaculty(Long userId) {
        CustomUserDetails userDetails = new CustomUserDetails(
                userId,
                "prof_hopper",
                "grace.hopper@univ.edu",
                "Grace",
                "Hopper",
                "encodedPassword",
                UserStatus.ACTIVE,
                Collections.singleton(new SimpleGrantedAuthority("ROLE_FACULTY"))
        );
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @Test
    @DisplayName("FacultyResourceRequestController must have @PreAuthorize('hasRole(\\'FACULTY\\')')")
    void testControllerPreAuthorizeAnnotation() {
        PreAuthorize preAuth = FacultyResourceRequestController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(preAuth, "Controller must have @PreAuthorize annotation");
        assertEquals("hasRole('FACULTY')", preAuth.value(), "Annotation must restrict to ROLE_FACULTY");
    }

    @Test
    @DisplayName("Unauthenticated request to get requests throws UnauthorizedException")
    void testGetRequests_Unauthenticated_ThrowsUnauthorized() {
        assertThrows(UnauthorizedException.class, () ->
                controller.getMyRequests(null, null, null, null, 0, 20, "createdAt", "desc"));
        verifyNoInteractions(requestService);
    }

    @Test
    @DisplayName("Unauthenticated request to get request counts throws UnauthorizedException")
    void testGetCounts_Unauthenticated_ThrowsUnauthorized() {
        assertThrows(UnauthorizedException.class, () -> controller.getRequestCounts());
        verifyNoInteractions(requestService);
    }

    @Test
    @DisplayName("Unauthenticated request to create request throws UnauthorizedException")
    void testCreateRequest_Unauthenticated_ThrowsUnauthorized() {
        CreateFacultyResourceRequest req = new CreateFacultyResourceRequest();
        assertThrows(UnauthorizedException.class, () -> controller.createRequest(req, httpServletRequest));
        verifyNoInteractions(requestService);
    }

    @Test
    @DisplayName("Unauthenticated request to cancel request throws UnauthorizedException")
    void testCancelRequest_Unauthenticated_ThrowsUnauthorized() {
        assertThrows(UnauthorizedException.class, () -> controller.cancelRequest(10L, httpServletRequest));
        verifyNoInteractions(requestService);
    }

    @Test
    @DisplayName("Authenticated faculty creates request with authenticated ID derived from token")
    void testCreateRequest_Authenticated_Success() {
        Long facultyUserId = 55L;
        authenticateAsFaculty(facultyUserId);

        when(httpServletRequest.getHeader("X-Forwarded-For")).thenReturn("192.168.1.10");
        when(httpServletRequest.getHeader("User-Agent")).thenReturn("Mozilla/5.0");

        CreateFacultyResourceRequest req = new CreateFacultyResourceRequest();
        req.setResourceId(1L);
        req.setPurpose("Distributed Systems Lab Session");
        req.setRequestedDate(LocalDate.now().plusDays(3));
        req.setStartTime(LocalTime.of(10, 0));
        req.setEndTime(LocalTime.of(12, 0));
        req.setPriority(PriorityLevel.HIGH);

        FacultyResourceRequestDto mockDto = new FacultyResourceRequestDto();
        mockDto.setId(101L);
        mockDto.setPurpose("Distributed Systems Lab Session");
        mockDto.setStatus("PENDING");

        when(requestService.createRequest(eq(facultyUserId), any(CreateFacultyResourceRequest.class), anyString(), anyString()))
                .thenReturn(mockDto);

        ResponseEntity<ApiResponse<FacultyResourceRequestDto>> response = controller.createRequest(req, httpServletRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(101L, response.getBody().getData().getId());

        verify(requestService).createRequest(eq(facultyUserId), eq(req), eq("192.168.1.10"), eq("Mozilla/5.0"));
    }

    @Test
    @DisplayName("Authenticated faculty cancels pending request deriving requester ID from token")
    void testCancelRequest_Authenticated_Success() {
        Long facultyUserId = 55L;
        authenticateAsFaculty(facultyUserId);

        when(httpServletRequest.getHeader("X-Forwarded-For")).thenReturn(null);
        when(httpServletRequest.getRemoteAddr()).thenReturn("127.0.0.1");
        when(httpServletRequest.getHeader("User-Agent")).thenReturn("Mozilla/5.0");

        FacultyResourceRequestDto mockDto = new FacultyResourceRequestDto();
        mockDto.setId(101L);
        mockDto.setStatus("CANCELLED");

        when(requestService.cancelRequest(eq(facultyUserId), eq(101L), eq("127.0.0.1"), eq("Mozilla/5.0")))
                .thenReturn(mockDto);

        ResponseEntity<ApiResponse<FacultyResourceRequestDto>> response = controller.cancelRequest(101L, httpServletRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("CANCELLED", response.getBody().getData().getStatus());

        verify(requestService).cancelRequest(eq(facultyUserId), eq(101L), eq("127.0.0.1"), eq("Mozilla/5.0"));
    }
}
