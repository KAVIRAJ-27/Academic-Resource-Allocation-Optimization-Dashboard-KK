package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.principal.allocation.PrincipalAllocationDetailDto;
import com.ahrao.dto.principal.allocation.PrincipalAllocationSummaryDto;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.principal.PrincipalAllocationService;
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
class PrincipalAllocationSecurityTest {

    @Mock
    private PrincipalAllocationService principalAllocationService;

    @InjectMocks
    private PrincipalAllocationController principalAllocationController;

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
    @DisplayName("Principal can list institution allocations")
    void testGetInstitutionAllocationsSuccess() {
        authenticateAs("PRINCIPAL", 101L);

        PrincipalAllocationSummaryDto item = new PrincipalAllocationSummaryDto();
        item.setId(25L);
        item.setResourceName("Seminar Hall 1");
        item.setDepartmentName("Electrical Engineering");
        item.setStatus("ACTIVE");

        PagedResponse<PrincipalAllocationSummaryDto> pagedResponse = new PagedResponse<>(
                Collections.singletonList(item), 0, 10, 1L, 1, true, true
        );

        when(principalAllocationService.getInstitutionAllocations(
                eq(101L), any(), any(), any(), any(), any(), any(), any(), any(Pageable.class)
        )).thenReturn(pagedResponse);

        ResponseEntity<ApiResponse<PagedResponse<PrincipalAllocationSummaryDto>>> response =
                principalAllocationController.getInstitutionAllocations(null, null, null, null, null, null, null, 0, 10, "id,desc");

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().getContent().size());
        assertEquals("Seminar Hall 1", response.getBody().getData().getContent().get(0).getResourceName());
    }

    @Test
    @DisplayName("Principal can get allocation by ID")
    void testGetAllocationByIdSuccess() {
        authenticateAs("PRINCIPAL", 101L);

        PrincipalAllocationDetailDto detail = new PrincipalAllocationDetailDto();
        detail.setId(25L);
        detail.setResourceName("Seminar Hall 1");

        when(principalAllocationService.getAllocationById(101L, 25L)).thenReturn(detail);

        ResponseEntity<ApiResponse<PrincipalAllocationDetailDto>> response =
                principalAllocationController.getAllocationById(25L);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Seminar Hall 1", response.getBody().getData().getResourceName());
    }

    @Test
    @DisplayName("Allocation belonging to another institution throws ForbiddenException")
    void testGetAllocationCrossInstitutionForbidden() {
        authenticateAs("PRINCIPAL", 101L);

        when(principalAllocationService.getAllocationById(101L, 999L))
                .thenThrow(new ForbiddenException("Access denied: Allocation belongs to another institution."));

        assertThrows(ForbiddenException.class, () -> {
            principalAllocationController.getAllocationById(999L);
        });
    }

    @Test
    @DisplayName("Unauthenticated request throws UnauthorizedException")
    void testUnauthenticatedThrows() {
        assertThrows(UnauthorizedException.class, () -> {
            principalAllocationController.getAllocationById(25L);
        });
    }
}
