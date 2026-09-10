package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.student.CreateStudentRequest;
import com.ahrao.dto.student.StudentDetailsResponse;
import com.ahrao.dto.student.StudentReferenceDataResponse;
import com.ahrao.dto.student.StudentSummaryResponse;
import com.ahrao.dto.student.UpdateStudentRequest;
import com.ahrao.dto.student.UpdateStudentStatusRequest;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.academic.AdminStudentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/students")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStudentController {

    private final AdminStudentService adminStudentService;

    public AdminStudentController(AdminStudentService adminStudentService) {
        this.adminStudentService = adminStudentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<StudentSummaryResponse>>> getStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long programId,
            @RequestParam(required = false) Long sectionId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        PagedResponse<StudentSummaryResponse> response = adminStudentService.getStudents(
                search, departmentId, programId, sectionId, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Students retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentDetailsResponse>> getStudentById(@PathVariable Long id) {
        StudentDetailsResponse response = adminStudentService.getStudentById(id);
        return ResponseEntity.ok(ApiResponse.success("Student details retrieved successfully", response));
    }

    @GetMapping("/reference-data")
    public ResponseEntity<ApiResponse<StudentReferenceDataResponse>> getReferenceData() {
        StudentReferenceDataResponse response = adminStudentService.getReferenceData();
        return ResponseEntity.ok(ApiResponse.success("Student reference data retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StudentSummaryResponse>> createStudent(
            @Valid @RequestBody CreateStudentRequest request,
            HttpServletRequest httpRequest) {
        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        StudentSummaryResponse created = adminStudentService.createStudent(request, adminUsername, ipAddress, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Student created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentSummaryResponse>> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStudentRequest request,
            HttpServletRequest httpRequest) {
        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        StudentSummaryResponse updated = adminStudentService.updateStudent(id, request, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Student updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<StudentSummaryResponse>> updateStudentStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStudentStatusRequest request,
            HttpServletRequest httpRequest) {
        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        StudentSummaryResponse updated = adminStudentService.updateStudentStatus(
                id, request.getStatus(), adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Student status updated successfully", updated));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
