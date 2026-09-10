package com.ahrao.service.hostel;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.hostel.*;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.HostelBedStatus;
import com.ahrao.entity.hostel.HostelBlock;
import com.ahrao.entity.hostel.HostelFloor;
import com.ahrao.entity.hostel.HostelRoom;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.hostel.HostelBedRepository;
import com.ahrao.repository.hostel.HostelBlockRepository;
import com.ahrao.repository.hostel.HostelFloorRepository;
import com.ahrao.repository.hostel.HostelRoomRepository;
import com.ahrao.repository.user.UserRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class HostelFloorManagementServiceImpl implements HostelFloorManagementService {

    private final HostelBlockRepository blockRepository;
    private final HostelFloorRepository floorRepository;
    private final HostelRoomRepository roomRepository;
    private final HostelBedRepository bedRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public HostelFloorManagementServiceImpl(HostelBlockRepository blockRepository,
                                           HostelFloorRepository floorRepository,
                                           HostelRoomRepository roomRepository,
                                           HostelBedRepository bedRepository,
                                           AuditLogRepository auditLogRepository,
                                           UserRepository userRepository) {
        this.blockRepository = blockRepository;
        this.floorRepository = floorRepository;
        this.roomRepository = roomRepository;
        this.bedRepository = bedRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<HostelFloorSummaryResponse> getFloors(Long hostelId, Long blockId, String search, String status, Pageable pageable) {
        Specification<HostelFloor> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (blockId != null) {
                predicates.add(cb.equal(root.get("block").get("id"), blockId));
            } else if (hostelId != null) {
                predicates.add(cb.equal(root.get("block").get("hostel").get("id"), hostelId));
            }

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), pattern);
                Predicate numMatch = cb.like(root.get("floorNumber").as(String.class), pattern);
                predicates.add(cb.or(nameMatch, numMatch));
            }

            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<HostelFloor> page = floorRepository.findAll(spec, pageable);
        List<HostelFloorSummaryResponse> content = page.getContent().stream()
                .map(this::mapToSummary)
                .collect(Collectors.toList());

        return new PagedResponse<>(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isFirst(), page.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public HostelFloorDetailsResponse getFloorById(Long id) {
        HostelFloor floor = floorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HostelFloor not found with id: " + id));

        HostelFloorDetailsResponse res = new HostelFloorDetailsResponse();
        res.setId(floor.getId());
        if (floor.getBlock() != null) {
            res.setBlockId(floor.getBlock().getId());
            res.setBlockName(floor.getBlock().getName());
            res.setBlockCode(floor.getBlock().getCode());
            if (floor.getBlock().getHostel() != null) {
                res.setHostelId(floor.getBlock().getHostel().getId());
                res.setHostelName(floor.getBlock().getHostel().getName());
            }
        }
        res.setFloorNumber(floor.getFloorNumber());
        res.setName(floor.getName());
        res.setStatus(floor.getStatus());

        res.setTotalRooms(roomRepository.countByFloorId(floor.getId()));
        res.setTotalBeds(bedRepository.countByRoomFloorId(floor.getId()));
        res.setAvailableBeds(bedRepository.countByRoomFloorIdAndStatus(floor.getId(), HostelBedStatus.AVAILABLE));
        res.setOccupiedBeds(bedRepository.countByRoomFloorIdAndStatus(floor.getId(), HostelBedStatus.OCCUPIED));
        res.setMaintenanceBeds(bedRepository.countByRoomFloorIdAndStatus(floor.getId(), HostelBedStatus.MAINTENANCE));

        List<HostelRoom> rooms = roomRepository.findByFloorIdOrderByRoomNumberAsc(floor.getId());
        res.setRooms(rooms.stream().map(this::mapRoomToSummary).collect(Collectors.toList()));

        return res;
    }

    @Override
    public HostelFloorSummaryResponse createFloor(CreateHostelFloorRequest request, String adminUsername, String ip, String userAgent) {
        HostelBlock block = blockRepository.findById(request.getBlockId())
                .orElseThrow(() -> new ResourceNotFoundException("HostelBlock not found with id: " + request.getBlockId()));

        if (floorRepository.existsByBlockIdAndFloorNumber(block.getId(), request.getFloorNumber())) {
            throw new ConflictException("Floor number " + request.getFloorNumber() + " already exists in block '" + block.getName() + "'.");
        }

        HostelFloor floor = new HostelFloor();
        floor.setBlock(block);
        floor.setFloorNumber(request.getFloorNumber());
        floor.setName(request.getName() != null && !request.getName().trim().isEmpty() ? request.getName().trim() : "Floor " + request.getFloorNumber());
        floor.setStatus("ACTIVE");

        HostelFloor saved = floorRepository.save(floor);

        logAudit(adminUsername, "HOSTEL_FLOOR_CREATED", "HostelFloor", saved.getId(),
                null, "floorNumber=" + saved.getFloorNumber() + ", block=" + block.getName(), ip, userAgent);

        return mapToSummary(saved);
    }

    @Override
    public HostelFloorSummaryResponse updateFloor(Long id, UpdateHostelFloorRequest request, String adminUsername, String ip, String userAgent) {
        HostelFloor floor = floorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HostelFloor not found with id: " + id));

        String oldVal = "floorNumber=" + floor.getFloorNumber() + ", name=" + floor.getName() + ", status=" + floor.getStatus();

        if (request.getFloorNumber() != null) {
            if (floorRepository.existsByBlockIdAndFloorNumberAndIdNot(floor.getBlock().getId(), request.getFloorNumber(), id)) {
                throw new ConflictException("Floor number " + request.getFloorNumber() + " already exists in this block.");
            }
            floor.setFloorNumber(request.getFloorNumber());
        }

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            floor.setName(request.getName().trim());
        }

        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            floor.setStatus(request.getStatus().trim().toUpperCase());
        }

        HostelFloor updated = floorRepository.save(floor);

        logAudit(adminUsername, "HOSTEL_FLOOR_UPDATED", "HostelFloor", updated.getId(),
                oldVal, "floorNumber=" + updated.getFloorNumber() + ", name=" + updated.getName() + ", status=" + updated.getStatus(), ip, userAgent);

        return mapToSummary(updated);
    }

    @Override
    public HostelFloorSummaryResponse changeStatus(Long id, String status, String adminUsername, String ip, String userAgent) {
        HostelFloor floor = floorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HostelFloor not found with id: " + id));

        String oldStatus = floor.getStatus();
        floor.setStatus(status.trim().toUpperCase());
        HostelFloor updated = floorRepository.save(floor);

        logAudit(adminUsername, "HOSTEL_FLOOR_STATUS_CHANGED", "HostelFloor", updated.getId(),
                "status=" + oldStatus, "status=" + updated.getStatus(), ip, userAgent);

        return mapToSummary(updated);
    }

    @Override
    public void deleteFloor(Long id, String adminUsername, String ip, String userAgent) {
        HostelFloor floor = floorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HostelFloor not found with id: " + id));

        if (roomRepository.countByFloorId(id) > 0) {
            throw new ConflictException("Floor " + floor.getFloorNumber() + " cannot be deleted because it contains configured rooms.");
        }

        floorRepository.delete(floor);

        logAudit(adminUsername, "HOSTEL_FLOOR_DELETED", "HostelFloor", id,
                "floorNumber=" + floor.getFloorNumber() + ", block=" + (floor.getBlock() != null ? floor.getBlock().getName() : "N/A"), "DELETED", ip, userAgent);
    }

    private HostelFloorSummaryResponse mapToSummary(HostelFloor floor) {
        HostelFloorSummaryResponse res = new HostelFloorSummaryResponse();
        res.setId(floor.getId());
        if (floor.getBlock() != null) {
            res.setBlockId(floor.getBlock().getId());
            res.setBlockName(floor.getBlock().getName());
            res.setBlockCode(floor.getBlock().getCode());
            if (floor.getBlock().getHostel() != null) {
                res.setHostelId(floor.getBlock().getHostel().getId());
                res.setHostelName(floor.getBlock().getHostel().getName());
                res.setHostelCode(floor.getBlock().getHostel().getCode());
            }
        }
        res.setFloorNumber(floor.getFloorNumber());
        res.setName(floor.getName());
        res.setStatus(floor.getStatus());

        res.setTotalRooms(roomRepository.countByFloorId(floor.getId()));
        res.setTotalBeds(bedRepository.countByRoomFloorId(floor.getId()));
        res.setAvailableBeds(bedRepository.countByRoomFloorIdAndStatus(floor.getId(), HostelBedStatus.AVAILABLE));
        res.setOccupiedBeds(bedRepository.countByRoomFloorIdAndStatus(floor.getId(), HostelBedStatus.OCCUPIED));

        return res;
    }

    private HostelRoomSummaryResponse mapRoomToSummary(HostelRoom room) {
        HostelRoomSummaryResponse res = new HostelRoomSummaryResponse();
        res.setId(room.getId());
        if (room.getFloor() != null) {
            res.setFloorId(room.getFloor().getId());
            res.setFloorNumber(room.getFloor().getFloorNumber());
            res.setFloorName(room.getFloor().getName());
            if (room.getFloor().getBlock() != null) {
                res.setBlockId(room.getFloor().getBlock().getId());
                res.setBlockName(room.getFloor().getBlock().getName());
                if (room.getFloor().getBlock().getHostel() != null) {
                    res.setHostelId(room.getFloor().getBlock().getHostel().getId());
                    res.setHostelName(room.getFloor().getBlock().getHostel().getName());
                }
            }
        }
        res.setRoomNumber(room.getRoomNumber());
        res.setRoomType(room.getRoomType());
        res.setCapacity(room.getCapacity());
        res.setStatus(room.getStatus());

        res.setConfiguredBeds(bedRepository.countByRoomId(room.getId()));
        res.setAvailableBeds(bedRepository.countByRoomIdAndStatus(room.getId(), HostelBedStatus.AVAILABLE));
        res.setOccupiedBeds(bedRepository.countByRoomIdAndStatus(room.getId(), HostelBedStatus.OCCUPIED));
        res.setMaintenanceBeds(bedRepository.countByRoomIdAndStatus(room.getId(), HostelBedStatus.MAINTENANCE));

        return res;
    }

    private void logAudit(String adminUsername, String action, String entityType, Long entityId,
                          String oldValue, String newValue, String ipAddress, String userAgent) {
        if (adminUsername == null) return;
        AuditLog log = new AuditLog();
        userRepository.findByUsername(adminUsername).ifPresent(log::setUser);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setOldValue(oldValue);
        log.setNewValue(newValue);
        log.setIpAddress(ipAddress);
        log.setUserAgent(userAgent);
        log.setCreatedAt(Instant.now());
        auditLogRepository.save(log);
    }
}
