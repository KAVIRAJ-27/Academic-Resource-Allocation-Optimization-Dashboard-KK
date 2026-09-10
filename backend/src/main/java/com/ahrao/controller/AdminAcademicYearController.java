package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.academic.AcademicYearDetailsResponse;
import com.ahrao.dto.academic.AcademicYearSummaryResponse;
import com.ahrao.dto.academic.CreateAcademicYearRequest;
import com.ahrao.dto.academic.UpdateAcademicYearRequest;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.academic.AcademicYearManagementService;
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
@RequestMapping("/api/admin/academic-years")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAcademicYearController {

    private final AcademicYearManagementService academicYearManagementService;

    public AdminAcademicYearController(AcademicYearManagementService academicYearManagementService) {
        this.academicYearManagementService = academicYearManagementService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<AcademicYearSummaryResponse>>> getAcademicYears(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "startDate", direction = Sort.Direction.DESC) Pageable pageable) {

        PagedResponse<AcademicYearSummaryResponse> response = academicYearManagementService.getAcademicYears(search, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Academic years retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AcademicYearDetailsResponse>> getAcademicYearById(@PathVariable Long id) {
        AcademicYearDetailsResponse response = academicYearManagementService.getAcademicYearById(id);
        return ResponseEntity.ok(ApiResponse.success("Academic year details retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AcademicYearSummaryResponse>> createAcademicYear(
            @Valid @RequestBody CreateAcademicYearRequest request,
            HttpServletRequest httpRequest) {

        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        AcademicYearSummaryResponse created = academicYearManagementService.createAcademicYear(
                request, adminUsername, ipAddress, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Academic year created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AcademicYearSummaryResponse>> updateAcademicYear(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAcademicYearRequest request,
            HttpServletRequest httpRequest) {

        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        AcademicYearSummaryResponse updated = academicYearManagementService.updateAcademicYear(
                id, request, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Academic year updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AcademicYearSummaryResponse>> updateAcademicYearStatus(
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

        AcademicYearSummaryResponse updated = academicYearManagementService.updateAcademicYearStatus(
                id, status, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Academic year status updated successfully", updated));
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<AcademicYearSummaryResponse>> activateAcademicYear(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        AcademicYearSummaryResponse activated = academicYearManagementService.activateAcademicYear(
                id, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Academic year designated as active institution-wide", activated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAcademicYear(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        academicYearManagementService.deleteAcademicYear(id, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Academic year deleted successfully", null));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
