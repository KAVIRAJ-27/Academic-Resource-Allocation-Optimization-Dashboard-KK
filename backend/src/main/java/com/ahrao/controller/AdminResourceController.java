package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.resource.CreateResourceRequest;
import com.ahrao.dto.resource.ResourceDetailsResponse;
import com.ahrao.dto.resource.ResourceSummaryResponse;
import com.ahrao.dto.resource.UpdateResourceRequest;
import com.ahrao.entity.enums.ResourceStatus;
import com.ahrao.service.resource.ResourceManagementService;
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
@RequestMapping("/api/admin/resources")
@PreAuthorize("hasRole('ADMIN')")
public class AdminResourceController {

    private final ResourceManagementService service;

    public AdminResourceController(ResourceManagementService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ResourceSummaryResponse>>> getResources(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) Integer maxCapacity,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<ResourceSummaryResponse> response = service.getResources(
                search, categoryId, departmentId, status, location, minCapacity, maxCapacity, pageable);
        return ResponseEntity.ok(ApiResponse.success("Resources retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceDetailsResponse>> getResourceById(@PathVariable Long id) {
        ResourceDetailsResponse response = service.getResourceById(id);
        return ResponseEntity.ok(ApiResponse.success("Resource retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ResourceDetailsResponse>> createResource(
            @Valid @RequestBody CreateResourceRequest request,
            Authentication auth,
            HttpServletRequest req) {

        String username = auth != null ? auth.getName() : "ADMIN";
        ResourceDetailsResponse response = service.createResource(request, username, req.getRemoteAddr(), req.getHeader("User-Agent"));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Resource created successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceDetailsResponse>> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody UpdateResourceRequest request,
            Authentication auth,
            HttpServletRequest req) {

        String username = auth != null ? auth.getName() : "ADMIN";
        ResourceDetailsResponse response = service.updateResource(id, request, username, req.getRemoteAddr(), req.getHeader("User-Agent"));
        return ResponseEntity.ok(ApiResponse.success("Resource updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ResourceSummaryResponse>> changeStatus(
            @PathVariable Long id,
            @RequestParam ResourceStatus status,
            Authentication auth,
            HttpServletRequest req) {

        String username = auth != null ? auth.getName() : "ADMIN";
        ResourceSummaryResponse response = service.changeStatus(id, status, username, req.getRemoteAddr(), req.getHeader("User-Agent"));
        return ResponseEntity.ok(ApiResponse.success("Resource status updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteResource(
            @PathVariable Long id,
            Authentication auth,
            HttpServletRequest req) {

        String username = auth != null ? auth.getName() : "ADMIN";
        service.deleteResource(id, username, req.getRemoteAddr(), req.getHeader("User-Agent"));
        return ResponseEntity.ok(ApiResponse.success("Resource deleted successfully", null));
    }
}
