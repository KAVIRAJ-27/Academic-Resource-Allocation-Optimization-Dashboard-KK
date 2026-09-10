package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.faculty.workload.FacultyWorkloadResponseDto;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.faculty.FacultyWorkloadService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/faculty/workload")
@PreAuthorize("hasRole('FACULTY')")
public class FacultyWorkloadController {

    private final FacultyWorkloadService workloadService;

    public FacultyWorkloadController(FacultyWorkloadService workloadService) {
        this.workloadService = workloadService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<FacultyWorkloadResponseDto>> getMyWorkload() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated faculty context not found"));

        FacultyWorkloadResponseDto workload = workloadService.getWorkload(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Faculty workload retrieved successfully", workload));
    }
}
