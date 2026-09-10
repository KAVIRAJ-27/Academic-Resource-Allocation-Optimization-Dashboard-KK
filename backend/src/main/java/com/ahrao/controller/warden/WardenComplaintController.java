package com.ahrao.controller.warden;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.warden.UpdateComplaintStatusRequest;
import com.ahrao.dto.warden.WardenComplaintDetailDto;
import com.ahrao.dto.warden.WardenComplaintSummaryDto;
import com.ahrao.entity.enums.ComplaintStatus;
import com.ahrao.entity.enums.PriorityLevel;
import com.ahrao.service.warden.WardenComplaintService;
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
@RequestMapping("/api/warden/complaints")
@PreAuthorize("hasRole('WARDEN')")
public class WardenComplaintController {

    private final WardenComplaintService wardenComplaintService;

    public WardenComplaintController(WardenComplaintService wardenComplaintService) {
        this.wardenComplaintService = wardenComplaintService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<WardenComplaintSummaryDto>>> getComplaints(
            @RequestParam(required = false) Long hostelId,
            @RequestParam(required = false) Long blockId,
            @RequestParam(required = false) Integer floorNumber,
            @RequestParam(required = false) Long roomId,
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) PriorityLevel priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        PagedResponse<WardenComplaintSummaryDto> response = wardenComplaintService.getComplaints(
                hostelId, blockId, floorNumber, roomId, status, priority, category, search, page, size, sortBy, sortDir);

        return ResponseEntity.ok(ApiResponse.success("Hostel complaints retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WardenComplaintDetailDto>> getComplaintById(@PathVariable Long id) {
        WardenComplaintDetailDto response = wardenComplaintService.getComplaintById(id);
        return ResponseEntity.ok(ApiResponse.success("Hostel complaint details retrieved successfully", response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<WardenComplaintDetailDto>> updateComplaintStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateComplaintStatusRequest request,
            HttpServletRequest httpRequest) {

        WardenComplaintDetailDto response = wardenComplaintService.updateComplaintStatus(
                id,
                request,
                httpRequest.getRemoteAddr(),
                httpRequest.getHeader("User-Agent"));

        return ResponseEntity.ok(ApiResponse.success("Hostel complaint status updated successfully", response));
    }
}
