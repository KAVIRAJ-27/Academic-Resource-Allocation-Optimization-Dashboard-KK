package com.ahrao.controller;

import com.ahrao.dto.approval.ApprovalActionRequestDto;
import com.ahrao.dto.approval.CreateApprovalRequestDto;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.approval.ApprovalService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ApprovalSecurityTest {

    @Mock
    private ApprovalService approvalService;

    @Mock
    private UserRepository userRepository;

    private ApprovalController approvalController;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        approvalController = new ApprovalController(approvalService, userRepository);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Security: ApprovalController requires authenticated user at class level")
    void testClassPreAuthorize_RequiresAuthentication() {
        PreAuthorize annotation = ApprovalController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(annotation, "ApprovalController must have @PreAuthorize at class level");
        assertEquals("isAuthenticated()", annotation.value());
    }

    @Test
    @DisplayName("Security: approve endpoint requires ADMIN, PRINCIPAL, HOD, or WARDEN")
    void testApprovePreAuthorize_RequiresSpecificRoles() throws NoSuchMethodException {
        Method approveMethod = ApprovalController.class.getMethod("approve", Long.class, ApprovalActionRequestDto.class, jakarta.servlet.http.HttpServletRequest.class);
        PreAuthorize annotation = approveMethod.getAnnotation(PreAuthorize.class);
        assertNotNull(annotation, "approve() method must have @PreAuthorize");
        assertTrue(annotation.value().contains("ADMIN"));
        assertTrue(annotation.value().contains("PRINCIPAL"));
        assertTrue(annotation.value().contains("HOD"));
        assertTrue(annotation.value().contains("WARDEN"));
        assertFalse(annotation.value().contains("STUDENT"), "STUDENT must not be allowed to approve");
    }

    @Test
    @DisplayName("Security: reject endpoint requires ADMIN, PRINCIPAL, HOD, or WARDEN")
    void testRejectPreAuthorize_RequiresSpecificRoles() throws NoSuchMethodException {
        Method rejectMethod = ApprovalController.class.getMethod("reject", Long.class, ApprovalActionRequestDto.class, jakarta.servlet.http.HttpServletRequest.class);
        PreAuthorize annotation = rejectMethod.getAnnotation(PreAuthorize.class);
        assertNotNull(annotation, "reject() method must have @PreAuthorize");
        assertTrue(annotation.value().contains("ADMIN"));
        assertTrue(annotation.value().contains("PRINCIPAL"));
        assertTrue(annotation.value().contains("HOD"));
        assertTrue(annotation.value().contains("WARDEN"));
        assertFalse(annotation.value().contains("STUDENT"), "STUDENT must not be allowed to reject");
    }

    @Test
    @DisplayName("Security: Unauthenticated request to createApproval throws UnauthorizedException")
    void testUnauthenticated_ThrowsUnauthorizedException() {
        CreateApprovalRequestDto dto = new CreateApprovalRequestDto("ACADEMIC_RESOURCE", 100L, null, null, null);
        assertThrows(UnauthorizedException.class, () -> approvalController.createApproval(dto));
    }
}
