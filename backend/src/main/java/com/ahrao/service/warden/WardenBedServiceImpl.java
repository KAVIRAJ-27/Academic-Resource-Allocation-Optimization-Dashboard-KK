package com.ahrao.service.warden;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.warden.WardenAllocationSummaryDto;
import com.ahrao.dto.warden.WardenBedDetailDto;
import com.ahrao.dto.warden.WardenBedSummaryDto;
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
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class WardenBedServiceImpl implements WardenBedService {

    private final HostelBedRepository hostelBedRepository;
    private final HostelAllocationRepository hostelAllocationRepository;
    private final WardenScopeService wardenScopeService;

    public WardenBedServiceImpl(
            HostelBedRepository hostelBedRepository,
            HostelAllocationRepository hostelAllocationRepository,
            WardenScopeService wardenScopeService) {
        this.hostelBedRepository = hostelBedRepository;
        this.hostelAllocationRepository = hostelAllocationRepository;
        this.wardenScopeService = wardenScopeService;
    }

    @Override
    public PagedResponse<WardenBedSummaryDto> getBeds(
            Long hostelId,
            Long blockId,
            Integer floorNumber,
            Long roomId,
            HostelBedStatus status,
            String search,
            Pageable pageable) {

        Set<Long> authorizedHostelIds = wardenScopeService.getAuthorizedHostelIds();
        if (authorizedHostelIds.isEmpty()) {
            return new PagedResponse<>(Collections.emptyList(), 0, pageable.getPageSize(), 0, 0, true, true);
        }

        Long effectiveHostelId = wardenScopeService.validateHostelAccess(hostelId);

        Specification<HostelBed> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            Join<HostelBed, HostelRoom> roomJoin = root.join("room");
            Join<HostelRoom, HostelFloor> floorJoin = roomJoin.join("floor");
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

            if (roomId != null) {
                predicates.add(cb.equal(roomJoin.get("id"), roomId));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (search != null && !search.trim().isEmpty()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                Predicate bedMatch = cb.like(cb.lower(root.get("bedNumber")), term);
                Predicate roomMatch = cb.like(cb.lower(roomJoin.get("roomNumber")), term);
                predicates.add(cb.or(bedMatch, roomMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<HostelBed> page = hostelBedRepository.findAll(spec, pageable);

        List<WardenBedSummaryDto> content = page.getContent().stream()
                .map(this::mapToBedSummary)
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
    public WardenBedDetailDto getBedById(Long bedId) {
        HostelBed bed = wardenScopeService.validateBedAccess(bedId);

        WardenBedDetailDto dto = new WardenBedDetailDto();
        populateSummaryFields(dto, bed);

        List<HostelAllocation> allAllocations = hostelAllocationRepository.findByHostelBedId(bed.getId());
        List<WardenAllocationSummaryDto> history = allAllocations.stream()
                .sorted(Comparator.comparing(HostelAllocation::getStartDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::mapToAllocationSummary)
                .collect(Collectors.toList());

        dto.setAllocationHistory(history);
        return dto;
    }

    private WardenBedSummaryDto mapToBedSummary(HostelBed bed) {
        WardenBedSummaryDto dto = new WardenBedSummaryDto();
        populateSummaryFields(dto, bed);
        return dto;
    }

    private void populateSummaryFields(WardenBedSummaryDto dto, HostelBed bed) {
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
    }

    private WardenAllocationSummaryDto mapToAllocationSummary(HostelAllocation alloc) {
        WardenAllocationSummaryDto dto = new WardenAllocationSummaryDto();
        dto.setId(alloc.getId());
        dto.setStartDate(alloc.getStartDate());
        dto.setEndDate(alloc.getEndDate());
        dto.setStatus(alloc.getStatus());
        dto.setAllocatedAt(alloc.getAllocatedAt());
        dto.setReleasedAt(alloc.getReleasedAt());

        if (alloc.getAcademicYear() != null) {
            dto.setAcademicYearName(alloc.getAcademicYear().getName());
        }

        if (alloc.getStudent() != null) {
            dto.setStudentId(alloc.getStudent().getId());
            dto.setRegisterNumber(alloc.getStudent().getRegisterNumber());
            dto.setRollNumber(alloc.getStudent().getRollNumber());

            if (alloc.getStudent().getUser() != null) {
                dto.setStudentName(alloc.getStudent().getUser().getFirstName() + " " + alloc.getStudent().getUser().getLastName());
            }

            if (alloc.getStudent().getDepartment() != null) {
                dto.setDepartmentName(alloc.getStudent().getDepartment().getName());
            }

            if (alloc.getStudent().getProgram() != null) {
                dto.setProgramName(alloc.getStudent().getProgram().getName());
            }
        }

        HostelBed bed = alloc.getBed();
        if (bed != null) {
            dto.setBedId(bed.getId());
            dto.setBedNumber(bed.getBedNumber());

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

                        Hostel hostel = block.getHostel();
                        if (hostel != null) {
                            dto.setHostelId(hostel.getId());
                            dto.setHostelName(hostel.getName());
                            dto.setHostelCode(hostel.getCode());
                        }
                    }
                }
            }
        }

        return dto;
    }
}
