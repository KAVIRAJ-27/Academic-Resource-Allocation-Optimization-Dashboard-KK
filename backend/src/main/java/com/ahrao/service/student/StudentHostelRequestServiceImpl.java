package com.ahrao.service.student;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.student.hostel.request.CreateStudentHostelRequest;
import com.ahrao.dto.student.hostel.request.StudentHostelRequestDto;
import com.ahrao.dto.student.hostel.request.StudentHostelRequestSummaryCountsDto;
import com.ahrao.entity.academic.Student;
import com.ahrao.entity.allocation.HostelAllocation;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.PriorityLevel;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.hostel.Hostel;
import com.ahrao.entity.request.HostelRequest;
import com.ahrao.entity.user.User;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.allocation.HostelAllocationRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.request.HostelRequestRepository;
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
public class StudentHostelRequestServiceImpl implements StudentHostelRequestService {

    private static final Logger logger = LoggerFactory.getLogger(StudentHostelRequestServiceImpl.class);

    private final HostelRequestRepository requestRepository;
    private final StudentRepository studentRepository;
    private final HostelAllocationRepository hostelAllocationRepository;
    private final AuditLogRepository auditLogRepository;

    public StudentHostelRequestServiceImpl(
            HostelRequestRepository requestRepository,
            StudentRepository studentRepository,
            HostelAllocationRepository hostelAllocationRepository,
            AuditLogRepository auditLogRepository) {
        this.requestRepository = requestRepository;
        this.studentRepository = studentRepository;
        this.hostelAllocationRepository = hostelAllocationRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<StudentHostelRequestDto> getMyRequests(
            Long userId,
            RequestStatus status,
            String requestType,
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

        Specification<HostelRequest> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Mandatory ownership filter
            predicates.add(cb.equal(root.get("student").get("id"), student.getId()));

            // 2. Status filter
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            // 3. Request type filter
            if (requestType != null && !requestType.trim().isEmpty() && !requestType.equalsIgnoreCase("ALL")) {
                predicates.add(cb.equal(root.get("requestType"), requestType.trim()));
            }

            // 4. Search across description or hostel name
            if (search != null && !search.trim().isEmpty()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                Join<HostelRequest, Hostel> hostelJoin = root.join("hostel", JoinType.LEFT);

                Predicate descMatch = cb.like(cb.lower(root.get("description")), term);
                Predicate typeMatch = cb.like(cb.lower(root.get("requestType")), term);
                Predicate hostelMatch = cb.like(cb.lower(hostelJoin.get("name")), term);

                predicates.add(cb.or(descMatch, typeMatch, hostelMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<HostelRequest> resultPage = requestRepository.findAll(spec, pageable);
        List<StudentHostelRequestDto> dtoList = resultPage.getContent().stream()
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
    public StudentHostelRequestDto getRequestById(Long userId, Long requestId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user ID: " + userId));

        HostelRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel request #" + requestId + " not found"));

        if (!request.getStudent().getId().equals(student.getId())) {
            throw new ForbiddenException("You do not have permission to access this hostel request");
        }

        return mapToDto(request);
    }

    @Override
    @Transactional
    public StudentHostelRequestDto createRequest(
            Long userId,
            CreateStudentHostelRequest req,
            String ipAddress,
            String userAgent) {

        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user ID: " + userId));

        if (!"ACTIVE".equalsIgnoreCase(student.getStatus())) {
            throw new ForbiddenException("Inactive student accounts cannot submit hostel requests");
        }

        // Validate active hostel allocation
        Optional<HostelAllocation> allocationOpt = hostelAllocationRepository
                .findByStudentIdAndStatus(student.getId(), AllocationStatus.ACTIVE);

        if (allocationOpt.isEmpty() || allocationOpt.get().getBed() == null ||
            allocationOpt.get().getBed().getRoom() == null ||
            allocationOpt.get().getBed().getRoom().getFloor() == null ||
            allocationOpt.get().getBed().getRoom().getFloor().getBlock() == null ||
            allocationOpt.get().getBed().getRoom().getFloor().getBlock().getHostel() == null) {
            throw new BadRequestException("No active hostel allocation found. You must be an active hostel resident to submit hostel requests.");
        }

        Hostel hostel = allocationOpt.get().getBed().getRoom().getFloor().getBlock().getHostel();

        // Prevent duplicate pending requests of the same type
        boolean duplicateExists = requestRepository.existsByStudentIdAndHostelIdAndRequestTypeAndStatus(
                student.getId(), hostel.getId(), req.getRequestType().trim(), RequestStatus.PENDING);

        if (duplicateExists) {
            throw new ConflictException("A pending request of type '" + req.getRequestType() + "' already exists for your hostel.");
        }

        HostelRequest entity = new HostelRequest();
        entity.setStudent(student);
        entity.setHostel(hostel);
        entity.setRequestType(req.getRequestType().trim());
        entity.setDescription(req.getDescription().trim());
        entity.setPriority(req.getPriority() != null ? req.getPriority() : PriorityLevel.MEDIUM);
        entity.setStatus(RequestStatus.PENDING);

        HostelRequest saved = requestRepository.save(entity);

        recordAuditLog(student.getUser(), "STUDENT_HOSTEL_REQUEST_CREATED", "HOSTEL_REQUEST",
                saved.getId(), null, "Type: " + saved.getRequestType(), ipAddress, userAgent);

        return mapToDto(saved);
    }

    @Override
    @Transactional
    public StudentHostelRequestDto cancelRequest(
            Long userId,
            Long requestId,
            String ipAddress,
            String userAgent) {

        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user ID: " + userId));

        HostelRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel request #" + requestId + " not found"));

        if (!request.getStudent().getId().equals(student.getId())) {
            throw new ForbiddenException("You do not have permission to cancel this hostel request");
        }

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Only PENDING requests can be cancelled. Current status is " + request.getStatus());
        }

        String oldStatus = request.getStatus().name();
        request.setStatus(RequestStatus.CANCELLED);
        HostelRequest saved = requestRepository.save(request);

        recordAuditLog(student.getUser(), "STUDENT_HOSTEL_REQUEST_CANCELLED", "HOSTEL_REQUEST",
                saved.getId(), oldStatus, "CANCELLED", ipAddress, userAgent);

        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentHostelRequestSummaryCountsDto getRequestCounts(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user ID: " + userId));

        long total = requestRepository.countByStudentId(student.getId());
        long pending = requestRepository.countByStudentIdAndStatus(student.getId(), RequestStatus.PENDING);
        long approved = requestRepository.countByStudentIdAndStatus(student.getId(), RequestStatus.APPROVED);
        long rejected = requestRepository.countByStudentIdAndStatus(student.getId(), RequestStatus.REJECTED);
        long cancelled = requestRepository.countByStudentIdAndStatus(student.getId(), RequestStatus.CANCELLED);
        long completed = requestRepository.countByStudentIdAndStatus(student.getId(), RequestStatus.COMPLETED);

        return new StudentHostelRequestSummaryCountsDto(total, pending, approved, rejected, cancelled, completed);
    }

    private StudentHostelRequestDto mapToDto(HostelRequest entity) {
        StudentHostelRequestDto dto = new StudentHostelRequestDto();
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
        dto.setRequestType(entity.getRequestType());
        dto.setDescription(entity.getDescription());
        dto.setPriority(entity.getPriority());
        dto.setStatus(entity.getStatus());
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
