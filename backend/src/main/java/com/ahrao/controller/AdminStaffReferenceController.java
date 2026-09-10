package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.staff.StaffReferenceDataResponse;
import com.ahrao.service.staff.StaffReferenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/staff")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStaffReferenceController {

    private final StaffReferenceService staffReferenceService;

    public AdminStaffReferenceController(StaffReferenceService staffReferenceService) {
        this.staffReferenceService = staffReferenceService;
    }

    @GetMapping("/reference-data")
    public ResponseEntity<ApiResponse<StaffReferenceDataResponse>> getReferenceData() {
        StaffReferenceDataResponse response = staffReferenceService.getReferenceData();
        return ResponseEntity.ok(ApiResponse.success("Staff reference data retrieved successfully", response));
    }
}
