package com.ahrao.service.warden;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.warden.WardenBedSummaryDto;
import com.ahrao.dto.warden.WardenRoomDetailDto;
import com.ahrao.dto.warden.WardenRoomSummaryDto;
import com.ahrao.entity.allocation.HostelAllocation;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.HostelBedStatus;
import com.ahrao.entity.hostel.Hostel;
import com.ahrao.entity.hostel.HostelBed;
import com.ahrao.entity.hostel.HostelBlock;
import com.ahrao.entity.hostel.HostelFloor;
import com.ahrao.entity.hostel.HostelRoom;
import com.ahrao.repository.allocation.HostelAllocationRepository;
import com.ahrao.repository.hostel.HostelBedRepository;
import com.ahrao.repository.hostel.HostelRoomRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class WardenRoomServiceImpl implements WardenRoomService {

    private final HostelRoomRepository hostelRoomRepository;
    private final HostelBedRepository hostelBedRepository;
    private final HostelAllocationRepository hostelAllocationRepository;
    private final WardenScopeService wardenScopeService;

    public WardenRoomServiceImpl(
            HostelRoomRepository hostelRoomRepository,
            HostelBedRepository hostelBedRepository,
            HostelAllocationRepository hostelAllocationRepository,
            WardenScopeService wardenScopeService) {
        this.hostelRoomRepository = hostelRoomRepository;
        this.hostelBedRepository = hostelBedRepository;
        this.hostelAllocationRepository = hostelAllocationRepository;
        this.wardenScopeService = wardenScopeService;
    }

    @Override
    public PagedResponse<WardenRoomSummaryDto> getRooms(
            Long hostelId,
            Long blockId,
            Integer floorNumber,
            String status,
            String search,
            Pageable pageable) {

        Set<Long> authorizedHostelIds = wardenScopeService.getAuthorizedHostelIds();
        if (authorizedHostelIds.isEmpty()) {
            return new PagedResponse<>(Collections.emptyList(), 0, pageable.getPageSize(), 0, 0, true, true);
        }

        Long effectiveHostelId = wardenScopeService.validateHostelAccess(hostelId);

        Specification<HostelRoom> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            Join<HostelRoom, HostelFloor> floorJoin = root.join("floor");
            Join<HostelFloor, HostelBlock> blockJoin = floorJoin.join("block");
            Join<HostelBlock, Hostel> hostelJoin = blockJoin.join("hostel");

            if (effectiveHostelId != null) {
                predicates.add(cb.equal(hostelJoin.get("id"), effectiveHostelId));
            } else {
                predicates.add(hostelJoin.get("id").in(authorizedHostelIds));
            }

            if (blockId != null) {
                predicates.add(cb.equal(blockJoin.get("id"), blockId));
            }

            if (floorNumber != null) {
                predicates.add(cb.equal(floorJoin.get("floorNumber"), floorNumber));
            }

            if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }

            if (search != null && !search.trim().isEmpty()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("roomNumber")), term));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<HostelRoom> page = hostelRoomRepository.findAll(spec, pageable);

        List<WardenRoomSummaryDto> content = page.getContent().stream()
                .map(this::mapToSummary)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }

    @Override
    public WardenRoomDetailDto getRoomById(Long roomId) {
        HostelRoom room = wardenScopeService.validateRoomAccess(roomId);

        WardenRoomDetailDto dto = new WardenRoomDetailDto();
        populateSummaryFields(dto, room);

        List<HostelBed> beds = hostelBedRepository.findByRoomId(room.getId());
        List<WardenBedSummaryDto> bedDtos = beds.stream()
                .map(this::mapToBedSummary)
                .collect(Collectors.toList());

        dto.setBeds(bedDtos);
        return dto;
    }

    private WardenRoomSummaryDto mapToSummary(HostelRoom room) {
        WardenRoomSummaryDto dto = new WardenRoomSummaryDto();
        populateSummaryFields(dto, room);
        return dto;
    }

    private void populateSummaryFields(WardenRoomSummaryDto dto, HostelRoom room) {
        dto.setId(room.getId());
        dto.setRoomNumber(room.getRoomNumber());
        dto.setRoomType(room.getRoomType());
        dto.setCapacity(room.getCapacity());
        dto.setStatus(room.getStatus());

        HostelFloor floor = room.getFloor();
        if (floor != null) {
            dto.setFloorId(floor.getId());
            dto.setFloorNumber(floor.getFloorNumber());
            dto.setFloorName(floor.getName());

            HostelBlock block = floor.getBlock();
            if (block != null) {
                dto.setBlockId(block.getId());
                dto.setBlockName(block.getName());
                dto.setBlockCode(block.getCode());

                Hostel hostel = block.getHostel();
                if (hostel != null) {
                    dto.setHostelId(hostel.getId());
                    dto.setHostelName(hostel.getName());
                }
            }
        }

        long totalBeds = hostelBedRepository.countByRoomId(room.getId());
        long occupiedBeds = hostelBedRepository.countByRoomIdAndStatus(room.getId(), HostelBedStatus.OCCUPIED);
        long availableBeds = hostelBedRepository.countByRoomIdAndStatus(room.getId(), HostelBedStatus.AVAILABLE);

        dto.setTotalBeds(totalBeds);
        dto.setOccupiedBeds(occupiedBeds);
        dto.setAvailableBeds(availableBeds);
    }

    private WardenBedSummaryDto mapToBedSummary(HostelBed bed) {
        WardenBedSummaryDto dto = new WardenBedSummaryDto();
        dto.setId(bed.getId());
        dto.setBedNumber(bed.getBedNumber());
        dto.setStatus(bed.getStatus());

        HostelRoom room = bed.getRoom();
        if (room != null) {
            dto.setRoomId(room.getId());
            dto.setRoomNumber(room.getRoomNumber());

            HostelFloor floor = room.getFloor();
            if (floor != null) {
                dto.setFloorNumber(floor.getFloorNumber());
                dto.setFloorName(floor.getName());

                HostelBlock block = floor.getBlock();
                if (block != null) {
                    dto.setBlockId(block.getId());
                    dto.setBlockName(block.getName());
                    dto.setBlockCode(block.getCode());

                    Hostel hostel = block.getHostel();
                    if (hostel != null) {
                        dto.setHostelId(hostel.getId());
                        dto.setHostelName(hostel.getName());
                    }
                }
            }
        }

        Optional<HostelAllocation> activeAllocOpt = hostelAllocationRepository
                .findByHostelBedIdAndStatus(bed.getId(), AllocationStatus.ACTIVE);

        if (activeAllocOpt.isPresent()) {
            HostelAllocation alloc = activeAllocOpt.get();
            WardenBedSummaryDto.CurrentStudentAllocationDto studentDto = new WardenBedSummaryDto.CurrentStudentAllocationDto();
            studentDto.setAllocationId(alloc.getId());
            studentDto.setAllocationStatus(alloc.getStatus() != null ? alloc.getStatus().name() : "ACTIVE");
            studentDto.setStartDate(alloc.getStartDate() != null ? alloc.getStartDate().toString() : null);
            studentDto.setEndDate(alloc.getEndDate() != null ? alloc.getEndDate().toString() : null);

            if (alloc.getStudent() != null) {
                studentDto.setStudentId(alloc.getStudent().getId());
                studentDto.setRegisterNumber(alloc.getStudent().getRegisterNumber());
                studentDto.setRollNumber(alloc.getStudent().getRollNumber());

                if (alloc.getStudent().getUser() != null) {
                    studentDto.setStudentName(alloc.getStudent().getUser().getFirstName() + " " + alloc.getStudent().getUser().getLastName());
                }

                if (alloc.getStudent().getDepartment() != null) {
                    studentDto.setDepartmentName(alloc.getStudent().getDepartment().getName());
                }

                if (alloc.getStudent().getProgram() != null) {
                    studentDto.setProgramName(alloc.getStudent().getProgram().getName());
                }
            }

            dto.setCurrentStudent(studentDto);
        }

        return dto;
    }
}
