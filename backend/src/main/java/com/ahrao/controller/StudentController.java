package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.student.StudentDashboardDto;
import com.ahrao.dto.student.StudentProfileDto;
import com.ahrao.dto.student.StudentProfileUpdateRequest;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.student.StudentDashboardService;
import com.ahrao.service.student.StudentProfileService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    private final StudentProfileService studentProfileService;
    private final StudentDashboardService studentDashboardService;

    public StudentController(
            StudentProfileService studentProfileService,
            StudentDashboardService studentDashboardService) {
        this.studentProfileService = studentProfileService;
        this.studentDashboardService = studentDashboardService;
    }

    @GetMapping("/overview")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStudentOverview() {
        return ResponseEntity.ok(ApiResponse.success("Student overview telemetry retrieved",
                Map.of("role", "STUDENT", "scope", "ACADEMIC_HOSTEL", "status", "AUTHORIZED")));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentDashboardDto>> getStudentDashboard() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated student context not found"));

        StudentDashboardDto dashboard = studentDashboardService.getDashboard(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Student dashboard data retrieved successfully", dashboard));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentProfileDto>> getStudentProfile() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated student context not found"));

        StudentProfileDto profile = studentProfileService.getProfile(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Student profile retrieved successfully", profile));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentProfileDto>> updateStudentProfile(
            @Valid @RequestBody StudentProfileUpdateRequest request,
            HttpServletRequest httpRequest) {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated student context not found"));

        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        StudentProfileDto updated = studentProfileService.updateProfile(currentUserId, request, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Student profile updated successfully", updated));
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        return (xf != null && !xf.isBlank()) ? xf.split(",")[0].trim() : request.getRemoteAddr();
    }
}
