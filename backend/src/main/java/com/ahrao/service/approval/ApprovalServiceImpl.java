package com.ahrao.service.approval;

import com.ahrao.dto.academic.allocation.AcademicAllocationDetailDto;
import com.ahrao.dto.academic.allocation.CreateAcademicAllocationRequest;
import com.ahrao.dto.approval.*;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.conflict.ConflictCheckRequestDto;
import com.ahrao.dto.conflict.ConflictResultDto;
import com.ahrao.dto.hostel.allocation.HostelAllocationRequestDto;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.approval.Approval;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.ApprovalLevel;
import com.ahrao.entity.enums.ApprovalStatus;
import com.ahrao.entity.enums.ConflictDomain;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.hostel.HostelBed;
import com.ahrao.entity.notification.Notification;
import com.ahrao.entity.request.AcademicResourceRequest;
import com.ahrao.entity.request.HostelRequest;
import com.ahrao.entity.resource.Resource;
import com.ahrao.entity.user.User;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.approval.ApprovalRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.hostel.HostelBedRepository;
import com.ahrao.repository.notification.NotificationRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.request.HostelRequestRepository;
import com.ahrao.repository.resource.ResourceRepository;
import com.ahrao.service.academic.allocation.AcademicAllocationService;
import com.ahrao.service.conflict.ConflictDetectionService;
import com.ahrao.service.hod.HodDepartmentResolver;
import com.ahrao.service.hostel.HostelResourceAllocationService;
import com.ahrao.service.principal.PrincipalInstitutionResolver;
import com.ahrao.service.warden.WardenScopeService;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;

@Service
@Transactional
public class ApprovalServiceImpl implements ApprovalService {

    private static final Logger log = LoggerFactory.getLogger(ApprovalServiceImpl.class);

    private final ApprovalRepository approvalRepository;
    private final ApprovalRoutingService approvalRoutingService;
    private final AllocationTrackingService allocationTrackingService;
    private final AcademicResourceRequestRepository academicRequestRepository;
    private final HostelRequestRepository hostelRequestRepository;
    private final ResourceRepository resourceRepository;
    private final HostelBedRepository hostelBedRepository;
    private final ConflictDetectionService conflictDetectionService;
    private final AcademicAllocationService academicAllocationService;
    private final HostelResourceAllocationService hostelResourceAllocationService;
    private final AuditLogRepository auditLogRepository;
    private final NotificationRepository notificationRepository;
    private final HodDepartmentResolver hodDepartmentResolver;
    private final WardenScopeService wardenScopeService;
    private final PrincipalInstitutionResolver principalInstitutionResolver;

    public ApprovalServiceImpl(
            ApprovalRepository approvalRepository,
            ApprovalRoutingService approvalRoutingService,
            AllocationTrackingService allocationTrackingService,
            AcademicResourceRequestRepository academicRequestRepository,
            HostelRequestRepository hostelRequestRepository,
            ResourceRepository resourceRepository,
            HostelBedRepository hostelBedRepository,
            ConflictDetectionService conflictDetectionService,
            AcademicAllocationService academicAllocationService,
            HostelResourceAllocationService hostelResourceAllocationService,
            AuditLogRepository auditLogRepository,
            NotificationRepository notificationRepository,
            HodDepartmentResolver hodDepartmentResolver,
            WardenScopeService wardenScopeService,
            PrincipalInstitutionResolver principalInstitutionResolver) {
        this.approvalRepository = approvalRepository;
        this.approvalRoutingService = approvalRoutingService;
        this.allocationTrackingService = allocationTrackingService;
        this.academicRequestRepository = academicRequestRepository;
        this.hostelRequestRepository = hostelRequestRepository;
        this.resourceRepository = resourceRepository;
        this.hostelBedRepository = hostelBedRepository;
        this.conflictDetectionService = conflictDetectionService;
        this.academicAllocationService = academicAllocationService;
        this.hostelResourceAllocationService = hostelResourceAllocationService;
        this.auditLogRepository = auditLogRepository;
        this.notificationRepository = notificationRepository;
        this.hodDepartmentResolver = hodDepartmentResolver;
        this.wardenScopeService = wardenScopeService;
        this.principalInstitutionResolver = principalInstitutionResolver;
    }

    @Override
    public ApprovalSummaryDto createApproval(CreateApprovalRequestDto requestDto, User actor) {
        if (requestDto == null) {
            throw new BadRequestException("CreateApprovalRequestDto cannot be null.");
        }

        String entityType = normalizeEntityType(requestDto.getRequestType());
        Long entityId = requestDto.getRequestId();

        // 1. Verify entity exists & resolve requester
        User requester = actor;
        if ("AcademicResourceRequest".equals(entityType)) {
            AcademicResourceRequest academicRequest = academicRequestRepository.findById(entityId)
                    .orElseThrow(() -> new ResourceNotFoundException("AcademicResourceRequest not found with ID: " + entityId));
            if (academicRequest.getRequester() != null) {
                requester = academicRequest.getRequester();
            }
        } else if ("HostelRequest".equals(entityType)) {
            HostelRequest hostelRequest = hostelRequestRepository.findById(entityId)
                    .orElseThrow(() -> new ResourceNotFoundException("HostelRequest not found with ID: " + entityId));
            if (hostelRequest.getStudent() != null && hostelRequest.getStudent().getUser() != null) {
                requester = hostelRequest.getStudent().getUser();
            }
        } else {
            throw new BadRequestException("Unsupported requestType: " + requestDto.getRequestType());
        }

        // 2. Prevent duplicate pending approvals for the same request
        List<Approval> existingApprovals = approvalRepository.findByEntityTypeAndEntityId(entityType, entityId);
        boolean hasPending = existingApprovals.stream().anyMatch(a -> a.getStatus() == ApprovalStatus.PENDING);
        if (hasPending) {
            throw new ConflictException("An active approval is already pending for " + entityType + " ID: " + entityId);
        }

        // 3. Determine Routing Level
        ApprovalLevel level = approvalRoutingService.determineApprovalLevel(entityType, entityId, requester);

        // 4. Create Approval Entity
        Approval approval = new Approval();
        approval.setEntityType(entityType);
        approval.setEntityId(entityId);
        approval.setRequestedBy(requester);
        approval.setApprovalLevel(level);
        approval.setStatus(ApprovalStatus.PENDING);
        approval.setComments(requestDto.getComments() != null ? requestDto.getComments().trim() : "Submitted for approval");

        Approval saved = approvalRepository.save(approval);

        // 5. Audit Log
        recordAuditLog(actor, "APPROVAL_CREATED", entityType, entityId, null, "PENDING");

        // 6. Notify
        sendNotification(requester, "Approval Submitted",
                "Your request (ID: " + entityId + ") has been submitted for " + level + " approval.",
                "APPROVAL", entityType, saved.getId());

        log.info("Approval created: ID={}, entityType={}, entityId={}, level={}, requester={}",
                saved.getId(), entityType, entityId, level, requester.getUsername());

        return mapToSummaryDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ApprovalSummaryDto> getApprovals(ApprovalFilterParams params, Pageable pageable, User actor) {
        Specification<Approval> spec = buildScopedSpecification(params, actor, false);
        Page<Approval> page = approvalRepository.findAll(spec, pageable);

        List<ApprovalSummaryDto> content = page.getContent().stream()
                .map(this::mapToSummaryDto)
                .toList();

        return new PagedResponse<ApprovalSummaryDto>(
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
    public PagedResponse<ApprovalSummaryDto> getPendingApprovals(Pageable pageable, User actor) {
        ApprovalFilterParams params = new ApprovalFilterParams();
        params.setStatus(ApprovalStatus.PENDING);
        params.setPendingOnly(true);

        Specification<Approval> spec = buildScopedSpecification(params, actor, true);
        Page<Approval> page = approvalRepository.findAll(spec, pageable);

        List<ApprovalSummaryDto> content = page.getContent().stream()
                .map(this::mapToSummaryDto)
                .toList();

        return new PagedResponse<ApprovalSummaryDto>(
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
    public ApprovalDetailDto getApprovalById(Long id, User actor) {
        Approval approval = approvalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Approval not found with ID: " + id));

        ApprovalDetailDto detail = new ApprovalDetailDto();
        populateBaseSummaryFields(detail, approval);

        // Attach request-specific attributes
        if ("AcademicResourceRequest".equals(approval.getEntityType())) {
            academicRequestRepository.findById(approval.getEntityId()).ifPresent(req -> {
                detail.setDescription(req.getDescription());
                detail.setPriority(req.getPriority() != null ? req.getPriority().name() : "MEDIUM");
                detail.setStartTime(req.getStartTime() != null ? req.getStartTime().toString() : null);
                detail.setEndTime(req.getEndTime() != null ? req.getEndTime().toString() : null);
                detail.setQuantity(req.getQuantity());

                Resource targetRes = req.getRequestedResource();
                if (targetRes != null) {
                    detail.setCandidateId(targetRes.getId());
                    detail.setCandidateName(targetRes.getName());
                    detail.setCandidateCode(targetRes.getCode());
                    detail.setCandidateType(targetRes.getCategory() != null ? targetRes.getCategory().getName() : "RESOURCE");
                    detail.setCandidateCapacity(targetRes.getCapacity());
                    detail.setCandidateLocation(targetRes.getLocation());

                    // Execute real-time Phase 30 Conflict check
                    ConflictCheckRequestDto checkDto = new ConflictCheckRequestDto();
                    checkDto.setDomain(ConflictDomain.ACADEMIC);
                    checkDto.setResourceId(targetRes.getId());
                    checkDto.setRequestedDate(req.getRequestedDate());
                    checkDto.setStartTime(req.getStartTime());
                    checkDto.setEndTime(req.getEndTime());
                    checkDto.setRequestId(req.getId());
                    checkDto.setRequestedCapacity(req.getQuantity());

                    try {
                        ConflictResultDto conflictResult = conflictDetectionService.detectAcademicConflicts(checkDto, actor);
                        detail.setLiveConflictCheck(conflictResult);
                    } catch (Exception e) {
                        log.warn("Live conflict check preview failed for approval ID {}: {}", id, e.getMessage());
                    }
                }
            });
        } else if ("HostelRequest".equals(approval.getEntityType())) {
            hostelRequestRepository.findById(approval.getEntityId()).ifPresent(req -> {
                detail.setDescription(req.getDescription());
                detail.setPriority(req.getPriority() != null ? req.getPriority().name() : "MEDIUM");
                if (req.getStudent() != null) {
                    detail.setStudentName(formatUserName(req.getStudent().getUser()));
                    detail.setStudentRollNumber(req.getStudent().getRollNumber() != null ? req.getStudent().getRollNumber() : req.getStudent().getRegisterNumber());
                }

                // Check conflict for student
                if (req.getStudent() != null && req.getHostel() != null) {
                    ConflictCheckRequestDto checkDto = new ConflictCheckRequestDto();
                    checkDto.setDomain(ConflictDomain.HOSTEL);
                    checkDto.setStudentId(req.getStudent().getId());
                    checkDto.setHostelId(req.getHostel().getId());
                    checkDto.setHostelRequestId(req.getId());

                    try {
                        ConflictResultDto conflictResult = conflictDetectionService.detectHostelConflicts(checkDto, actor);
                        detail.setLiveConflictCheck(conflictResult);
                    } catch (Exception e) {
                        log.warn("Live hostel conflict check preview failed for approval ID {}: {}", id, e.getMessage());
                    }
                }
            });
        }

        // Check if current user can approve
        if (approval.getStatus() != ApprovalStatus.PENDING) {
            detail.setCanApprove(false);
            detail.setCannotApproveReason("Approval is already " + approval.getStatus());
        } else if (actor != null && approval.getRequestedBy() != null && actor.getId().equals(approval.getRequestedBy().getId())) {
            detail.setCanApprove(false);
            detail.setCannotApproveReason("Self-approval is strictly prohibited.");
        } else if (actor != null && approvalRoutingService.isAuthorizedApprover(approval, actor)) {
            detail.setCanApprove(true);
        } else {
            detail.setCanApprove(false);
            detail.setCannotApproveReason("Insufficient authority or outside your assigned department/hostel scope.");
        }

        // Attach lifecycle timeline
        detail.setTimeline(allocationTrackingService.getApprovalTimeline(id, actor));

        return detail;
    }

    @Override
    public ApprovalDetailDto approve(Long id, ApprovalActionRequestDto actionRequest, User actor, String ipAddress, String userAgent) {
        Approval approval = approvalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Approval not found with ID: " + id));

        // 1. Status Guard: Must be PENDING
        if (approval.getStatus() != ApprovalStatus.PENDING) {
            throw new ConflictException("APPROVAL_ALREADY_PROCESSED: Approval is currently in " + approval.getStatus() + " status.");
        }

        // 2. Authorization, Scope & Self-Approval Prevention
        approvalRoutingService.validateApproverScope(approval, actor);

        String entityType = approval.getEntityType();

        // 3. Execution based on Entity Type
        if ("AcademicResourceRequest".equals(entityType)) {
            AcademicResourceRequest academicRequest = academicRequestRepository.findById(approval.getEntityId())
                    .orElseThrow(() -> new ResourceNotFoundException("AcademicResourceRequest not found with ID: " + approval.getEntityId()));

            Long targetResourceId = actionRequest != null && actionRequest.getResourceId() != null
                    ? actionRequest.getResourceId()
                    : (academicRequest.getRequestedResource() != null ? academicRequest.getRequestedResource().getId() : null);

            if (targetResourceId == null) {
                throw new BadRequestException("A target resource ID must be specified for allocation.");
            }

            Resource resource = resourceRepository.findById(targetResourceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + targetResourceId));

            // 4a. Critical Phase 30 Conflict Re-validation immediately before allocation
            ConflictCheckRequestDto conflictCheck = new ConflictCheckRequestDto();
            conflictCheck.setDomain(ConflictDomain.ACADEMIC);
            conflictCheck.setResourceId(targetResourceId);
            conflictCheck.setRequestedDate(academicRequest.getRequestedDate());
            conflictCheck.setStartTime(academicRequest.getStartTime());
            conflictCheck.setEndTime(academicRequest.getEndTime());
            conflictCheck.setRequestId(academicRequest.getId());
            conflictCheck.setRequestedCapacity(academicRequest.getQuantity());

            ConflictResultDto conflictResult = conflictDetectionService.detectAcademicConflicts(conflictCheck, actor);
            if (!conflictResult.isCanAllocate()) {
                String errorReason = conflictResult.getConflicts() != null && !conflictResult.getConflicts().isEmpty()
                        ? conflictResult.getConflicts().get(0).getMessage() : "Constraint conflict";
                recordAuditLog(actor, "APPROVAL_BLOCKED_BY_CONFLICT", entityType, academicRequest.getId(),
                        "PENDING", "Conflict detected: " + errorReason);
                log.warn("Approval blocked by Phase 30 conflict: approvalId={}, resourceId={}", id, targetResourceId);
                throw new ConflictException("The recommended resource is no longer available. Please re-evaluate the request.");
            }

            // 5a. Call Existing Phase 28 Allocation Engine
            CreateAcademicAllocationRequest allocReq = new CreateAcademicAllocationRequest(academicRequest.getId(), targetResourceId);
            allocReq.setPurpose(academicRequest.getPurpose());
            AcademicAllocationDetailDto allocDetail = academicAllocationService.allocateResource(allocReq, actor);

            // 6a. Update request status
            academicRequest.setStatus(RequestStatus.APPROVED);
            academicRequestRepository.save(academicRequest);

            // 7a. Audit allocation after approval
            recordAuditLog(actor, "ALLOCATION_CREATED_AFTER_APPROVAL", "ResourceAllocation", allocDetail.getId(),
                    null, "Allocated resource ID " + targetResourceId + " after approval ID " + id);

        } else if ("HostelRequest".equals(entityType)) {
            HostelRequest hostelRequest = hostelRequestRepository.findById(approval.getEntityId())
                    .orElseThrow(() -> new ResourceNotFoundException("HostelRequest not found with ID: " + approval.getEntityId()));

            Long targetBedId = actionRequest != null && actionRequest.getBedId() != null
                    ? actionRequest.getBedId() : null;

            if (targetBedId == null) {
                throw new BadRequestException("A target bed ID must be specified for hostel allocation.");
            }

            HostelBed bed = hostelBedRepository.findById(targetBedId)
                    .orElseThrow(() -> new ResourceNotFoundException("HostelBed not found with ID: " + targetBedId));

            // 4b. Critical Phase 30 Conflict Re-validation immediately before allocation
            ConflictCheckRequestDto conflictCheck = new ConflictCheckRequestDto();
            conflictCheck.setDomain(ConflictDomain.HOSTEL);
            conflictCheck.setStudentId(hostelRequest.getStudent().getId());
            conflictCheck.setBedId(targetBedId);
            conflictCheck.setHostelId(hostelRequest.getHostel() != null ? hostelRequest.getHostel().getId() : null);
            conflictCheck.setHostelRequestId(hostelRequest.getId());

            ConflictResultDto conflictResult = conflictDetectionService.detectHostelConflicts(conflictCheck, actor);
            if (!conflictResult.isCanAllocate()) {
                String errorReason = conflictResult.getConflicts() != null && !conflictResult.getConflicts().isEmpty()
                        ? conflictResult.getConflicts().get(0).getMessage() : "Constraint conflict";
                recordAuditLog(actor, "APPROVAL_BLOCKED_BY_CONFLICT", entityType, hostelRequest.getId(),
                        "PENDING", "Conflict detected: " + errorReason);
                log.warn("Hostel approval blocked by Phase 30 conflict: approvalId={}, bedId={}", id, targetBedId);
                throw new ConflictException("The recommended bed is no longer available. Please re-evaluate the request.");
            }

            // 5b. Call Existing Phase 29 Allocation Engine
            HostelAllocationRequestDto allocReq = new HostelAllocationRequestDto();
            allocReq.setStudentId(hostelRequest.getStudent().getId());
            allocReq.setHostelId(hostelRequest.getHostel().getId());
            allocReq.setRoomId(bed.getRoom() != null ? bed.getRoom().getId() : null);
            allocReq.setBedId(targetBedId);
            allocReq.setHostelRequestId(hostelRequest.getId());
            allocReq.setStartDate(LocalDate.now());

            hostelResourceAllocationService.allocate(allocReq, actor, ipAddress, userAgent);

            // 6b. Update request status
            hostelRequest.setStatus(RequestStatus.APPROVED);
            hostelRequestRepository.save(hostelRequest);

            // 7b. Audit allocation after approval
            recordAuditLog(actor, "ALLOCATION_CREATED_AFTER_APPROVAL", "HostelAllocation", targetBedId,
                    null, "Allocated bed ID " + targetBedId + " after approval ID " + id);
        }

        // 8. Transition Approval state to APPROVED
        approval.setStatus(ApprovalStatus.APPROVED);
        approval.setApprovedBy(actor);
        approval.setComments(actionRequest != null && actionRequest.getComments() != null && !actionRequest.getComments().trim().isEmpty()
                ? actionRequest.getComments().trim() : "Approved by " + actor.getUsername());
        Approval updated = approvalRepository.save(approval);

        // 9. Record Audit Log
        recordAuditLog(actor, "APPROVAL_APPROVED", entityType, approval.getEntityId(), "PENDING", "APPROVED");

        // 10. Notify Requester
        sendNotification(approval.getRequestedBy(), "Resource Request Approved",
                "Your request (ID: " + approval.getEntityId() + ") has been approved and allocated.",
                "APPROVAL", entityType, approval.getId());

        log.info("Approval ID={} successfully approved by user ID={}", id, actor.getId());
        return getApprovalById(updated.getId(), actor);
    }

    @Override
    public ApprovalDetailDto reject(Long id, ApprovalActionRequestDto actionRequest, User actor, String ipAddress, String userAgent) {
        Approval approval = approvalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Approval not found with ID: " + id));

        // 1. Status Guard: Must be PENDING
        if (approval.getStatus() != ApprovalStatus.PENDING) {
            throw new ConflictException("APPROVAL_ALREADY_PROCESSED: Approval is currently in " + approval.getStatus() + " status.");
        }

        // 2. Authorization, Scope & Self-Approval Prevention
        approvalRoutingService.validateApproverScope(approval, actor);

        // 3. Comments Mandatory on Reject
        if (actionRequest == null || actionRequest.getComments() == null || actionRequest.getComments().trim().isEmpty()) {
            throw new BadRequestException("Rejection reason/comments are required when rejecting an approval.");
        }

        String entityType = approval.getEntityType();

        // 4. Update underlying request
        if ("AcademicResourceRequest".equals(entityType)) {
            academicRequestRepository.findById(approval.getEntityId()).ifPresent(req -> {
                req.setStatus(RequestStatus.REJECTED);
                academicRequestRepository.save(req);
            });
        } else if ("HostelRequest".equals(entityType)) {
            hostelRequestRepository.findById(approval.getEntityId()).ifPresent(req -> {
                req.setStatus(RequestStatus.REJECTED);
                hostelRequestRepository.save(req);
            });
        }

        // 5. Update Approval state to REJECTED
        approval.setStatus(ApprovalStatus.REJECTED);
        approval.setApprovedBy(actor);
        approval.setComments(actionRequest.getComments().trim());
        Approval updated = approvalRepository.save(approval);

        // 6. Record Audit Log
        recordAuditLog(actor, "APPROVAL_REJECTED", entityType, approval.getEntityId(), "PENDING", "REJECTED: " + actionRequest.getComments().trim());

        // 7. Notify Requester
        sendNotification(approval.getRequestedBy(), "Resource Request Rejected",
                "Your request (ID: " + approval.getEntityId() + ") was rejected. Reason: " + actionRequest.getComments().trim(),
                "APPROVAL", entityType, approval.getId());

        log.info("Approval ID={} successfully rejected by user ID={}", id, actor.getId());
        return getApprovalById(updated.getId(), actor);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AllocationTimelineItemDto> getApprovalTimeline(Long id, User actor) {
        return allocationTrackingService.getApprovalTimeline(id, actor);
    }

    // --- Specification Builder for Role-Scoped Approvals Query ---
    private Specification<Approval> buildScopedSpecification(ApprovalFilterParams params, User actor, boolean pendingOnly) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (pendingOnly || (params != null && params.getStatus() == ApprovalStatus.PENDING)) {
                predicates.add(cb.equal(root.get("status"), ApprovalStatus.PENDING));
            } else if (params != null && params.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), params.getStatus()));
            }

            if (params != null && params.getApprovalLevel() != null) {
                predicates.add(cb.equal(root.get("approvalLevel"), params.getApprovalLevel()));
            }

            if (params != null && params.getRequestType() != null && !params.getRequestType().trim().isEmpty()) {
                String normalized = normalizeEntityType(params.getRequestType());
                predicates.add(cb.equal(root.get("entityType"), normalized));
            }

            if (params != null && params.getFromDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"),
                        params.getFromDate().atStartOfDay(ZoneOffset.UTC).toInstant()));
            }

            if (params != null && params.getToDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"),
                        params.getToDate().atTime(23, 59, 59).atZone(ZoneOffset.UTC).toInstant()));
            }

            // Role Scoping for non-admin actors
            if (actor != null && !hasRole(actor, "ADMIN")) {
                if (hasRole(actor, "HOD")) {
                    try {
                        Department hodDept = hodDepartmentResolver.resolveHodDepartment(actor.getId());
                        Subquery<Long> subquery = query.subquery(Long.class);
                        Root<AcademicResourceRequest> reqRoot = subquery.from(AcademicResourceRequest.class);
                        subquery.select(reqRoot.get("id"))
                                .where(cb.equal(reqRoot.get("department").get("id"), hodDept.getId()));

                        Predicate hodAcademic = cb.and(
                                cb.equal(root.get("entityType"), "AcademicResourceRequest"),
                                root.get("entityId").in(subquery)
                        );
                        // Also show approvals requested by HOD themselves
                        Predicate ownRequested = cb.equal(root.get("requestedBy").get("id"), actor.getId());
                        predicates.add(cb.or(hodAcademic, ownRequested));
                    } catch (Exception e) {
                        log.debug("HOD department scoping fallback to own requests: {}", e.getMessage());
                        predicates.add(cb.equal(root.get("requestedBy").get("id"), actor.getId()));
                    }
                } else if (hasRole(actor, "WARDEN")) {
                    try {
                        Set<Long> authorizedHostels = wardenScopeService.getAuthorizedHostelIds();
                        if (authorizedHostels != null && !authorizedHostels.isEmpty()) {
                            Subquery<Long> subquery = query.subquery(Long.class);
                            Root<HostelRequest> reqRoot = subquery.from(HostelRequest.class);
                            subquery.select(reqRoot.get("id"))
                                    .where(reqRoot.get("hostel").get("id").in(authorizedHostels));

                            Predicate wardenHostel = cb.and(
                                    cb.equal(root.get("entityType"), "HostelRequest"),
                                    root.get("entityId").in(subquery)
                            );
                            predicates.add(wardenHostel);
                        } else {
                            predicates.add(cb.equal(root.get("requestedBy").get("id"), actor.getId()));
                        }
                    } catch (Exception e) {
                        predicates.add(cb.equal(root.get("requestedBy").get("id"), actor.getId()));
                    }
                } else if (hasRole(actor, "PRINCIPAL")) {
                    try {
                        Institution inst = principalInstitutionResolver.resolvePrincipalInstitution(actor.getId());
                        if (inst != null) {
                            Subquery<Long> subquery = query.subquery(Long.class);
                            Root<AcademicResourceRequest> reqRoot = subquery.from(AcademicResourceRequest.class);
                            subquery.select(reqRoot.get("id"))
                                    .where(cb.equal(reqRoot.get("department").get("institution").get("id"), inst.getId()));

                            predicates.add(cb.and(
                                    cb.equal(root.get("entityType"), "AcademicResourceRequest"),
                                    root.get("entityId").in(subquery)
                            ));
                        }
                    } catch (Exception e) {
                        predicates.add(cb.equal(root.get("requestedBy").get("id"), actor.getId()));
                    }
                } else {
                    // Regular Faculty or Student: only see their own requested approvals
                    predicates.add(cb.equal(root.get("requestedBy").get("id"), actor.getId()));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private ApprovalSummaryDto mapToSummaryDto(Approval approval) {
        ApprovalSummaryDto dto = new ApprovalSummaryDto();
        populateBaseSummaryFields(dto, approval);
        return dto;
    }

    private void populateBaseSummaryFields(ApprovalSummaryDto dto, Approval approval) {
        dto.setId(approval.getId());
        dto.setEntityType(approval.getEntityType());
        dto.setEntityId(approval.getEntityId());
        dto.setApprovalLevel(approval.getApprovalLevel());
        dto.setStatus(approval.getStatus());
        dto.setComments(approval.getComments());
        dto.setCreatedAt(approval.getCreatedAt());
        dto.setUpdatedAt(approval.getUpdatedAt());

        if ("AcademicResourceRequest".equalsIgnoreCase(approval.getEntityType())) {
            dto.setRequestType("ACADEMIC_RESOURCE");
            academicRequestRepository.findById(approval.getEntityId()).ifPresent(req -> {
                dto.setPurpose(req.getPurpose());
                dto.setResourceCategory(req.getCategory() != null ? req.getCategory().getName() : null);
                dto.setRequestedResourceName(req.getRequestedResource() != null ? req.getRequestedResource().getName() : null);
                dto.setDepartmentName(req.getDepartment() != null ? req.getDepartment().getName() : null);
                dto.setTargetDate(req.getRequestedDate() != null ? req.getRequestedDate().toString() : null);
            });
        } else if ("HostelRequest".equalsIgnoreCase(approval.getEntityType())) {
            dto.setRequestType("HOSTEL_RESOURCE");
            hostelRequestRepository.findById(approval.getEntityId()).ifPresent(req -> {
                dto.setPurpose(req.getRequestType() + ": " + (req.getDescription() != null ? req.getDescription() : ""));
                dto.setHostelName(req.getHostel() != null ? req.getHostel().getName() : null);
                dto.setTargetDate(req.getCreatedAt() != null ? req.getCreatedAt().toString() : null);
            });
        }

        if (approval.getRequestedBy() != null) {
            User reqBy = approval.getRequestedBy();
            dto.setRequestedById(reqBy.getId());
            dto.setRequestedByName(formatUserName(reqBy));
            dto.setRequestedByEmail(reqBy.getEmail());
            dto.setRequestedByRole(extractUserRole(reqBy));
        }

        if (approval.getApprovedBy() != null) {
            User appBy = approval.getApprovedBy();
            dto.setApprovedById(appBy.getId());
            dto.setApprovedByName(formatUserName(appBy));
        }
    }

    private String normalizeEntityType(String type) {
        if (type == null) {
            return "AcademicResourceRequest";
        }
        if ("ACADEMIC_RESOURCE".equalsIgnoreCase(type) || "AcademicResourceRequest".equalsIgnoreCase(type)) {
            return "AcademicResourceRequest";
        }
        if ("HOSTEL_RESOURCE".equalsIgnoreCase(type) || "HostelRequest".equalsIgnoreCase(type)) {
            return "HostelRequest";
        }
        return type;
    }

    private void recordAuditLog(User user, String action, String entityType, Long entityId, String oldValue, String newValue) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setUser(user);
            auditLog.setAction(action);
            auditLog.setEntityType(entityType);
            auditLog.setEntityId(entityId);
            auditLog.setOldValue(oldValue);
            auditLog.setNewValue(newValue);
            auditLog.setCreatedAt(Instant.now());
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to record audit log: action={}, entityId={}, error={}", action, entityId, e.getMessage());
        }
    }

    private void sendNotification(User user, String title, String message, String notifType, String refType, Long refId) {
        if (user == null) {
            return;
        }
        try {
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setNotificationType(notifType);
            notification.setReferenceType(refType);
            notification.setReferenceId(refId);
            notification.setIsRead(false);
            notification.setCreatedAt(Instant.now());
            notificationRepository.save(notification);
        } catch (Exception e) {
            log.error("Failed to create notification: user={}, error={}", user.getId(), e.getMessage());
        }
    }

    private String formatUserName(User user) {
        if (user == null) {
            return "System";
        }
        String first = user.getFirstName() != null ? user.getFirstName() : "";
        String last = user.getLastName() != null ? user.getLastName() : "";
        String full = (first + " " + last).trim();
        return full.isEmpty() ? user.getUsername() : full;
    }

    private String extractUserRole(User user) {
        if (user == null || user.getRoles() == null || user.getRoles().isEmpty()) {
            return "USER";
        }
        return user.getRoles().iterator().next().getName().replace("ROLE_", "");
    }

    private boolean hasRole(User user, String roleName) {
        if (user == null || user.getRoles() == null) {
            return false;
        }
        return user.getRoles().stream()
                .anyMatch(r -> r.getName().equalsIgnoreCase(roleName) || r.getName().equalsIgnoreCase("ROLE_" + roleName));
    }
}
