package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.hostel.allocation.HostelAllocationPreviewDto;
import com.ahrao.dto.hostel.allocation.HostelAllocationPreviewRequestDto;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.entity.user.User;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.hostel.HostelResourceAllocationService;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HostelResourceAllocationSecurityTest {

    @Mock
    private HostelResourceAllocationService allocationService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private HostelResourceAllocationController allocationController;

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
                "test_user",
                "test@ahrao.edu",
                "Test",
                "User",
                "hashed_pwd",
                UserStatus.ACTIVE,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
        );

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("Class-level @PreAuthorize enforces roles: ADMIN, PRINCIPAL, HOD, WARDEN")
    void testPreAuthorizeAnnotationOnClass() {
        PreAuthorize annotation = HostelResourceAllocationController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(annotation, "HostelResourceAllocationController must have @PreAuthorize");
        String value = annotation.value();
        assertTrue(value.contains("ADMIN"), "Must allow ADMIN");
        assertTrue(value.contains("PRINCIPAL"), "Must allow PRINCIPAL");
        assertTrue(value.contains("HOD"), "Must allow HOD");
        assertTrue(value.contains("WARDEN"), "Must allow WARDEN");
        assertFalse(value.contains("STUDENT"), "Must NOT allow STUDENT");
    }

    @Test
    @DisplayName("Unauthenticated request throws UnauthorizedException")
    void testUnauthenticated_ThrowsUnauthorizedException() {
        HostelAllocationPreviewRequestDto request = new HostelAllocationPreviewRequestDto(1L);
        assertThrows(UnauthorizedException.class, () -> allocationController.previewAllocation(request));
    }

    @Test
    @DisplayName("Authenticated Warden can call preview successfully")
    void testWarden_CanCallPreview() {
        authenticateAs("WARDEN", 10L);

        User mockUser = new User();
        mockUser.setId(10L);
        mockUser.setUsername("warden_raj");
        when(userRepository.findById(10L)).thenReturn(Optional.of(mockUser));

        HostelAllocationPreviewDto previewDto = new HostelAllocationPreviewDto();
        previewDto.setEligible(true);
        when(allocationService.previewAllocation(any(), eq(mockUser))).thenReturn(previewDto);

        HostelAllocationPreviewRequestDto req = new HostelAllocationPreviewRequestDto(1L);
        ResponseEntity<ApiResponse<HostelAllocationPreviewDto>> response = allocationController.previewAllocation(req);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEligible());
    }

    @Test
    @DisplayName("Authenticated Admin can call preview successfully")
    void testAdmin_CanCallPreview() {
        authenticateAs("ADMIN", 1L);

        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername("admin");
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));

        HostelAllocationPreviewDto previewDto = new HostelAllocationPreviewDto();
        previewDto.setEligible(true);
        when(allocationService.previewAllocation(any(), eq(mockUser))).thenReturn(previewDto);

        HostelAllocationPreviewRequestDto req = new HostelAllocationPreviewRequestDto(1L);
        ResponseEntity<ApiResponse<HostelAllocationPreviewDto>> response = allocationController.previewAllocation(req);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }
}
