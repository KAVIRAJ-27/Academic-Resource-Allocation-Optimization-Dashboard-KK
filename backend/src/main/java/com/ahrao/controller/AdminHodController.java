package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.staff.CreateHodAssignmentRequest;
import com.ahrao.dto.staff.HodDetailsResponse;
import com.ahrao.dto.staff.HodSummaryResponse;
import com.ahrao.dto.staff.UpdateHodAssignmentRequest;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.staff.HodManagementService;
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
@RequestMapping("/api/admin/hods")
@PreAuthorize("hasRole('ADMIN')")
public class AdminHodController {

    private final HodManagementService hodManagementService;

    public AdminHodController(HodManagementService hodManagementService) {
        this.hodManagementService = hodManagementService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<HodSummaryResponse>>> getHods(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {

        PagedResponse<HodSummaryResponse> response = hodManagementService.getHods(
                search, departmentId, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("HOD assignments retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HodDetailsResponse>> getHodById(@PathVariable Long id) {
        HodDetailsResponse response = hodManagementService.getHodById(id);
        return ResponseEntity.ok(ApiResponse.success("HOD assignment details retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HodSummaryResponse>> assignHod(
            @Valid @RequestBody CreateHodAssignmentRequest request,
            HttpServletRequest httpRequest) {

        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        HodSummaryResponse created = hodManagementService.assignHod(
                request, adminUsername, ipAddress, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("HOD assigned successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HodSummaryResponse>> updateHodAssignment(
            @PathVariable Long id,
            @Valid @RequestBody UpdateHodAssignmentRequest request,
            HttpServletRequest httpRequest) {

        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        HodSummaryResponse updated = hodManagementService.updateHodAssignment(
                id, request, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("HOD assignment updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<HodSummaryResponse>> updateHodStatus(
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

        HodSummaryResponse updated = hodManagementService.updateHodStatus(
                id, status, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("HOD status updated successfully", updated));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
