package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.hod.resource.HodApprovalActionRequest;
import com.ahrao.dto.hod.resource.HodResourceRequestDetailDto;
import com.ahrao.dto.hod.resource.HodResourceRequestOverviewKpiDto;
import com.ahrao.dto.hod.resource.HodResourceRequestSummaryDto;
import com.ahrao.entity.enums.PriorityLevel;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.hod.HodResourceRequestService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/hod/resource-requests")
@PreAuthorize("hasRole('HOD')")
public class HodResourceRequestController {

    private final HodResourceRequestService resourceRequestService;

    public HodResourceRequestController(HodResourceRequestService resourceRequestService) {
        this.resourceRequestService = resourceRequestService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<HodResourceRequestSummaryDto>>> getDepartmentRequests(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long resourceId,
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(required = false) PriorityLevel priority,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort
    ) {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated HOD context not found"));

        int validatedSize = Math.min(Math.max(size, 1), 100);
        String[] sortParts = sort.split(",");
        String sortProp = sortParts[0];
        Sort.Direction sortDir = sortParts.length > 1 && "asc".equalsIgnoreCase(sortParts[1])
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, validatedSize, Sort.by(sortDir, sortProp));
        PagedResponse<HodResourceRequestSummaryDto> response = resourceRequestService.getDepartmentRequests(
                currentUserId, categoryId, resourceId, status, priority, search, fromDate, toDate, pageable
        );

        return ResponseEntity.ok(ApiResponse.success("Department resource requests retrieved successfully", response));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<HodResourceRequestOverviewKpiDto>> getRequestSummary() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated HOD context not found"));

        HodResourceRequestOverviewKpiDto summary = resourceRequestService.getRequestSummary(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Department resource request summary retrieved successfully", summary));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HodResourceRequestDetailDto>> getRequestDetails(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated HOD context not found"));

        HodResourceRequestDetailDto detail = resourceRequestService.getRequestDetails(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.success("Resource request details retrieved successfully", detail));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<HodResourceRequestDetailDto>> approveRequest(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) HodApprovalActionRequest actionRequest
    ) {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated HOD context not found"));

        HodResourceRequestDetailDto updated = resourceRequestService.approveRequest(currentUserId, id, actionRequest);
        return ResponseEntity.ok(ApiResponse.success("Academic resource request approved successfully", updated));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<HodResourceRequestDetailDto>> rejectRequest(
            @PathVariable Long id,
            @Valid @RequestBody HodApprovalActionRequest actionRequest
    ) {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated HOD context not found"));

        HodResourceRequestDetailDto updated = resourceRequestService.rejectRequest(currentUserId, id, actionRequest);
        return ResponseEntity.ok(ApiResponse.success("Academic resource request rejected successfully", updated));
    }
}
