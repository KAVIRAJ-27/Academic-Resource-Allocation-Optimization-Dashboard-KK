package com.ahrao.service.faculty;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.faculty.resource.*;
import com.ahrao.entity.academic.Faculty;
import com.ahrao.entity.academic.Section;
import com.ahrao.entity.academic.Subject;
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
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.academic.FacultySubjectAssignmentRepository;
import com.ahrao.repository.academic.SectionRepository;
import com.ahrao.repository.academic.SubjectRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.resource.ResourceCategoryRepository;
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
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class FacultyResourceRequestServiceImpl implements FacultyResourceRequestService {

    private static final Logger logger = LoggerFactory.getLogger(FacultyResourceRequestServiceImpl.class);
    private static final Pattern ACADEMIC_CONTEXT_PATTERN = Pattern.compile(
            "^\\[Academic Context: Subject: ([^\\-]+) - ([^,\\]]+)(?:, Section: ([^\\]]+))?\\](?:\\r?\\n)?(.*)$",
            Pattern.DOTALL
    );

    private final AcademicResourceRequestRepository requestRepository;
    private final ResourceRepository resourceRepository;
    private final ResourceCategoryRepository categoryRepository;
    private final FacultyRepository facultyRepository;
    private final FacultySubjectAssignmentRepository assignmentRepository;
    private final SubjectRepository subjectRepository;
    private final SectionRepository sectionRepository;
    private final AuditLogRepository auditLogRepository;

    public FacultyResourceRequestServiceImpl(
            AcademicResourceRequestRepository requestRepository,
            ResourceRepository resourceRepository,
            ResourceCategoryRepository categoryRepository,
            FacultyRepository facultyRepository,
            FacultySubjectAssignmentRepository assignmentRepository,
            SubjectRepository subjectRepository,
            SectionRepository sectionRepository,
            AuditLogRepository auditLogRepository) {
        this.requestRepository = requestRepository;
        this.resourceRepository = resourceRepository;
        this.categoryRepository = categoryRepository;
        this.facultyRepository = facultyRepository;
        this.assignmentRepository = assignmentRepository;
        this.subjectRepository = subjectRepository;
        this.sectionRepository = sectionRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<FacultyResourceRequestDto> getMyRequests(
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

            // 1. Mandatory ownership filter: ONLY authenticated faculty's requests
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
        List<FacultyResourceRequestDto> dtoList = resultPage.getContent().stream()
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
    public FacultyResourceRequestSummaryCountsDto getRequestCounts(Long userId) {
        long total = requestRepository.countByRequesterUserId(userId);
        long pending = requestRepository.countByRequesterUserIdAndStatus(userId, RequestStatus.PENDING);
        long approved = requestRepository.countByRequesterUserIdAndStatus(userId, RequestStatus.APPROVED);
        long rejected = requestRepository.countByRequesterUserIdAndStatus(userId, RequestStatus.REJECTED);
        long cancelled = requestRepository.countByRequesterUserIdAndStatus(userId, RequestStatus.CANCELLED);
        long completed = requestRepository.countByRequesterUserIdAndStatus(userId, RequestStatus.COMPLETED);

        return new FacultyResourceRequestSummaryCountsDto(total, pending, approved, rejected, cancelled, completed);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacultyAvailableResourceDto> getAvailableResources(Long userId, Long categoryId) {
        // Query resources where status is not INACTIVE and not MAINTENANCE
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
            FacultyAvailableResourceDto dto = new FacultyAvailableResourceDto();
            dto.setId(res.getId());
            dto.setCode(res.getCode());
            dto.setName(res.getName());
            if (res.getCategory() != null) {
                dto.setCategoryId(res.getCategory().getId());
                dto.setCategoryName(res.getCategory().getName());
            }
            dto.setCapacity(res.getCapacity());
            dto.setLocation(res.getLocation());
            dto.setStatus(res.getStatus() != null ? res.getStatus().name() : null);
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FacultyResourceRequestDetailsDto getRequestById(Long userId, Long requestId) {
        AcademicResourceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource request with ID " + requestId + " not found"));

        // Verify ownership
        if (!request.getRequester().getId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to view this resource request");
        }

        return mapToDetailsDto(request);
    }

    @Override
    @Transactional
    public FacultyResourceRequestDto createRequest(
            Long userId,
            CreateFacultyResourceRequest req,
            String ipAddress,
            String userAgent) {

        // 1. Resolve faculty and verify active status
        Faculty faculty = facultyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty record not found for authenticated user ID: " + userId));

        if (!"ACTIVE".equalsIgnoreCase(faculty.getStatus())) {
            throw new ForbiddenException("Inactive faculty accounts cannot submit academic resource requests");
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

        // 5. Academic context validation if specified
        Subject subject = null;
        Section section = null;
        if (req.getSubjectId() != null) {
            subject = subjectRepository.findById(req.getSubjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject with ID " + req.getSubjectId() + " not found"));

            boolean isAssigned = assignmentRepository.existsByFacultyIdAndSubjectId(faculty.getId(), subject.getId());
            if (!isAssigned) {
                throw new ForbiddenException("You are not assigned to subject '" + subject.getCode() + " - " + subject.getName() + "'");
            }

            if (req.getSectionId() != null) {
                section = sectionRepository.findById(req.getSectionId())
                        .orElseThrow(() -> new ResourceNotFoundException("Section with ID " + req.getSectionId() + " not found"));
            }
        }

        // 6. Duplicate request protection: same faculty + same resource + same date + status PENDING
        boolean duplicateExists = requestRepository
                .existsByRequesterUserIdAndRequestedResourceIdAndRequestedDateAndStatus(
                        userId, resource.getId(), req.getRequestedDate(), RequestStatus.PENDING);

        if (duplicateExists) {
            throw new ConflictException("A similar pending request already exists for resource '" + resource.getName() + "' on " + req.getRequestedDate());
        }

        // 7. Build description with academic context prefix if subject is present
        String finalDescription;
        String rawDescription = req.getDescription() != null ? req.getDescription().trim() : "";
        if (subject != null) {
            String contextTag = String.format("[Academic Context: Subject: %s - %s%s]",
                    subject.getCode(),
                    subject.getName(),
                    section != null ? ", Section: " + section.getName() : "");
            finalDescription = rawDescription.isEmpty() ? contextTag : contextTag + "\n" + rawDescription;
        } else {
            finalDescription = rawDescription.isEmpty() ? null : rawDescription;
        }

        // 8. Build and persist AcademicResourceRequest
        AcademicResourceRequest entity = new AcademicResourceRequest();
        entity.setRequester(faculty.getUser());
        entity.setRequestedResource(resource);
        entity.setCategory(resource.getCategory());
        entity.setDepartment(resource.getDepartment() != null ? resource.getDepartment() : faculty.getDepartment());
        entity.setRequestedDate(req.getRequestedDate());
        entity.setStartTime(req.getStartTime());
        entity.setEndTime(req.getEndTime());
        entity.setPurpose(req.getPurpose().trim());
        entity.setPriority(req.getPriority() != null ? req.getPriority() : PriorityLevel.MEDIUM);
        entity.setQuantity(req.getQuantity() != null ? req.getQuantity() : 1);
        entity.setDescription(finalDescription);
        entity.setStatus(RequestStatus.PENDING);

        AcademicResourceRequest saved = requestRepository.save(entity);

        // 9. Record audit log
        String details = String.format("Request #%d for resource '%s' on %s (%s - %s)",
                saved.getId(), resource.getName(), saved.getRequestedDate(), saved.getStartTime(), saved.getEndTime());
        recordAuditLog(faculty.getUser(), "FACULTY_RESOURCE_REQUEST_CREATED", "ACADEMIC_RESOURCE_REQUEST",
                saved.getId(), null, details, ipAddress, userAgent);

        logger.info("Faculty user {} successfully created resource request #{}", userId, saved.getId());
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public FacultyResourceRequestDto cancelRequest(
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

        recordAuditLog(request.getRequester(), "FACULTY_RESOURCE_REQUEST_CANCELLED", "ACADEMIC_RESOURCE_REQUEST",
                saved.getId(), oldStatus, "CANCELLED", ipAddress, userAgent);

        logger.info("Faculty user {} successfully cancelled resource request #{}", userId, saved.getId());
        return mapToDto(saved);
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
            AuditLog auditLog = new AuditLog();
            auditLog.setUser(user);
            auditLog.setAction(action);
            auditLog.setEntityType(entityType);
            auditLog.setEntityId(entityId);
            auditLog.setOldValue(oldValue);
            auditLog.setNewValue(newValue);
            auditLog.setIpAddress(ipAddress != null ? ipAddress : "UNKNOWN");
            auditLog.setUserAgent(userAgent != null ? (userAgent.length() > 255 ? userAgent.substring(0, 255) : userAgent) : "UNKNOWN");
            auditLog.setCreatedAt(Instant.now());
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            logger.error("Failed to record audit log for action: {}", action, e);
        }
    }

    private FacultyResourceRequestDto mapToDto(AcademicResourceRequest entity) {
        FacultyResourceRequestDto dto = new FacultyResourceRequestDto();
        dto.setId(entity.getId());
        dto.setPurpose(entity.getPurpose());
        dto.setRequestedDate(entity.getRequestedDate());
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        dto.setQuantity(entity.getQuantity());
        dto.setPriority(entity.getPriority() != null ? entity.getPriority().name() : null);
        dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);

        // Parse academic context from description if present
        parseAcademicContextAndDescription(entity.getDescription(), dto);

        if (entity.getRequestedResource() != null) {
            dto.setResourceId(entity.getRequestedResource().getId());
            dto.setResourceName(entity.getRequestedResource().getName());
            dto.setResourceCode(entity.getRequestedResource().getCode());
            dto.setResourceLocation(entity.getRequestedResource().getLocation());
            if (entity.getRequestedResource().getCategory() != null) {
                dto.setResourceCategoryName(entity.getRequestedResource().getCategory().getName());
            }
        }

        if (entity.getDepartment() != null) {
            dto.setDepartmentName(entity.getDepartment().getName());
        }

        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        return dto;
    }

    private FacultyResourceRequestDetailsDto mapToDetailsDto(AcademicResourceRequest entity) {
        FacultyResourceRequestDetailsDto dto = new FacultyResourceRequestDetailsDto();
        dto.setId(entity.getId());
        dto.setPurpose(entity.getPurpose());
        dto.setRequestedDate(entity.getRequestedDate());
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        dto.setQuantity(entity.getQuantity());
        dto.setPriority(entity.getPriority() != null ? entity.getPriority().name() : null);
        dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);

        // Parse academic context
        String rawDesc = entity.getDescription();
        if (rawDesc != null) {
            Matcher matcher = ACADEMIC_CONTEXT_PATTERN.matcher(rawDesc);
            if (matcher.matches()) {
                dto.setSubjectCode(matcher.group(1).trim());
                dto.setSubjectName(matcher.group(2).trim());
                if (matcher.group(3) != null) {
                    dto.setSectionName(matcher.group(3).trim());
                }
                String cleanDesc = matcher.group(4);
                dto.setDescription(cleanDesc != null && !cleanDesc.trim().isEmpty() ? cleanDesc.trim() : null);
            } else {
                dto.setDescription(rawDesc);
            }
        }

        if (entity.getRequestedResource() != null) {
            dto.setResourceId(entity.getRequestedResource().getId());
            dto.setResourceName(entity.getRequestedResource().getName());
            dto.setResourceCode(entity.getRequestedResource().getCode());
            dto.setResourceLocation(entity.getRequestedResource().getLocation());
            dto.setResourceCapacity(entity.getRequestedResource().getCapacity());
            if (entity.getRequestedResource().getCategory() != null) {
                dto.setResourceCategoryName(entity.getRequestedResource().getCategory().getName());
            }
        }

        if (entity.getDepartment() != null) {
            dto.setDepartmentName(entity.getDepartment().getName());
        }

        if (entity.getRequester() != null) {
            String requesterFullName = (entity.getRequester().getFirstName() != null ? entity.getRequester().getFirstName() : "")
                    + (entity.getRequester().getLastName() != null ? " " + entity.getRequester().getLastName() : "");
            dto.setRequesterName(requesterFullName.trim());
            dto.setRequesterEmail(entity.getRequester().getEmail());
            // Lookup faculty employee ID if possible
            facultyRepository.findByUserId(entity.getRequester().getId())
                    .ifPresent(f -> dto.setRequesterEmployeeId(f.getEmployeeId()));
        }

        dto.setCancellable(entity.getStatus() == RequestStatus.PENDING);
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        return dto;
    }

    private void parseAcademicContextAndDescription(String rawDesc, FacultyResourceRequestDto dto) {
        if (rawDesc == null) {
            return;
        }
        Matcher matcher = ACADEMIC_CONTEXT_PATTERN.matcher(rawDesc);
        if (matcher.matches()) {
            dto.setSubjectCode(matcher.group(1).trim());
            dto.setSubjectName(matcher.group(2).trim());
            if (matcher.group(3) != null) {
                dto.setSectionName(matcher.group(3).trim());
            }
            String cleanDesc = matcher.group(4);
            dto.setDescription(cleanDesc != null && !cleanDesc.trim().isEmpty() ? cleanDesc.trim() : null);
        } else {
            dto.setDescription(rawDesc);
        }
    }
}
