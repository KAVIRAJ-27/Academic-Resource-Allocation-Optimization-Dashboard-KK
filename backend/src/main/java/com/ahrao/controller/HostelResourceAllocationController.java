package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.hostel.allocation.*;
import com.ahrao.entity.user.User;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.hostel.HostelResourceAllocationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ahrao.dto.optimization.HostelOptimizationRequestDto;
import com.ahrao.dto.optimization.OptimizationResultDto;
import com.ahrao.dto.approval.AllocationTimelineItemDto;
import com.ahrao.service.optimization.HostelAllocationOptimizer;
import com.ahrao.service.approval.AllocationTrackingService;
import java.util.List;

@RestController
@RequestMapping("/api/hostel/resource-allocations")
@PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'HOD', 'WARDEN')")
public class HostelResourceAllocationController {

    private final HostelResourceAllocationService allocationService;
    private final HostelAllocationOptimizer optimizer;
    private final AllocationTrackingService trackingService;
    private final UserRepository userRepository;

    public HostelResourceAllocationController(
            HostelResourceAllocationService allocationService,
            HostelAllocationOptimizer optimizer,
            AllocationTrackingService trackingService,
            UserRepository userRepository) {
        this.allocationService = allocationService;
        this.optimizer = optimizer;
        this.trackingService = trackingService;
        this.userRepository = userRepository;
    }

    @PostMapping("/optimize")
    public ResponseEntity<ApiResponse<OptimizationResultDto>> optimizeAllocation(
            @RequestBody HostelOptimizationRequestDto request) {
        User currentUser = resolveCurrentUser();
        OptimizationResultDto result = optimizer.optimizeHostelAllocation(request, currentUser);
        return ResponseEntity.ok(ApiResponse.success(result.getMessage(), result));
    }

    @PostMapping("/preview")
    public ResponseEntity<ApiResponse<HostelAllocationPreviewDto>> previewAllocation(
            @Valid @RequestBody HostelAllocationPreviewRequestDto request) {
        User currentUser = resolveCurrentUser();
        HostelAllocationPreviewDto preview = allocationService.previewAllocation(request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Hostel allocation preview generated", preview));
    }

    @PostMapping("/auto")
    public ResponseEntity<ApiResponse<HostelAllocationResponseDto>> autoAllocate(
            @Valid @RequestBody AutoHostelAllocationRequestDto request,
            HttpServletRequest servletRequest) {
        User currentUser = resolveCurrentUser();
        String ipAddress = servletRequest.getRemoteAddr();
        String userAgent = servletRequest.getHeader("User-Agent");

        HostelAllocationResponseDto response = allocationService.autoAllocate(request, currentUser, ipAddress, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Hostel bed automatically allocated successfully", response));
    }

    @PostMapping({"/manual", ""})
    public ResponseEntity<ApiResponse<HostelAllocationResponseDto>> allocate(
            @Valid @RequestBody HostelAllocationRequestDto request,
            HttpServletRequest servletRequest) {
        User currentUser = resolveCurrentUser();
        String ipAddress = servletRequest.getRemoteAddr();
        String userAgent = servletRequest.getHeader("User-Agent");

        HostelAllocationResponseDto response = allocationService.allocate(request, currentUser, ipAddress, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Hostel bed allocated successfully", response));
    }

    @RequestMapping(value = "/{id}/release", method = {RequestMethod.POST, RequestMethod.PATCH})
    public ResponseEntity<ApiResponse<HostelAllocationResponseDto>> releaseAllocation(
            @PathVariable Long id,
            HttpServletRequest servletRequest) {
        User currentUser = resolveCurrentUser();
        String ipAddress = servletRequest.getRemoteAddr();
        String userAgent = servletRequest.getHeader("User-Agent");

        HostelAllocationResponseDto response = allocationService.releaseAllocation(id, currentUser, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Hostel allocation released successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<HostelAllocationResponseDto>>> getAllocations(
            HostelAllocationFilterParams params,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "allocatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        User currentUser = resolveCurrentUser();
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<HostelAllocationResponseDto> result = allocationService.getAllocations(params, pageable, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Hostel allocations retrieved successfully", result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HostelAllocationResponseDto>> getAllocationById(@PathVariable Long id) {
        User currentUser = resolveCurrentUser();
        HostelAllocationResponseDto response = allocationService.getAllocationById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Hostel allocation retrieved successfully", response));
    }

    @GetMapping("/{id}/timeline")
    public ResponseEntity<ApiResponse<List<AllocationTimelineItemDto>>> getAllocationTimeline(@PathVariable Long id) {
        User currentUser = resolveCurrentUser();
        List<AllocationTimelineItemDto> timeline = trackingService.getHostelAllocationTimeline(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Hostel allocation timeline retrieved successfully", timeline));
    }

    private User resolveCurrentUser() {
        return SecurityUtils.getCurrentUserId()
                .flatMap(userRepository::findByIdWithRoles)
                .orElseThrow(() -> new UnauthorizedException("User session is invalid or user not found."));
    }
}
