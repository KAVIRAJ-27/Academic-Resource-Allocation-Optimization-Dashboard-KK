package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.approval.*;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.entity.user.User;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.approval.ApprovalService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/approvals")
@PreAuthorize("isAuthenticated()")
public class ApprovalController {

    private final ApprovalService approvalService;
    private final UserRepository userRepository;

    public ApprovalController(ApprovalService approvalService, UserRepository userRepository) {
        this.approvalService = approvalService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ApprovalSummaryDto>> createApproval(
            @Valid @RequestBody CreateApprovalRequestDto requestDto) {
        User currentUser = resolveCurrentUser();
        ApprovalSummaryDto result = approvalService.createApproval(requestDto, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Approval request created successfully", result));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ApprovalSummaryDto>>> getApprovals(
            ApprovalFilterParams params,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        User currentUser = resolveCurrentUser();
        Pageable pageable = buildPageable(page, size, sort);
        PagedResponse<ApprovalSummaryDto> result = approvalService.getApprovals(params, pageable, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Approvals retrieved successfully", result));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<PagedResponse<ApprovalSummaryDto>>> getPendingApprovals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        User currentUser = resolveCurrentUser();
        Pageable pageable = buildPageable(page, size, sort);
        PagedResponse<ApprovalSummaryDto> result = approvalService.getPendingApprovals(pageable, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Pending approvals retrieved successfully", result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ApprovalDetailDto>> getApprovalById(@PathVariable Long id) {
        User currentUser = resolveCurrentUser();
        ApprovalDetailDto result = approvalService.getApprovalById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Approval details retrieved successfully", result));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'HOD', 'WARDEN')")
    public ResponseEntity<ApiResponse<ApprovalDetailDto>> approve(
            @PathVariable Long id,
            @RequestBody(required = false) ApprovalActionRequestDto actionRequest,
            HttpServletRequest request) {
        User currentUser = resolveCurrentUser();
        ApprovalDetailDto result = approvalService.approve(id, actionRequest, currentUser,
                request.getRemoteAddr(), request.getHeader("User-Agent"));
        return ResponseEntity.ok(ApiResponse.success("Request approved and resource allocated successfully", result));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'HOD', 'WARDEN')")
    public ResponseEntity<ApiResponse<ApprovalDetailDto>> reject(
            @PathVariable Long id,
            @RequestBody(required = false) ApprovalActionRequestDto actionRequest,
            HttpServletRequest request) {
        User currentUser = resolveCurrentUser();
        ApprovalDetailDto result = approvalService.reject(id, actionRequest, currentUser,
                request.getRemoteAddr(), request.getHeader("User-Agent"));
        return ResponseEntity.ok(ApiResponse.success("Request rejected successfully", result));
    }

    @GetMapping("/{id}/timeline")
    public ResponseEntity<ApiResponse<List<AllocationTimelineItemDto>>> getTimeline(@PathVariable Long id) {
        User currentUser = resolveCurrentUser();
        List<AllocationTimelineItemDto> timeline = approvalService.getApprovalTimeline(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Approval timeline retrieved successfully", timeline));
    }

    private User resolveCurrentUser() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated context not found"));
        return userRepository.findByIdWithRoles(currentUserId)
                .orElseThrow(() -> new UnauthorizedException("User not found with id: " + currentUserId));
    }

    private Pageable buildPageable(int page, int size, String sort) {
        int validatedSize = Math.min(Math.max(size, 1), 100);
        String[] sortParts = sort.split(",");
        String sortProp = sortParts[0];
        Sort.Direction sortDir = sortParts.length > 1 && "asc".equalsIgnoreCase(sortParts[1])
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        return PageRequest.of(page, validatedSize, Sort.by(sortDir, sortProp));
    }
}
