package com.ahrao.service.student;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.student.resource.CreateStudentResourceRequest;
import com.ahrao.dto.student.resource.StudentResourceRequestDto;
import com.ahrao.dto.student.resource.StudentResourceRequestSummaryCountsDto;
import com.ahrao.dto.student.resource.StudentResourceSummaryDto;
import com.ahrao.entity.academic.Student;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.PriorityLevel;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.enums.ResourceStatus;
import com.ahrao.entity.request.AcademicResourceRequest;
import com.ahrao.entity.resource.Resource;
import com.ahrao.entity.resource.ResourceCategory;
import com.ahrao.entity.user.User;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.resource.ResourceRepository;
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
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentResourceRequestServiceImpl implements StudentResourceRequestService {

    private static final Logger logger = LoggerFactory.getLogger(StudentResourceRequestServiceImpl.class);

    private final AcademicResourceRequestRepository requestRepository;
    private final ResourceRepository resourceRepository;
    private final StudentRepository studentRepository;
    private final AuditLogRepository auditLogRepository;

    public StudentResourceRequestServiceImpl(
            AcademicResourceRequestRepository requestRepository,
            ResourceRepository resourceRepository,
            StudentRepository studentRepository,
            AuditLogRepository auditLogRepository) {
        this.requestRepository = requestRepository;
        this.resourceRepository = resourceRepository;
        this.studentRepository = studentRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<StudentResourceRequestDto> getMyRequests(
            Long userId,
            RequestStatus status,
            Long categoryId,
            LocalDate date,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDirection) {

        Sort sort = sortDirection.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<AcademicResourceRequest> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Mandatory ownership filter: ONLY authenticated student's requests
            predicates.add(cb.equal(root.get("requester").get("id"), userId));

            // 2. Status filter
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            // 3. Category filter
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            // 4. Date filter
            if (date != null) {
                predicates.add(cb.equal(root.get("requestedDate"), date));
            }

            // 5. Search across purpose, resource name/code, category name
            if (search != null && !search.trim().isEmpty()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                Join<AcademicResourceRequest, Resource> resourceJoin = root.join("requestedResource", JoinType.LEFT);
                Join<AcademicResourceRequest, ResourceCategory> categoryJoin = root.join("category", JoinType.LEFT);

                Predicate purposeMatch = cb.like(cb.lower(root.get("purpose")), term);
                Predicate resourceNameMatch = cb.like(cb.lower(resourceJoin.get("name")), term);
                Predicate resourceCodeMatch = cb.like(cb.lower(resourceJoin.get("code")), term);
                Predicate categoryNameMatch = cb.like(cb.lower(categoryJoin.get("name")), term);

                predicates.add(cb.or(purposeMatch, resourceNameMatch, resourceCodeMatch, categoryNameMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<AcademicResourceRequest> resultPage = requestRepository.findAll(spec, pageable);
        List<StudentResourceRequestDto> dtoList = resultPage.getContent().stream()
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
    public StudentResourceRequestDto getRequestById(Long userId, Long requestId) {
        AcademicResourceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource request with ID " + requestId + " not found"));

        // Verify ownership
        if (!request.getRequester().getId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to view this resource request");
        }

        return mapToDto(request);
    }

    @Override
    @Transactional
    public StudentResourceRequestDto createRequest(
            Long userId,
            CreateStudentResourceRequest req,
            String ipAddress,
            String userAgent) {

        // 1. Resolve student and verify active status
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student record not found for authenticated user ID: " + userId));

        if (!"ACTIVE".equalsIgnoreCase(student.getStatus())) {
            throw new ForbiddenException("Inactive student accounts cannot submit academic resource requests");
        }

        // 2. Resolve resource and verify eligibility
        Resource resource = resourceRepository.findById(req.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource with ID " + req.getResourceId() + " does not exist"));

        if (resource.getStatus() == ResourceStatus.INACTIVE || resource.getStatus() == ResourceStatus.MAINTENANCE) {
            throw new BadRequestException("Resource '" + resource.getName() + "' is currently under maintenance or inactive and cannot be requested");
        }

        // 3. Validate requested date
        if (req.getRequestedDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Requested date cannot be in the past");
        }

        // 4. Validate time window
        if (!req.getStartTime().isBefore(req.getEndTime())) {
            throw new BadRequestException("Start time (" + req.getStartTime() + ") must be earlier than end time (" + req.getEndTime() + ")");
        }

        // 5. Duplicate request protection: same student + same resource + same date + status PENDING
        boolean duplicateExists = requestRepository
                .existsByRequesterUserIdAndRequestedResourceIdAndRequestedDateAndStatus(
                        userId, resource.getId(), req.getRequestedDate(), RequestStatus.PENDING);

        if (duplicateExists) {
            throw new ConflictException("A similar pending request already exists for resource '" + resource.getName() + "' on " + req.getRequestedDate());
        }

        // 6. Build and persist AcademicResourceRequest
        AcademicResourceRequest entity = new AcademicResourceRequest();
        entity.setRequester(student.getUser());
        entity.setRequestedResource(resource);
        entity.setCategory(resource.getCategory());
        entity.setDepartment(resource.getDepartment() != null ? resource.getDepartment() : student.getDepartment());
        entity.setRequestedDate(req.getRequestedDate());
        entity.setStartTime(req.getStartTime());
        entity.setEndTime(req.getEndTime());
        entity.setPurpose(req.getPurpose().trim());
        entity.setPriority(req.getPriority() != null ? req.getPriority() : PriorityLevel.MEDIUM);
        entity.setQuantity(req.getQuantity() != null ? req.getQuantity() : 1);
        entity.setDescription(req.getDescription() != null ? req.getDescription().trim() : null);
        entity.setStatus(RequestStatus.PENDING);

        AcademicResourceRequest saved = requestRepository.save(entity);

        // 7. Record audit log
        String details = String.format("Request #%d for resource '%s' on %s (%s - %s)",
                saved.getId(), resource.getName(), saved.getRequestedDate(), saved.getStartTime(), saved.getEndTime());
        recordAuditLog(student.getUser(), "STUDENT_RESOURCE_REQUEST_CREATED", "ACADEMIC_RESOURCE_REQUEST",
                saved.getId(), null, details, ipAddress, userAgent);

        return mapToDto(saved);
    }

    @Override
    @Transactional
    public StudentResourceRequestDto cancelRequest(
            Long userId,
            Long requestId,
            String ipAddress,
            String userAgent) {

        AcademicResourceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource request with ID " + requestId + " not found"));

        // Verify ownership
        if (!request.getRequester().getId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to cancel this resource request");
        }

        // Enforce cancellation eligibility: ONLY PENDING requests can be cancelled
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Only PENDING requests can be cancelled. Current status is " + request.getStatus());
        }

        String oldStatus = request.getStatus().name();
        request.setStatus(RequestStatus.CANCELLED);
        AcademicResourceRequest saved = requestRepository.save(request);

        recordAuditLog(request.getRequester(), "STUDENT_RESOURCE_REQUEST_CANCELLED", "ACADEMIC_RESOURCE_REQUEST",
                saved.getId(), oldStatus, "CANCELLED", ipAddress, userAgent);

        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResourceRequestSummaryCountsDto getRequestCounts(Long userId) {
        long total = requestRepository.countByRequesterUserId(userId);
        long pending = requestRepository.countByRequesterUserIdAndStatus(userId, RequestStatus.PENDING);
        long approved = requestRepository.countByRequesterUserIdAndStatus(userId, RequestStatus.APPROVED);
        long rejected = requestRepository.countByRequesterUserIdAndStatus(userId, RequestStatus.REJECTED);
        long cancelled = requestRepository.countByRequesterUserIdAndStatus(userId, RequestStatus.CANCELLED);
        long completed = requestRepository.countByRequesterUserIdAndStatus(userId, RequestStatus.COMPLETED);

        return new StudentResourceRequestSummaryCountsDto(total, pending, approved, rejected, cancelled, completed);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResourceSummaryDto> getAvailableResources(Long userId, Long categoryId) {
        // Query resources where status is AVAILABLE or ALLOCATED (allocations are time-slotted; students can request future slots)
        Specification<Resource> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.notEqual(root.get("status"), ResourceStatus.INACTIVE));
            predicates.add(cb.notEqual(root.get("status"), ResourceStatus.MAINTENANCE));

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<Resource> resources = resourceRepository.findAll(spec, Sort.by("name").ascending());

        return resources.stream().map(res -> {
            StudentResourceSummaryDto dto = new StudentResourceSummaryDto();
            dto.setId(res.getId());
            dto.setCode(res.getCode());
            dto.setName(res.getName());
            if (res.getCategory() != null) {
                dto.setCategoryId(res.getCategory().getId());
                dto.setCategoryName(res.getCategory().getName());
            }
            if (res.getDepartment() != null) {
                dto.setDepartmentId(res.getDepartment().getId());
                dto.setDepartmentName(res.getDepartment().getName());
            }
            dto.setCapacity(res.getCapacity());
            dto.setLocation(res.getLocation());
            dto.setStatus(res.getStatus() != null ? res.getStatus().name() : "AVAILABLE");
            return dto;
        }).collect(Collectors.toList());
    }

    private StudentResourceRequestDto mapToDto(AcademicResourceRequest entity) {
        StudentResourceRequestDto dto = new StudentResourceRequestDto();
        dto.setId(entity.getId());
        dto.setRequesterUserId(entity.getRequester().getId());
        dto.setRequesterName(entity.getRequester().getFirstName() + " " + entity.getRequester().getLastName());

        if (entity.getRequestedResource() != null) {
            dto.setResourceId(entity.getRequestedResource().getId());
            dto.setResourceName(entity.getRequestedResource().getName());
            dto.setResourceCode(entity.getRequestedResource().getCode());
            dto.setResourceLocation(entity.getRequestedResource().getLocation());
            dto.setResourceCapacity(entity.getRequestedResource().getCapacity());
        }

        if (entity.getCategory() != null) {
            dto.setCategoryId(entity.getCategory().getId());
            dto.setCategoryName(entity.getCategory().getName());
        }

        if (entity.getDepartment() != null) {
            dto.setDepartmentId(entity.getDepartment().getId());
            dto.setDepartmentName(entity.getDepartment().getName());
            dto.setDepartmentCode(entity.getDepartment().getCode());
        }

        dto.setRequestedDate(entity.getRequestedDate());
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        dto.setPurpose(entity.getPurpose());
        dto.setQuantity(entity.getQuantity());
        dto.setPriority(entity.getPriority());
        dto.setStatus(entity.getStatus());
        dto.setDescription(entity.getDescription());
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
