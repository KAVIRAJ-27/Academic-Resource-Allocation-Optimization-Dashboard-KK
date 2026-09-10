package com.ahrao.service.warden;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.warden.UpdateComplaintStatusRequest;
import com.ahrao.dto.warden.WardenComplaintDetailDto;
import com.ahrao.dto.warden.WardenComplaintSummaryDto;
import com.ahrao.entity.academic.Student;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.ComplaintStatus;
import com.ahrao.entity.enums.PriorityLevel;
import com.ahrao.entity.hostel.Hostel;
import com.ahrao.entity.hostel.HostelBlock;
import com.ahrao.entity.hostel.HostelFloor;
import com.ahrao.entity.hostel.HostelRoom;
import com.ahrao.entity.hostel.Warden;
import com.ahrao.entity.request.HostelComplaint;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.request.HostelComplaintRepository;
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
public class WardenComplaintServiceImpl implements WardenComplaintService {

    private static final Logger log = LoggerFactory.getLogger(WardenComplaintServiceImpl.class);

    private final HostelComplaintRepository hostelComplaintRepository;
    private final WardenScopeService wardenScopeService;
    private final AuditLogRepository auditLogRepository;

    public WardenComplaintServiceImpl(
            HostelComplaintRepository hostelComplaintRepository,
            WardenScopeService wardenScopeService,
            AuditLogRepository auditLogRepository) {
        this.hostelComplaintRepository = hostelComplaintRepository;
        this.wardenScopeService = wardenScopeService;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    public PagedResponse<WardenComplaintSummaryDto> getComplaints(
            Long hostelId,
            Long blockId,
            Integer floorNumber,
            Long roomId,
            ComplaintStatus status,
            PriorityLevel priority,
            String category,
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

        Specification<HostelComplaint> spec = (root, query, cb) -> {
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

            if (category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category)) {
                predicates.add(cb.equal(cb.upper(root.get("category")), category.trim().toUpperCase()));
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
                Predicate studentName = cb.like(cb.lower(root.get("student").get("user").get("firstName")), term);
                Predicate regMatch = cb.like(cb.lower(root.get("student").get("registerNumber")), term);
                Predicate roomMatch = cb.like(cb.lower(root.get("room").get("roomNumber")), term);
                predicates.add(cb.or(titleMatch, descMatch, studentName, regMatch, roomMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<HostelComplaint> resultPage = hostelComplaintRepository.findAll(spec, pageable);
        List<WardenComplaintSummaryDto> dtos = resultPage.getContent().stream()
                .map(this::mapToSummary)
                .collect(Collectors.toList());

        return PagedResponse.fromPage(new PageImpl<>(
                dtos, pageable, resultPage.getTotalElements()));
    }

    @Override
    public WardenComplaintDetailDto getComplaintById(Long id) {
        HostelComplaint complaint = wardenScopeService.validateComplaintAccess(id);
        return mapToDetail(complaint);
    }

    @Override
    @Transactional
    public WardenComplaintDetailDto updateComplaintStatus(
            Long id,
            UpdateComplaintStatusRequest request,
            String ipAddress,
            String userAgent) {

        HostelComplaint complaint = wardenScopeService.validateComplaintAccess(id);
        Warden warden = wardenScopeService.resolveWarden();

        ComplaintStatus currentStatus = complaint.getStatus();
        ComplaintStatus newStatus = request.getStatus();

        if (currentStatus == newStatus) {
            return mapToDetail(complaint);
        }

        // Validate state machine transitions
        validateStatusTransition(currentStatus, newStatus);

        // Update state
        complaint.setStatus(newStatus);

        if (newStatus == ComplaintStatus.RESOLVED) {
            complaint.setResolvedAt(Instant.now());
        }

        if (newStatus == ComplaintStatus.IN_PROGRESS && complaint.getAssignedTo() == null) {
            complaint.setAssignedTo(warden.getUser());
        }

        HostelComplaint saved = hostelComplaintRepository.save(complaint);

        // Create AuditLog
        AuditLog auditLog = new AuditLog();
        auditLog.setUser(warden.getUser());
        auditLog.setAction("WARDEN_COMPLAINT_STATUS_UPDATED");
        auditLog.setEntityType("HostelComplaint");
        auditLog.setEntityId(saved.getId());
        auditLog.setOldValue(String.format("{\"status\":\"%s\"}", currentStatus));
        auditLog.setNewValue(String.format("{\"status\":\"%s\",\"remarks\":\"%s\"}", newStatus, request.getRemarks() != null ? request.getRemarks() : ""));
        auditLog.setIpAddress(ipAddress);
        auditLog.setUserAgent(userAgent);
        auditLog.setCreatedAt(Instant.now());
        auditLogRepository.save(auditLog);

        log.info("Complaint status updated: id={}, from={}, to={}, wardenId={}", saved.getId(), currentStatus, newStatus, warden.getId());
        return mapToDetail(saved);
    }

    private void validateStatusTransition(ComplaintStatus current, ComplaintStatus next) {
        switch (current) {
            case OPEN:
                if (next != ComplaintStatus.IN_PROGRESS && next != ComplaintStatus.REJECTED) {
                    throw new ConflictException("Cannot transition complaint from " + current + " to " + next + ". Allowed: IN_PROGRESS, REJECTED");
                }
                break;
            case IN_PROGRESS:
                if (next != ComplaintStatus.RESOLVED && next != ComplaintStatus.REJECTED) {
                    throw new ConflictException("Cannot transition complaint from " + current + " to " + next + ". Allowed: RESOLVED, REJECTED");
                }
                break;
            case RESOLVED:
                if (next != ComplaintStatus.CLOSED && next != ComplaintStatus.IN_PROGRESS) {
                    throw new ConflictException("Cannot transition complaint from " + current + " to " + next + ". Allowed: CLOSED, IN_PROGRESS");
                }
                break;
            case CLOSED:
            case REJECTED:
                throw new ConflictException("Complaint is in terminal state '" + current + "' and cannot be modified.");
            default:
                throw new ConflictException("Unknown complaint status transition from " + current + " to " + next);
        }
    }

    private WardenComplaintSummaryDto mapToSummary(HostelComplaint complaint) {
        WardenComplaintSummaryDto dto = new WardenComplaintSummaryDto();
        dto.setId(complaint.getId());
        dto.setTitle(complaint.getTitle());
        dto.setCategory(complaint.getCategory());
        dto.setPriority(complaint.getPriority());
        dto.setStatus(complaint.getStatus());
        dto.setCreatedAt(complaint.getCreatedAt());
        dto.setUpdatedAt(complaint.getUpdatedAt());
        dto.setResolvedAt(complaint.getResolvedAt());

        Student student = complaint.getStudent();
        if (student != null) {
            dto.setStudentId(student.getId());
            dto.setRegisterNumber(student.getRegisterNumber());
            if (student.getUser() != null) {
                dto.setStudentName(student.getUser().getFirstName() + " " + (student.getUser().getLastName() != null ? student.getUser().getLastName() : ""));
            }
        }

        Hostel hostel = complaint.getHostel();
        if (hostel != null) {
            dto.setHostelId(hostel.getId());
            dto.setHostelName(hostel.getName());
            dto.setHostelCode(hostel.getCode());
        }

        HostelRoom room = complaint.getRoom();
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

        User assignedTo = complaint.getAssignedTo();
        if (assignedTo != null) {
            dto.setAssignedToId(assignedTo.getId());
            dto.setAssignedToName(assignedTo.getFirstName() + " " + (assignedTo.getLastName() != null ? assignedTo.getLastName() : ""));
        }

        return dto;
    }

    private WardenComplaintDetailDto mapToDetail(HostelComplaint complaint) {
        WardenComplaintDetailDto dto = new WardenComplaintDetailDto();
        dto.setId(complaint.getId());
        dto.setTitle(complaint.getTitle());
        dto.setDescription(complaint.getDescription());
        dto.setCategory(complaint.getCategory());
        dto.setPriority(complaint.getPriority());
        dto.setStatus(complaint.getStatus());
        dto.setCreatedAt(complaint.getCreatedAt());
        dto.setUpdatedAt(complaint.getUpdatedAt());
        dto.setResolvedAt(complaint.getResolvedAt());

        Student student = complaint.getStudent();
        if (student != null) {
            dto.setStudentId(student.getId());
            dto.setRegisterNumber(student.getRegisterNumber());
            dto.setCurrentSemester(student.getCurrentSemester());
            if (student.getDepartment() != null) {
                dto.setDepartmentName(student.getDepartment().getName());
            }
            if (student.getProgram() != null) {
                dto.setProgramName(student.getProgram().getName());
            }
            if (student.getUser() != null) {
                dto.setStudentName(student.getUser().getFirstName() + " " + (student.getUser().getLastName() != null ? student.getUser().getLastName() : ""));
                dto.setStudentEmail(student.getUser().getEmail());
                dto.setStudentPhone(student.getUser().getPhone());
            }
        }

        Hostel hostel = complaint.getHostel();
        if (hostel != null) {
            dto.setHostelId(hostel.getId());
            dto.setHostelName(hostel.getName());
            dto.setHostelCode(hostel.getCode());
        }

        HostelRoom room = complaint.getRoom();
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

        User assignedTo = complaint.getAssignedTo();
        if (assignedTo != null) {
            dto.setAssignedToId(assignedTo.getId());
            dto.setAssignedToName(assignedTo.getFirstName() + " " + (assignedTo.getLastName() != null ? assignedTo.getLastName() : ""));
            dto.setAssignedToEmail(assignedTo.getEmail());
        }

        return dto;
    }
}
