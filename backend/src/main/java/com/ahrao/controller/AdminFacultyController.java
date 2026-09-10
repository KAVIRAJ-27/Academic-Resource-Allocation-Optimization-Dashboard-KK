package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.staff.CreateFacultyRequest;
import com.ahrao.dto.staff.FacultyDetailsResponse;
import com.ahrao.dto.staff.FacultySummaryResponse;
import com.ahrao.dto.staff.UpdateFacultyRequest;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.staff.FacultyManagementService;
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
@RequestMapping("/api/admin/faculty")
@PreAuthorize("hasRole('ADMIN')")
public class AdminFacultyController {

    private final FacultyManagementService facultyManagementService;

    public AdminFacultyController(FacultyManagementService facultyManagementService) {
        this.facultyManagementService = facultyManagementService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<FacultySummaryResponse>>> getFaculty(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {

        PagedResponse<FacultySummaryResponse> response = facultyManagementService.getFaculty(
                search, departmentId, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Faculty records retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FacultyDetailsResponse>> getFacultyById(@PathVariable Long id) {
        FacultyDetailsResponse response = facultyManagementService.getFacultyById(id);
        return ResponseEntity.ok(ApiResponse.success("Faculty details retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FacultySummaryResponse>> createFaculty(
            @Valid @RequestBody CreateFacultyRequest request,
            HttpServletRequest httpRequest) {

        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        FacultySummaryResponse created = facultyManagementService.createFaculty(
                request, adminUsername, ipAddress, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Faculty member provisioned successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FacultySummaryResponse>> updateFaculty(
            @PathVariable Long id,
            @Valid @RequestBody UpdateFacultyRequest request,
            HttpServletRequest httpRequest) {

        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        FacultySummaryResponse updated = facultyManagementService.updateFaculty(
                id, request, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Faculty record updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<FacultySummaryResponse>> updateFacultyStatus(
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

        FacultySummaryResponse updated = facultyManagementService.updateFacultyStatus(
                id, status, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Faculty status updated successfully", updated));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
