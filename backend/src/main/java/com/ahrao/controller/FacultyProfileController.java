package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.faculty.profile.FacultyProfileDto;
import com.ahrao.dto.faculty.profile.UpdateFacultyProfileRequest;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.faculty.FacultyProfileService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/faculty/profile")
@PreAuthorize("hasRole('FACULTY')")
public class FacultyProfileController {

    private final FacultyProfileService facultyProfileService;

    public FacultyProfileController(FacultyProfileService facultyProfileService) {
        this.facultyProfileService = facultyProfileService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<FacultyProfileDto>> getProfile() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated faculty context not found"));

        FacultyProfileDto profile = facultyProfileService.getProfile(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Faculty profile retrieved successfully", profile));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<FacultyProfileDto>> updateProfile(
            @Valid @RequestBody UpdateFacultyProfileRequest request,
            HttpServletRequest httpRequest) {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated faculty context not found"));

        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        FacultyProfileDto updated = facultyProfileService.updateProfile(currentUserId, request, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Faculty profile updated successfully", updated));
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        return (xf != null && !xf.isBlank()) ? xf.split(",")[0].trim() : request.getRemoteAddr();
    }
}
