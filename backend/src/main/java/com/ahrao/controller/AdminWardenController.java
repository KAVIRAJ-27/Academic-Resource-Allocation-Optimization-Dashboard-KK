package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.staff.CreateWardenRequest;
import com.ahrao.dto.staff.UpdateWardenRequest;
import com.ahrao.dto.staff.WardenDetailsResponse;
import com.ahrao.dto.staff.WardenHostelAssignmentRequest;
import com.ahrao.dto.staff.WardenSummaryResponse;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.staff.WardenManagementService;
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
@RequestMapping("/api/admin/wardens")
@PreAuthorize("hasRole('ADMIN')")
public class AdminWardenController {

    private final WardenManagementService wardenManagementService;

    public AdminWardenController(WardenManagementService wardenManagementService) {
        this.wardenManagementService = wardenManagementService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<WardenSummaryResponse>>> getWardens(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long hostelId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {

        PagedResponse<WardenSummaryResponse> response = wardenManagementService.getWardens(
                search, hostelId, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Warden records retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WardenDetailsResponse>> getWardenById(@PathVariable Long id) {
        WardenDetailsResponse response = wardenManagementService.getWardenById(id);
        return ResponseEntity.ok(ApiResponse.success("Warden details retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WardenSummaryResponse>> createWarden(
            @Valid @RequestBody CreateWardenRequest request,
            HttpServletRequest httpRequest) {

        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        WardenSummaryResponse created = wardenManagementService.createWarden(
                request, adminUsername, ipAddress, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Warden created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WardenSummaryResponse>> updateWarden(
            @PathVariable Long id,
            @Valid @RequestBody UpdateWardenRequest request,
            HttpServletRequest httpRequest) {

        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        WardenSummaryResponse updated = wardenManagementService.updateWarden(
                id, request, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Warden record updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<WardenSummaryResponse>> updateWardenStatus(
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

        WardenSummaryResponse updated = wardenManagementService.updateWardenStatus(
                id, status, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Warden status updated successfully", updated));
    }

    @PostMapping("/{id}/hostels")
    public ResponseEntity<ApiResponse<WardenSummaryResponse>> assignHostels(
            @PathVariable Long id,
            @Valid @RequestBody WardenHostelAssignmentRequest request,
            HttpServletRequest httpRequest) {

        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        WardenSummaryResponse updated = wardenManagementService.assignHostels(
                id, request, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Warden hostel assignments updated successfully", updated));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
