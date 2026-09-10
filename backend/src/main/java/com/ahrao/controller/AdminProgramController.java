package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.academic.CreateProgramRequest;
import com.ahrao.dto.academic.ProgramDetailsResponse;
import com.ahrao.dto.academic.ProgramSummaryResponse;
import com.ahrao.dto.academic.UpdateProgramRequest;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.academic.ProgramManagementService;
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
@RequestMapping("/api/admin/programs")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProgramController {

    private final ProgramManagementService programManagementService;

    public AdminProgramController(ProgramManagementService programManagementService) {
        this.programManagementService = programManagementService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ProgramSummaryResponse>>> getPrograms(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {

        PagedResponse<ProgramSummaryResponse> response = programManagementService.getPrograms(
                search, departmentId, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Programs retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProgramDetailsResponse>> getProgramById(@PathVariable Long id) {
        ProgramDetailsResponse response = programManagementService.getProgramById(id);
        return ResponseEntity.ok(ApiResponse.success("Program details retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProgramSummaryResponse>> createProgram(
            @Valid @RequestBody CreateProgramRequest request,
            HttpServletRequest httpRequest) {

        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        ProgramSummaryResponse created = programManagementService.createProgram(
                request, adminUsername, ipAddress, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Degree program created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProgramSummaryResponse>> updateProgram(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProgramRequest request,
            HttpServletRequest httpRequest) {

        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        ProgramSummaryResponse updated = programManagementService.updateProgram(
                id, request, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Degree program updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ProgramSummaryResponse>> updateProgramStatus(
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

        ProgramSummaryResponse updated = programManagementService.updateProgramStatus(
                id, status, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Program status updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProgram(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        programManagementService.deleteProgram(id, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Degree program deleted successfully", null));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
