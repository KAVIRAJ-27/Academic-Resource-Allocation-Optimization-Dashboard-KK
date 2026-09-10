package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.resource.ResourceOverviewResponse;
import com.ahrao.dto.resource.ResourceReferenceDataResponse;
import com.ahrao.service.resource.ResourceOverviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/resources")
@PreAuthorize("hasRole('ADMIN')")
public class AdminResourceOverviewController {

    private final ResourceOverviewService overviewService;

    public AdminResourceOverviewController(ResourceOverviewService overviewService) {
        this.overviewService = overviewService;
    }

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<ResourceOverviewResponse>> getOverview() {
        ResourceOverviewResponse response = overviewService.getOverview();
        return ResponseEntity.ok(ApiResponse.success("Resource overview retrieved successfully", response));
    }

    @GetMapping("/reference-data")
    public ResponseEntity<ApiResponse<ResourceReferenceDataResponse>> getReferenceData() {
        ResourceReferenceDataResponse response = overviewService.getReferenceData();
        return ResponseEntity.ok(ApiResponse.success("Resource reference data retrieved successfully", response));
    }
}
