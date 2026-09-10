package com.ahrao.controller.warden;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.warden.UpdateFacilityRequest;
import com.ahrao.dto.warden.WardenFacilityDetailDto;
import com.ahrao.dto.warden.WardenFacilitySummaryDto;
import com.ahrao.service.warden.WardenResourceService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/warden/resources")
@PreAuthorize("hasRole('WARDEN')")
public class WardenResourceController {

    private final WardenResourceService wardenResourceService;

    public WardenResourceController(WardenResourceService wardenResourceService) {
        this.wardenResourceService = wardenResourceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<WardenFacilitySummaryDto>>> getFacilities(
            @RequestParam(required = false) Long hostelId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        PagedResponse<WardenFacilitySummaryDto> response = wardenResourceService.getFacilities(
                hostelId, status, search, page, size, sortBy, sortDir);

        return ResponseEntity.ok(ApiResponse.success("Hostel resources retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WardenFacilityDetailDto>> getFacilityById(@PathVariable Long id) {
        WardenFacilityDetailDto response = wardenResourceService.getFacilityById(id);
        return ResponseEntity.ok(ApiResponse.success("Hostel resource details retrieved successfully", response));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<WardenFacilityDetailDto>> updateFacility(
            @PathVariable Long id,
            @Valid @RequestBody UpdateFacilityRequest request,
            HttpServletRequest httpRequest) {

        WardenFacilityDetailDto response = wardenResourceService.updateFacility(
                id,
                request,
                httpRequest.getRemoteAddr(),
                httpRequest.getHeader("User-Agent"));

        return ResponseEntity.ok(ApiResponse.success("Hostel resource updated successfully", response));
    }
}
