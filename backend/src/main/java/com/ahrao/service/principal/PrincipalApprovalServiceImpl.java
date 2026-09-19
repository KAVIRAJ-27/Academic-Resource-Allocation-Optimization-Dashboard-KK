package com.ahrao.service.principal;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.principal.approval.PrincipalApprovalActionRequest;
import com.ahrao.dto.principal.approval.PrincipalApprovalDetailDto;
import com.ahrao.dto.principal.approval.PrincipalApprovalSummaryDto;
import com.ahrao.dto.principal.resource.PrincipalApprovalHistoryItemDto;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.approval.Approval;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.ApprovalLevel;
import com.ahrao.entity.enums.ApprovalStatus;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.request.AcademicResourceRequest;
import com.ahrao.entity.user.User;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.approval.ApprovalRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.user.UserRepository;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
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
import java.time.ZoneId;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class PrincipalApprovalServiceImpl implements PrincipalApprovalService {

    private static final Logger log = LoggerFactory.getLogger(PrincipalApprovalServiceImpl.class);

    private final PrincipalInstitutionResolver institutionResolver;
    private final ApprovalRepository approvalRepository;
    private final AcademicResourceRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public PrincipalApprovalServiceImpl(
            PrincipalInstitutionResolver institutionResolver,
            ApprovalRepository approvalRepository,
            AcademicResourceRequestRepository requestRepository,
            UserRepository userRepository,
            AuditLogRepository auditLogRepository
    ) {
        this.institutionResolver = institutionResolver;
        this.approvalRepository = approvalRepository;
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    public PagedResponse<PrincipalApprovalSummaryDto> getInstitutionApprovals(
            Long userId,
            Long departmentId,
            ApprovalStatus status,
            ApprovalLevel approvalLevel,
            LocalDate fromDate,
            LocalDate toDate,
            Pageable pageable
    ) {
        Institution institution = institutionResolver.resolvePrincipalInstitution(userId);
        if (institution == null) {
            throw new AccessDeniedException("No authorized institution found for current principal");
        }

        Specification<Approval> spec = (root, query, cb) -> {
            if (query == null) {
                return cb.conjunction();
            }
            List<Predicate> predicates = new ArrayList<>();

            // Institution Scoping via AcademicResourceRequest subquery
            Subquery<Long> subquery = query.subquery(Long.class);
            Root<AcademicResourceRequest> reqRoot = subquery.from(AcademicResourceRequest.class);
            List<Predicate> subPredicates = new ArrayList<>();
            subPredicates.add(cb.equal(reqRoot.get("department").get("institution").get("id"), institution.getId()));
            if (departmentId != null) {
                subPredicates.add(cb.equal(reqRoot.get("department").get("id"), departmentId));
            }
            subquery.select(reqRoot.get("id")).where(subPredicates.toArray(new Predicate[0]));

            predicates.add(cb.equal(root.get("entityType"), "AcademicResourceRequest"));
            predicates.add(root.get("entityId").in(subquery));

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (approvalLevel != null) {
                predicates.add(cb.equal(root.get("approvalLevel"), approvalLevel));
            }

            if (fromDate != null) {
                Instant startInstant = fromDate.atStartOfDay(ZoneId.systemDefault()).toInstant();
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startInstant));
            }

            if (toDate != null) {
                Instant endInstant = toDate.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endInstant));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Approval> page = approvalRepository.findAll(spec, pageable);

        // Batch load requests to avoid N+1 queries
        Set<Long> requestIds = page.getContent().stream()
                .filter(a -> "AcademicResourceRequest".equals(a.getEntityType()))
                .map(Approval::getEntityId)
                .collect(Collectors.toSet());

        Map<Long, AcademicResourceRequest> requestMap = Collections.emptyMap();
        if (!requestIds.isEmpty()) {
            requestMap = requestRepository.findAllById(requestIds).stream()
                    .collect(Collectors.toMap(AcademicResourceRequest::getId, Function.identity()));
        }

        final Map<Long, AcademicResourceRequest> finalRequestMap = requestMap;
        List<PrincipalApprovalSummaryDto> content = page.getContent().stream()
                .map(a -> mapToSummaryDto(a, finalRequestMap.get(a.getEntityId())))
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
    public PrincipalApprovalDetailDto getApprovalById(Long userId, Long approvalId) {
        Institution institution = institutionResolver.resolvePrincipalInstitution(userId);
        if (institution == null) {
            throw new AccessDeniedException("No authorized institution found for current principal");
        }

        Approval approval = approvalRepository.findById(approvalId)
                .orElseThrow(() -> new ResourceNotFoundException("Approval not found with id: " + approvalId));

        if (!"AcademicResourceRequest".equals(approval.getEntityType())) {
            throw new ResourceNotFoundException("AcademicResourceRequest not found for approval id: " + approvalId);
        }

        AcademicResourceRequest request = requestRepository.findById(approval.getEntityId())
                .orElseThrow(() -> new ResourceNotFoundException("AcademicResourceRequest not found with id: " + approval.getEntityId()));

        if (request.getDepartment() == null || request.getDepartment().getInstitution() == null ||
                !request.getDepartment().getInstitution().getId().equals(institution.getId())) {
            log.warn("Security Alert: Principal userId={} attempted unauthorized access to approvalId={}", userId, approvalId);
            throw new ForbiddenException("Access denied: Approval belongs to another institution.");
        }

        return mapToDetailDto(approval, request);
    }

    @Override
    @Transactional
    public PrincipalApprovalDetailDto approveApproval(Long userId, Long approvalId, PrincipalApprovalActionRequest actionRequest) {
        Institution institution = institutionResolver.resolvePrincipalInstitution(userId);
        if (institution == null) {
            throw new AccessDeniedException("No authorized institution found for current principal");
        }

        Approval approval = approvalRepository.findById(approvalId)
                .orElseThrow(() -> new ResourceNotFoundException("Approval not found with id: " + approvalId));

        if (!"AcademicResourceRequest".equals(approval.getEntityType())) {
            throw new BadRequestException("Approval entity type is not supported for Principal approval.");
        }

        AcademicResourceRequest request = requestRepository.findById(approval.getEntityId())
                .orElseThrow(() -> new ResourceNotFoundException("AcademicResourceRequest not found with id: " + approval.getEntityId()));

        if (request.getDepartment() == null || request.getDepartment().getInstitution() == null ||
                !request.getDepartment().getInstitution().getId().equals(institution.getId())) {
            log.warn("Security Alert: Principal userId={} attempted unauthorized approval on approvalId={}", userId, approvalId);
            throw new ForbiddenException("Access denied: Approval belongs to another institution.");
        }

        if (approval.getStatus() != ApprovalStatus.PENDING || request.getStatus() != RequestStatus.PENDING) {
            throw new ConflictException("Cannot approve: Approval is in " + approval.getStatus() +
                    " status and request is in " + request.getStatus() + " status. Only PENDING approvals may be approved.");
        }

        User principalUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // 1. Update Request
        request.setStatus(RequestStatus.APPROVED);
        requestRepository.save(request);

        // 2. Update Approval
        approval.setStatus(ApprovalStatus.APPROVED);
        approval.setApprovedBy(principalUser);
        approval.setApprovalLevel(ApprovalLevel.PRINCIPAL);
        approval.setComments(actionRequest != null && actionRequest.getComments() != null && !actionRequest.getComments().trim().isEmpty()
                ? actionRequest.getComments().trim() : "Approved by Principal");
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

        log.info("Principal (userId={}) approved approval id={} for request id={}", userId, approval.getId(), request.getId());
        return mapToDetailDto(approval, request);
    }

    @Override
    @Transactional
    public PrincipalApprovalDetailDto rejectApproval(Long userId, Long approvalId, PrincipalApprovalActionRequest actionRequest) {
        Institution institution = institutionResolver.resolvePrincipalInstitution(userId);
        if (institution == null) {
            throw new AccessDeniedException("No authorized institution found for current principal");
        }

        if (actionRequest == null || actionRequest.getComments() == null || actionRequest.getComments().trim().isEmpty()) {
            throw new BadRequestException("Rejection reason is mandatory when declining an approval.");
        }

        Approval approval = approvalRepository.findById(approvalId)
                .orElseThrow(() -> new ResourceNotFoundException("Approval not found with id: " + approvalId));

        if (!"AcademicResourceRequest".equals(approval.getEntityType())) {
            throw new BadRequestException("Approval entity type is not supported for Principal approval.");
        }

        AcademicResourceRequest request = requestRepository.findById(approval.getEntityId())
                .orElseThrow(() -> new ResourceNotFoundException("AcademicResourceRequest not found with id: " + approval.getEntityId()));

        if (request.getDepartment() == null || request.getDepartment().getInstitution() == null ||
                !request.getDepartment().getInstitution().getId().equals(institution.getId())) {
            log.warn("Security Alert: Principal userId={} attempted unauthorized rejection on approvalId={}", userId, approvalId);
            throw new ForbiddenException("Access denied: Approval belongs to another institution.");
        }

        if (approval.getStatus() != ApprovalStatus.PENDING || request.getStatus() != RequestStatus.PENDING) {
            throw new ConflictException("Cannot reject: Approval is in " + approval.getStatus() +
                    " status and request is in " + request.getStatus() + " status. Only PENDING approvals may be rejected.");
        }

        User principalUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // 1. Update Request
        request.setStatus(RequestStatus.REJECTED);
        requestRepository.save(request);

        // 2. Update Approval
        approval.setStatus(ApprovalStatus.REJECTED);
        approval.setApprovedBy(principalUser);
        approval.setApprovalLevel(ApprovalLevel.PRINCIPAL);
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

        log.info("Principal (userId={}) rejected approval id={} for request id={}", userId, approval.getId(), request.getId());
        return mapToDetailDto(approval, request);
    }

    private PrincipalApprovalSummaryDto mapToSummaryDto(Approval approval, AcademicResourceRequest request) {
        PrincipalApprovalSummaryDto dto = new PrincipalApprovalSummaryDto();
        dto.setId(approval.getId());
        dto.setRequestId(approval.getEntityId());
        dto.setEntityType(approval.getEntityType());

        if (approval.getRequestedBy() != null) {
            User r = approval.getRequestedBy();
            dto.setRequesterName((r.getFirstName() + " " + (r.getLastName() != null ? r.getLastName() : "")).trim());
            dto.setRequesterEmail(r.getEmail());
        }

        if (request != null && request.getDepartment() != null) {
            dto.setDepartmentName(request.getDepartment().getName());
            dto.setDepartmentCode(request.getDepartment().getCode());
        }

        dto.setApprovalLevel(approval.getApprovalLevel() != null ? approval.getApprovalLevel().name() : null);
        dto.setStatus(approval.getStatus() != null ? approval.getStatus().name() : null);

        if (approval.getApprovedBy() != null) {
            User a = approval.getApprovedBy();
            dto.setApproverName((a.getFirstName() + " " + (a.getLastName() != null ? a.getLastName() : "")).trim());
        }

        dto.setComments(approval.getComments());
        dto.setCreatedAt(approval.getCreatedAt());
        dto.setUpdatedAt(approval.getUpdatedAt());

        return dto;
    }

    private PrincipalApprovalDetailDto mapToDetailDto(Approval approval, AcademicResourceRequest request) {
        PrincipalApprovalDetailDto dto = new PrincipalApprovalDetailDto();
        dto.setId(approval.getId());
        dto.setRequestId(request.getId());
        dto.setEntityType(approval.getEntityType());

        if (approval.getRequestedBy() != null) {
            User r = approval.getRequestedBy();
            dto.setRequesterName((r.getFirstName() + " " + (r.getLastName() != null ? r.getLastName() : "")).trim());
            dto.setRequesterEmail(r.getEmail());
        } else if (request.getRequester() != null) {
            User r = request.getRequester();
            dto.setRequesterName((r.getFirstName() + " " + (r.getLastName() != null ? r.getLastName() : "")).trim());
            dto.setRequesterEmail(r.getEmail());
        }

        if (request.getDepartment() != null) {
            dto.setDepartmentName(request.getDepartment().getName());
            dto.setDepartmentCode(request.getDepartment().getCode());
        }

        if (request.getRequestedResource() != null) {
            dto.setResourceName(request.getRequestedResource().getName());
            dto.setResourceCode(request.getRequestedResource().getCode());
        }

        dto.setPurpose(request.getPurpose());
        dto.setRequestedDate(request.getRequestedDate());
        dto.setStartTime(request.getStartTime());
        dto.setEndTime(request.getEndTime());
        dto.setPriority(request.getPriority() != null ? request.getPriority().name() : null);

        dto.setApprovalLevel(approval.getApprovalLevel() != null ? approval.getApprovalLevel().name() : null);
        dto.setStatus(approval.getStatus() != null ? approval.getStatus().name() : null);

        if (approval.getApprovedBy() != null) {
            User a = approval.getApprovedBy();
            dto.setApproverName((a.getFirstName() + " " + (a.getLastName() != null ? a.getLastName() : "")).trim());
        }

        dto.setComments(approval.getComments());
        dto.setCreatedAt(approval.getCreatedAt());
        dto.setUpdatedAt(approval.getUpdatedAt());

        boolean eligible = (approval.getStatus() == ApprovalStatus.PENDING && request.getStatus() == RequestStatus.PENDING);
        dto.setCanApprove(eligible);
        dto.setCanReject(eligible);

        // Fetch Approval History for this request
        List<Approval> history = approvalRepository.findByEntityTypeAndEntityIdOrderByCreatedAtAsc(
                approval.getEntityType(), approval.getEntityId());

        List<PrincipalApprovalHistoryItemDto> historyDtos = history.stream().map(h -> {
            PrincipalApprovalHistoryItemDto hDto = new PrincipalApprovalHistoryItemDto();
            hDto.setId(h.getId());
            hDto.setApprovalLevel(h.getApprovalLevel() != null ? h.getApprovalLevel().name() : null);
            hDto.setStatus(h.getStatus() != null ? h.getStatus().name() : null);
            if (h.getApprovedBy() != null) {
                User ab = h.getApprovedBy();
                hDto.setApprovedByName((ab.getFirstName() + " " + (ab.getLastName() != null ? ab.getLastName() : "")).trim());
            }
            hDto.setComments(h.getComments());
            hDto.setCreatedAt(h.getCreatedAt());
            return hDto;
        }).collect(Collectors.toList());

        dto.setApprovalHistory(historyDtos);

        return dto;
    }
}
