package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.hod.dashboard.HodDashboardResponse;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.hod.HodDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hod/dashboard")
@PreAuthorize("hasRole('HOD')")
public class HodDashboardController {

    private final HodDashboardService hodDashboardService;

    public HodDashboardController(HodDashboardService hodDashboardService) {
        this.hodDashboardService = hodDashboardService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<HodDashboardResponse>> getHodDashboard() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated HOD user context not found"));

        HodDashboardResponse dashboard = hodDashboardService.getHodDashboard(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("HOD department dashboard retrieved successfully", dashboard));
    }
}
