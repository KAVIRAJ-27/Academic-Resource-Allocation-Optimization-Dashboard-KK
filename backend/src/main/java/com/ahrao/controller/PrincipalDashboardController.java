package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.principal.dashboard.PrincipalDashboardResponse;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.principal.PrincipalDashboardService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/principal/dashboard")
@PreAuthorize("hasRole('PRINCIPAL')")
public class PrincipalDashboardController {

    private static final Logger log = LoggerFactory.getLogger(PrincipalDashboardController.class);

    private final PrincipalDashboardService principalDashboardService;

    public PrincipalDashboardController(PrincipalDashboardService principalDashboardService) {
        this.principalDashboardService = principalDashboardService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PrincipalDashboardResponse>> getPrincipalDashboard() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated Principal user context not found"));

        log.info("Request for Principal dashboard by user ID: {}", currentUserId);
        PrincipalDashboardResponse response = principalDashboardService.getDashboard(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Principal institution dashboard retrieved successfully", response));
    }
}
