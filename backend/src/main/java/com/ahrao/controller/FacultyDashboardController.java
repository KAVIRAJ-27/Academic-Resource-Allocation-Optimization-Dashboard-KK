package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.faculty.dashboard.FacultyDashboardDto;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.faculty.FacultyDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/faculty/dashboard")
@PreAuthorize("hasRole('FACULTY')")
public class FacultyDashboardController {

    private final FacultyDashboardService facultyDashboardService;

    public FacultyDashboardController(FacultyDashboardService facultyDashboardService) {
        this.facultyDashboardService = facultyDashboardService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<FacultyDashboardDto>> getDashboard() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated faculty context not found"));

        FacultyDashboardDto dashboard = facultyDashboardService.getDashboard(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Faculty dashboard data retrieved successfully", dashboard));
    }
}
