package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.hod.resource.HodResourceAllocationDetailDto;
import com.ahrao.dto.hod.resource.HodResourceAllocationOverviewKpiDto;
import com.ahrao.dto.hod.resource.HodResourceAllocationSummaryDto;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.hod.HodResourceAllocationService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/hod/allocations")
@PreAuthorize("hasRole('HOD')")
public class HodResourceAllocationController {

    private final HodResourceAllocationService allocationService;

    public HodResourceAllocationController(HodResourceAllocationService allocationService) {
        this.allocationService = allocationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<HodResourceAllocationSummaryDto>>> getDepartmentAllocations(
            @RequestParam(required = false) Long resourceId,
            @RequestParam(required = false) Long allocatedToUserId,
            @RequestParam(required = false) AllocationStatus status,
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
        PagedResponse<HodResourceAllocationSummaryDto> response = allocationService.getDepartmentAllocations(
                currentUserId, resourceId, allocatedToUserId, status, fromDate, toDate, pageable
        );

        return ResponseEntity.ok(ApiResponse.success("Department resource allocations retrieved successfully", response));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<HodResourceAllocationOverviewKpiDto>> getAllocationSummary() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated HOD context not found"));

        HodResourceAllocationOverviewKpiDto summary = allocationService.getAllocationSummary(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Department resource allocation summary retrieved successfully", summary));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HodResourceAllocationDetailDto>> getAllocationDetails(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated HOD context not found"));

        HodResourceAllocationDetailDto detail = allocationService.getAllocationDetails(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.success("Resource allocation details retrieved successfully", detail));
    }
}
