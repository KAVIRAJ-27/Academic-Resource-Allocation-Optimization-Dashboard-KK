package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.resource.CreateEquipmentRequest;
import com.ahrao.dto.resource.EquipmentDetailsResponse;
import com.ahrao.dto.resource.EquipmentSummaryResponse;
import com.ahrao.dto.resource.UpdateEquipmentRequest;
import com.ahrao.service.resource.EquipmentManagementService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/equipment")
@PreAuthorize("hasRole('ADMIN')")
public class AdminEquipmentController {

    private final EquipmentManagementService service;

    public AdminEquipmentController(EquipmentManagementService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<EquipmentSummaryResponse>>> getEquipment(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String conditionStatus,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "serialNumber") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<EquipmentSummaryResponse> response = service.getEquipment(search, departmentId, conditionStatus, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Equipment retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EquipmentDetailsResponse>> getEquipmentById(@PathVariable Long id) {
        EquipmentDetailsResponse response = service.getEquipmentById(id);
        return ResponseEntity.ok(ApiResponse.success("Equipment retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EquipmentDetailsResponse>> createEquipment(
            @Valid @RequestBody CreateEquipmentRequest request,
            Authentication auth,
            HttpServletRequest req) {

        String username = auth != null ? auth.getName() : "ADMIN";
        EquipmentDetailsResponse response = service.createEquipment(request, username, req.getRemoteAddr(), req.getHeader("User-Agent"));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Equipment created successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EquipmentDetailsResponse>> updateEquipment(
            @PathVariable Long id,
            @Valid @RequestBody UpdateEquipmentRequest request,
            Authentication auth,
            HttpServletRequest req) {

        String username = auth != null ? auth.getName() : "ADMIN";
        EquipmentDetailsResponse response = service.updateEquipment(id, request, username, req.getRemoteAddr(), req.getHeader("User-Agent"));
        return ResponseEntity.ok(ApiResponse.success("Equipment updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<EquipmentSummaryResponse>> changeStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication auth,
            HttpServletRequest req) {

        String username = auth != null ? auth.getName() : "ADMIN";
        EquipmentSummaryResponse response = service.changeStatus(id, status, username, req.getRemoteAddr(), req.getHeader("User-Agent"));
        return ResponseEntity.ok(ApiResponse.success("Equipment status updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEquipment(
            @PathVariable Long id,
            Authentication auth,
            HttpServletRequest req) {

        String username = auth != null ? auth.getName() : "ADMIN";
        service.deleteEquipment(id, username, req.getRemoteAddr(), req.getHeader("User-Agent"));
        return ResponseEntity.ok(ApiResponse.success("Equipment deleted successfully", null));
    }
}
