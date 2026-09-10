package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.academic.CreateSemesterRequest;
import com.ahrao.dto.academic.SemesterDetailsResponse;
import com.ahrao.dto.academic.SemesterSummaryResponse;
import com.ahrao.dto.academic.UpdateSemesterRequest;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.academic.SemesterManagementService;
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
@RequestMapping("/api/admin/semesters")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSemesterController {

    private final SemesterManagementService semesterManagementService;

    public AdminSemesterController(SemesterManagementService semesterManagementService) {
        this.semesterManagementService = semesterManagementService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<SemesterSummaryResponse>>> getSemesters(
            @RequestParam(required = false) Long academicYearId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "number", direction = Sort.Direction.ASC) Pageable pageable) {

        PagedResponse<SemesterSummaryResponse> response = semesterManagementService.getSemesters(
                academicYearId, status, search, pageable);
        return ResponseEntity.ok(ApiResponse.success("Semesters retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SemesterDetailsResponse>> getSemesterById(@PathVariable Long id) {
        SemesterDetailsResponse response = semesterManagementService.getSemesterById(id);
        return ResponseEntity.ok(ApiResponse.success("Semester details retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SemesterSummaryResponse>> createSemester(
            @Valid @RequestBody CreateSemesterRequest request,
            HttpServletRequest httpRequest) {

        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        SemesterSummaryResponse created = semesterManagementService.createSemester(
                request, adminUsername, ipAddress, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Semester created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SemesterSummaryResponse>> updateSemester(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSemesterRequest request,
            HttpServletRequest httpRequest) {

        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        SemesterSummaryResponse updated = semesterManagementService.updateSemester(
                id, request, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Semester updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<SemesterSummaryResponse>> updateSemesterStatus(
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

        SemesterSummaryResponse updated = semesterManagementService.updateSemesterStatus(
                id, status, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Semester status updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSemester(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        semesterManagementService.deleteSemester(id, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Semester deleted successfully", null));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
