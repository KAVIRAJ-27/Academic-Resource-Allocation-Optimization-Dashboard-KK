package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.hod.HodStudentDetailDto;
import com.ahrao.dto.hod.HodStudentReferenceDataDto;
import com.ahrao.dto.hod.HodStudentSummaryDto;
import com.ahrao.dto.hod.HodUpdateStatusRequest;
import com.ahrao.dto.hod.HodUpdateStudentRequest;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.hod.HodStudentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hod/students")
@PreAuthorize("hasRole('HOD')")
public class HodStudentController {

    private final HodStudentService hodStudentService;

    public HodStudentController(HodStudentService hodStudentService) {
        this.hodStudentService = hodStudentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<HodStudentSummaryDto>>> getStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long programId,
            @RequestParam(required = false) Long sectionId,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {

        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated HOD context not found"));

        PagedResponse<HodStudentSummaryDto> response = hodStudentService.getStudents(
                currentUserId, search, programId, sectionId, semester, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Department students retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HodStudentDetailDto>> getStudentById(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated HOD context not found"));

        HodStudentDetailDto response = hodStudentService.getStudentById(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.success("Student details retrieved successfully", response));
    }

    @GetMapping("/reference-data")
    public ResponseEntity<ApiResponse<HodStudentReferenceDataDto>> getReferenceData() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated HOD context not found"));

        HodStudentReferenceDataDto response = hodStudentService.getReferenceData(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Department student reference data retrieved successfully", response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<HodStudentSummaryDto>> updateStudentStatus(
            @PathVariable Long id,
            @Valid @RequestBody HodUpdateStatusRequest request) {

        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated HOD context not found"));

        HodStudentSummaryDto response = hodStudentService.updateStudentStatus(currentUserId, id, request);
        return ResponseEntity.ok(ApiResponse.success("Student status updated successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HodStudentDetailDto>> updateStudentProfile(
            @PathVariable Long id,
            @Valid @RequestBody HodUpdateStudentRequest request) {

        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated HOD context not found"));

        HodStudentDetailDto response = hodStudentService.updateStudentProfile(currentUserId, id, request);
        return ResponseEntity.ok(ApiResponse.success("Student profile updated successfully", response));
    }
}
