package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.academic.allocation.*;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.entity.user.User;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.academic.allocation.AcademicAllocationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ahrao.dto.optimization.AcademicOptimizationRequestDto;
import com.ahrao.dto.optimization.OptimizationResultDto;
import com.ahrao.dto.approval.AllocationTimelineItemDto;
import com.ahrao.service.optimization.AcademicAllocationOptimizer;
import com.ahrao.service.approval.AllocationTrackingService;
import java.util.List;

@RestController
@RequestMapping("/api/academic/resource-allocations")
@PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY')")
public class AcademicAllocationController {

    private final AcademicAllocationService allocationService;
    private final AcademicAllocationOptimizer optimizer;
    private final AllocationTrackingService trackingService;
    private final UserRepository userRepository;

    public AcademicAllocationController(
            AcademicAllocationService allocationService,
            AcademicAllocationOptimizer optimizer,
            AllocationTrackingService trackingService,
            UserRepository userRepository
    ) {
        this.allocationService = allocationService;
        this.optimizer = optimizer;
        this.trackingService = trackingService;
        this.userRepository = userRepository;
    }

    @PostMapping("/optimize")
    public ResponseEntity<ApiResponse<OptimizationResultDto>> optimizeAllocation(
            @RequestBody AcademicOptimizationRequestDto request
    ) {
        User currentUser = resolveCurrentUser();
        OptimizationResultDto result = optimizer.optimizeAcademicAllocation(request, currentUser);
        return ResponseEntity.ok(ApiResponse.success(result.getMessage(), result));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AcademicAllocationDetailDto>> allocateResource(
            @Valid @RequestBody CreateAcademicAllocationRequest request
    ) {
        User currentUser = resolveCurrentUser();
        AcademicAllocationDetailDto dto = allocationService.allocateResource(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Academic resource allocated successfully", dto));
    }

    @PostMapping("/auto")
    public ResponseEntity<ApiResponse<AcademicAllocationDetailDto>> autoAllocateResource(
            @Valid @RequestBody AutoAcademicAllocationRequest request
    ) {
        User currentUser = resolveCurrentUser();
        AcademicAllocationDetailDto dto = allocationService.autoAllocateResource(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Academic resource auto-allocated successfully", dto));
    }

    @PostMapping("/preview")
    public ResponseEntity<ApiResponse<AcademicAllocationPreviewDto>> previewAllocation(
            @Valid @RequestBody PreviewAcademicAllocationRequest request
    ) {
        User currentUser = resolveCurrentUser();
        AcademicAllocationPreviewDto dto = allocationService.previewAllocation(request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Allocation preview evaluated successfully", dto));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<AcademicAllocationSummaryDto>>> getAllocations(
            @ModelAttribute AcademicAllocationFilterParams filters
    ) {
        User currentUser = resolveCurrentUser();
        Sort.Direction direction = "asc".equalsIgnoreCase(filters.getSortDir()) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortProperty = filters.getSortBy() != null ? filters.getSortBy() : "createdAt";
        Pageable pageable = PageRequest.of(filters.getPage(), filters.getSize(), Sort.by(direction, sortProperty));

        PagedResponse<AcademicAllocationSummaryDto> response = allocationService.getAllocations(filters, pageable, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Academic resource allocations retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AcademicAllocationDetailDto>> getAllocationById(
            @PathVariable Long id
    ) {
        User currentUser = resolveCurrentUser();
        AcademicAllocationDetailDto dto = allocationService.getAllocationById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Academic resource allocation retrieved successfully", dto));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<AcademicAllocationDetailDto>> cancelAllocation(
            @PathVariable Long id,
            @RequestParam(required = false) String remarks
    ) {
        User currentUser = resolveCurrentUser();
        AcademicAllocationDetailDto dto = allocationService.cancelAllocation(id, remarks, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Academic resource allocation cancelled successfully", dto));
    }

    @GetMapping("/{id}/timeline")
    public ResponseEntity<ApiResponse<List<AllocationTimelineItemDto>>> getAllocationTimeline(
            @PathVariable Long id
    ) {
        User currentUser = resolveCurrentUser();
        List<AllocationTimelineItemDto> timeline = trackingService.getAcademicAllocationTimeline(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Academic resource allocation timeline retrieved successfully", timeline));
    }

    private User resolveCurrentUser() {
        Long userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated user context not found."));
        return userRepository.findByIdWithRoles(userId)
                .orElseThrow(() -> new UnauthorizedException("User record not found in system."));
    }
}
