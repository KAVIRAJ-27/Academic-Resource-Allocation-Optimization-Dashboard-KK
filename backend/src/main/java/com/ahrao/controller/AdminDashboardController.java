package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.dashboard.AcademicResourceOverviewDto;
import com.ahrao.dto.dashboard.AdminDashboardOverviewResponse;
import com.ahrao.dto.dashboard.HostelResourceOverviewDto;
import com.ahrao.dto.dashboard.UserDistributionDto;
import com.ahrao.service.AdminDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for Admin Dashboard institution-wide overview metrics.
 * Strictly protected: Accessible ONLY to users with ROLE_ADMIN.
 */
@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<AdminDashboardOverviewResponse>> getDashboardOverview() {
        AdminDashboardOverviewResponse overview = adminDashboardService.getDashboardOverview();
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard overview retrieved successfully", overview));
    }

    @GetMapping("/user-distribution")
    public ResponseEntity<ApiResponse<UserDistributionDto>> getUserDistribution() {
        UserDistributionDto userDist = adminDashboardService.getUserDistribution();
        return ResponseEntity.ok(ApiResponse.success("User distribution retrieved successfully", userDist));
    }

    @GetMapping("/academic-summary")
    public ResponseEntity<ApiResponse<AcademicResourceOverviewDto>> getAcademicSummary() {
        AcademicResourceOverviewDto summary = adminDashboardService.getAcademicResourceOverview();
        return ResponseEntity.ok(ApiResponse.success("Academic summary retrieved successfully", summary));
    }

    @GetMapping("/hostel-summary")
    public ResponseEntity<ApiResponse<HostelResourceOverviewDto>> getHostelSummary() {
        HostelResourceOverviewDto summary = adminDashboardService.getHostelResourceOverview();
        return ResponseEntity.ok(ApiResponse.success("Hostel summary retrieved successfully", summary));
    }
}
