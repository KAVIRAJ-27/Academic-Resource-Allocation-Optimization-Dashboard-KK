package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.principal.approval.PrincipalApprovalActionRequest;
import com.ahrao.dto.principal.approval.PrincipalApprovalDetailDto;
import com.ahrao.dto.principal.approval.PrincipalApprovalSummaryDto;
import com.ahrao.entity.enums.ApprovalStatus;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.principal.PrincipalApprovalService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
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
class PrincipalApprovalSecurityTest {

    @Mock
    private PrincipalApprovalService principalApprovalService;

    @InjectMocks
    private PrincipalApprovalController principalApprovalController;

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
                "principal_user",
                "principal@univ.edu",
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
    @DisplayName("Principal can list institution approvals")
    void testGetInstitutionApprovalsSuccess() {
        authenticateAs("PRINCIPAL", 101L);

        PrincipalApprovalSummaryDto item = new PrincipalApprovalSummaryDto();
        item.setId(50L);
        item.setRequestId(200L);
        item.setDepartmentName("Computer Science");
        item.setStatus("PENDING");

        PagedResponse<PrincipalApprovalSummaryDto> pagedResponse = new PagedResponse<>(
                Collections.singletonList(item), 0, 10, 1L, 1, true, true
        );

        when(principalApprovalService.getInstitutionApprovals(
                eq(101L), any(), any(), any(), any(), any(), any(Pageable.class)
        )).thenReturn(pagedResponse);

        ResponseEntity<ApiResponse<PagedResponse<PrincipalApprovalSummaryDto>>> response =
                principalApprovalController.getInstitutionApprovals(null, null, null, null, null, 0, 10, "id,desc");

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().getContent().size());
        assertEquals("Computer Science", response.getBody().getData().getContent().get(0).getDepartmentName());
    }

    @Test
    @DisplayName("Principal can get approval by ID")
    void testGetApprovalByIdSuccess() {
        authenticateAs("PRINCIPAL", 101L);

        PrincipalApprovalDetailDto detail = new PrincipalApprovalDetailDto();
        detail.setId(50L);
        detail.setRequestId(200L);
        detail.setDepartmentName("Computer Science");
        detail.setCanApprove(true);
        detail.setCanReject(true);

        when(principalApprovalService.getApprovalById(101L, 50L)).thenReturn(detail);

        ResponseEntity<ApiResponse<PrincipalApprovalDetailDto>> response =
                principalApprovalController.getApprovalById(50L);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().getData().isCanApprove());
    }

    @Test
    @DisplayName("Approval for another institution throws ForbiddenException")
    void testGetApprovalCrossInstitutionForbidden() {
        authenticateAs("PRINCIPAL", 101L);

        when(principalApprovalService.getApprovalById(101L, 999L))
                .thenThrow(new ForbiddenException("Access denied: Approval belongs to another institution."));

        assertThrows(ForbiddenException.class, () -> {
            principalApprovalController.getApprovalById(999L);
        });
    }

    @Test
    @DisplayName("Principal can approve a pending request")
    void testApproveApprovalSuccess() {
        authenticateAs("PRINCIPAL", 101L);

        PrincipalApprovalDetailDto detail = new PrincipalApprovalDetailDto();
        detail.setId(50L);
        detail.setStatus("APPROVED");

        PrincipalApprovalActionRequest req = new PrincipalApprovalActionRequest();
        req.setComments("Approved for department seminar");

        when(principalApprovalService.approveApproval(eq(101L), eq(50L), any()))
                .thenReturn(detail);

        ResponseEntity<ApiResponse<PrincipalApprovalDetailDto>> response =
                principalApprovalController.approveApproval(50L, req);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("APPROVED", response.getBody().getData().getStatus());
    }

    @Test
    @DisplayName("Approving an already processed approval throws ConflictException (409)")
    void testApproveAlreadyProcessedConflict() {
        authenticateAs("PRINCIPAL", 101L);

        when(principalApprovalService.approveApproval(eq(101L), eq(50L), any()))
                .thenThrow(new ConflictException("Cannot approve: Approval is in APPROVED status."));

        assertThrows(ConflictException.class, () -> {
            principalApprovalController.approveApproval(50L, new PrincipalApprovalActionRequest());
        });
    }

    @Test
    @DisplayName("Principal can reject with reason")
    void testRejectApprovalSuccess() {
        authenticateAs("PRINCIPAL", 101L);

        PrincipalApprovalDetailDto detail = new PrincipalApprovalDetailDto();
        detail.setId(50L);
        detail.setStatus("REJECTED");

        PrincipalApprovalActionRequest req = new PrincipalApprovalActionRequest();
        req.setComments("Resource not available on requested date");

        when(principalApprovalService.rejectApproval(eq(101L), eq(50L), any()))
                .thenReturn(detail);

        ResponseEntity<ApiResponse<PrincipalApprovalDetailDto>> response =
                principalApprovalController.rejectApproval(50L, req);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("REJECTED", response.getBody().getData().getStatus());
    }

    @Test
    @DisplayName("Unauthenticated request throws UnauthorizedException")
    void testUnauthenticatedThrows() {
        assertThrows(UnauthorizedException.class, () -> {
            principalApprovalController.getApprovalById(50L);
        });
    }
}
