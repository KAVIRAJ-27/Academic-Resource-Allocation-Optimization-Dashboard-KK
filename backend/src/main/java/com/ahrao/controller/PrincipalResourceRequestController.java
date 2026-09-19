package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.principal.approval.PrincipalApprovalActionRequest;
import com.ahrao.dto.principal.resource.PrincipalResourceRequestDetailDto;
import com.ahrao.dto.principal.resource.PrincipalResourceRequestSummaryDto;
import com.ahrao.entity.enums.PriorityLevel;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.principal.PrincipalResourceRequestService;
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
@RequestMapping("/api/principal/resource-requests")
@PreAuthorize("hasRole('PRINCIPAL')")
public class PrincipalResourceRequestController {

    private final PrincipalResourceRequestService resourceRequestService;

    public PrincipalResourceRequestController(PrincipalResourceRequestService resourceRequestService) {
        this.resourceRequestService = resourceRequestService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<PrincipalResourceRequestSummaryDto>>> getInstitutionRequests(
            @RequestParam(required = false) Long departmentId,
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
                .orElseThrow(() -> new UnauthorizedException("Authenticated Principal context not found"));

        int validatedSize = Math.min(Math.max(size, 1), 100);
        String[] sortParts = sort.split(",");
        String sortProp = sortParts[0];
        Sort.Direction sortDir = sortParts.length > 1 && "asc".equalsIgnoreCase(sortParts[1])
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, validatedSize, Sort.by(sortDir, sortProp));
        PagedResponse<PrincipalResourceRequestSummaryDto> response = resourceRequestService.getInstitutionRequests(
                currentUserId, departmentId, categoryId, resourceId, status, priority, search, fromDate, toDate, pageable
        );

        return ResponseEntity.ok(ApiResponse.success("Institution resource requests retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PrincipalResourceRequestDetailDto>> getRequestById(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated Principal context not found"));

        PrincipalResourceRequestDetailDto detail = resourceRequestService.getRequestById(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.success("Resource request details retrieved successfully", detail));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<PrincipalResourceRequestDetailDto>> approveRequest(
            @PathVariable Long id,
            @RequestBody(required = false) PrincipalApprovalActionRequest actionRequest
    ) {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated Principal context not found"));

        PrincipalResourceRequestDetailDto updated = resourceRequestService.approveRequest(currentUserId, id, actionRequest);
        return ResponseEntity.ok(ApiResponse.success("Academic resource request approved successfully by Principal", updated));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<PrincipalResourceRequestDetailDto>> rejectRequest(
            @PathVariable Long id,
            @Valid @RequestBody PrincipalApprovalActionRequest actionRequest
    ) {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated Principal context not found"));

        PrincipalResourceRequestDetailDto updated = resourceRequestService.rejectRequest(currentUserId, id, actionRequest);
        return ResponseEntity.ok(ApiResponse.success("Academic resource request rejected successfully by Principal", updated));
    }
}
