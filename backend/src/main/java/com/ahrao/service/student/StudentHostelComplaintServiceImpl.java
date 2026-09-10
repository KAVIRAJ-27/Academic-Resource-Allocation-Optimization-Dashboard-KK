package com.ahrao.service.student;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.student.hostel.complaint.CreateStudentHostelComplaint;
import com.ahrao.dto.student.hostel.complaint.StudentHostelComplaintDto;
import com.ahrao.dto.student.hostel.complaint.StudentHostelComplaintSummaryCountsDto;
import com.ahrao.entity.academic.Student;
import com.ahrao.entity.allocation.HostelAllocation;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.ComplaintStatus;
import com.ahrao.entity.enums.PriorityLevel;
import com.ahrao.entity.hostel.Hostel;
import com.ahrao.entity.hostel.HostelRoom;
import com.ahrao.entity.request.HostelComplaint;
import com.ahrao.entity.user.User;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.allocation.HostelAllocationRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.hostel.HostelRoomRepository;
import com.ahrao.repository.request.HostelComplaintRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StudentHostelComplaintServiceImpl implements StudentHostelComplaintService {

    private static final Logger logger = LoggerFactory.getLogger(StudentHostelComplaintServiceImpl.class);

    private final HostelComplaintRepository complaintRepository;
    private final StudentRepository studentRepository;
    private final HostelAllocationRepository hostelAllocationRepository;
    private final HostelRoomRepository hostelRoomRepository;
    private final AuditLogRepository auditLogRepository;

    public StudentHostelComplaintServiceImpl(
            HostelComplaintRepository complaintRepository,
            StudentRepository studentRepository,
            HostelAllocationRepository hostelAllocationRepository,
            HostelRoomRepository hostelRoomRepository,
            AuditLogRepository auditLogRepository) {
        this.complaintRepository = complaintRepository;
        this.studentRepository = studentRepository;
        this.hostelAllocationRepository = hostelAllocationRepository;
        this.hostelRoomRepository = hostelRoomRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<StudentHostelComplaintDto> getMyComplaints(
            Long userId,
            ComplaintStatus status,
            String category,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDirection) {

        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user ID: " + userId));

        Sort sort = sortDirection.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<HostelComplaint> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Mandatory ownership filter
            predicates.add(cb.equal(root.get("student").get("id"), student.getId()));

            // 2. Status filter
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            // 3. Category filter
            if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("ALL")) {
                predicates.add(cb.equal(root.get("category"), category.trim()));
            }

            // 4. Search across title, description, or hostel name
            if (search != null && !search.trim().isEmpty()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                Join<HostelComplaint, Hostel> hostelJoin = root.join("hostel", JoinType.LEFT);

                Predicate titleMatch = cb.like(cb.lower(root.get("title")), term);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), term);
                Predicate catMatch = cb.like(cb.lower(root.get("category")), term);
                Predicate hostelMatch = cb.like(cb.lower(hostelJoin.get("name")), term);

                predicates.add(cb.or(titleMatch, descMatch, catMatch, hostelMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<HostelComplaint> resultPage = complaintRepository.findAll(spec, pageable);
        List<StudentHostelComplaintDto> dtoList = resultPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                dtoList,
                resultPage.getNumber(),
                resultPage.getSize(),
                resultPage.getTotalElements(),
                resultPage.getTotalPages(),
                resultPage.isFirst(),
                resultPage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public StudentHostelComplaintDto getComplaintById(Long userId, Long complaintId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user ID: " + userId));

        HostelComplaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel complaint #" + complaintId + " not found"));

        if (!complaint.getStudent().getId().equals(student.getId())) {
            throw new ForbiddenException("You do not have permission to access this hostel complaint");
        }

        return mapToDto(complaint);
    }

    @Override
    @Transactional
    public StudentHostelComplaintDto createComplaint(
            Long userId,
            CreateStudentHostelComplaint req,
            String ipAddress,
            String userAgent) {

        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user ID: " + userId));

        if (!"ACTIVE".equalsIgnoreCase(student.getStatus())) {
            throw new ForbiddenException("Inactive student accounts cannot submit hostel complaints");
        }

        // Validate active hostel allocation
        Optional<HostelAllocation> allocationOpt = hostelAllocationRepository
                .findByStudentIdAndStatus(student.getId(), AllocationStatus.ACTIVE);

        if (allocationOpt.isEmpty() || allocationOpt.get().getBed() == null ||
            allocationOpt.get().getBed().getRoom() == null ||
            allocationOpt.get().getBed().getRoom().getFloor() == null ||
            allocationOpt.get().getBed().getRoom().getFloor().getBlock() == null ||
            allocationOpt.get().getBed().getRoom().getFloor().getBlock().getHostel() == null) {
            throw new BadRequestException("No active hostel allocation found. You must be an active hostel resident to lodge hostel complaints.");
        }

        HostelRoom assignedRoom = allocationOpt.get().getBed().getRoom();
        Hostel hostel = assignedRoom.getFloor().getBlock().getHostel();

        HostelRoom targetRoom = assignedRoom;
        if (req.getRoomId() != null) {
            HostelRoom requestedRoom = hostelRoomRepository.findById(req.getRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Specified room does not exist"));
            // Verify room belongs to student's allocated hostel
            if (!requestedRoom.getFloor().getBlock().getHostel().getId().equals(hostel.getId())) {
                throw new BadRequestException("The specified room does not belong to your allocated hostel");
            }
            targetRoom = requestedRoom;
        }

        HostelComplaint entity = new HostelComplaint();
        entity.setStudent(student);
        entity.setHostel(hostel);
        entity.setRoom(targetRoom);
        entity.setCategory(req.getCategory().trim().toUpperCase());
        entity.setTitle(req.getTitle().trim());
        entity.setDescription(req.getDescription().trim());
        entity.setPriority(req.getPriority() != null ? req.getPriority() : PriorityLevel.MEDIUM);
        entity.setStatus(ComplaintStatus.OPEN);

        HostelComplaint saved = complaintRepository.save(entity);

        recordAuditLog(student.getUser(), "STUDENT_HOSTEL_COMPLAINT_CREATED", "HOSTEL_COMPLAINT",
                saved.getId(), null, "Title: " + saved.getTitle(), ipAddress, userAgent);

        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentHostelComplaintSummaryCountsDto getComplaintCounts(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user ID: " + userId));

        long total = complaintRepository.countByStudentId(student.getId());
        long open = complaintRepository.countByStudentIdAndStatus(student.getId(), ComplaintStatus.OPEN);
        long inProgress = complaintRepository.countByStudentIdAndStatus(student.getId(), ComplaintStatus.IN_PROGRESS);
        long resolved = complaintRepository.countByStudentIdAndStatus(student.getId(), ComplaintStatus.RESOLVED);
        long closed = complaintRepository.countByStudentIdAndStatus(student.getId(), ComplaintStatus.CLOSED);
        long rejected = complaintRepository.countByStudentIdAndStatus(student.getId(), ComplaintStatus.REJECTED);

        return new StudentHostelComplaintSummaryCountsDto(total, open, inProgress, resolved, closed, rejected);
    }

    private StudentHostelComplaintDto mapToDto(HostelComplaint entity) {
        StudentHostelComplaintDto dto = new StudentHostelComplaintDto();
        dto.setId(entity.getId());
        if (entity.getStudent() != null) {
            dto.setStudentId(entity.getStudent().getId());
            if (entity.getStudent().getUser() != null) {
                dto.setStudentName(entity.getStudent().getUser().getFirstName() + " " + entity.getStudent().getUser().getLastName());
            }
        }
        if (entity.getHostel() != null) {
            dto.setHostelId(entity.getHostel().getId());
            dto.setHostelName(entity.getHostel().getName());
            dto.setHostelCode(entity.getHostel().getCode());
        }
        if (entity.getRoom() != null) {
            dto.setRoomId(entity.getRoom().getId());
            dto.setRoomNumber(entity.getRoom().getRoomNumber());
        }
        dto.setCategory(entity.getCategory());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setPriority(entity.getPriority());
        dto.setStatus(entity.getStatus());
        if (entity.getAssignedTo() != null) {
            dto.setAssignedToName(entity.getAssignedTo().getFirstName() + " " + entity.getAssignedTo().getLastName());
        }
        dto.setResolvedAt(entity.getResolvedAt());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    private void recordAuditLog(
            User user,
            String action,
            String entityType,
            Long entityId,
            String oldValue,
            String newValue,
            String ipAddress,
            String userAgent) {
        try {
            AuditLog log = new AuditLog();
            log.setUser(user);
            log.setAction(action);
            log.setEntityType(entityType);
            log.setEntityId(entityId);
            log.setOldValue(oldValue);
            log.setNewValue(newValue);
            log.setIpAddress(ipAddress);
            log.setUserAgent(userAgent);
            log.setCreatedAt(Instant.now());
            auditLogRepository.save(log);
        } catch (Exception ex) {
            logger.error("Failed to record audit log for action: {}", action, ex);
        }
    }
}
