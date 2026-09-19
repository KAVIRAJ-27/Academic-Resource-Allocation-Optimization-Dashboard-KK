package com.ahrao.controller;

import com.ahrao.dto.conflict.ConflictItemDto;
import com.ahrao.dto.hostel.allocation.HostelAllocationPreviewRequestDto;
import com.ahrao.dto.hostel.allocation.HostelAllocationRequestDto;
import com.ahrao.entity.enums.ConflictCode;
import com.ahrao.entity.enums.ConflictDomain;
import com.ahrao.entity.enums.ConflictSeverity;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.academic.allocation.AcademicAllocationService;
import com.ahrao.service.hostel.HostelResourceAllocationService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ConflictDetectionSecurityTest {

    @Mock
    private HostelResourceAllocationService hostelAllocationService;

    @Mock
    private AcademicAllocationService academicAllocationService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HttpServletRequest servletRequest;

    @InjectMocks
    private HostelResourceAllocationController hostelController;

    @InjectMocks
    private AcademicAllocationController academicController;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private User authenticateAs(String role, Long userId) {
        CustomUserDetails userDetails = new CustomUserDetails(
                userId,
                "test_user",
                "test@ahrao.edu",
                "Test",
                "User",
                "hashed_pwd",
                UserStatus.ACTIVE,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
        );
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        User mockUser = new User();
        mockUser.setId(userId);
        lenient().when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        return mockUser;
    }

    @Test
    @DisplayName("1. Unauthenticated user: security context empty triggers UnauthorizedException")
    void testUnauthenticatedUser() {
        HostelAllocationPreviewRequestDto req = new HostelAllocationPreviewRequestDto(101L);
        assertThrows(UnauthorizedException.class, () -> hostelController.previewAllocation(req));
    }

    @Test
    @DisplayName("2. Unauthorized role: Controller enforces roles: ADMIN, PRINCIPAL, HOD, WARDEN")
    void testUnauthorizedRole_PreAuthorizeCheck() {
        PreAuthorize annotation = HostelResourceAllocationController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(annotation, "@PreAuthorize must be present on controller class");
        assertFalse(annotation.value().contains("STUDENT"), "STUDENT must not have access to allocation endpoints");
        assertTrue(annotation.value().contains("WARDEN"), "WARDEN must have access");
        assertTrue(annotation.value().contains("ADMIN"), "ADMIN must have access");
    }

    @Test
    @DisplayName("3. Warden accessing another hostel: throws ConflictException with WARDEN_SCOPE_VIOLATION")
    void testWardenAccessingAnotherHostel() {
        User warden = authenticateAs("WARDEN", 200L);

        ConflictItemDto conflict = new ConflictItemDto(
                ConflictCode.WARDEN_SCOPE_VIOLATION,
                ConflictDomain.HOSTEL,
                ConflictSeverity.ERROR,
                "Hostel",
                99L,
                "Warden is not assigned to this hostel.",
                "Scope violation"
        );

        when(hostelAllocationService.allocate(any(), eq(warden), any(), any()))
                .thenThrow(new ConflictException("Warden is not assigned to this hostel.", List.of(conflict)));

        HostelAllocationRequestDto req = new HostelAllocationRequestDto();
        req.setHostelId(99L);
        req.setRoomId(101L);
        req.setBedId(1L);

        ConflictException ex = assertThrows(ConflictException.class, () -> hostelController.allocate(req, servletRequest));
        assertEquals("Warden is not assigned to this hostel.", ex.getMessage());
        assertNotNull(ex.getConflicts());
        assertEquals(ConflictCode.WARDEN_SCOPE_VIOLATION.name(), ex.getConflicts().get(0).getConflictType());
    }

    @Test
    @DisplayName("4. IDOR attempt: accessing another allocation detail throws ResourceNotFoundException")
    void testIdorAttemptOnAllocationDetail() {
        User warden = authenticateAs("WARDEN", 200L);

        when(hostelAllocationService.getAllocationById(9999L, warden))
                .thenThrow(new ResourceNotFoundException("Hostel allocation not found or out of scope for id: 9999"));

        assertThrows(ResourceNotFoundException.class, () -> hostelController.getAllocationById(9999L));
    }

    @Test
    @DisplayName("5. Direct API call bypassing frontend: server-side conflict detection still blocks allocation")
    void testDirectApiCallBypassingFrontendBlocksAllocation() {
        User warden = authenticateAs("WARDEN", 200L);

        ConflictItemDto conflict = new ConflictItemDto(
                ConflictCode.BED_ALREADY_ALLOCATED,
                ConflictDomain.HOSTEL,
                ConflictSeverity.ERROR,
                "HostelBed",
                501L,
                "The selected bed already has an active allocation.",
                "Occupied bed"
        );

        when(hostelAllocationService.allocate(any(), eq(warden), any(), any()))
                .thenThrow(new ConflictException("Allocation blocked by conflict detection.", List.of(conflict)));

        HostelAllocationRequestDto req = new HostelAllocationRequestDto();
        req.setHostelId(1L);
        req.setRoomId(101L);
        req.setBedId(501L);

        ConflictException ex = assertThrows(ConflictException.class, () -> hostelController.allocate(req, servletRequest));
        assertEquals(1, ex.getConflicts().size());
        assertEquals(ConflictCode.BED_ALREADY_ALLOCATED.name(), ex.getConflicts().get(0).getConflictType());
    }

    @Test
    @DisplayName("6. Invalid resource ID: non-existent resource throws ResourceNotFoundException")
    void testInvalidResourceIds() {
        User hod = authenticateAs("HOD", 300L);

        when(academicAllocationService.getAllocationById(8888L, hod))
                .thenThrow(new ResourceNotFoundException("Academic allocation not found with id: 8888"));

        assertThrows(ResourceNotFoundException.class, () -> academicController.getAllocationById(8888L));
    }

    @Test
    @DisplayName("7. Invalid hostel request ID: non-existent hostel request throws ResourceNotFoundException")
    void testInvalidHostelIds() {
        User warden = authenticateAs("WARDEN", 200L);

        when(hostelAllocationService.previewAllocation(any(), eq(warden)))
                .thenThrow(new ResourceNotFoundException("Hostel request not found with id: 7777"));

        HostelAllocationPreviewRequestDto req = new HostelAllocationPreviewRequestDto(7777L);
        assertThrows(ResourceNotFoundException.class, () -> hostelController.previewAllocation(req));
    }
}
