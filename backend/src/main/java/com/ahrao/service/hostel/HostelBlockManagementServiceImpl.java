package com.ahrao.service.hostel;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.hostel.*;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.HostelBedStatus;
import com.ahrao.entity.hostel.Hostel;
import com.ahrao.entity.hostel.HostelBlock;
import com.ahrao.entity.hostel.HostelFloor;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.hostel.*;
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
public class HostelBlockManagementServiceImpl implements HostelBlockManagementService {

    private final HostelRepository hostelRepository;
    private final HostelBlockRepository blockRepository;
    private final HostelFloorRepository floorRepository;
    private final HostelRoomRepository roomRepository;
    private final HostelBedRepository bedRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public HostelBlockManagementServiceImpl(HostelRepository hostelRepository,
                                           HostelBlockRepository blockRepository,
                                           HostelFloorRepository floorRepository,
                                           HostelRoomRepository roomRepository,
                                           HostelBedRepository bedRepository,
                                           AuditLogRepository auditLogRepository,
                                           UserRepository userRepository) {
        this.hostelRepository = hostelRepository;
        this.blockRepository = blockRepository;
        this.floorRepository = floorRepository;
        this.roomRepository = roomRepository;
        this.bedRepository = bedRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<HostelBlockSummaryResponse> getBlocks(Long hostelId, String search, String status, Pageable pageable) {
        Specification<HostelBlock> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (hostelId != null) {
                predicates.add(cb.equal(root.get("hostel").get("id"), hostelId));
            }

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), pattern);
                Predicate codeMatch = cb.like(cb.lower(root.get("code")), pattern);
                predicates.add(cb.or(nameMatch, codeMatch));
            }

            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<HostelBlock> page = blockRepository.findAll(spec, pageable);
        List<HostelBlockSummaryResponse> content = page.getContent().stream()
                .map(this::mapToSummary)
                .collect(Collectors.toList());

        return new PagedResponse<>(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isFirst(), page.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public HostelBlockDetailsResponse getBlockById(Long id) {
        HostelBlock block = blockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HostelBlock not found with id: " + id));

        HostelBlockDetailsResponse res = new HostelBlockDetailsResponse();
        res.setId(block.getId());
        if (block.getHostel() != null) {
            res.setHostelId(block.getHostel().getId());
            res.setHostelName(block.getHostel().getName());
            res.setHostelCode(block.getHostel().getCode());
        }
        res.setName(block.getName());
        res.setCode(block.getCode());
        res.setNumberOfFloors(block.getNumberOfFloors());
        res.setStatus(block.getStatus());

        res.setTotalFloors(floorRepository.countByBlockId(block.getId()));
        res.setTotalRooms(roomRepository.countByFloorBlockId(block.getId()));
        res.setTotalBeds(bedRepository.countByRoomFloorBlockId(block.getId()));
        res.setAvailableBeds(bedRepository.countByRoomFloorBlockIdAndStatus(block.getId(), HostelBedStatus.AVAILABLE));
        res.setOccupiedBeds(bedRepository.countByRoomFloorBlockIdAndStatus(block.getId(), HostelBedStatus.OCCUPIED));
        res.setMaintenanceBeds(bedRepository.countByRoomFloorBlockIdAndStatus(block.getId(), HostelBedStatus.MAINTENANCE));

        List<HostelFloor> floors = floorRepository.findByBlockIdOrderByFloorNumberAsc(block.getId());
        res.setFloors(floors.stream().map(this::mapFloorToSummary).collect(Collectors.toList()));

        return res;
    }

    @Override
    public HostelBlockSummaryResponse createBlock(CreateHostelBlockRequest request, String adminUsername, String ip, String userAgent) {
        Hostel hostel = hostelRepository.findById(request.getHostelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hostel not found with id: " + request.getHostelId()));

        if (blockRepository.existsByHostelIdAndCode(hostel.getId(), request.getCode().trim().toUpperCase())) {
            throw new ConflictException("Block with code '" + request.getCode().trim().toUpperCase() + "' already exists in this hostel.");
        }

        HostelBlock block = new HostelBlock();
        block.setHostel(hostel);
        block.setName(request.getName().trim());
        block.setCode(request.getCode().trim().toUpperCase());
        block.setNumberOfFloors(request.getNumberOfFloors() != null ? request.getNumberOfFloors() : 1);
        block.setStatus(request.getStatus() != null ? request.getStatus().trim().toUpperCase() : "ACTIVE");

        HostelBlock saved = blockRepository.save(block);

        logAudit(adminUsername, "HOSTEL_BLOCK_CREATED", "HostelBlock", saved.getId(),
                null, "name=" + saved.getName() + ", code=" + saved.getCode(), ip, userAgent);

        return mapToSummary(saved);
    }

    @Override
    public HostelBlockSummaryResponse updateBlock(Long id, UpdateHostelBlockRequest request, String adminUsername, String ip, String userAgent) {
        HostelBlock block = blockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HostelBlock not found with id: " + id));

        String oldVal = "name=" + block.getName() + ", code=" + block.getCode() + ", status=" + block.getStatus();

        if (request.getCode() != null && !request.getCode().trim().isEmpty()) {
            String newCode = request.getCode().trim().toUpperCase();
            if (blockRepository.existsByHostelIdAndCodeAndIdNot(block.getHostel().getId(), newCode, id)) {
                throw new ConflictException("Block with code '" + newCode + "' already exists in this hostel.");
            }
            block.setCode(newCode);
        }

        block.setName(request.getName().trim());
        if (request.getNumberOfFloors() != null) {
            block.setNumberOfFloors(request.getNumberOfFloors());
        }
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            block.setStatus(request.getStatus().trim().toUpperCase());
        }

        HostelBlock updated = blockRepository.save(block);

        logAudit(adminUsername, "HOSTEL_BLOCK_UPDATED", "HostelBlock", updated.getId(),
                oldVal, "name=" + updated.getName() + ", code=" + updated.getCode() + ", status=" + updated.getStatus(), ip, userAgent);

        return mapToSummary(updated);
    }

    @Override
    public HostelBlockSummaryResponse changeStatus(Long id, String status, String adminUsername, String ip, String userAgent) {
        HostelBlock block = blockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HostelBlock not found with id: " + id));

        String oldStatus = block.getStatus();
        block.setStatus(status.trim().toUpperCase());
        HostelBlock updated = blockRepository.save(block);

        logAudit(adminUsername, "HOSTEL_BLOCK_STATUS_CHANGED", "HostelBlock", updated.getId(),
                "status=" + oldStatus, "status=" + updated.getStatus(), ip, userAgent);

        return mapToSummary(updated);
    }

    @Override
    public void deleteBlock(Long id, String adminUsername, String ip, String userAgent) {
        HostelBlock block = blockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HostelBlock not found with id: " + id));

        if (floorRepository.countByBlockId(id) > 0) {
            throw new ConflictException("Block '" + block.getName() + "' cannot be deleted because it contains configured floors.");
        }

        blockRepository.delete(block);

        logAudit(adminUsername, "HOSTEL_BLOCK_DELETED", "HostelBlock", id,
                "name=" + block.getName() + ", code=" + block.getCode(), "DELETED", ip, userAgent);
    }

    private HostelBlockSummaryResponse mapToSummary(HostelBlock block) {
        HostelBlockSummaryResponse res = new HostelBlockSummaryResponse();
        res.setId(block.getId());
        if (block.getHostel() != null) {
            res.setHostelId(block.getHostel().getId());
            res.setHostelName(block.getHostel().getName());
            res.setHostelCode(block.getHostel().getCode());
        }
        res.setName(block.getName());
        res.setCode(block.getCode());
        res.setNumberOfFloors(block.getNumberOfFloors());
        res.setStatus(block.getStatus());

        res.setTotalFloors(floorRepository.countByBlockId(block.getId()));
        res.setTotalRooms(roomRepository.countByFloorBlockId(block.getId()));
        res.setTotalBeds(bedRepository.countByRoomFloorBlockId(block.getId()));
        res.setAvailableBeds(bedRepository.countByRoomFloorBlockIdAndStatus(block.getId(), HostelBedStatus.AVAILABLE));
        res.setOccupiedBeds(bedRepository.countByRoomFloorBlockIdAndStatus(block.getId(), HostelBedStatus.OCCUPIED));

        return res;
    }

    private HostelFloorSummaryResponse mapFloorToSummary(HostelFloor floor) {
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
