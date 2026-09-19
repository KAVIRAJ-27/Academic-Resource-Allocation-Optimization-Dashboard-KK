package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.principal.approval.PrincipalApprovalActionRequest;
import com.ahrao.dto.principal.approval.PrincipalApprovalDetailDto;
import com.ahrao.dto.principal.approval.PrincipalApprovalSummaryDto;
import com.ahrao.entity.enums.ApprovalLevel;
import com.ahrao.entity.enums.ApprovalStatus;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.principal.PrincipalApprovalService;
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
@RequestMapping("/api/principal/approvals")
@PreAuthorize("hasRole('PRINCIPAL')")
public class PrincipalApprovalController {

    private final PrincipalApprovalService approvalService;

    public PrincipalApprovalController(PrincipalApprovalService approvalService) {
        this.approvalService = approvalService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<PrincipalApprovalSummaryDto>>> getInstitutionApprovals(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) ApprovalStatus status,
            @RequestParam(required = false) ApprovalLevel approvalLevel,
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
        PagedResponse<PrincipalApprovalSummaryDto> response = approvalService.getInstitutionApprovals(
                currentUserId, departmentId, status, approvalLevel, fromDate, toDate, pageable
        );

        return ResponseEntity.ok(ApiResponse.success("Institution approvals retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PrincipalApprovalDetailDto>> getApprovalById(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated Principal context not found"));

        PrincipalApprovalDetailDto detail = approvalService.getApprovalById(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.success("Approval details retrieved successfully", detail));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<PrincipalApprovalDetailDto>> approveApproval(
            @PathVariable Long id,
            @RequestBody(required = false) PrincipalApprovalActionRequest actionRequest
    ) {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated Principal context not found"));

        PrincipalApprovalDetailDto updated = approvalService.approveApproval(currentUserId, id, actionRequest);
        return ResponseEntity.ok(ApiResponse.success("Approval processed successfully: Approved", updated));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<PrincipalApprovalDetailDto>> rejectApproval(
            @PathVariable Long id,
            @Valid @RequestBody PrincipalApprovalActionRequest actionRequest
    ) {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated Principal context not found"));

        PrincipalApprovalDetailDto updated = approvalService.rejectApproval(currentUserId, id, actionRequest);
        return ResponseEntity.ok(ApiResponse.success("Approval processed successfully: Rejected", updated));
    }
}
