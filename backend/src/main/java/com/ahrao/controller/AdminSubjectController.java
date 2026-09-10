package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.academic.CreateSubjectRequest;
import com.ahrao.dto.academic.SubjectDetailsResponse;
import com.ahrao.dto.academic.SubjectSummaryResponse;
import com.ahrao.dto.academic.UpdateSubjectRequest;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.academic.SubjectManagementService;
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
@RequestMapping("/api/admin/subjects")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSubjectController {

    private final SubjectManagementService subjectManagementService;

    public AdminSubjectController(SubjectManagementService subjectManagementService) {
        this.subjectManagementService = subjectManagementService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<SubjectSummaryResponse>>> getSubjects(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long programId,
            @RequestParam(required = false) Long semesterId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "code", direction = Sort.Direction.ASC) Pageable pageable) {

        PagedResponse<SubjectSummaryResponse> response = subjectManagementService.getSubjects(
                search, departmentId, programId, semesterId, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Subjects retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubjectDetailsResponse>> getSubjectById(@PathVariable Long id) {
        SubjectDetailsResponse response = subjectManagementService.getSubjectById(id);
        return ResponseEntity.ok(ApiResponse.success("Subject details retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SubjectSummaryResponse>> createSubject(
            @Valid @RequestBody CreateSubjectRequest request,
            HttpServletRequest httpRequest) {

        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        SubjectSummaryResponse created = subjectManagementService.createSubject(
                request, adminUsername, ipAddress, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Curriculum subject created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SubjectSummaryResponse>> updateSubject(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSubjectRequest request,
            HttpServletRequest httpRequest) {

        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        SubjectSummaryResponse updated = subjectManagementService.updateSubject(
                id, request, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Curriculum subject updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<SubjectSummaryResponse>> updateSubjectStatus(
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

        SubjectSummaryResponse updated = subjectManagementService.updateSubjectStatus(
                id, status, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Subject status updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        subjectManagementService.deleteSubject(id, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Subject deleted successfully", null));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
