package com.ahrao.service.hod;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.hod.resource.*;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Faculty;
import com.ahrao.entity.approval.Approval;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.ApprovalLevel;
import com.ahrao.entity.enums.ApprovalStatus;
import com.ahrao.entity.enums.PriorityLevel;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.enums.ResourceStatus;
import com.ahrao.entity.request.AcademicResourceRequest;
import com.ahrao.entity.resource.Resource;
import com.ahrao.entity.user.Role;
import com.ahrao.entity.user.User;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.allocation.ResourceAllocationRepository;
import com.ahrao.repository.approval.ApprovalRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.resource.ResourceRepository;
import jakarta.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
@Transactional(readOnly = true)
public class HodResourceRequestServiceImpl implements HodResourceRequestService {

    private static final Logger log = LoggerFactory.getLogger(HodResourceRequestServiceImpl.class);

    private static final Pattern ACADEMIC_CONTEXT_PATTERN = Pattern.compile(
            "^\\[Academic Context: Subject: ([^\\-]+) - ([^,\\]]+)(?:, Section: ([^\\]]+))?\\](?:\\r?\\n)?(.*)$",
            Pattern.DOTALL
    );

    private final HodDepartmentResolver departmentResolver;
    private final AcademicResourceRequestRepository requestRepository;
    private final ResourceRepository resourceRepository;
    private final ApprovalRepository approvalRepository;
    private final ResourceAllocationRepository allocationRepository;
    private final AuditLogRepository auditLogRepository;

    public HodResourceRequestServiceImpl(
            HodDepartmentResolver departmentResolver,
            AcademicResourceRequestRepository requestRepository,
            ResourceRepository resourceRepository,
            ApprovalRepository approvalRepository,
            ResourceAllocationRepository allocationRepository,
            AuditLogRepository auditLogRepository
    ) {
        this.departmentResolver = departmentResolver;
        this.requestRepository = requestRepository;
        this.resourceRepository = resourceRepository;
        this.approvalRepository = approvalRepository;
        this.allocationRepository = allocationRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    public PagedResponse<HodResourceRequestSummaryDto> getDepartmentRequests(
            Long userId,
            Long categoryId,
            Long resourceId,
            RequestStatus status,
            PriorityLevel priority,
            String search,
            LocalDate fromDate,
            LocalDate toDate,
            Pageable pageable
    ) {
        Department department = departmentResolver.resolveHodDepartment(userId);

        Specification<AcademicResourceRequest> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Mandatory Department Scope
            predicates.add(cb.equal(root.get("department").get("id"), department.getId()));

            // 2. Status Filter
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            // 3. Category Filter
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            // 4. Resource Filter
            if (resourceId != null) {
                predicates.add(cb.equal(root.get("requestedResource").get("id"), resourceId));
            }

            // 5. Priority Filter
            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }

            // 6. Date Range Filters
            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("requestedDate"), fromDate));
            }
            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("requestedDate"), toDate));
            }

            // 7. Search Text
            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("purpose")), searchPattern),
                        cb.like(cb.lower(root.get("requester").get("firstName")), searchPattern),
                        cb.like(cb.lower(root.get("requester").get("lastName")), searchPattern),
                        cb.like(cb.lower(root.get("requester").get("email")), searchPattern),
                        cb.like(cb.lower(root.get("requestedResource").get("name")), searchPattern),
                        cb.like(cb.lower(root.get("requestedResource").get("code")), searchPattern)
                );
                predicates.add(searchPredicate);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<AcademicResourceRequest> pageResult = requestRepository.findAll(spec, pageable);
        List<HodResourceRequestSummaryDto> dtoList = pageResult.getContent()
                .stream()
                .map(this::mapToSummaryDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                dtoList,
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.isFirst(),
                pageResult.isLast()
        );
    }

    @Override
    public HodResourceRequestDetailDto getRequestDetails(Long userId, Long requestId) {
        Department department = departmentResolver.resolveHodDepartment(userId);
        AcademicResourceRequest request = findRequestAndVerifyScope(requestId, department, userId);
        return mapToDetailDto(request);
    }

    @Override
    public HodResourceRequestOverviewKpiDto getRequestSummary(Long userId) {
        Department department = departmentResolver.resolveHodDepartment(userId);
        Long deptId = department.getId();

        HodResourceRequestOverviewKpiDto kpi = new HodResourceRequestOverviewKpiDto();
        kpi.setPendingCount(requestRepository.countByDepartmentIdAndStatus(deptId, RequestStatus.PENDING));
        kpi.setApprovedCount(requestRepository.countByDepartmentIdAndStatus(deptId, RequestStatus.APPROVED));
        kpi.setRejectedCount(requestRepository.countByDepartmentIdAndStatus(deptId, RequestStatus.REJECTED));
        kpi.setCancelledCount(requestRepository.countByDepartmentIdAndStatus(deptId, RequestStatus.CANCELLED));
        kpi.setTotalRequestsCount(requestRepository.countByDepartmentId(deptId));

        kpi.setTotalResources(resourceRepository.countByDepartmentId(deptId));
        kpi.setAvailableResources(resourceRepository.countByDepartmentIdAndStatus(deptId, ResourceStatus.AVAILABLE));
        kpi.setAllocatedResources(resourceRepository.countByDepartmentIdAndStatus(deptId, ResourceStatus.ALLOCATED));
        kpi.setMaintenanceResources(resourceRepository.countByDepartmentIdAndStatus(deptId, ResourceStatus.MAINTENANCE));
        kpi.setInactiveResources(resourceRepository.countByDepartmentIdAndStatus(deptId, ResourceStatus.INACTIVE));

        return kpi;
    }

    @Override
    @Transactional
    public HodResourceRequestDetailDto approveRequest(Long userId, Long requestId, HodApprovalActionRequest actionRequest) {
        Department department = departmentResolver.resolveHodDepartment(userId);
        Faculty hodFaculty = departmentResolver.resolveHodFaculty(userId);
        AcademicResourceRequest request = findRequestAndVerifyScope(requestId, department, userId);

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new ConflictException("Cannot approve request in " + request.getStatus() + " status. Only PENDING requests may be approved.");
        }

        User hodUser = hodFaculty.getUser();

        // 1. Update Request Status
        request.setStatus(RequestStatus.APPROVED);
        requestRepository.save(request);

        // 2. Record Approval Record
        Approval approval = new Approval();
        approval.setEntityType("AcademicResourceRequest");
        approval.setEntityId(request.getId());
        approval.setRequestedBy(request.getRequester());
        approval.setApprovedBy(hodUser);
        approval.setApprovalLevel(ApprovalLevel.HOD);
        approval.setStatus(ApprovalStatus.APPROVED);
        approval.setComments(actionRequest != null && actionRequest.getComments() != null ? actionRequest.getComments().trim() : "Approved by HOD");
        approvalRepository.save(approval);

        // 3. Record Audit Log
        AuditLog auditLog = new AuditLog();
        auditLog.setUser(hodUser);
        auditLog.setAction("HOD_RESOURCE_REQUEST_APPROVED");
        auditLog.setEntityType("AcademicResourceRequest");
        auditLog.setEntityId(request.getId());
        auditLog.setOldValue("PENDING");
        auditLog.setNewValue("APPROVED");
        auditLog.setCreatedAt(Instant.now());
        auditLogRepository.save(auditLog);

        log.info("HOD (userId={}) approved resource request id={}", userId, request.getId());

        return mapToDetailDto(request);
    }

    @Override
    @Transactional
    public HodResourceRequestDetailDto rejectRequest(Long userId, Long requestId, HodApprovalActionRequest actionRequest) {
        Department department = departmentResolver.resolveHodDepartment(userId);
        Faculty hodFaculty = departmentResolver.resolveHodFaculty(userId);
        AcademicResourceRequest request = findRequestAndVerifyScope(requestId, department, userId);

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new ConflictException("Cannot reject request in " + request.getStatus() + " status. Only PENDING requests may be rejected.");
        }

        if (actionRequest == null || actionRequest.getComments() == null || actionRequest.getComments().trim().isEmpty()) {
            throw new BadRequestException("Rejection reason is mandatory when declining a resource request.");
        }

        User hodUser = hodFaculty.getUser();

        // 1. Update Request Status
        request.setStatus(RequestStatus.REJECTED);
        requestRepository.save(request);

        // 2. Record Approval Record
        Approval approval = new Approval();
        approval.setEntityType("AcademicResourceRequest");
        approval.setEntityId(request.getId());
        approval.setRequestedBy(request.getRequester());
        approval.setApprovedBy(hodUser);
        approval.setApprovalLevel(ApprovalLevel.HOD);
        approval.setStatus(ApprovalStatus.REJECTED);
        approval.setComments(actionRequest.getComments().trim());
        approvalRepository.save(approval);

        // 3. Record Audit Log
        AuditLog auditLog = new AuditLog();
        auditLog.setUser(hodUser);
        auditLog.setAction("HOD_RESOURCE_REQUEST_REJECTED");
        auditLog.setEntityType("AcademicResourceRequest");
        auditLog.setEntityId(request.getId());
        auditLog.setOldValue("PENDING");
        auditLog.setNewValue("REJECTED");
        auditLog.setCreatedAt(Instant.now());
        auditLogRepository.save(auditLog);

        log.info("HOD (userId={}) rejected resource request id={}", userId, request.getId());

        return mapToDetailDto(request);
    }

    private AcademicResourceRequest findRequestAndVerifyScope(Long requestId, Department department, Long userId) {
        AcademicResourceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource request not found with id: " + requestId));

        if (request.getDepartment() == null || !request.getDepartment().getId().equals(department.getId())) {
            log.warn("Security Alert: User {} attempted cross-department access to request id={}", userId, requestId);
            throw new ForbiddenException("Access denied: Resource request belongs to another department.");
        }

        return request;
    }

    private HodResourceRequestSummaryDto mapToSummaryDto(AcademicResourceRequest entity) {
        HodResourceRequestSummaryDto dto = new HodResourceRequestSummaryDto();
        dto.setId(entity.getId());

        if (entity.getRequester() != null) {
            User r = entity.getRequester();
            dto.setRequesterUserId(r.getId());
            dto.setRequesterName((r.getFirstName() + " " + (r.getLastName() != null ? r.getLastName() : "")).trim());
            dto.setRequesterEmail(r.getEmail());
            if (r.getRoles() != null && !r.getRoles().isEmpty()) {
                dto.setRequesterRole(r.getRoles().stream().map(Role::getName).collect(Collectors.joining(", ")));
            }
        }

        if (entity.getDepartment() != null) {
            dto.setDepartmentId(entity.getDepartment().getId());
            dto.setDepartmentName(entity.getDepartment().getName());
        }

        if (entity.getCategory() != null) {
            dto.setResourceCategoryId(entity.getCategory().getId());
            dto.setCategoryName(entity.getCategory().getName());
        }

        if (entity.getRequestedResource() != null) {
            dto.setRequestedResourceId(entity.getRequestedResource().getId());
            dto.setRequestedResourceName(entity.getRequestedResource().getName());
            dto.setRequestedResourceCode(entity.getRequestedResource().getCode());
        }

        dto.setPurpose(entity.getPurpose());
        dto.setRequestedDate(entity.getRequestedDate());
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        dto.setQuantity(entity.getQuantity());
        dto.setPriority(entity.getPriority());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());

        return dto;
    }

    private HodResourceRequestDetailDto mapToDetailDto(AcademicResourceRequest entity) {
        HodResourceRequestDetailDto dto = new HodResourceRequestDetailDto();
        dto.setId(entity.getId());

        if (entity.getRequester() != null) {
            User r = entity.getRequester();
            dto.setRequesterUserId(r.getId());
            dto.setRequesterName((r.getFirstName() + " " + (r.getLastName() != null ? r.getLastName() : "")).trim());
            dto.setRequesterEmail(r.getEmail());
            if (r.getRoles() != null && !r.getRoles().isEmpty()) {
                dto.setRequesterRole(r.getRoles().stream().map(Role::getName).collect(Collectors.joining(", ")));
            }
        }

        if (entity.getDepartment() != null) {
            dto.setDepartmentId(entity.getDepartment().getId());
            dto.setDepartmentName(entity.getDepartment().getName());
        }

        if (entity.getCategory() != null) {
            dto.setResourceCategoryId(entity.getCategory().getId());
            dto.setCategoryName(entity.getCategory().getName());
        }

        if (entity.getRequestedResource() != null) {
            Resource r = entity.getRequestedResource();
            dto.setRequestedResourceId(r.getId());
            dto.setRequestedResourceName(r.getName());
            dto.setRequestedResourceCode(r.getCode());
            dto.setResourceLocation(r.getLocation());
            dto.setResourceCapacity(r.getCapacity());
        }

        dto.setPurpose(entity.getPurpose());
        dto.setRequestedDate(entity.getRequestedDate());
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        dto.setQuantity(entity.getQuantity());
        dto.setPriority(entity.getPriority());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        // Parse academic context from description if formatted as such
        if (entity.getDescription() != null) {
            Matcher matcher = ACADEMIC_CONTEXT_PATTERN.matcher(entity.getDescription());
            if (matcher.matches()) {
                dto.setAcademicSubject(matcher.group(1).trim() + " - " + matcher.group(2).trim());
                dto.setAcademicSection(matcher.group(3) != null ? matcher.group(3).trim() : null);
                dto.setDescription(matcher.group(4) != null ? matcher.group(4).trim() : "");
            } else {
                dto.setDescription(entity.getDescription());
            }
        }

        // Fetch Approval History
        List<Approval> approvals = approvalRepository.findByEntityTypeAndEntityId("AcademicResourceRequest", entity.getId());
        List<HodApprovalHistoryItemDto> approvalDtos = approvals.stream().map(appr -> {
            HodApprovalHistoryItemDto aDto = new HodApprovalHistoryItemDto();
            aDto.setId(appr.getId());
            if (appr.getApprovedBy() != null) {
                User ab = appr.getApprovedBy();
                aDto.setApprovedByUserId(ab.getId());
                aDto.setApprovedByName((ab.getFirstName() + " " + (ab.getLastName() != null ? ab.getLastName() : "")).trim());
            }
            aDto.setApprovalLevel(appr.getApprovalLevel());
            aDto.setStatus(appr.getStatus());
            aDto.setComments(appr.getComments());
            aDto.setCreatedAt(appr.getCreatedAt());
            return aDto;
        }).collect(Collectors.toList());
        dto.setApprovalHistory(approvalDtos);

        // Fetch Related Allocation if any
        allocationRepository.findFirstByRequestId(entity.getId()).ifPresent(alloc -> {
            HodRelatedAllocationDto relDto = new HodRelatedAllocationDto();
            relDto.setId(alloc.getId());
            if (alloc.getResource() != null) {
                relDto.setResourceId(alloc.getResource().getId());
                relDto.setResourceName(alloc.getResource().getName());
                relDto.setResourceCode(alloc.getResource().getCode());
            }
            relDto.setStartDatetime(alloc.getStartDatetime());
            relDto.setEndDatetime(alloc.getEndDatetime());
            relDto.setQuantity(alloc.getQuantity());
            relDto.setStatus(alloc.getStatus());
            dto.setRelatedAllocation(relDto);
        });

        return dto;
    }
}
