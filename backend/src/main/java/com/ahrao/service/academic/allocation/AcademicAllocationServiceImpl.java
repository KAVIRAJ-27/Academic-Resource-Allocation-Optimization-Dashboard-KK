package com.ahrao.service.academic.allocation;

import com.ahrao.dto.academic.allocation.*;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.entity.academic.AcademicYear;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.academic.Semester;
import com.ahrao.entity.academic.TimeSlot;
import com.ahrao.entity.allocation.ResourceAllocation;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.enums.ResourceStatus;
import com.ahrao.entity.request.AcademicResourceRequest;
import com.ahrao.entity.resource.Classroom;
import com.ahrao.entity.resource.Laboratory;
import com.ahrao.entity.resource.Resource;
import com.ahrao.entity.user.Role;
import com.ahrao.entity.user.User;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.AcademicYearRepository;
import com.ahrao.repository.academic.SemesterRepository;
import com.ahrao.repository.academic.TimeSlotRepository;
import com.ahrao.repository.allocation.ResourceAllocationRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.resource.ClassroomRepository;
import com.ahrao.repository.resource.LaboratoryRepository;
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
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AcademicAllocationServiceImpl implements AcademicAllocationService {

    private static final Logger logger = LoggerFactory.getLogger(AcademicAllocationServiceImpl.class);

    private static final Pattern ACADEMIC_CONTEXT_PATTERN = Pattern.compile(
            "^\\[Academic Context: Subject: ([^\\-]+) - ([^,\\]]+)(?:, Section: ([^\\]]+))?\\].*$",
            Pattern.DOTALL
    );

    private final ResourceAllocationRepository allocationRepository;
    private final AcademicResourceRequestRepository requestRepository;
    private final ResourceRepository resourceRepository;
    private final ClassroomRepository classroomRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final AcademicYearRepository academicYearRepository;
    private final SemesterRepository semesterRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final AuditLogRepository auditLogRepository;
    private final AcademicAllocationValidator validator;
    private final AcademicResourceCandidateService candidateService;
    private final com.ahrao.service.hod.HodDepartmentResolver hodDepartmentResolver;
    private final com.ahrao.service.conflict.ConflictDetectionService conflictDetectionService;

    public AcademicAllocationServiceImpl(
            ResourceAllocationRepository allocationRepository,
            AcademicResourceRequestRepository requestRepository,
            ResourceRepository resourceRepository,
            ClassroomRepository classroomRepository,
            LaboratoryRepository laboratoryRepository,
            AcademicYearRepository academicYearRepository,
            SemesterRepository semesterRepository,
            TimeSlotRepository timeSlotRepository,
            AuditLogRepository auditLogRepository,
            AcademicAllocationValidator validator,
            AcademicResourceCandidateService candidateService,
            com.ahrao.service.hod.HodDepartmentResolver hodDepartmentResolver,
            com.ahrao.service.conflict.ConflictDetectionService conflictDetectionService
    ) {
        this.allocationRepository = allocationRepository;
        this.requestRepository = requestRepository;
        this.resourceRepository = resourceRepository;
        this.classroomRepository = classroomRepository;
        this.laboratoryRepository = laboratoryRepository;
        this.academicYearRepository = academicYearRepository;
        this.semesterRepository = semesterRepository;
        this.timeSlotRepository = timeSlotRepository;
        this.auditLogRepository = auditLogRepository;
        this.validator = validator;
        this.candidateService = candidateService;
        this.hodDepartmentResolver = hodDepartmentResolver;
        this.conflictDetectionService = conflictDetectionService;
    }


    @Override
    @Transactional
    public AcademicAllocationDetailDto allocateResource(CreateAcademicAllocationRequest request, User currentUser) {
        if (request == null || request.getRequestId() == null) {
            throw new BadRequestException("Request ID is required for allocation.");
        }
        if (request.getResourceId() == null) {
            throw new BadRequestException("Resource ID is required for manual allocation.");
        }

        // 1. Load and validate request
        AcademicResourceRequest academicRequest = requestRepository.findById(request.getRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Academic request not found with ID: " + request.getRequestId()));

        validator.validateRequestEligibility(academicRequest);

        // 2. Concurrency Control: Acquire PESSIMISTIC_WRITE lock on the candidate Resource row
        Resource resource = resourceRepository.findByIdWithLock(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Target resource not found with ID: " + request.getResourceId()));

        // 3. Validate user scope (Institution / Department)
        validator.validateUserScope(currentUser, academicRequest, resource);

        // 4. Resolve TimeSlot if provided
        TimeSlot timeSlot = null;
        if (request.getTimeSlotId() != null) {
            timeSlot = timeSlotRepository.findById(request.getTimeSlotId())
                    .orElseThrow(() -> new ResourceNotFoundException("TimeSlot not found with ID: " + request.getTimeSlotId()));
        }

        // 5. Assert resource eligibility and conflict-free under lock
        com.ahrao.dto.conflict.ConflictCheckRequestDto checkReq = new com.ahrao.dto.conflict.ConflictCheckRequestDto();
        checkReq.setDomain(com.ahrao.entity.enums.ConflictDomain.ACADEMIC);
        checkReq.setRequestId(academicRequest.getId());
        checkReq.setResourceId(resource.getId());
        checkReq.setTargetResource(resource);
        checkReq.setTimeSlotId(timeSlot != null ? timeSlot.getId() : null);

        checkReq.setRequestedDate(academicRequest.getRequestedDate());
        checkReq.setStartTime(academicRequest.getStartTime());
        checkReq.setEndTime(academicRequest.getEndTime());
        checkReq.setRequestedCapacity(academicRequest.getQuantity());
        if (academicRequest.getDepartment() != null) {
            checkReq.setDepartmentId(academicRequest.getDepartment().getId());
        }

        com.ahrao.dto.conflict.ConflictResultDto conflictResult = conflictDetectionService.detectAcademicConflicts(checkReq, currentUser);
        if (!conflictResult.isValid()) {
            String errorMsg = conflictResult.getConflicts().stream()
                    .map(com.ahrao.dto.conflict.ConflictItemDto::getMessage)
                    .collect(Collectors.joining("; "));
            throw new ConflictException("Allocation cannot be completed because conflicts were detected: " + errorMsg, conflictResult);
        }

        validator.assertResourceEligible(academicRequest, resource, timeSlot);


        // 6. Resolve AcademicYear and Semester
        AcademicYear academicYear = resolveAcademicYear(academicRequest, resource);
        Semester semester = resolveSemester(academicYear);

        // 7. Compute Instants
        Instant startInstant = academicRequest.getRequestedDate()
                .atTime(academicRequest.getStartTime())
                .atZone(ZoneId.systemDefault())
                .toInstant();
        Instant endInstant = academicRequest.getRequestedDate()
                .atTime(academicRequest.getEndTime())
                .atZone(ZoneId.systemDefault())
                .toInstant();

        // 8. Create ResourceAllocation
        ResourceAllocation allocation = new ResourceAllocation();
        allocation.setResource(resource);
        allocation.setAllocatedToUser(academicRequest.getRequester());
        allocation.setDepartment(academicRequest.getDepartment());
        allocation.setRequest(academicRequest);
        allocation.setAcademicYear(academicYear);
        allocation.setSemester(semester);
        allocation.setTimeSlot(timeSlot);
        allocation.setStartDatetime(startInstant);
        allocation.setEndDatetime(endInstant);
        allocation.setQuantity(academicRequest.getQuantity() != null && academicRequest.getQuantity() > 0 ? academicRequest.getQuantity() : 1);
        allocation.setPurpose(request.getPurpose() != null && !request.getPurpose().isBlank()
                ? request.getPurpose().trim() : academicRequest.getPurpose());
        allocation.setStatus(AllocationStatus.ACTIVE);
        allocation.setAllocatedBy(currentUser);

        ResourceAllocation savedAllocation = allocationRepository.save(allocation);

        // 9. Update AcademicResourceRequest status
        academicRequest.setStatus(RequestStatus.APPROVED);
        requestRepository.save(academicRequest);

        // 10. Audit Log
        AuditLog audit = new AuditLog();
        audit.setAction("ACADEMIC_RESOURCE_ALLOCATION_CREATED");
        audit.setEntityType("ResourceAllocation");
        audit.setEntityId(savedAllocation.getId());
        audit.setUser(currentUser);
        audit.setNewValue("Allocated resource " + resource.getName() + " (" + resource.getCode() +
                ") to request #" + academicRequest.getId() + " by " + currentUser.getEmail());
        auditLogRepository.save(audit);

        logger.info("Academic resource allocated successfully: allocationId={}, requestId={}, resourceId={}, actor={}",
                savedAllocation.getId(), academicRequest.getId(), resource.getId(), currentUser.getEmail());

        return mapToDetailDto(savedAllocation);
    }

    @Override
    @Transactional
    public AcademicAllocationDetailDto autoAllocateResource(AutoAcademicAllocationRequest request, User currentUser) {
        if (request == null || request.getRequestId() == null) {
            throw new BadRequestException("Request ID is required for auto allocation.");
        }

        // 1. Load and validate request
        AcademicResourceRequest academicRequest = requestRepository.findById(request.getRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Academic request not found with ID: " + request.getRequestId()));

        validator.validateRequestEligibility(academicRequest);

        // 2. Resolve TimeSlot if provided
        TimeSlot timeSlot = null;
        if (request.getTimeSlotId() != null) {
            timeSlot = timeSlotRepository.findById(request.getTimeSlotId())
                    .orElseThrow(() -> new ResourceNotFoundException("TimeSlot not found with ID: " + request.getTimeSlotId()));
        }

        // 3. Find deterministic best candidate
        Resource candidate = candidateService.findBestCandidate(academicRequest, timeSlot);

        // 4. Acquire PESSIMISTIC_WRITE lock on candidate
        Resource lockedResource = resourceRepository.findByIdWithLock(candidate.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + candidate.getId()));

        // 5. Validate user scope
        validator.validateUserScope(currentUser, academicRequest, lockedResource);

        // 6. Re-assert eligibility under lock with ConflictDetectionService
        com.ahrao.dto.conflict.ConflictCheckRequestDto checkReq = new com.ahrao.dto.conflict.ConflictCheckRequestDto();
        checkReq.setDomain(com.ahrao.entity.enums.ConflictDomain.ACADEMIC);
        checkReq.setRequestId(academicRequest.getId());
        checkReq.setResourceId(lockedResource.getId());
        checkReq.setTargetResource(lockedResource);
        checkReq.setTimeSlotId(timeSlot != null ? timeSlot.getId() : null);

        checkReq.setRequestedDate(academicRequest.getRequestedDate());
        checkReq.setStartTime(academicRequest.getStartTime());
        checkReq.setEndTime(academicRequest.getEndTime());
        checkReq.setRequestedCapacity(academicRequest.getQuantity());
        if (academicRequest.getDepartment() != null) {
            checkReq.setDepartmentId(academicRequest.getDepartment().getId());
        }

        com.ahrao.dto.conflict.ConflictResultDto conflictResult = conflictDetectionService.detectAcademicConflicts(checkReq, currentUser);
        if (!conflictResult.isValid()) {
            String errorMsg = conflictResult.getConflicts().stream()
                    .map(com.ahrao.dto.conflict.ConflictItemDto::getMessage)
                    .collect(Collectors.joining("; "));
            throw new ConflictException("Allocation cannot be completed because conflicts were detected: " + errorMsg, conflictResult);
        }

        validator.assertResourceEligible(academicRequest, lockedResource, timeSlot);


        // 7. Resolve AcademicYear and Semester
        AcademicYear academicYear = resolveAcademicYear(academicRequest, lockedResource);
        Semester semester = resolveSemester(academicYear);

        // 8. Compute Instants
        Instant startInstant = academicRequest.getRequestedDate()
                .atTime(academicRequest.getStartTime())
                .atZone(ZoneId.systemDefault())
                .toInstant();
        Instant endInstant = academicRequest.getRequestedDate()
                .atTime(academicRequest.getEndTime())
                .atZone(ZoneId.systemDefault())
                .toInstant();

        // 9. Create ResourceAllocation
        ResourceAllocation allocation = new ResourceAllocation();
        allocation.setResource(lockedResource);
        allocation.setAllocatedToUser(academicRequest.getRequester());
        allocation.setDepartment(academicRequest.getDepartment());
        allocation.setRequest(academicRequest);
        allocation.setAcademicYear(academicYear);
        allocation.setSemester(semester);
        allocation.setTimeSlot(timeSlot);
        allocation.setStartDatetime(startInstant);
        allocation.setEndDatetime(endInstant);
        allocation.setQuantity(academicRequest.getQuantity() != null && academicRequest.getQuantity() > 0 ? academicRequest.getQuantity() : 1);
        allocation.setPurpose(request.getPurpose() != null && !request.getPurpose().isBlank()
                ? request.getPurpose().trim() : academicRequest.getPurpose());
        allocation.setStatus(AllocationStatus.ACTIVE);
        allocation.setAllocatedBy(currentUser);

        ResourceAllocation savedAllocation = allocationRepository.save(allocation);

        // 10. Update AcademicResourceRequest status
        academicRequest.setStatus(RequestStatus.APPROVED);
        requestRepository.save(academicRequest);

        // 11. Audit Log
        AuditLog audit = new AuditLog();
        audit.setAction("ACADEMIC_RESOURCE_ALLOCATION_CREATED");
        audit.setEntityType("ResourceAllocation");
        audit.setEntityId(savedAllocation.getId());
        audit.setUser(currentUser);
        audit.setNewValue("Auto-allocated best-fit resource " + lockedResource.getName() + " (" + lockedResource.getCode() +
                ") to request #" + academicRequest.getId() + " by " + currentUser.getEmail());
        auditLogRepository.save(audit);

        logger.info("Academic resource auto-allocated successfully: allocationId={}, requestId={}, resourceId={}, actor={}",
                savedAllocation.getId(), academicRequest.getId(), lockedResource.getId(), currentUser.getEmail());

        return mapToDetailDto(savedAllocation);
    }

    @Override
    @Transactional(readOnly = true)
    public AcademicAllocationPreviewDto previewAllocation(PreviewAcademicAllocationRequest request, User currentUser) {
        if (request == null || request.getRequestId() == null) {
            throw new BadRequestException("Request ID is required for preview.");
        }

        AcademicResourceRequest academicRequest = requestRepository.findById(request.getRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Academic request not found with ID: " + request.getRequestId()));

        AcademicAllocationPreviewDto preview = candidateService.previewCandidates(academicRequest, request.getResourceId(), null);

        Long targetResourceId = request.getResourceId() != null
                ? request.getResourceId()
                : (preview.getRecommendedResource() != null ? preview.getRecommendedResource().getResourceId() : null);

        if (targetResourceId != null) {
            com.ahrao.dto.conflict.ConflictCheckRequestDto checkReq = new com.ahrao.dto.conflict.ConflictCheckRequestDto();
            checkReq.setDomain(com.ahrao.entity.enums.ConflictDomain.ACADEMIC);
            checkReq.setRequestId(academicRequest.getId());
            checkReq.setResourceId(targetResourceId);
            checkReq.setRequestedDate(academicRequest.getRequestedDate());
            checkReq.setStartTime(academicRequest.getStartTime());
            checkReq.setEndTime(academicRequest.getEndTime());
            checkReq.setRequestedCapacity(academicRequest.getQuantity());
            if (academicRequest.getDepartment() != null) {
                checkReq.setDepartmentId(academicRequest.getDepartment().getId());
            }

            com.ahrao.dto.conflict.ConflictResultDto conflictResult = conflictDetectionService.detectAcademicConflicts(checkReq, currentUser);
            preview.setConflictResult(conflictResult);
            if (!conflictResult.isValid()) {
                preview.setCanAllocate(false);
            }
        } else {
            preview.setConflictResult(com.ahrao.dto.conflict.ConflictResultDto.valid());
        }

        return preview;
    }


    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AcademicAllocationSummaryDto> getAllocations(
            AcademicAllocationFilterParams filters,
            Pageable pageable,
            User currentUser
    ) {
        Specification<ResourceAllocation> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Scoping: If user is HOD, restrict to their department
            Set<Role> roles = currentUser.getRoles();
            boolean isAdmin = roles.stream().anyMatch(r -> "ROLE_ADMIN".equals(r.getName()) || "ADMIN".equals(r.getName()));
            boolean isPrincipal = roles.stream().anyMatch(r -> "ROLE_PRINCIPAL".equals(r.getName()) || "PRINCIPAL".equals(r.getName()));
            boolean isHod = roles.stream().anyMatch(r -> "ROLE_HOD".equals(r.getName()) || "HOD".equals(r.getName()));

            if (isHod && !isAdmin && !isPrincipal) {
                try {
                    com.ahrao.entity.academic.Department hodDept = hodDepartmentResolver.resolveHodDepartment(currentUser.getId());
                    if (hodDept != null) {
                        predicates.add(cb.equal(root.get("department").get("id"), hodDept.getId()));
                    }
                } catch (Exception e) {
                    // If no assigned department, filter to no records
                    predicates.add(cb.disjunction());
                }
            }

            if (filters.getResourceId() != null) {
                predicates.add(cb.equal(root.get("resource").get("id"), filters.getResourceId()));
            }
            if (filters.getDepartmentId() != null) {
                predicates.add(cb.equal(root.get("department").get("id"), filters.getDepartmentId()));
            }
            if (filters.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filters.getStatus()));
            }
            if (filters.getDate() != null) {
                Instant dayStart = filters.getDate().atStartOfDay(ZoneId.systemDefault()).toInstant();
                Instant dayEnd = filters.getDate().plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
                predicates.add(cb.greaterThanOrEqualTo(root.get("startDatetime"), dayStart));
                predicates.add(cb.lessThan(root.get("startDatetime"), dayEnd));
            }
            if (filters.getSearch() != null && !filters.getSearch().trim().isEmpty()) {
                String term = "%" + filters.getSearch().trim().toLowerCase() + "%";
                Join<ResourceAllocation, Resource> resJoin = root.join("resource", JoinType.LEFT);
                Join<ResourceAllocation, User> userJoin = root.join("allocatedToUser", JoinType.LEFT);
                Predicate resNameMatch = cb.like(cb.lower(resJoin.get("name")), term);
                Predicate resCodeMatch = cb.like(cb.lower(resJoin.get("code")), term);
                Predicate userFirstMatch = cb.like(cb.lower(userJoin.get("firstName")), term);
                Predicate userLastMatch = cb.like(cb.lower(userJoin.get("lastName")), term);
                Predicate purposeMatch = cb.like(cb.lower(root.get("purpose")), term);
                predicates.add(cb.or(resNameMatch, resCodeMatch, userFirstMatch, userLastMatch, purposeMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<ResourceAllocation> page = allocationRepository.findAll(spec, pageable);
        List<AcademicAllocationSummaryDto> content = page.getContent().stream()
                .map(this::mapToSummaryDto)
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
    public AcademicAllocationDetailDto getAllocationById(Long id, User currentUser) {
        ResourceAllocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource allocation not found with ID: " + id));

        return mapToDetailDto(allocation);
    }

    @Override
    @Transactional
    public AcademicAllocationDetailDto cancelAllocation(Long id, String remarks, User currentUser) {
        ResourceAllocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource allocation not found with ID: " + id));

        if (allocation.getStatus() == AllocationStatus.CANCELLED) {
            throw new ConflictException("Allocation #" + id + " is already cancelled.");
        }

        allocation.setStatus(AllocationStatus.CANCELLED);
        ResourceAllocation updated = allocationRepository.save(allocation);

        // Audit Log
        AuditLog audit = new AuditLog();
        audit.setAction("ACADEMIC_RESOURCE_ALLOCATION_CANCELLED");
        audit.setEntityType("ResourceAllocation");
        audit.setEntityId(allocation.getId());
        audit.setUser(currentUser);
        audit.setNewValue("Cancelled allocation #" + id + ". Remarks: " + (remarks != null ? remarks.trim() : "None"));
        auditLogRepository.save(audit);

        logger.info("Academic allocation cancelled: id={}, actor={}", id, currentUser.getEmail());

        return mapToDetailDto(updated);
    }

    private AcademicYear resolveAcademicYear(AcademicResourceRequest request, Resource resource) {
        Long institutionId = null;
        if (resource.getInstitution() != null) {
            institutionId = resource.getInstitution().getId();
        } else if (request.getDepartment() != null && request.getDepartment().getInstitution() != null) {
            institutionId = request.getDepartment().getInstitution().getId();
        }

        if (institutionId != null) {
            Optional<AcademicYear> yearOpt = academicYearRepository.findByInstitutionIdAndStatus(institutionId, "ACTIVE");
            if (yearOpt.isPresent()) {
                return yearOpt.get();
            }
        }

        List<AcademicYear> activeYears = academicYearRepository.findByStatus("ACTIVE");
        if (!activeYears.isEmpty()) {
            return activeYears.get(0);
        }

        throw new ConflictException("No active academic year found in the system for allocation.");
    }

    private Semester resolveSemester(AcademicYear academicYear) {
        List<Semester> semesters = semesterRepository.findByAcademicYearId(academicYear.getId());
        if (!semesters.isEmpty()) {
            return semesters.stream()
                    .filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus()))
                    .findFirst()
                    .orElse(semesters.get(0));
        }

        throw new ConflictException("No semester configured for academic year '" + academicYear.getName() + "'.");
    }

    private AcademicAllocationSummaryDto mapToSummaryDto(ResourceAllocation allocation) {
        AcademicAllocationSummaryDto dto = new AcademicAllocationSummaryDto();
        dto.setId(allocation.getId());
        dto.setPurpose(allocation.getPurpose());
        dto.setStatus(allocation.getStatus());
        dto.setCreatedAt(allocation.getCreatedAt());

        if (allocation.getRequest() != null) {
            dto.setRequestId(allocation.getRequest().getId());
        }

        if (allocation.getResource() != null) {
            Resource r = allocation.getResource();
            dto.setResourceId(r.getId());
            dto.setResourceName(r.getName());
            dto.setResourceCode(r.getCode());
            dto.setLocation(r.getLocation());
            dto.setCapacity(r.getCapacity());
            if (r.getCategory() != null) {
                dto.setCategoryName(r.getCategory().getName());
            }
        }

        if (allocation.getAllocatedToUser() != null) {
            User u = allocation.getAllocatedToUser();
            dto.setAllocatedToUserId(u.getId());
            dto.setAllocatedToUserName((u.getFirstName() + " " + (u.getLastName() != null ? u.getLastName() : "")).trim());
            dto.setAllocatedToUserEmail(u.getEmail());
        }

        if (allocation.getDepartment() != null) {
            dto.setDepartmentId(allocation.getDepartment().getId());
            dto.setDepartmentName(allocation.getDepartment().getName());
        }

        if (allocation.getAllocatedBy() != null) {
            dto.setAllocatedByName((allocation.getAllocatedBy().getFirstName() + " " +
                    (allocation.getAllocatedBy().getLastName() != null ? allocation.getAllocatedBy().getLastName() : "")).trim());
        }

        if (allocation.getStartDatetime() != null) {
            LocalDate date = allocation.getStartDatetime().atZone(ZoneId.systemDefault()).toLocalDate();
            LocalTime startTime = allocation.getStartDatetime().atZone(ZoneId.systemDefault()).toLocalTime();
            dto.setAllocationDate(date);
            dto.setStartTime(startTime);
        }

        if (allocation.getEndDatetime() != null) {
            LocalTime endTime = allocation.getEndDatetime().atZone(ZoneId.systemDefault()).toLocalTime();
            dto.setEndTime(endTime);
        }

        return dto;
    }

    private AcademicAllocationDetailDto mapToDetailDto(ResourceAllocation allocation) {
        AcademicAllocationSummaryDto summary = mapToSummaryDto(allocation);
        AcademicAllocationDetailDto detail = new AcademicAllocationDetailDto();

        // Copy summary fields
        detail.setId(summary.getId());
        detail.setRequestId(summary.getRequestId());
        detail.setResourceId(summary.getResourceId());
        detail.setResourceName(summary.getResourceName());
        detail.setResourceCode(summary.getResourceCode());
        detail.setCategoryName(summary.getCategoryName());
        detail.setLocation(summary.getLocation());
        detail.setCapacity(summary.getCapacity());
        detail.setAllocatedToUserId(summary.getAllocatedToUserId());
        detail.setAllocatedToUserName(summary.getAllocatedToUserName());
        detail.setAllocatedToUserEmail(summary.getAllocatedToUserEmail());
        detail.setDepartmentId(summary.getDepartmentId());
        detail.setDepartmentName(summary.getDepartmentName());
        detail.setAllocationDate(summary.getAllocationDate());
        detail.setStartTime(summary.getStartTime());
        detail.setEndTime(summary.getEndTime());
        detail.setPurpose(summary.getPurpose());
        detail.setStatus(summary.getStatus());
        detail.setAllocatedByName(summary.getAllocatedByName());
        detail.setCreatedAt(summary.getCreatedAt());
        detail.setUpdatedAt(allocation.getUpdatedAt());

        if (allocation.getAcademicYear() != null) {
            detail.setAcademicYearName(allocation.getAcademicYear().getName());
        }
        if (allocation.getSemester() != null) {
            detail.setSemesterName(allocation.getSemester().getName());
        }
        if (allocation.getTimeSlot() != null) {
            detail.setTimeSlotName(allocation.getTimeSlot().getName());
        }

        if (allocation.getResource() != null) {
            Long resId = allocation.getResource().getId();
            Optional<Classroom> cOpt = classroomRepository.findByResourceId(resId);
            if (cOpt.isPresent()) {
                detail.setBuilding(cOpt.get().getBuilding());
                detail.setRoomNumber(cOpt.get().getRoomNumber());
                detail.setRoomType(cOpt.get().getRoomType());
            } else {
                Optional<Laboratory> lOpt = laboratoryRepository.findByResourceId(resId);
                if (lOpt.isPresent()) {
                    detail.setBuilding(lOpt.get().getBuilding());
                    detail.setRoomNumber(lOpt.get().getRoomNumber());
                    detail.setRoomType(lOpt.get().getLabType());
                }
            }
        }

        if (allocation.getAllocatedToUser() != null && !allocation.getAllocatedToUser().getRoles().isEmpty()) {
            String roleName = allocation.getAllocatedToUser().getRoles().iterator().next().getName();
            detail.setRequesterRole(roleName.replace("ROLE_", ""));
        }

        if (allocation.getRequest() != null && allocation.getRequest().getDescription() != null) {
            Matcher m = ACADEMIC_CONTEXT_PATTERN.matcher(allocation.getRequest().getDescription());
            if (m.matches()) {
                detail.setSubjectName(m.group(1) + " - " + m.group(2));
                if (m.group(3) != null) {
                    detail.setSectionName(m.group(3));
                }
            }
        }

        return detail;
    }
}
