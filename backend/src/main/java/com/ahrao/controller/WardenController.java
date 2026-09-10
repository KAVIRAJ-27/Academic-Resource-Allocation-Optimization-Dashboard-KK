package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.warden.WardenOverviewDto;
import com.ahrao.service.warden.WardenOverviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/warden")
@PreAuthorize("hasAnyRole('WARDEN', 'ADMIN')")
public class WardenController {

    private final WardenOverviewService wardenOverviewService;

    public WardenController(WardenOverviewService wardenOverviewService) {
        this.wardenOverviewService = wardenOverviewService;
    }

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<WardenOverviewDto>> getWardenOverview(
            @RequestParam(required = false) Long hostelId) {
        WardenOverviewDto overview = wardenOverviewService.getWardenOverview(hostelId);
        return ResponseEntity.ok(ApiResponse.success("Warden overview telemetry retrieved", overview));
    }
}
