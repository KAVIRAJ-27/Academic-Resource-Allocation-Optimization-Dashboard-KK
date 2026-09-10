package com.ahrao.controller.warden;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.warden.WardenHostelOptionDto;
import com.ahrao.entity.enums.HostelBedStatus;
import com.ahrao.entity.hostel.Hostel;
import com.ahrao.repository.hostel.HostelBedRepository;
import com.ahrao.repository.hostel.HostelRoomRepository;
import com.ahrao.service.warden.WardenScopeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/warden/hostels")
@PreAuthorize("hasRole('WARDEN')")
public class WardenHostelController {

    private final WardenScopeService wardenScopeService;
    private final HostelRoomRepository hostelRoomRepository;
    private final HostelBedRepository hostelBedRepository;

    public WardenHostelController(
            WardenScopeService wardenScopeService,
            HostelRoomRepository hostelRoomRepository,
            HostelBedRepository hostelBedRepository) {
        this.wardenScopeService = wardenScopeService;
        this.hostelRoomRepository = hostelRoomRepository;
        this.hostelBedRepository = hostelBedRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WardenHostelOptionDto>>> getAuthorizedHostels() {
        Set<Hostel> hostels = wardenScopeService.getAuthorizedHostels();

        List<WardenHostelOptionDto> dtoList = hostels.stream().map(h -> {
            WardenHostelOptionDto dto = new WardenHostelOptionDto(
                    h.getId(),
                    h.getName(),
                    h.getCode(),
                    h.getType() != null ? h.getType().name() : "N/A",
                    h.getAddress(),
                    h.getCapacity(),
                    h.getStatus()
            );

            long totalRooms = hostelRoomRepository.countByFloorBlockHostelId(h.getId());
            long totalBeds = hostelBedRepository.countByRoomFloorBlockHostelId(h.getId());
            long occupiedBeds = hostelBedRepository.countByRoomFloorBlockHostelIdAndStatus(h.getId(), HostelBedStatus.OCCUPIED);
            long availableBeds = hostelBedRepository.countByRoomFloorBlockHostelIdAndStatus(h.getId(), HostelBedStatus.AVAILABLE);

            dto.setTotalRooms(totalRooms);
            dto.setTotalBeds(totalBeds);
            dto.setOccupiedBeds(occupiedBeds);
            dto.setAvailableBeds(availableBeds);

            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Authorized hostels retrieved successfully", dtoList));
    }
}
