package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.resource.CreateResourceCategoryRequest;
import com.ahrao.dto.resource.ResourceCategoryResponse;
import com.ahrao.dto.resource.UpdateResourceCategoryRequest;
import com.ahrao.entity.enums.ResourceType;
import com.ahrao.service.resource.ResourceCategoryManagementService;
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
@RequestMapping("/api/admin/resource-categories")
@PreAuthorize("hasRole('ADMIN')")
public class AdminResourceCategoryController {

    private final ResourceCategoryManagementService service;

    public AdminResourceCategoryController(ResourceCategoryManagementService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ResourceCategoryResponse>>> getCategories(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) ResourceType resourceType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<ResourceCategoryResponse> response = service.getCategories(search, status, resourceType, pageable);
        return ResponseEntity.ok(ApiResponse.success("Resource categories retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceCategoryResponse>> getCategoryById(@PathVariable Long id) {
        ResourceCategoryResponse response = service.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success("Resource category retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ResourceCategoryResponse>> createCategory(
            @Valid @RequestBody CreateResourceCategoryRequest request,
            Authentication auth,
            HttpServletRequest req) {

        String username = auth != null ? auth.getName() : "ADMIN";
        ResourceCategoryResponse response = service.createCategory(request, username, req.getRemoteAddr(), req.getHeader("User-Agent"));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Resource category created successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceCategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody UpdateResourceCategoryRequest request,
            Authentication auth,
            HttpServletRequest req) {

        String username = auth != null ? auth.getName() : "ADMIN";
        ResourceCategoryResponse response = service.updateCategory(id, request, username, req.getRemoteAddr(), req.getHeader("User-Agent"));
        return ResponseEntity.ok(ApiResponse.success("Resource category updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ResourceCategoryResponse>> changeStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication auth,
            HttpServletRequest req) {

        String username = auth != null ? auth.getName() : "ADMIN";
        ResourceCategoryResponse response = service.changeStatus(id, status, username, req.getRemoteAddr(), req.getHeader("User-Agent"));
        return ResponseEntity.ok(ApiResponse.success("Resource category status updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @PathVariable Long id,
            Authentication auth,
            HttpServletRequest req) {

        String username = auth != null ? auth.getName() : "ADMIN";
        service.deleteCategory(id, username, req.getRemoteAddr(), req.getHeader("User-Agent"));
        return ResponseEntity.ok(ApiResponse.success("Resource category deleted successfully", null));
    }
}
