package com.ahrao.controller.warden;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.warden.AssignMaintenanceRequest;
import com.ahrao.dto.warden.CreateWardenMaintenanceRequest;
import com.ahrao.dto.warden.UpdateMaintenanceStatusRequest;
import com.ahrao.dto.warden.WardenMaintenanceDetailDto;
import com.ahrao.dto.warden.WardenMaintenanceSummaryDto;
import com.ahrao.entity.enums.MaintenanceStatus;
import com.ahrao.entity.enums.PriorityLevel;
import com.ahrao.service.warden.WardenMaintenanceService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
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
@RequestMapping("/api/warden/maintenance")
@PreAuthorize("hasRole('WARDEN')")
public class WardenMaintenanceController {

    private final WardenMaintenanceService wardenMaintenanceService;

    public WardenMaintenanceController(WardenMaintenanceService wardenMaintenanceService) {
        this.wardenMaintenanceService = wardenMaintenanceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<WardenMaintenanceSummaryDto>>> getMaintenanceRequests(
            @RequestParam(required = false) Long hostelId,
            @RequestParam(required = false) Long blockId,
            @RequestParam(required = false) Integer floorNumber,
            @RequestParam(required = false) Long roomId,
            @RequestParam(required = false) MaintenanceStatus status,
            @RequestParam(required = false) PriorityLevel priority,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        PagedResponse<WardenMaintenanceSummaryDto> response = wardenMaintenanceService.getMaintenanceRequests(
                hostelId, blockId, floorNumber, roomId, status, priority, search, page, size, sortBy, sortDir);

        return ResponseEntity.ok(ApiResponse.success("Hostel maintenance requests retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WardenMaintenanceDetailDto>> getMaintenanceRequestById(@PathVariable Long id) {
        WardenMaintenanceDetailDto response = wardenMaintenanceService.getMaintenanceRequestById(id);
        return ResponseEntity.ok(ApiResponse.success("Hostel maintenance details retrieved successfully", response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<WardenMaintenanceDetailDto>> updateMaintenanceStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMaintenanceStatusRequest request,
            HttpServletRequest httpRequest) {

        WardenMaintenanceDetailDto response = wardenMaintenanceService.updateMaintenanceStatus(
                id,
                request,
                httpRequest.getRemoteAddr(),
                httpRequest.getHeader("User-Agent"));

        return ResponseEntity.ok(ApiResponse.success("Maintenance request status updated successfully", response));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<WardenMaintenanceDetailDto>> assignMaintenance(
            @PathVariable Long id,
            @Valid @RequestBody AssignMaintenanceRequest request,
            HttpServletRequest httpRequest) {

        WardenMaintenanceDetailDto response = wardenMaintenanceService.assignMaintenance(
                id,
                request,
                httpRequest.getRemoteAddr(),
                httpRequest.getHeader("User-Agent"));

        return ResponseEntity.ok(ApiResponse.success("Maintenance request assigned successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WardenMaintenanceDetailDto>> createMaintenanceRequest(
            @Valid @RequestBody CreateWardenMaintenanceRequest request,
            HttpServletRequest httpRequest) {

        WardenMaintenanceDetailDto response = wardenMaintenanceService.createMaintenanceRequest(
                request,
                httpRequest.getRemoteAddr(),
                httpRequest.getHeader("User-Agent"));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Maintenance request created successfully", response));
    }
}
