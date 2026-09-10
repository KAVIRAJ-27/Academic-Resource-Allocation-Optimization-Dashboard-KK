package com.ahrao.service.hostel;

import com.ahrao.dto.hostel.allocation.HostelCandidateDto;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.HostelBedStatus;
import com.ahrao.entity.hostel.Hostel;
import com.ahrao.entity.hostel.HostelBed;
import com.ahrao.entity.hostel.HostelBlock;
import com.ahrao.entity.hostel.HostelFloor;
import com.ahrao.entity.hostel.HostelRoom;
import com.ahrao.repository.allocation.HostelAllocationRepository;
import com.ahrao.repository.hostel.HostelBedRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;

@Service
public class HostelCandidateServiceImpl implements HostelCandidateService {

    private static final Logger log = LoggerFactory.getLogger(HostelCandidateServiceImpl.class);

    private final HostelBedRepository hostelBedRepository;
    private final HostelAllocationRepository hostelAllocationRepository;

    public HostelCandidateServiceImpl(
            HostelBedRepository hostelBedRepository,
            HostelAllocationRepository hostelAllocationRepository) {
        this.hostelBedRepository = hostelBedRepository;
        this.hostelAllocationRepository = hostelAllocationRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<HostelCandidateDto> evaluateCandidates(Long requestedHostelId, Set<Long> authorizedHostelIds) {
        List<HostelBed> candidateBeds = fetchRawCandidateBeds(requestedHostelId, authorizedHostelIds);
        List<HostelCandidateDto> results = new ArrayList<>();

        for (HostelBed bed : candidateBeds) {
            List<String> conflicts = new ArrayList<>();
            HostelRoom room = bed.getRoom();
            HostelFloor floor = room != null ? room.getFloor() : null;
            HostelBlock block = floor != null ? floor.getBlock() : null;
            Hostel hostel = block != null ? block.getHostel() : null;

            if (hostel == null || (hostel.getStatus() != null && !"ACTIVE".equalsIgnoreCase(hostel.getStatus()))) {
                conflicts.add("HOSTEL_INACTIVE");
            }

            if (room != null && room.getStatus() != null && ("MAINTENANCE".equalsIgnoreCase(room.getStatus()) || "INACTIVE".equalsIgnoreCase(room.getStatus()))) {
                conflicts.add("ROOM_INACTIVE: " + room.getStatus());
            }

            if (bed.getStatus() != HostelBedStatus.AVAILABLE) {
                conflicts.add("BED_UNAVAILABLE: " + bed.getStatus());
            }

            if (hostelAllocationRepository.existsByHostelBedIdAndStatus(bed.getId(), AllocationStatus.ACTIVE)) {
                conflicts.add("BED_ALREADY_ALLOCATED");
            }

            long activeAllocations = room != null
                    ? hostelAllocationRepository.countByHostelBedRoomIdAndStatus(room.getId(), AllocationStatus.ACTIVE)
                    : 0;

            if (room != null && activeAllocations >= room.getCapacity()) {
                conflicts.add("ROOM_CAPACITY_EXCEEDED");
            }

            boolean available = conflicts.isEmpty();
            HostelCandidateDto dto = mapToCandidateDto(bed, available, conflicts);
            dto.setActiveAllocations(activeAllocations);
            results.add(dto);
        }

        return results;
    }

    @Override
    @Transactional(readOnly = true)
    public HostelBed selectBestCandidateBed(Long requestedHostelId, Set<Long> authorizedHostelIds) {
        List<HostelBed> candidateBeds = fetchRawCandidateBeds(requestedHostelId, authorizedHostelIds);

        for (HostelBed bed : candidateBeds) {
            HostelRoom room = bed.getRoom();
            HostelFloor floor = room != null ? room.getFloor() : null;
            HostelBlock block = floor != null ? floor.getBlock() : null;
            Hostel hostel = block != null ? block.getHostel() : null;

            if (hostel == null || (hostel.getStatus() != null && !"ACTIVE".equalsIgnoreCase(hostel.getStatus()))) {
                continue;
            }

            if (room == null || (room.getStatus() != null && ("MAINTENANCE".equalsIgnoreCase(room.getStatus()) || "INACTIVE".equalsIgnoreCase(room.getStatus())))) {
                continue;
            }

            if (bed.getStatus() != HostelBedStatus.AVAILABLE) {
                continue;
            }

            if (hostelAllocationRepository.existsByHostelBedIdAndStatus(bed.getId(), AllocationStatus.ACTIVE)) {
                continue;
            }

            long activeAllocations = hostelAllocationRepository.countByHostelBedRoomIdAndStatus(room.getId(), AllocationStatus.ACTIVE);
            if (activeAllocations >= room.getCapacity()) {
                continue;
            }

            // First valid candidate matching deterministic criteria
            return bed;
        }

        return null;
    }

    private List<HostelBed> fetchRawCandidateBeds(Long requestedHostelId, Set<Long> authorizedHostelIds) {
        if (requestedHostelId != null) {
            if (authorizedHostelIds != null && !authorizedHostelIds.isEmpty() && !authorizedHostelIds.contains(requestedHostelId)) {
                return Collections.emptyList();
            }
            return hostelBedRepository.findCandidateBedsByHostelId(requestedHostelId, HostelBedStatus.AVAILABLE);
        }

        if (authorizedHostelIds != null && !authorizedHostelIds.isEmpty()) {
            return hostelBedRepository.findCandidateBedsByHostelIds(authorizedHostelIds, HostelBedStatus.AVAILABLE);
        }

        return hostelBedRepository.findByStatus(HostelBedStatus.AVAILABLE);
    }

    @Override
    public HostelCandidateDto mapToCandidateDto(HostelBed bed, boolean available, List<String> conflicts) {
        HostelRoom room = bed.getRoom();
        HostelFloor floor = room != null ? room.getFloor() : null;
        HostelBlock block = floor != null ? floor.getBlock() : null;
        Hostel hostel = block != null ? block.getHostel() : null;

        HostelCandidateDto dto = new HostelCandidateDto();
        dto.setBedId(bed.getId());
        dto.setBedNumber(bed.getBedNumber());
        dto.setAvailable(available);
        dto.setConflicts(conflicts);

        if (room != null) {
            dto.setRoomId(room.getId());
            dto.setRoomNumber(room.getRoomNumber());
            dto.setRoomType(room.getRoomType() != null ? room.getRoomType().name() : "STANDARD");
            dto.setCapacity(room.getCapacity());
        }

        if (floor != null) {
            dto.setFloorId(floor.getId());
            dto.setFloorNumber(floor.getFloorNumber());
        }

        if (block != null) {
            dto.setBlockId(block.getId());
            dto.setBlockName(block.getName());
        }

        if (hostel != null) {
            dto.setHostelId(hostel.getId());
            dto.setHostelName(hostel.getName());
        }

        return dto;
    }
}
