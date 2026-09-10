package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.student.hostel.request.CreateStudentHostelRequest;
import com.ahrao.dto.student.hostel.request.StudentHostelRequestDto;
import com.ahrao.dto.student.hostel.request.StudentHostelRequestSummaryCountsDto;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.student.StudentHostelRequestService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student/hostel/requests")
@PreAuthorize("hasRole('STUDENT')")
public class StudentHostelRequestController {

    private final StudentHostelRequestService requestService;

    public StudentHostelRequestController(StudentHostelRequestService requestService) {
        this.requestService = requestService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<StudentHostelRequestDto>>> getMyRequests(
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(required = false) String requestType,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated student context not found"));

        PagedResponse<StudentHostelRequestDto> response = requestService.getMyRequests(
                currentUserId, status, requestType, search, page, size, sortBy, sortDirection);

        return ResponseEntity.ok(ApiResponse.success("Hostel requests retrieved successfully", response));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<StudentHostelRequestSummaryCountsDto>> getRequestCounts() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated student context not found"));

        StudentHostelRequestSummaryCountsDto counts = requestService.getRequestCounts(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Hostel request summary counts retrieved successfully", counts));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentHostelRequestDto>> getRequestById(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated student context not found"));

        StudentHostelRequestDto dto = requestService.getRequestById(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.success("Hostel request details retrieved successfully", dto));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StudentHostelRequestDto>> createRequest(
            @Valid @RequestBody CreateStudentHostelRequest request,
            HttpServletRequest httpRequest) {

        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated student context not found"));

        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        StudentHostelRequestDto created = requestService.createRequest(currentUserId, request, ipAddress, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Hostel request submitted successfully", created));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<StudentHostelRequestDto>> cancelRequest(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated student context not found"));

        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        StudentHostelRequestDto cancelled = requestService.cancelRequest(currentUserId, id, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Hostel request cancelled successfully", cancelled));
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        return (xf != null && !xf.isBlank()) ? xf.split(",")[0].trim() : request.getRemoteAddr();
    }
}
