package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.resource.CreateTimeSlotRequest;
import com.ahrao.dto.resource.TimeSlotDetailsResponse;
import com.ahrao.dto.resource.TimeSlotSummaryResponse;
import com.ahrao.dto.resource.UpdateTimeSlotRequest;
import com.ahrao.service.resource.TimeSlotManagementService;
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
@RequestMapping("/api/admin/time-slots")
@PreAuthorize("hasRole('ADMIN')")
public class AdminTimeSlotController {

    private final TimeSlotManagementService service;

    public AdminTimeSlotController(TimeSlotManagementService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<TimeSlotSummaryResponse>>> getTimeSlots(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String dayOfWeek,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "startTime") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<TimeSlotSummaryResponse> response = service.getTimeSlots(search, dayOfWeek, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Time slots retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TimeSlotDetailsResponse>> getTimeSlotById(@PathVariable Long id) {
        TimeSlotDetailsResponse response = service.getTimeSlotById(id);
        return ResponseEntity.ok(ApiResponse.success("Time slot retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TimeSlotDetailsResponse>> createTimeSlot(
            @Valid @RequestBody CreateTimeSlotRequest request,
            Authentication auth,
            HttpServletRequest req) {

        String username = auth != null ? auth.getName() : "ADMIN";
        TimeSlotDetailsResponse response = service.createTimeSlot(request, username, req.getRemoteAddr(), req.getHeader("User-Agent"));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Time slot created successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TimeSlotDetailsResponse>> updateTimeSlot(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTimeSlotRequest request,
            Authentication auth,
            HttpServletRequest req) {

        String username = auth != null ? auth.getName() : "ADMIN";
        TimeSlotDetailsResponse response = service.updateTimeSlot(id, request, username, req.getRemoteAddr(), req.getHeader("User-Agent"));
        return ResponseEntity.ok(ApiResponse.success("Time slot updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TimeSlotSummaryResponse>> changeStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication auth,
            HttpServletRequest req) {

        String username = auth != null ? auth.getName() : "ADMIN";
        TimeSlotSummaryResponse response = service.changeStatus(id, status, username, req.getRemoteAddr(), req.getHeader("User-Agent"));
        return ResponseEntity.ok(ApiResponse.success("Time slot status updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTimeSlot(
            @PathVariable Long id,
            Authentication auth,
            HttpServletRequest req) {

        String username = auth != null ? auth.getName() : "ADMIN";
        service.deleteTimeSlot(id, username, req.getRemoteAddr(), req.getHeader("User-Agent"));
        return ResponseEntity.ok(ApiResponse.success("Time slot deleted successfully", null));
    }
}
