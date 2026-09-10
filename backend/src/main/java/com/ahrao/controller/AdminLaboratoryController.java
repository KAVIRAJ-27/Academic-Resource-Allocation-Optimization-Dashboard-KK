package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.resource.CreateLaboratoryRequest;
import com.ahrao.dto.resource.LaboratoryDetailsResponse;
import com.ahrao.dto.resource.LaboratorySummaryResponse;
import com.ahrao.dto.resource.UpdateLaboratoryRequest;
import com.ahrao.service.resource.LaboratoryManagementService;
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
@RequestMapping("/api/admin/laboratories")
@PreAuthorize("hasRole('ADMIN')")
public class AdminLaboratoryController {

    private final LaboratoryManagementService service;

    public AdminLaboratoryController(LaboratoryManagementService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<LaboratorySummaryResponse>>> getLaboratories(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String labType,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "building") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<LaboratorySummaryResponse> response = service.getLaboratories(search, departmentId, labType, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Laboratories retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LaboratoryDetailsResponse>> getLaboratoryById(@PathVariable Long id) {
        LaboratoryDetailsResponse response = service.getLaboratoryById(id);
        return ResponseEntity.ok(ApiResponse.success("Laboratory retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LaboratoryDetailsResponse>> createLaboratory(
            @Valid @RequestBody CreateLaboratoryRequest request,
            Authentication auth,
            HttpServletRequest req) {

        String username = auth != null ? auth.getName() : "ADMIN";
        LaboratoryDetailsResponse response = service.createLaboratory(request, username, req.getRemoteAddr(), req.getHeader("User-Agent"));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Laboratory created successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LaboratoryDetailsResponse>> updateLaboratory(
            @PathVariable Long id,
            @Valid @RequestBody UpdateLaboratoryRequest request,
            Authentication auth,
            HttpServletRequest req) {

        String username = auth != null ? auth.getName() : "ADMIN";
        LaboratoryDetailsResponse response = service.updateLaboratory(id, request, username, req.getRemoteAddr(), req.getHeader("User-Agent"));
        return ResponseEntity.ok(ApiResponse.success("Laboratory updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<LaboratorySummaryResponse>> changeStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication auth,
            HttpServletRequest req) {

        String username = auth != null ? auth.getName() : "ADMIN";
        LaboratorySummaryResponse response = service.changeStatus(id, status, username, req.getRemoteAddr(), req.getHeader("User-Agent"));
        return ResponseEntity.ok(ApiResponse.success("Laboratory status updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLaboratory(
            @PathVariable Long id,
            Authentication auth,
            HttpServletRequest req) {

        String username = auth != null ? auth.getName() : "ADMIN";
        service.deleteLaboratory(id, username, req.getRemoteAddr(), req.getHeader("User-Agent"));
        return ResponseEntity.ok(ApiResponse.success("Laboratory deleted successfully", null));
    }
}
