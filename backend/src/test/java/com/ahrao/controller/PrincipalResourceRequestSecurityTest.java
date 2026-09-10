package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.principal.resource.PrincipalResourceRequestDetailDto;
import com.ahrao.dto.principal.resource.PrincipalResourceRequestSummaryDto;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.principal.PrincipalResourceRequestService;
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
class PrincipalResourceRequestSecurityTest {

    @Mock
    private PrincipalResourceRequestService resourceRequestService;

    @InjectMocks
    private PrincipalResourceRequestController resourceRequestController;

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
    @DisplayName("Principal can list institution resource requests")
    void testGetInstitutionRequestsSuccess() {
        authenticateAs("PRINCIPAL", 101L);

        PrincipalResourceRequestSummaryDto item = new PrincipalResourceRequestSummaryDto();
        item.setId(10L);
        item.setResourceName("Auditorium A");
        item.setDepartmentName("Computer Science");
        item.setStatus("PENDING");

        PagedResponse<PrincipalResourceRequestSummaryDto> pagedResponse = new PagedResponse<>(
                Collections.singletonList(item), 0, 10, 1L, 1, true, true
        );

        when(resourceRequestService.getInstitutionRequests(
                eq(101L), any(), any(), any(), any(), any(), any(), any(), any(), any(Pageable.class)
        )).thenReturn(pagedResponse);

        ResponseEntity<ApiResponse<PagedResponse<PrincipalResourceRequestSummaryDto>>> response =
                resourceRequestController.getInstitutionRequests(null, null, null, null, null, null, null, null, 0, 10, "id,desc");

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().getContent().size());
        assertEquals("Auditorium A", response.getBody().getData().getContent().get(0).getResourceName());
    }

    @Test
    @DisplayName("Principal can get request details")
    void testGetRequestByIdSuccess() {
        authenticateAs("PRINCIPAL", 101L);

        PrincipalResourceRequestDetailDto detail = new PrincipalResourceRequestDetailDto();
        detail.setId(10L);
        detail.setResourceName("Auditorium A");

        when(resourceRequestService.getRequestById(101L, 10L)).thenReturn(detail);

        ResponseEntity<ApiResponse<PrincipalResourceRequestDetailDto>> response =
                resourceRequestController.getRequestById(10L);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Auditorium A", response.getBody().getData().getResourceName());
    }

    @Test
    @DisplayName("Request belonging to another institution throws ForbiddenException")
    void testGetRequestCrossInstitutionForbidden() {
        authenticateAs("PRINCIPAL", 101L);

        when(resourceRequestService.getRequestById(101L, 999L))
                .thenThrow(new ForbiddenException("Access denied: Resource request belongs to another institution."));

        assertThrows(ForbiddenException.class, () -> {
            resourceRequestController.getRequestById(999L);
        });
    }

    @Test
    @DisplayName("Unauthenticated request throws UnauthorizedException")
    void testUnauthenticatedThrows() {
        assertThrows(UnauthorizedException.class, () -> {
            resourceRequestController.getRequestById(10L);
        });
    }
}
