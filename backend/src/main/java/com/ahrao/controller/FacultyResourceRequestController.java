package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.faculty.resource.*;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.faculty.FacultyResourceRequestService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/faculty/resource-requests")
@PreAuthorize("hasRole('FACULTY')")
public class FacultyResourceRequestController {

    private final FacultyResourceRequestService requestService;

    public FacultyResourceRequestController(FacultyResourceRequestService requestService) {
        this.requestService = requestService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<FacultyResourceRequestDto>>> getMyRequests(
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated faculty context not found"));

        PagedResponse<FacultyResourceRequestDto> response = requestService.getMyRequests(
                currentUserId, status, categoryId, date, search, page, size, sortBy, sortDirection);

        return ResponseEntity.ok(ApiResponse.success("Resource requests retrieved successfully", response));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<FacultyResourceRequestSummaryCountsDto>> getRequestCounts() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated faculty context not found"));

        FacultyResourceRequestSummaryCountsDto counts = requestService.getRequestCounts(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Request summary counts retrieved successfully", counts));
    }

    @GetMapping("/resources")
    public ResponseEntity<ApiResponse<List<FacultyAvailableResourceDto>>> getAvailableResources(
            @RequestParam(required = false) Long categoryId) {

        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated faculty context not found"));

        List<FacultyAvailableResourceDto> resources = requestService.getAvailableResources(currentUserId, categoryId);
        return ResponseEntity.ok(ApiResponse.success("Available resources retrieved successfully", resources));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FacultyResourceRequestDetailsDto>> getRequestById(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated faculty context not found"));

        FacultyResourceRequestDetailsDto dto = requestService.getRequestById(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.success("Resource request details retrieved successfully", dto));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FacultyResourceRequestDto>> createRequest(
            @Valid @RequestBody CreateFacultyResourceRequest request,
            HttpServletRequest httpRequest) {

        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated faculty context not found"));

        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        FacultyResourceRequestDto created = requestService.createRequest(currentUserId, request, ipAddress, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resource request submitted successfully", created));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<FacultyResourceRequestDto>> cancelRequest(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated faculty context not found"));

        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        FacultyResourceRequestDto cancelled = requestService.cancelRequest(currentUserId, id, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Resource request cancelled successfully", cancelled));
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        return (xf != null && !xf.isBlank()) ? xf.split(",")[0].trim() : request.getRemoteAddr();
    }
}
