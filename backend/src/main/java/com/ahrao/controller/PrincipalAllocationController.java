package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.principal.allocation.PrincipalAllocationDetailDto;
import com.ahrao.dto.principal.allocation.PrincipalAllocationSummaryDto;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.principal.PrincipalAllocationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/principal/allocations")
@PreAuthorize("hasRole('PRINCIPAL')")
public class PrincipalAllocationController {

    private static final Logger log = LoggerFactory.getLogger(PrincipalAllocationController.class);

    private final PrincipalAllocationService allocationService;

    public PrincipalAllocationController(PrincipalAllocationService allocationService) {
        this.allocationService = allocationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<PrincipalAllocationSummaryDto>>> getInstitutionAllocations(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long resourceId,
            @RequestParam(required = false) Long facultyId,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Long sectionId,
            @RequestParam(required = false) AllocationStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
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
        PagedResponse<PrincipalAllocationSummaryDto> response = allocationService.getInstitutionAllocations(
                currentUserId, departmentId, resourceId, facultyId, subjectId, sectionId, status, date, pageable
        );

        return ResponseEntity.ok(ApiResponse.success("Institution resource allocations retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PrincipalAllocationDetailDto>> getAllocationById(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated Principal context not found"));

        PrincipalAllocationDetailDto detail = allocationService.getAllocationById(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.success("Resource allocation details retrieved successfully", detail));
    }
}
