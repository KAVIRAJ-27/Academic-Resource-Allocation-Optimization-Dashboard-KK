package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.staff.AssignPrincipalRequest;
import com.ahrao.dto.staff.PrincipalResponse;
import com.ahrao.dto.staff.UpdatePrincipalAssignmentRequest;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.staff.PrincipalManagementService;
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
@RequestMapping("/api/admin/principal")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPrincipalController {

    private final PrincipalManagementService principalManagementService;

    public AdminPrincipalController(PrincipalManagementService principalManagementService) {
        this.principalManagementService = principalManagementService;
    }

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<PrincipalResponse>> getCurrentPrincipal() {
        PrincipalResponse response = principalManagementService.getCurrentPrincipal();
        return ResponseEntity.ok(ApiResponse.success("Current Principal retrieved successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<PrincipalResponse>>> getPrincipalHistory(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {

        PagedResponse<PrincipalResponse> response = principalManagementService.getPrincipalHistory(
                search, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Principal assignments retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PrincipalResponse>> getPrincipalById(@PathVariable Long id) {
        PrincipalResponse response = principalManagementService.getPrincipalById(id);
        return ResponseEntity.ok(ApiResponse.success("Principal assignment details retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PrincipalResponse>> assignPrincipal(
            @Valid @RequestBody AssignPrincipalRequest request,
            HttpServletRequest httpRequest) {

        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        PrincipalResponse created = principalManagementService.assignPrincipal(
                request, adminUsername, ipAddress, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Principal assigned successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PrincipalResponse>> updatePrincipalAssignment(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePrincipalAssignmentRequest request,
            HttpServletRequest httpRequest) {

        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        PrincipalResponse updated = principalManagementService.updatePrincipalAssignment(
                id, request, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Principal assignment updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<PrincipalResponse>> updatePrincipalStatus(
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

        PrincipalResponse updated = principalManagementService.updatePrincipalStatus(
                id, status, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Principal assignment status updated successfully", updated));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
