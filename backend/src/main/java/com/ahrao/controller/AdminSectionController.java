package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.academic.CreateSectionRequest;
import com.ahrao.dto.academic.SectionDetailsResponse;
import com.ahrao.dto.academic.SectionSummaryResponse;
import com.ahrao.dto.academic.UpdateSectionRequest;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.academic.SectionManagementService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/sections")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSectionController {

    private final SectionManagementService sectionManagementService;

    public AdminSectionController(SectionManagementService sectionManagementService) {
        this.sectionManagementService = sectionManagementService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<SectionSummaryResponse>>> getSections(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long programId,
            @RequestParam(required = false) Long academicYearId,
            @RequestParam(required = false) Long semesterId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {

        PagedResponse<SectionSummaryResponse> response = sectionManagementService.getSections(
                search, departmentId, programId, academicYearId, semesterId, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Sections retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SectionDetailsResponse>> getSectionById(@PathVariable Long id) {
        SectionDetailsResponse response = sectionManagementService.getSectionById(id);
        return ResponseEntity.ok(ApiResponse.success("Section details retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SectionSummaryResponse>> createSection(
            @Valid @RequestBody CreateSectionRequest request,
            HttpServletRequest httpRequest) {

        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        SectionSummaryResponse created = sectionManagementService.createSection(
                request, adminUsername, ipAddress, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Section created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SectionSummaryResponse>> updateSection(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSectionRequest request,
            HttpServletRequest httpRequest) {

        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        SectionSummaryResponse updated = sectionManagementService.updateSection(
                id, request, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Section updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<SectionSummaryResponse>> updateSectionStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusBody,
            HttpServletRequest httpRequest) {

        String status = statusBody.get("status");
        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Status field is required"));
        }

        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        SectionSummaryResponse updated = sectionManagementService.updateSectionStatus(
                id, status, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Section status updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSection(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        sectionManagementService.deleteSection(id, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Section deleted successfully", null));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
