package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.academic.AcademicReferenceDataResponse;
import com.ahrao.service.academic.AcademicReferenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/academic/reference-data")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAcademicReferenceController {

    private final AcademicReferenceService academicReferenceService;

    public AdminAcademicReferenceController(AcademicReferenceService academicReferenceService) {
        this.academicReferenceService = academicReferenceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<AcademicReferenceDataResponse>> getReferenceData() {
        AcademicReferenceDataResponse response = academicReferenceService.getReferenceData();
        return ResponseEntity.ok(ApiResponse.success("Academic reference data retrieved successfully", response));
    }
}
