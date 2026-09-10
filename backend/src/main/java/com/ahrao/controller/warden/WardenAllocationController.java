package com.ahrao.controller.warden;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.warden.CreateHostelAllocationRequest;
import com.ahrao.dto.warden.WardenAllocationDetailDto;
import com.ahrao.dto.warden.WardenAllocationSummaryDto;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.service.warden.WardenAllocationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/warden/allocations")
@PreAuthorize("hasRole('WARDEN')")
public class WardenAllocationController {

    private final WardenAllocationService wardenAllocationService;

    public WardenAllocationController(WardenAllocationService wardenAllocationService) {
        this.wardenAllocationService = wardenAllocationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<WardenAllocationSummaryDto>>> getAllocations(
            @RequestParam(required = false) Long hostelId,
            @RequestParam(required = false) Long blockId,
            @RequestParam(required = false) Integer floorNumber,
            @RequestParam(required = false) Long roomId,
            @RequestParam(required = false) AllocationStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "allocatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<WardenAllocationSummaryDto> response = wardenAllocationService.getAllocations(
                hostelId, blockId, floorNumber, roomId, status, search, pageable);

        return ResponseEntity.ok(ApiResponse.success("Hostel allocations retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WardenAllocationDetailDto>> getAllocationById(@PathVariable Long id) {
        WardenAllocationDetailDto allocation = wardenAllocationService.getAllocationById(id);
        return ResponseEntity.ok(ApiResponse.success("Hostel allocation details retrieved successfully", allocation));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WardenAllocationSummaryDto>> createAllocation(
            @Valid @RequestBody CreateHostelAllocationRequest request,
            HttpServletRequest servletRequest) {

        String ipAddress = servletRequest.getRemoteAddr();
        String userAgent = servletRequest.getHeader("User-Agent");

        WardenAllocationSummaryDto allocation = wardenAllocationService.createAllocation(request, ipAddress, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Student hostel allocation created successfully", allocation));
    }

    @PatchMapping("/{id}/release")
    public ResponseEntity<ApiResponse<WardenAllocationSummaryDto>> releaseAllocation(
            @PathVariable Long id,
            HttpServletRequest servletRequest) {

        String ipAddress = servletRequest.getRemoteAddr();
        String userAgent = servletRequest.getHeader("User-Agent");

        WardenAllocationSummaryDto allocation = wardenAllocationService.releaseAllocation(id, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Student hostel allocation released successfully", allocation));
    }
}
