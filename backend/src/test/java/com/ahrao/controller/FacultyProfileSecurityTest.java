package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.faculty.profile.FacultyProfileDto;
import com.ahrao.dto.faculty.profile.UpdateFacultyProfileRequest;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.faculty.FacultyProfileService;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FacultyProfileSecurityTest {

    @Mock
    private FacultyProfileService facultyProfileService;

    @Mock
    private HttpServletRequest httpServletRequest;

    @InjectMocks
    private FacultyProfileController facultyProfileController;

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
                "prof_alan",
                "alan.turing@univ.edu",
                "Alan",
                "Turing",
                "encodedPassword",
                UserStatus.ACTIVE,
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + role))
        );
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @Test
    @DisplayName("Authenticated FACULTY can access their own profile")
    void testGetFacultyProfileSuccess() {
        authenticateAs("FACULTY", 42L);

        FacultyProfileDto mockProfile = new FacultyProfileDto();
        mockProfile.setUserId(42L);
        mockProfile.setFacultyId(10L);
        mockProfile.setFullName("Alan Turing");
        mockProfile.setEmployeeId("FAC-0042");
        mockProfile.setDepartmentName("Computer Science and Engineering");
        when(facultyProfileService.getProfile(42L)).thenReturn(mockProfile);

        ResponseEntity<ApiResponse<FacultyProfileDto>> response = facultyProfileController.getProfile();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Alan Turing", response.getBody().getData().getFullName());
        assertEquals("FAC-0042", response.getBody().getData().getEmployeeId());
        verify(facultyProfileService, times(1)).getProfile(42L);
    }

    @Test
    @DisplayName("Unauthenticated request to getProfile throws UnauthorizedException")
    void testUnauthenticatedProfileThrows() {
        SecurityContextHolder.clearContext();

        assertThrows(UnauthorizedException.class, () -> facultyProfileController.getProfile());
        verifyNoInteractions(facultyProfileService);
    }

    @Test
    @DisplayName("Authenticated FACULTY can update permitted profile fields")
    void testUpdateFacultyProfileSuccess() {
        authenticateAs("FACULTY", 42L);

        UpdateFacultyProfileRequest updateReq = new UpdateFacultyProfileRequest("Alan", "M. Turing", "+1987654321", "Ph.D. Mathematics");
        FacultyProfileDto updatedDto = new FacultyProfileDto();
        updatedDto.setUserId(42L);
        updatedDto.setFullName("Alan M. Turing");
        updatedDto.setPhone("+1987654321");
        updatedDto.setQualification("Ph.D. Mathematics");

        lenient().when(httpServletRequest.getRemoteAddr()).thenReturn("127.0.0.1");
        lenient().when(httpServletRequest.getHeader("X-Forwarded-For")).thenReturn(null);
        lenient().when(httpServletRequest.getHeader("User-Agent")).thenReturn("Mozilla/5.0 TestBrowser");
        when(facultyProfileService.updateProfile(eq(42L), any(UpdateFacultyProfileRequest.class), any(), any()))
                .thenReturn(updatedDto);

        ResponseEntity<ApiResponse<FacultyProfileDto>> response = facultyProfileController.updateProfile(updateReq, httpServletRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Alan M. Turing", response.getBody().getData().getFullName());
        assertEquals("+1987654321", response.getBody().getData().getPhone());
        assertEquals("Ph.D. Mathematics", response.getBody().getData().getQualification());
        verify(facultyProfileService, times(1)).updateProfile(eq(42L), eq(updateReq), any(), any());
    }

    @Test
    @DisplayName("Unauthenticated request to updateProfile throws UnauthorizedException")
    void testUnauthenticatedUpdateProfileThrows() {
        SecurityContextHolder.clearContext();

        UpdateFacultyProfileRequest updateReq = new UpdateFacultyProfileRequest("Alan", "Turing", "+1234567890", "Ph.D.");
        assertThrows(UnauthorizedException.class, () -> facultyProfileController.updateProfile(updateReq, httpServletRequest));
        verifyNoInteractions(facultyProfileService);
    }
}
