package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.hod.HodFacultyDetailDto;
import com.ahrao.dto.hod.HodFacultySummaryDto;
import com.ahrao.dto.hod.HodUpdateFacultyRequest;
import com.ahrao.dto.hod.HodUpdateStatusRequest;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.hod.HodFacultyService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hod/faculty")
@PreAuthorize("hasRole('HOD')")
public class HodFacultyController {

    private final HodFacultyService hodFacultyService;

    public HodFacultyController(HodFacultyService hodFacultyService) {
        this.hodFacultyService = hodFacultyService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<HodFacultySummaryDto>>> getFaculty(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {

        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated HOD context not found"));

        PagedResponse<HodFacultySummaryDto> response = hodFacultyService.getFaculty(currentUserId, search, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Department faculty retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HodFacultyDetailDto>> getFacultyById(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated HOD context not found"));

        HodFacultyDetailDto response = hodFacultyService.getFacultyById(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.success("Faculty details retrieved successfully", response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<HodFacultySummaryDto>> updateFacultyStatus(
            @PathVariable Long id,
            @Valid @RequestBody HodUpdateStatusRequest request) {

        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated HOD context not found"));

        HodFacultySummaryDto response = hodFacultyService.updateFacultyStatus(currentUserId, id, request);
        return ResponseEntity.ok(ApiResponse.success("Faculty status updated successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HodFacultyDetailDto>> updateFacultyProfile(
            @PathVariable Long id,
            @Valid @RequestBody HodUpdateFacultyRequest request) {

        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated HOD context not found"));

        HodFacultyDetailDto response = hodFacultyService.updateFacultyProfile(currentUserId, id, request);
        return ResponseEntity.ok(ApiResponse.success("Faculty profile updated successfully", response));
    }
}
