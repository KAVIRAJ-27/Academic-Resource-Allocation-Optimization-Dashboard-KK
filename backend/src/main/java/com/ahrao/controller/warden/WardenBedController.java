package com.ahrao.controller.warden;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.warden.WardenBedDetailDto;
import com.ahrao.dto.warden.WardenBedSummaryDto;
import com.ahrao.entity.enums.HostelBedStatus;
import com.ahrao.service.warden.WardenBedService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/warden/beds")
@PreAuthorize("hasRole('WARDEN')")
public class WardenBedController {

    private final WardenBedService wardenBedService;

    public WardenBedController(WardenBedService wardenBedService) {
        this.wardenBedService = wardenBedService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<WardenBedSummaryDto>>> getBeds(
            @RequestParam(required = false) Long hostelId,
            @RequestParam(required = false) Long blockId,
            @RequestParam(required = false) Integer floorNumber,
            @RequestParam(required = false) Long roomId,
            @RequestParam(required = false) HostelBedStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "bedNumber") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<WardenBedSummaryDto> response = wardenBedService.getBeds(
                hostelId, blockId, floorNumber, roomId, status, search, pageable);

        return ResponseEntity.ok(ApiResponse.success("Hostel beds retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WardenBedDetailDto>> getBedById(@PathVariable Long id) {
        WardenBedDetailDto bed = wardenBedService.getBedById(id);
        return ResponseEntity.ok(ApiResponse.success("Hostel bed details retrieved successfully", bed));
    }
}
