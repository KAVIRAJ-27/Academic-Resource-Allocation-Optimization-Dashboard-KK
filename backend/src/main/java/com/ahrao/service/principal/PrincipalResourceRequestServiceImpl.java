package com.ahrao.service.principal;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.principal.approval.PrincipalApprovalActionRequest;
import com.ahrao.dto.principal.resource.PrincipalApprovalHistoryItemDto;
import com.ahrao.dto.principal.resource.PrincipalRelatedAllocationDto;
import com.ahrao.dto.principal.resource.PrincipalResourceRequestDetailDto;
import com.ahrao.dto.principal.resource.PrincipalResourceRequestSummaryDto;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.allocation.ResourceAllocation;
import com.ahrao.entity.approval.Approval;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.ApprovalLevel;
import com.ahrao.entity.enums.ApprovalStatus;
import com.ahrao.entity.enums.PriorityLevel;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.request.AcademicResourceRequest;
import com.ahrao.entity.user.User;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.DepartmentRepository;
import com.ahrao.repository.allocation.ResourceAllocationRepository;
import com.ahrao.repository.approval.ApprovalRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.user.UserRepository;
import jakarta.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class PrincipalResourceRequestServiceImpl implements PrincipalResourceRequestService {

    private static final Logger log = LoggerFactory.getLogger(PrincipalResourceRequestServiceImpl.class);

    private final PrincipalInstitutionResolver institutionResolver;
    private final AcademicResourceRequestRepository requestRepository;
    private final DepartmentRepository departmentRepository;
    private final ApprovalRepository approvalRepository;
    private final ResourceAllocationRepository allocationRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public PrincipalResourceRequestServiceImpl(
            PrincipalInstitutionResolver institutionResolver,
            AcademicResourceRequestRepository requestRepository,
            DepartmentRepository departmentRepository,
            ApprovalRepository approvalRepository,
            ResourceAllocationRepository allocationRepository,
            UserRepository userRepository,
            AuditLogRepository auditLogRepository) {
        this.institutionResolver = institutionResolver;
        this.requestRepository = requestRepository;
        this.departmentRepository = departmentRepository;
        this.approvalRepository = approvalRepository;
        this.allocationRepository = allocationRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    public PagedResponse<PrincipalResourceRequestSummaryDto> getInstitutionRequests(
            Long userId,
            Long departmentId,
            Long categoryId,
            Long resourceId,
            RequestStatus status,
            PriorityLevel priority,
            String search,
            LocalDate fromDate,
            LocalDate toDate,
            Pageable pageable
    ) {
        Institution institution = institutionResolver.resolvePrincipalInstitution(userId);
        if (institution == null) {
            throw new AccessDeniedException("No authorized institution found for current principal");
        }

        // Validate department belongs to institution if specified
        if (departmentId != null) {
            Optional<Department> deptOpt = departmentRepository.findById(departmentId);
            if (deptOpt.isEmpty() || deptOpt.get().getInstitution() == null ||
                    !deptOpt.get().getInstitution().getId().equals(institution.getId())) {
                log.warn("Security Alert: Principal userId={} attempted query on departmentId={} outside institutionId={}",
                        userId, departmentId, institution.getId());
                throw new ForbiddenException("Department does not belong to your authorized institution.");
            }
        }

        Specification<AcademicResourceRequest> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Mandatory Institution Scope
            predicates.add(cb.equal(root.get("department").get("institution").get("id"), institution.getId()));

            // 2. Department Filter
            if (departmentId != null) {
                predicates.add(cb.equal(root.get("department").get("id"), departmentId));
            }

            // 3. Status Filter
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            // 4. Category Filter
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            // 5. Resource Filter
            if (resourceId != null) {
                predicates.add(cb.equal(root.get("requestedResource").get("id"), resourceId));
            }

            // 6. Priority Filter
            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }

            // 7. Date Range
            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("requestedDate"), fromDate));
            }
            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("requestedDate"), toDate));
            }

            // 8. Search
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

        Page<AcademicResourceRequest> page = requestRepository.findAll(spec, pageable);
        List<PrincipalResourceRequestSummaryDto> content = page.getContent().stream()
                .map(this::mapToSummaryDto)
                .toList();

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
    public PrincipalResourceRequestDetailDto getRequestById(Long userId, Long requestId) {
        Institution institution = institutionResolver.resolvePrincipalInstitution(userId);
        if (institution == null) {
            throw new AccessDeniedException("No authorized institution found for current principal");
        }

        AcademicResourceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("AcademicResourceRequest not found with id: " + requestId));

        if (request.getDepartment() == null || request.getDepartment().getInstitution() == null ||
                !request.getDepartment().getInstitution().getId().equals(institution.getId())) {
            log.warn("Security Alert: Principal userId={} attempted unauthorized access to requestId={}", userId, requestId);
            throw new ForbiddenException("Access denied: Resource request belongs to another institution.");
        }

        return mapToDetailDto(request);
    }

    @Override
    @Transactional
    public PrincipalResourceRequestDetailDto approveRequest(Long userId, Long requestId, PrincipalApprovalActionRequest actionRequest) {
        Institution institution = institutionResolver.resolvePrincipalInstitution(userId);
        if (institution == null) {
            throw new AccessDeniedException("No authorized institution found for current principal");
        }

        AcademicResourceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("AcademicResourceRequest not found with id: " + requestId));

        if (request.getDepartment() == null || request.getDepartment().getInstitution() == null ||
                !request.getDepartment().getInstitution().getId().equals(institution.getId())) {
            log.warn("Security Alert: Principal userId={} attempted unauthorized approval on requestId={}", userId, requestId);
            throw new ForbiddenException("Access denied: Resource request belongs to another institution.");
        }

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new ConflictException("Cannot approve request in " + request.getStatus() + " status. Only PENDING requests may be approved.");
        }

        User principalUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // 1. Update Request
        request.setStatus(RequestStatus.APPROVED);
        requestRepository.save(request);

        // 2. Record Approval
        Approval approval = new Approval();
        approval.setEntityType("AcademicResourceRequest");
        approval.setEntityId(request.getId());
        approval.setRequestedBy(request.getRequester());
        approval.setApprovedBy(principalUser);
        approval.setApprovalLevel(ApprovalLevel.PRINCIPAL);
        approval.setStatus(ApprovalStatus.APPROVED);
        approval.setComments(actionRequest != null && actionRequest.getComments() != null ? actionRequest.getComments().trim() : "Approved by Principal");
        approvalRepository.save(approval);

        // 3. Record AuditLog
        AuditLog auditLog = new AuditLog();
        auditLog.setUser(principalUser);
        auditLog.setAction("PRINCIPAL_RESOURCE_REQUEST_APPROVED");
        auditLog.setEntityType("AcademicResourceRequest");
        auditLog.setEntityId(request.getId());
        auditLog.setOldValue("PENDING");
        auditLog.setNewValue("APPROVED");
        auditLog.setCreatedAt(Instant.now());
        auditLogRepository.save(auditLog);

        log.info("Principal (userId={}) approved academic resource request id={}", userId, request.getId());
        return mapToDetailDto(request);
    }

    @Override
    @Transactional
    public PrincipalResourceRequestDetailDto rejectRequest(Long userId, Long requestId, PrincipalApprovalActionRequest actionRequest) {
        Institution institution = institutionResolver.resolvePrincipalInstitution(userId);
        if (institution == null) {
            throw new AccessDeniedException("No authorized institution found for current principal");
        }

        AcademicResourceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("AcademicResourceRequest not found with id: " + requestId));

        if (request.getDepartment() == null || request.getDepartment().getInstitution() == null ||
                !request.getDepartment().getInstitution().getId().equals(institution.getId())) {
            log.warn("Security Alert: Principal userId={} attempted unauthorized rejection on requestId={}", userId, requestId);
            throw new ForbiddenException("Access denied: Resource request belongs to another institution.");
        }

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new ConflictException("Cannot reject request in " + request.getStatus() + " status. Only PENDING requests may be rejected.");
        }

        if (actionRequest == null || actionRequest.getComments() == null || actionRequest.getComments().trim().isEmpty()) {
            throw new BadRequestException("Rejection reason is mandatory when declining a resource request.");
        }

        User principalUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // 1. Update Request
        request.setStatus(RequestStatus.REJECTED);
        requestRepository.save(request);

        // 2. Record Approval
        Approval approval = new Approval();
        approval.setEntityType("AcademicResourceRequest");
        approval.setEntityId(request.getId());
        approval.setRequestedBy(request.getRequester());
        approval.setApprovedBy(principalUser);
        approval.setApprovalLevel(ApprovalLevel.PRINCIPAL);
        approval.setStatus(ApprovalStatus.REJECTED);
        approval.setComments(actionRequest.getComments().trim());
        approvalRepository.save(approval);

        // 3. Record AuditLog
        AuditLog auditLog = new AuditLog();
        auditLog.setUser(principalUser);
        auditLog.setAction("PRINCIPAL_RESOURCE_REQUEST_REJECTED");
        auditLog.setEntityType("AcademicResourceRequest");
        auditLog.setEntityId(request.getId());
        auditLog.setOldValue("PENDING");
        auditLog.setNewValue("REJECTED");
        auditLog.setCreatedAt(Instant.now());
        auditLogRepository.save(auditLog);

        log.info("Principal (userId={}) rejected academic resource request id={}", userId, request.getId());
        return mapToDetailDto(request);
    }

    private PrincipalResourceRequestSummaryDto mapToSummaryDto(AcademicResourceRequest req) {
        PrincipalResourceRequestSummaryDto dto = new PrincipalResourceRequestSummaryDto();
        dto.setId(req.getId());
        if (req.getRequester() != null) {
            dto.setRequesterUserId(req.getRequester().getId());
            String first = req.getRequester().getFirstName() != null ? req.getRequester().getFirstName() : "";
            String last = req.getRequester().getLastName() != null ? req.getRequester().getLastName() : "";
            String full = (first + " " + last).trim();
            dto.setRequesterName(!full.isEmpty() ? full : req.getRequester().getUsername());
            dto.setRequesterEmail(req.getRequester().getEmail());
        }

        if (req.getDepartment() != null) {
            dto.setDepartmentId(req.getDepartment().getId());
            dto.setDepartmentName(req.getDepartment().getName());
            dto.setDepartmentCode(req.getDepartment().getCode());
        }

        if (req.getCategory() != null) {
            dto.setCategoryId(req.getCategory().getId());
            dto.setCategoryName(req.getCategory().getName());
        }

        if (req.getRequestedResource() != null) {
            dto.setResourceId(req.getRequestedResource().getId());
            dto.setResourceName(req.getRequestedResource().getName());
            dto.setResourceCode(req.getRequestedResource().getCode());
        }

        dto.setPurpose(req.getPurpose());
        dto.setRequestedDate(req.getRequestedDate());
        dto.setStartTime(req.getStartTime());
        dto.setEndTime(req.getEndTime());
        dto.setQuantity(req.getQuantity());
        dto.setPriority(req.getPriority() != null ? req.getPriority().name() : "MEDIUM");
        dto.setStatus(req.getStatus() != null ? req.getStatus().name() : "PENDING");
        dto.setCreatedAt(req.getCreatedAt());
        return dto;
    }

    private PrincipalResourceRequestDetailDto mapToDetailDto(AcademicResourceRequest req) {
        PrincipalResourceRequestDetailDto dto = new PrincipalResourceRequestDetailDto();
        dto.setId(req.getId());
        if (req.getRequester() != null) {
            dto.setRequesterUserId(req.getRequester().getId());
            String first = req.getRequester().getFirstName() != null ? req.getRequester().getFirstName() : "";
            String last = req.getRequester().getLastName() != null ? req.getRequester().getLastName() : "";
            String full = (first + " " + last).trim();
            dto.setRequesterName(!full.isEmpty() ? full : req.getRequester().getUsername());
            dto.setRequesterEmail(req.getRequester().getEmail());
        }

        if (req.getDepartment() != null) {
            dto.setDepartmentId(req.getDepartment().getId());
            dto.setDepartmentName(req.getDepartment().getName());
            dto.setDepartmentCode(req.getDepartment().getCode());
        }

        if (req.getCategory() != null) {
            dto.setCategoryId(req.getCategory().getId());
            dto.setCategoryName(req.getCategory().getName());
        }

        if (req.getRequestedResource() != null) {
            dto.setResourceId(req.getRequestedResource().getId());
            dto.setResourceName(req.getRequestedResource().getName());
            dto.setResourceCode(req.getRequestedResource().getCode());
            dto.setResourceCapacity(req.getRequestedResource().getCapacity());
            dto.setResourceLocation(req.getRequestedResource().getLocation());
        }

        dto.setPurpose(req.getPurpose());
        dto.setDescription(req.getDescription());
        dto.setRequestedDate(req.getRequestedDate());
        dto.setStartTime(req.getStartTime());
        dto.setEndTime(req.getEndTime());
        dto.setQuantity(req.getQuantity());
        dto.setPriority(req.getPriority() != null ? req.getPriority().name() : "MEDIUM");
        dto.setStatus(req.getStatus() != null ? req.getStatus().name() : "PENDING");
        dto.setCreatedAt(req.getCreatedAt());

        dto.setCanPrincipalApprove(req.getStatus() == RequestStatus.PENDING);
        dto.setCanPrincipalReject(req.getStatus() == RequestStatus.PENDING);

        // Approval History
        List<Approval> approvals = approvalRepository.findByEntityTypeAndEntityIdOrderByCreatedAtAsc(
                "AcademicResourceRequest", req.getId());
        List<PrincipalApprovalHistoryItemDto> historyList = new ArrayList<>();
        for (Approval a : approvals) {
            PrincipalApprovalHistoryItemDto h = new PrincipalApprovalHistoryItemDto();
            h.setId(a.getId());
            h.setApprovalLevel(a.getApprovalLevel() != null ? a.getApprovalLevel().name() : "");
            h.setStatus(a.getStatus() != null ? a.getStatus().name() : "");
            h.setComments(a.getComments());
            h.setCreatedAt(a.getCreatedAt());
            if (a.getApprovedBy() != null) {
                String first = a.getApprovedBy().getFirstName() != null ? a.getApprovedBy().getFirstName() : "";
                String last = a.getApprovedBy().getLastName() != null ? a.getApprovedBy().getLastName() : "";
                String full = (first + " " + last).trim();
                h.setReviewerName(!full.isEmpty() ? full : a.getApprovedBy().getUsername());
                h.setReviewerEmail(a.getApprovedBy().getEmail());
            }
            historyList.add(h);
        }
        dto.setApprovalHistory(historyList);

        // Related Allocation
        Optional<ResourceAllocation> allocOpt = allocationRepository.findFirstByRequestId(req.getId());
        if (allocOpt.isPresent()) {
            ResourceAllocation alloc = allocOpt.get();
            PrincipalRelatedAllocationDto rAlloc = new PrincipalRelatedAllocationDto();
            rAlloc.setId(alloc.getId());
            if (alloc.getResource() != null) {
                rAlloc.setResourceId(alloc.getResource().getId());
                rAlloc.setResourceName(alloc.getResource().getName());
                rAlloc.setResourceCode(alloc.getResource().getCode());
            }
            if (alloc.getAllocatedToUser() != null) {
                String first = alloc.getAllocatedToUser().getFirstName() != null ? alloc.getAllocatedToUser().getFirstName() : "";
                String last = alloc.getAllocatedToUser().getLastName() != null ? alloc.getAllocatedToUser().getLastName() : "";
                String full = (first + " " + last).trim();
                rAlloc.setAllocatedToName(!full.isEmpty() ? full : alloc.getAllocatedToUser().getUsername());
            }
            rAlloc.setStatus(alloc.getStatus() != null ? alloc.getStatus().name() : "");
            rAlloc.setAllocatedAt(alloc.getCreatedAt());
            dto.setRelatedAllocation(rAlloc);
        }

        return dto;
    }
}
