package com.ahrao.controller.warden;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.warden.WardenRoomDetailDto;
import com.ahrao.dto.warden.WardenRoomSummaryDto;
import com.ahrao.service.warden.WardenRoomService;
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
@RequestMapping("/api/warden/rooms")
@PreAuthorize("hasRole('WARDEN')")
public class WardenRoomController {

    private final WardenRoomService wardenRoomService;

    public WardenRoomController(WardenRoomService wardenRoomService) {
        this.wardenRoomService = wardenRoomService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<WardenRoomSummaryDto>>> getRooms(
            @RequestParam(required = false) Long hostelId,
            @RequestParam(required = false) Long blockId,
            @RequestParam(required = false) Integer floorNumber,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "roomNumber") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<WardenRoomSummaryDto> response = wardenRoomService.getRooms(
                hostelId, blockId, floorNumber, status, search, pageable);

        return ResponseEntity.ok(ApiResponse.success("Hostel rooms retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WardenRoomDetailDto>> getRoomById(@PathVariable Long id) {
        WardenRoomDetailDto room = wardenRoomService.getRoomById(id);
        return ResponseEntity.ok(ApiResponse.success("Hostel room details retrieved successfully", room));
    }
}
