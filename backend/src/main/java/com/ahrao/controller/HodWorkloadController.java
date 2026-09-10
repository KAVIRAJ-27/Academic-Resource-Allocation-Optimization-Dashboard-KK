package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.hod.HodDepartmentAssignmentItemDto;
import com.ahrao.dto.hod.HodDepartmentWorkloadOverviewDto;
import com.ahrao.dto.hod.HodFacultyWorkloadDetailDto;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.hod.HodWorkloadService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/hod/workload")
@PreAuthorize("hasRole('HOD')")
public class HodWorkloadController {

    private final HodWorkloadService hodWorkloadService;

    public HodWorkloadController(HodWorkloadService hodWorkloadService) {
        this.hodWorkloadService = hodWorkloadService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<HodDepartmentWorkloadOverviewDto>> getWorkloadOverview() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated HOD context not found"));

        HodDepartmentWorkloadOverviewDto overview = hodWorkloadService.getWorkloadOverview(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Department workload overview retrieved successfully", overview));
    }

    @GetMapping("/{facultyId}")
    public ResponseEntity<ApiResponse<HodFacultyWorkloadDetailDto>> getFacultyWorkloadDetail(@PathVariable Long facultyId) {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated HOD context not found"));

        HodFacultyWorkloadDetailDto detail = hodWorkloadService.getFacultyWorkloadDetail(currentUserId, facultyId);
        return ResponseEntity.ok(ApiResponse.success("Faculty workload details retrieved successfully", detail));
    }

    @GetMapping("/assignments")
    public ResponseEntity<ApiResponse<List<HodDepartmentAssignmentItemDto>>> getDepartmentAssignments() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated HOD context not found"));

        List<HodDepartmentAssignmentItemDto> assignments = hodWorkloadService.getDepartmentAssignments(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Department course assignments retrieved successfully", assignments));
    }
}
