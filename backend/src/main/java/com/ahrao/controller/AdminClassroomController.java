package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.resource.ClassroomDetailsResponse;
import com.ahrao.dto.resource.ClassroomSummaryResponse;
import com.ahrao.dto.resource.CreateClassroomRequest;
import com.ahrao.dto.resource.UpdateClassroomRequest;
import com.ahrao.service.resource.ClassroomManagementService;
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
@RequestMapping("/api/admin/classrooms")
@PreAuthorize("hasRole('ADMIN')")
public class AdminClassroomController {

    private final ClassroomManagementService service;

    public AdminClassroomController(ClassroomManagementService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ClassroomSummaryResponse>>> getClassrooms(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String building,
            @RequestParam(required = false) String roomType,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "building") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<ClassroomSummaryResponse> response = service.getClassrooms(search, building, roomType, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Classrooms retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ClassroomDetailsResponse>> getClassroomById(@PathVariable Long id) {
        ClassroomDetailsResponse response = service.getClassroomById(id);
        return ResponseEntity.ok(ApiResponse.success("Classroom retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ClassroomDetailsResponse>> createClassroom(
            @Valid @RequestBody CreateClassroomRequest request,
            Authentication auth,
            HttpServletRequest req) {

        String username = auth != null ? auth.getName() : "ADMIN";
        ClassroomDetailsResponse response = service.createClassroom(request, username, req.getRemoteAddr(), req.getHeader("User-Agent"));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Classroom created successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ClassroomDetailsResponse>> updateClassroom(
            @PathVariable Long id,
            @Valid @RequestBody UpdateClassroomRequest request,
            Authentication auth,
            HttpServletRequest req) {

        String username = auth != null ? auth.getName() : "ADMIN";
        ClassroomDetailsResponse response = service.updateClassroom(id, request, username, req.getRemoteAddr(), req.getHeader("User-Agent"));
        return ResponseEntity.ok(ApiResponse.success("Classroom updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ClassroomSummaryResponse>> changeStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication auth,
            HttpServletRequest req) {

        String username = auth != null ? auth.getName() : "ADMIN";
        ClassroomSummaryResponse response = service.changeStatus(id, status, username, req.getRemoteAddr(), req.getHeader("User-Agent"));
        return ResponseEntity.ok(ApiResponse.success("Classroom status updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteClassroom(
            @PathVariable Long id,
            Authentication auth,
            HttpServletRequest req) {

        String username = auth != null ? auth.getName() : "ADMIN";
        service.deleteClassroom(id, username, req.getRemoteAddr(), req.getHeader("User-Agent"));
        return ResponseEntity.ok(ApiResponse.success("Classroom deleted successfully", null));
    }
}
