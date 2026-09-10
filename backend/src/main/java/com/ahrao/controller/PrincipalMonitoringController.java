package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.principal.monitoring.PrincipalMonitoringResponse;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.principal.PrincipalMonitoringService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/principal/monitoring")
@PreAuthorize("hasRole('PRINCIPAL')")
public class PrincipalMonitoringController {

    private static final Logger log = LoggerFactory.getLogger(PrincipalMonitoringController.class);

    private final PrincipalMonitoringService monitoringService;

    public PrincipalMonitoringController(PrincipalMonitoringService monitoringService) {
        this.monitoringService = monitoringService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PrincipalMonitoringResponse>> getMonitoringOverview() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated Principal user context not found"));

        log.info("Request for Principal institution monitoring overview by userId={}", currentUserId);
        PrincipalMonitoringResponse response = monitoringService.getMonitoring(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Principal institution monitoring overview retrieved successfully", response));
    }
}
