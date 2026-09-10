package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.HealthResponse;
import com.ahrao.service.HealthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Health check endpoint for AHRAO system.
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final HealthService healthService;

    public HealthController(HealthService healthService) {
        this.healthService = healthService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<HealthResponse>> getHealth() {
        HealthResponse health = healthService.getSystemHealth();
        return ResponseEntity.ok(ApiResponse.success("System operational", health));
    }
}
