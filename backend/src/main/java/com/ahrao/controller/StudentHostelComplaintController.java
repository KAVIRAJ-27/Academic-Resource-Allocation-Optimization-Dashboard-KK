package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.student.hostel.complaint.CreateStudentHostelComplaint;
import com.ahrao.dto.student.hostel.complaint.StudentHostelComplaintDto;
import com.ahrao.dto.student.hostel.complaint.StudentHostelComplaintSummaryCountsDto;
import com.ahrao.entity.enums.ComplaintStatus;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.student.StudentHostelComplaintService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student/hostel/complaints")
@PreAuthorize("hasRole('STUDENT')")
public class StudentHostelComplaintController {

    private final StudentHostelComplaintService complaintService;

    public StudentHostelComplaintController(StudentHostelComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<StudentHostelComplaintDto>>> getMyComplaints(
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated student context not found"));

        PagedResponse<StudentHostelComplaintDto> response = complaintService.getMyComplaints(
                currentUserId, status, category, search, page, size, sortBy, sortDirection);

        return ResponseEntity.ok(ApiResponse.success("Hostel complaints retrieved successfully", response));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<StudentHostelComplaintSummaryCountsDto>> getComplaintCounts() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated student context not found"));

        StudentHostelComplaintSummaryCountsDto counts = complaintService.getComplaintCounts(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Hostel complaint summary counts retrieved successfully", counts));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentHostelComplaintDto>> getComplaintById(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated student context not found"));

        StudentHostelComplaintDto dto = complaintService.getComplaintById(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.success("Hostel complaint details retrieved successfully", dto));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StudentHostelComplaintDto>> createComplaint(
            @Valid @RequestBody CreateStudentHostelComplaint request,
            HttpServletRequest httpRequest) {

        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated student context not found"));

        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        StudentHostelComplaintDto created = complaintService.createComplaint(currentUserId, request, ipAddress, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Hostel complaint submitted successfully", created));
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        return (xf != null && !xf.isBlank()) ? xf.split(",")[0].trim() : request.getRemoteAddr();
    }
}
