package com.ahrao.service.warden;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.warden.AssignMaintenanceRequest;
import com.ahrao.dto.warden.CreateWardenMaintenanceRequest;
import com.ahrao.dto.warden.UpdateMaintenanceStatusRequest;
import com.ahrao.dto.warden.WardenMaintenanceDetailDto;
import com.ahrao.dto.warden.WardenMaintenanceSummaryDto;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.MaintenanceStatus;
import com.ahrao.entity.enums.PriorityLevel;
import com.ahrao.entity.hostel.Hostel;
import com.ahrao.entity.hostel.HostelBlock;
import com.ahrao.entity.hostel.HostelFloor;
import com.ahrao.entity.hostel.HostelRoom;
import com.ahrao.entity.hostel.Warden;
import com.ahrao.entity.request.MaintenanceRequest;
import com.ahrao.entity.resource.Resource;
import com.ahrao.entity.user.User;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.hostel.HostelRepository;
import com.ahrao.repository.request.MaintenanceRequestRepository;
import com.ahrao.repository.resource.ResourceRepository;
import com.ahrao.repository.user.UserRepository;
import jakarta.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class WardenMaintenanceServiceImpl implements WardenMaintenanceService {

    private static final Logger log = LoggerFactory.getLogger(WardenMaintenanceServiceImpl.class);

    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final WardenScopeService wardenScopeService;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final HostelRepository hostelRepository;
    private final ResourceRepository resourceRepository;

    public WardenMaintenanceServiceImpl(
            MaintenanceRequestRepository maintenanceRequestRepository,
            WardenScopeService wardenScopeService,
            AuditLogRepository auditLogRepository,
            UserRepository userRepository,
            HostelRepository hostelRepository,
            ResourceRepository resourceRepository) {
        this.maintenanceRequestRepository = maintenanceRequestRepository;
        this.wardenScopeService = wardenScopeService;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
        this.hostelRepository = hostelRepository;
        this.resourceRepository = resourceRepository;
    }

    @Override
    public PagedResponse<WardenMaintenanceSummaryDto> getMaintenanceRequests(
            Long hostelId,
            Long blockId,
            Integer floorNumber,
            Long roomId,
            MaintenanceStatus status,
            PriorityLevel priority,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDir) {

        Set<Long> authorizedHostelIds = wardenScopeService.getAuthorizedHostelIds();
        if (authorizedHostelIds.isEmpty()) {
            return PagedResponse.fromPage(new PageImpl<>(
                    List.of(), PageRequest.of(page, size), 0));
        }

        if (hostelId != null && !authorizedHostelIds.contains(hostelId)) {
            throw new ForbiddenException("Requested hostel is outside your authorized warden scope.");
        }

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortProperty = (sortBy == null || sortBy.isBlank()) ? "createdAt" : sortBy;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortProperty));

        Specification<MaintenanceRequest> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (hostelId != null) {
                predicates.add(cb.equal(root.get("hostel").get("id"), hostelId));
            } else {
                predicates.add(root.get("hostel").get("id").in(authorizedHostelIds));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }

            if (roomId != null) {
                predicates.add(cb.equal(root.get("room").get("id"), roomId));
            }

            if (blockId != null) {
                predicates.add(cb.equal(root.get("room").get("floor").get("block").get("id"), blockId));
            }

            if (floorNumber != null) {
                predicates.add(cb.equal(root.get("room").get("floor").get("floorNumber"), floorNumber));
            }

            if (search != null && !search.isBlank()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), term);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), term);
                Predicate reporterMatch = cb.like(cb.lower(root.get("reportedBy").get("firstName")), term);
                Predicate roomMatch = cb.like(cb.lower(root.get("room").get("roomNumber")), term);
                predicates.add(cb.or(titleMatch, descMatch, reporterMatch, roomMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<MaintenanceRequest> resultPage = maintenanceRequestRepository.findAll(spec, pageable);
        List<WardenMaintenanceSummaryDto> dtos = resultPage.getContent().stream()
                .map(this::mapToSummary)
                .collect(Collectors.toList());

        return PagedResponse.fromPage(new PageImpl<>(
                dtos, pageable, resultPage.getTotalElements()));
    }

    @Override
    public WardenMaintenanceDetailDto getMaintenanceRequestById(Long id) {
        MaintenanceRequest request = wardenScopeService.validateMaintenanceAccess(id);
        return mapToDetail(request);
    }

    @Override
    @Transactional
    public WardenMaintenanceDetailDto updateMaintenanceStatus(
            Long id,
            UpdateMaintenanceStatusRequest request,
            String ipAddress,
            String userAgent) {

        MaintenanceRequest maintenance = wardenScopeService.validateMaintenanceAccess(id);
        Warden warden = wardenScopeService.resolveWarden();

        MaintenanceStatus currentStatus = maintenance.getStatus();
        MaintenanceStatus newStatus = request.getStatus();

        if (currentStatus == newStatus) {
            return mapToDetail(maintenance);
        }

        validateStatusTransition(currentStatus, newStatus);

        maintenance.setStatus(newStatus);
        if (newStatus == MaintenanceStatus.COMPLETED) {
            maintenance.setCompletedAt(Instant.now());
        }

        MaintenanceRequest saved = maintenanceRequestRepository.save(maintenance);

        // Audit Log
        AuditLog auditLog = new AuditLog();
        auditLog.setUser(warden.getUser());
        auditLog.setAction("WARDEN_MAINTENANCE_STATUS_UPDATED");
        auditLog.setEntityType("MaintenanceRequest");
        auditLog.setEntityId(saved.getId());
        auditLog.setOldValue(String.format("{\"status\":\"%s\"}", currentStatus));
        auditLog.setNewValue(String.format("{\"status\":\"%s\",\"remarks\":\"%s\"}", newStatus, request.getRemarks() != null ? request.getRemarks() : ""));
        auditLog.setIpAddress(ipAddress);
        auditLog.setUserAgent(userAgent);
        auditLog.setCreatedAt(Instant.now());
        auditLogRepository.save(auditLog);

        log.info("Maintenance status updated: id={}, from={}, to={}, wardenId={}", saved.getId(), currentStatus, newStatus, warden.getId());
        return mapToDetail(saved);
    }

    @Override
    @Transactional
    public WardenMaintenanceDetailDto assignMaintenance(
            Long id,
            AssignMaintenanceRequest request,
            String ipAddress,
            String userAgent) {

        MaintenanceRequest maintenance = wardenScopeService.validateMaintenanceAccess(id);
        Warden warden = wardenScopeService.resolveWarden();

        if (maintenance.getStatus() == MaintenanceStatus.COMPLETED || maintenance.getStatus() == MaintenanceStatus.CANCELLED) {
            throw new ConflictException("Cannot assign maintenance request in terminal state '" + maintenance.getStatus() + "'");
        }

        User technician = userRepository.findById(request.getAssignedToId())
                .orElseThrow(() -> new ResourceNotFoundException("Assigned user not found with ID: " + request.getAssignedToId()));

        User previousAssignee = maintenance.getAssignedTo();
        maintenance.setAssignedTo(technician);

        if (maintenance.getStatus() == MaintenanceStatus.OPEN) {
            maintenance.setStatus(MaintenanceStatus.ASSIGNED);
        }

        MaintenanceRequest saved = maintenanceRequestRepository.save(maintenance);

        // Audit Log
        AuditLog auditLog = new AuditLog();
        auditLog.setUser(warden.getUser());
        auditLog.setAction("WARDEN_MAINTENANCE_ASSIGNED");
        auditLog.setEntityType("MaintenanceRequest");
        auditLog.setEntityId(saved.getId());
        auditLog.setOldValue(String.format("{\"assignedToId\":%s}", previousAssignee != null ? previousAssignee.getId() : "null"));
        auditLog.setNewValue(String.format("{\"assignedToId\":%d,\"assignedToName\":\"%s\"}", technician.getId(), technician.getFirstName() + " " + technician.getLastName()));
        auditLog.setIpAddress(ipAddress);
        auditLog.setUserAgent(userAgent);
        auditLog.setCreatedAt(Instant.now());
        auditLogRepository.save(auditLog);

        log.info("Maintenance request assigned: id={}, technicianId={}, wardenId={}", saved.getId(), technician.getId(), warden.getId());
        return mapToDetail(saved);
    }

    @Override
    @Transactional
    public WardenMaintenanceDetailDto createMaintenanceRequest(
            CreateWardenMaintenanceRequest request,
            String ipAddress,
            String userAgent) {

        wardenScopeService.validateHostelAccess(request.getHostelId());
        Warden warden = wardenScopeService.resolveWarden();

        Hostel hostel = hostelRepository.findById(request.getHostelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hostel not found with ID: " + request.getHostelId()));

        HostelRoom room = null;
        if (request.getRoomId() != null) {
            room = wardenScopeService.validateRoomAccess(request.getRoomId());
        }

        Resource resource = null;
        if (request.getResourceId() != null) {
            resource = resourceRepository.findById(request.getResourceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + request.getResourceId()));
        }

        MaintenanceRequest maintenance = new MaintenanceRequest();
        maintenance.setHostel(hostel);
        maintenance.setRoom(room);
        maintenance.setResource(resource);
        maintenance.setReportedBy(warden.getUser());
        maintenance.setTitle(request.getTitle().trim());
        maintenance.setDescription(request.getDescription().trim());
        maintenance.setPriority(request.getPriority() != null ? request.getPriority() : PriorityLevel.MEDIUM);
        maintenance.setStatus(MaintenanceStatus.OPEN);

        MaintenanceRequest saved = maintenanceRequestRepository.save(maintenance);

        // Audit Log
        AuditLog auditLog = new AuditLog();
        auditLog.setUser(warden.getUser());
        auditLog.setAction("WARDEN_MAINTENANCE_CREATED");
        auditLog.setEntityType("MaintenanceRequest");
        auditLog.setEntityId(saved.getId());
        auditLog.setNewValue(String.format("{\"hostelId\":%d,\"title\":\"%s\",\"priority\":\"%s\"}", hostel.getId(), saved.getTitle(), saved.getPriority()));
        auditLog.setIpAddress(ipAddress);
        auditLog.setUserAgent(userAgent);
        auditLog.setCreatedAt(Instant.now());
        auditLogRepository.save(auditLog);

        log.info("Warden maintenance created: id={}, hostelId={}, wardenId={}", saved.getId(), hostel.getId(), warden.getId());
        return mapToDetail(saved);
    }

    private void validateStatusTransition(MaintenanceStatus current, MaintenanceStatus next) {
        switch (current) {
            case OPEN:
                if (next != MaintenanceStatus.ASSIGNED && next != MaintenanceStatus.IN_PROGRESS && next != MaintenanceStatus.CANCELLED) {
                    throw new ConflictException("Cannot transition maintenance from " + current + " to " + next + ". Allowed: ASSIGNED, IN_PROGRESS, CANCELLED");
                }
                break;
            case ASSIGNED:
                if (next != MaintenanceStatus.IN_PROGRESS && next != MaintenanceStatus.CANCELLED) {
                    throw new ConflictException("Cannot transition maintenance from " + current + " to " + next + ". Allowed: IN_PROGRESS, CANCELLED");
                }
                break;
            case IN_PROGRESS:
                if (next != MaintenanceStatus.COMPLETED && next != MaintenanceStatus.CANCELLED) {
                    throw new ConflictException("Cannot transition maintenance from " + current + " to " + next + ". Allowed: COMPLETED, CANCELLED");
                }
                break;
            case COMPLETED:
            case CANCELLED:
                throw new ConflictException("Maintenance request is in terminal state '" + current + "' and cannot be modified.");
            default:
                throw new ConflictException("Unknown maintenance status transition from " + current + " to " + next);
        }
    }

    private WardenMaintenanceSummaryDto mapToSummary(MaintenanceRequest request) {
        WardenMaintenanceSummaryDto dto = new WardenMaintenanceSummaryDto();
        dto.setId(request.getId());
        dto.setTitle(request.getTitle());
        dto.setPriority(request.getPriority());
        dto.setStatus(request.getStatus());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());
        dto.setCompletedAt(request.getCompletedAt());

        Hostel hostel = request.getHostel();
        if (hostel != null) {
            dto.setHostelId(hostel.getId());
            dto.setHostelName(hostel.getName());
            dto.setHostelCode(hostel.getCode());
        }

        HostelRoom room = request.getRoom();
        if (room != null) {
            dto.setRoomId(room.getId());
            dto.setRoomNumber(room.getRoomNumber());
            HostelFloor floor = room.getFloor();
            if (floor != null) {
                dto.setFloorNumber(floor.getFloorNumber());
                HostelBlock block = floor.getBlock();
                if (block != null) {
                    dto.setBlockName(block.getName());
                }
            }
        }

        Resource resource = request.getResource();
        if (resource != null) {
            dto.setResourceId(resource.getId());
            dto.setResourceName(resource.getName());
        }

        User reporter = request.getReportedBy();
        if (reporter != null) {
            dto.setReportedById(reporter.getId());
            dto.setReportedByName(reporter.getFirstName() + " " + (reporter.getLastName() != null ? reporter.getLastName() : ""));
        }

        User assignedTo = request.getAssignedTo();
        if (assignedTo != null) {
            dto.setAssignedToId(assignedTo.getId());
            dto.setAssignedToName(assignedTo.getFirstName() + " " + (assignedTo.getLastName() != null ? assignedTo.getLastName() : ""));
        }

        return dto;
    }

    private WardenMaintenanceDetailDto mapToDetail(MaintenanceRequest request) {
        WardenMaintenanceDetailDto dto = new WardenMaintenanceDetailDto();
        dto.setId(request.getId());
        dto.setTitle(request.getTitle());
        dto.setDescription(request.getDescription());
        dto.setPriority(request.getPriority());
        dto.setStatus(request.getStatus());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());
        dto.setCompletedAt(request.getCompletedAt());

        Hostel hostel = request.getHostel();
        if (hostel != null) {
            dto.setHostelId(hostel.getId());
            dto.setHostelName(hostel.getName());
            dto.setHostelCode(hostel.getCode());
        }

        HostelRoom room = request.getRoom();
        if (room != null) {
            dto.setRoomId(room.getId());
            dto.setRoomNumber(room.getRoomNumber());
            HostelFloor floor = room.getFloor();
            if (floor != null) {
                dto.setFloorNumber(floor.getFloorNumber());
                HostelBlock block = floor.getBlock();
                if (block != null) {
                    dto.setBlockName(block.getName());
                }
            }
        }

        Resource resource = request.getResource();
        if (resource != null) {
            dto.setResourceId(resource.getId());
            dto.setResourceName(resource.getName());
        }

        User reporter = request.getReportedBy();
        if (reporter != null) {
            dto.setReportedById(reporter.getId());
            dto.setReportedByName(reporter.getFirstName() + " " + (reporter.getLastName() != null ? reporter.getLastName() : ""));
            dto.setReportedByEmail(reporter.getEmail());
        }

        User assignedTo = request.getAssignedTo();
        if (assignedTo != null) {
            dto.setAssignedToId(assignedTo.getId());
            dto.setAssignedToName(assignedTo.getFirstName() + " " + (assignedTo.getLastName() != null ? assignedTo.getLastName() : ""));
            dto.setAssignedToEmail(assignedTo.getEmail());
        }

        return dto;
    }
}
