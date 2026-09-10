package com.ahrao.service.hostel;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.hostel.*;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.HostelBedStatus;
import com.ahrao.entity.enums.HostelType;
import com.ahrao.entity.hostel.Hostel;
import com.ahrao.entity.hostel.HostelBlock;
import com.ahrao.entity.hostel.HostelFacility;
import com.ahrao.entity.hostel.Warden;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.InstitutionRepository;
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
public class HostelManagementServiceImpl implements HostelManagementService {

    private final HostelRepository hostelRepository;
    private final HostelBlockRepository blockRepository;
    private final HostelFloorRepository floorRepository;
    private final HostelRoomRepository roomRepository;
    private final HostelBedRepository bedRepository;
    private final HostelFacilityRepository facilityRepository;
    private final WardenRepository wardenRepository;
    private final InstitutionRepository institutionRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public HostelManagementServiceImpl(HostelRepository hostelRepository,
                                      HostelBlockRepository blockRepository,
                                      HostelFloorRepository floorRepository,
                                      HostelRoomRepository roomRepository,
                                      HostelBedRepository bedRepository,
                                      HostelFacilityRepository facilityRepository,
                                      WardenRepository wardenRepository,
                                      InstitutionRepository institutionRepository,
                                      AuditLogRepository auditLogRepository,
                                      UserRepository userRepository) {
        this.hostelRepository = hostelRepository;
        this.blockRepository = blockRepository;
        this.floorRepository = floorRepository;
        this.roomRepository = roomRepository;
        this.bedRepository = bedRepository;
        this.facilityRepository = facilityRepository;
        this.wardenRepository = wardenRepository;
        this.institutionRepository = institutionRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<HostelSummaryResponse> getHostels(String search, String status, HostelType type, Pageable pageable) {
        Specification<Hostel> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), pattern);
                Predicate codeMatch = cb.like(cb.lower(root.get("code")), pattern);
                predicates.add(cb.or(nameMatch, codeMatch));
            }
            if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status.trim())) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }
            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Hostel> page = hostelRepository.findAll(spec, pageable);
        List<HostelSummaryResponse> content = page.getContent().stream()
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
    @Transactional(readOnly = true)
    public HostelDetailsResponse getHostelById(Long id) {
        Hostel hostel = hostelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel not found with ID: " + id));

        HostelDetailsResponse response = new HostelDetailsResponse();
        response.setId(hostel.getId());
        if (hostel.getInstitution() != null) {
            response.setInstitutionId(hostel.getInstitution().getId());
            response.setInstitutionName(hostel.getInstitution().getName());
        }
        response.setName(hostel.getName());
        response.setCode(hostel.getCode());
        response.setType(hostel.getType());
        response.setAddress(hostel.getAddress());
        response.setCapacity(hostel.getCapacity());
        response.setStatus(hostel.getStatus());
        response.setCreatedAt(hostel.getCreatedAt());
        response.setUpdatedAt(hostel.getUpdatedAt());

        response.setTotalBlocks(blockRepository.countByHostelId(hostel.getId()));
        response.setTotalFloors(floorRepository.countByBlockHostelId(hostel.getId()));
        response.setTotalRooms(roomRepository.countByFloorBlockHostelId(hostel.getId()));
        response.setTotalBeds(bedRepository.countByRoomFloorBlockHostelId(hostel.getId()));
        response.setAvailableBeds(bedRepository.countByRoomFloorBlockHostelIdAndStatus(hostel.getId(), HostelBedStatus.AVAILABLE));
        response.setOccupiedBeds(bedRepository.countByRoomFloorBlockHostelIdAndStatus(hostel.getId(), HostelBedStatus.OCCUPIED));
        response.setMaintenanceBeds(bedRepository.countByRoomFloorBlockHostelIdAndStatus(hostel.getId(), HostelBedStatus.MAINTENANCE));
        response.setReservedBeds(bedRepository.countByRoomFloorBlockHostelIdAndStatus(hostel.getId(), HostelBedStatus.RESERVED));

        // Assigned wardens
        List<Warden> wardens = wardenRepository.findByAssignedHostelsId(hostel.getId());
        List<HostelDetailsResponse.HostelWardenBriefResponse> wardenBriefs = wardens.stream().map(w -> {
            String name = w.getUser() != null ? (w.getUser().getFirstName() + " " + w.getUser().getLastName()).trim() : "N/A";
            String email = w.getUser() != null ? w.getUser().getEmail() : "N/A";
            Long userId = w.getUser() != null ? w.getUser().getId() : null;
            return new HostelDetailsResponse.HostelWardenBriefResponse(
                    w.getId(), userId, w.getEmployeeId(), name, email, w.getContactNumber()
            );
        }).collect(Collectors.toList());
        response.setAssignedWardens(wardenBriefs);

        // Blocks
        List<HostelBlock> blocks = blockRepository.findByHostelId(hostel.getId());
        List<HostelBlockSummaryResponse> blockSummaries = blocks.stream().map(b -> {
            HostelBlockSummaryResponse br = new HostelBlockSummaryResponse();
            br.setId(b.getId());
            br.setHostelId(hostel.getId());
            br.setHostelName(hostel.getName());
            br.setHostelCode(hostel.getCode());
            br.setName(b.getName());
            br.setCode(b.getCode());
            br.setNumberOfFloors(b.getNumberOfFloors());
            br.setStatus(b.getStatus());
            br.setTotalFloors(floorRepository.countByBlockId(b.getId()));
            br.setTotalRooms(roomRepository.countByFloorBlockId(b.getId()));
            br.setTotalBeds(bedRepository.countByRoomFloorBlockId(b.getId()));
            return br;
        }).collect(Collectors.toList());
        response.setBlocks(blockSummaries);

        // Facilities
        List<HostelFacility> facilities = facilityRepository.findByHostelId(hostel.getId());
        List<HostelFacilitySummaryResponse> facilitySummaries = facilities.stream().map(f -> {
            HostelFacilitySummaryResponse fr = new HostelFacilitySummaryResponse();
            fr.setId(f.getId());
            fr.setHostelId(hostel.getId());
            fr.setHostelName(hostel.getName());
            fr.setName(f.getName());
            fr.setDescription(f.getDescription());
            fr.setQuantity(f.getQuantity());
            fr.setStatus(f.getStatus());
            return fr;
        }).collect(Collectors.toList());
        response.setFacilities(facilitySummaries);

        return response;
    }

    @Override
    public HostelSummaryResponse createHostel(CreateHostelRequest request, String adminUsername, String ip, String userAgent) {
        String code = request.getCode().trim().toUpperCase();
        if (hostelRepository.existsByCode(code)) {
            throw new ConflictException("A hostel with code '" + code + "' already exists");
        }

        Institution institution = institutionRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Institutional profile not configured. Please initialize academic foundation first."));

        Hostel hostel = new Hostel();
        hostel.setInstitution(institution);
        hostel.setName(request.getName().trim());
        hostel.setCode(code);
        hostel.setType(request.getType());
        hostel.setAddress(request.getAddress() != null ? request.getAddress().trim() : null);
        hostel.setCapacity(request.getCapacity());
        hostel.setStatus("ACTIVE");

        Hostel saved = hostelRepository.save(hostel);
        logAudit(adminUsername, "HOSTEL_CREATED", "Hostel", saved.getId(),
                null, "Created hostel: " + saved.getName() + " (" + saved.getCode() + ")", ip, userAgent);

        return mapToSummary(saved);
    }

    @Override
    public HostelSummaryResponse updateHostel(Long id, UpdateHostelRequest request, String adminUsername, String ip, String userAgent) {
        Hostel hostel = hostelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel not found with ID: " + id));

        String oldValue = "name=" + hostel.getName() + ", type=" + hostel.getType() + ", capacity=" + hostel.getCapacity();

        hostel.setName(request.getName().trim());
        hostel.setType(request.getType());
        hostel.setAddress(request.getAddress() != null ? request.getAddress().trim() : null);
        hostel.setCapacity(request.getCapacity());

        Hostel updated = hostelRepository.save(hostel);
        String newValue = "name=" + updated.getName() + ", type=" + updated.getType() + ", capacity=" + updated.getCapacity();

        logAudit(adminUsername, "HOSTEL_UPDATED", "Hostel", updated.getId(),
                oldValue, newValue, ip, userAgent);

        return mapToSummary(updated);
    }

    @Override
    public HostelSummaryResponse changeStatus(Long id, String status, String adminUsername, String ip, String userAgent) {
        Hostel hostel = hostelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel not found with ID: " + id));

        String oldStatus = hostel.getStatus();
        String newStatus = status.trim().toUpperCase();
        hostel.setStatus(newStatus);

        Hostel saved = hostelRepository.save(hostel);
        logAudit(adminUsername, "HOSTEL_STATUS_CHANGED", "Hostel", saved.getId(),
                "status=" + oldStatus, "status=" + newStatus, ip, userAgent);

        return mapToSummary(saved);
    }

    @Override
    public void deleteHostel(Long id, String adminUsername, String ip, String userAgent) {
        Hostel hostel = hostelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel not found with ID: " + id));

        if (blockRepository.countByHostelId(id) > 0) {
            throw new ConflictException("Hostel '" + hostel.getName() + "' cannot be deleted because it contains configured blocks.");
        }
        if (facilityRepository.countByHostelId(id) > 0) {
            throw new ConflictException("Hostel '" + hostel.getName() + "' cannot be deleted because it has registered facilities.");
        }
        if (wardenRepository.existsByAssignedHostelsId(id)) {
            throw new ConflictException("Hostel '" + hostel.getName() + "' cannot be deleted because wardens are assigned to it.");
        }

        hostelRepository.delete(hostel);
        logAudit(adminUsername, "HOSTEL_DELETED", "Hostel", id,
                "name=" + hostel.getName() + ", code=" + hostel.getCode(), "DELETED", ip, userAgent);
    }

    private HostelSummaryResponse mapToSummary(Hostel hostel) {
        HostelSummaryResponse res = new HostelSummaryResponse();
        res.setId(hostel.getId());
        if (hostel.getInstitution() != null) {
            res.setInstitutionId(hostel.getInstitution().getId());
            res.setInstitutionName(hostel.getInstitution().getName());
        }
        res.setName(hostel.getName());
        res.setCode(hostel.getCode());
        res.setType(hostel.getType());
        res.setAddress(hostel.getAddress());
        res.setCapacity(hostel.getCapacity());
        res.setStatus(hostel.getStatus());
        res.setCreatedAt(hostel.getCreatedAt());

        res.setTotalBlocks(blockRepository.countByHostelId(hostel.getId()));
        res.setTotalFloors(floorRepository.countByBlockHostelId(hostel.getId()));
        res.setTotalRooms(roomRepository.countByFloorBlockHostelId(hostel.getId()));
        res.setTotalBeds(bedRepository.countByRoomFloorBlockHostelId(hostel.getId()));
        res.setAvailableBeds(bedRepository.countByRoomFloorBlockHostelIdAndStatus(hostel.getId(), HostelBedStatus.AVAILABLE));
        res.setOccupiedBeds(bedRepository.countByRoomFloorBlockHostelIdAndStatus(hostel.getId(), HostelBedStatus.OCCUPIED));
        res.setMaintenanceBeds(bedRepository.countByRoomFloorBlockHostelIdAndStatus(hostel.getId(), HostelBedStatus.MAINTENANCE));

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
