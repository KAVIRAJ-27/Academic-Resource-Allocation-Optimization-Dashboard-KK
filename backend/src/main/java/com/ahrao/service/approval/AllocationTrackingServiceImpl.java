package com.ahrao.service.approval;

import com.ahrao.dto.approval.AllocationTimelineItemDto;
import com.ahrao.entity.allocation.HostelAllocation;
import com.ahrao.entity.allocation.ResourceAllocation;
import com.ahrao.entity.approval.Approval;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.ApprovalStatus;
import com.ahrao.entity.request.AcademicResourceRequest;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.allocation.HostelAllocationRepository;
import com.ahrao.repository.allocation.ResourceAllocationRepository;
import com.ahrao.repository.approval.ApprovalRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class AllocationTrackingServiceImpl implements AllocationTrackingService {

    private final ResourceAllocationRepository resourceAllocationRepository;
    private final HostelAllocationRepository hostelAllocationRepository;
    private final ApprovalRepository approvalRepository;
    private final AuditLogRepository auditLogRepository;

    public AllocationTrackingServiceImpl(
            ResourceAllocationRepository resourceAllocationRepository,
            HostelAllocationRepository hostelAllocationRepository,
            ApprovalRepository approvalRepository,
            AuditLogRepository auditLogRepository) {
        this.resourceAllocationRepository = resourceAllocationRepository;
        this.hostelAllocationRepository = hostelAllocationRepository;
        this.approvalRepository = approvalRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    public List<AllocationTimelineItemDto> getAcademicAllocationTimeline(Long allocationId, User actor) {
        ResourceAllocation allocation = resourceAllocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("ResourceAllocation not found with ID: " + allocationId));

        List<AllocationTimelineItemDto> timeline = new ArrayList<>();

        // 1. Linked Academic Request
        AcademicResourceRequest request = allocation.getRequest();
        if (request != null) {
            timeline.add(new AllocationTimelineItemDto(
                    "REQUEST_CREATED",
                    "REQUESTED",
                    formatUserName(request.getRequester()),
                    extractUserRole(request.getRequester()),
                    request.getCreatedAt(),
                    "Academic resource requested: " + request.getPurpose()
            ));

            // Check linked approvals
            List<Approval> approvals = approvalRepository.findByEntityTypeAndEntityIdOrderByCreatedAtAsc(
                    "AcademicResourceRequest", request.getId());
            if (approvals.isEmpty()) {
                approvals = approvalRepository.findByEntityTypeAndEntityIdOrderByCreatedAtAsc(
                        "ACADEMIC_RESOURCE", request.getId());
            }

            for (Approval approval : approvals) {
                timeline.add(new AllocationTimelineItemDto(
                        "SUBMITTED_FOR_APPROVAL",
                        "PENDING_APPROVAL",
                        formatUserName(approval.getRequestedBy()),
                        extractUserRole(approval.getRequestedBy()),
                        approval.getCreatedAt(),
                        "Submitted for " + approval.getApprovalLevel() + " authority review"
                ));

                if (approval.getStatus() == ApprovalStatus.APPROVED) {
                    timeline.add(new AllocationTimelineItemDto(
                            "APPROVED",
                            "APPROVED",
                            formatUserName(approval.getApprovedBy()),
                            approval.getApprovalLevel() != null ? approval.getApprovalLevel().name() : "APPROVER",
                            approval.getUpdatedAt() != null ? approval.getUpdatedAt() : approval.getCreatedAt(),
                            approval.getComments() != null ? approval.getComments() : "Approved for academic allocation"
                    ));
                } else if (approval.getStatus() == ApprovalStatus.REJECTED) {
                    timeline.add(new AllocationTimelineItemDto(
                            "REJECTED",
                            "REJECTED",
                            formatUserName(approval.getApprovedBy()),
                            approval.getApprovalLevel() != null ? approval.getApprovalLevel().name() : "APPROVER",
                            approval.getUpdatedAt() != null ? approval.getUpdatedAt() : approval.getCreatedAt(),
                            approval.getComments() != null ? approval.getComments() : "Request rejected"
                    ));
                }
            }
        }

        // 2. Allocation Milestone
        timeline.add(new AllocationTimelineItemDto(
                "ALLOCATED",
                allocation.getStatus().name(),
                formatUserName(allocation.getAllocatedBy()),
                extractUserRole(allocation.getAllocatedBy()),
                allocation.getCreatedAt(),
                "Resource allocated: " + (allocation.getResource() != null ? allocation.getResource().getName() : "ID " + allocation.getId())
        ));

        // 3. Current Lifecycle state
        if (allocation.getStatus() != null) {
            String currentStatus = allocation.getStatus().name();
            if ("CANCELLED".equalsIgnoreCase(currentStatus)) {
                timeline.add(new AllocationTimelineItemDto(
                        "CANCELLED",
                        "CANCELLED",
                        formatUserName(allocation.getAllocatedBy()),
                        "SYSTEM",
                        allocation.getUpdatedAt() != null ? allocation.getUpdatedAt() : allocation.getCreatedAt(),
                        "Allocation cancelled"
                ));
            } else if ("COMPLETED".equalsIgnoreCase(currentStatus)) {
                timeline.add(new AllocationTimelineItemDto(
                        "COMPLETED",
                        "COMPLETED",
                        "System Scheduler",
                        "SYSTEM",
                        allocation.getEndDatetime() != null ? allocation.getEndDatetime() : Instant.now(),
                        "Scheduled resource booking completed successfully"
                ));
            }
        }

        timeline.sort(Comparator.comparing(AllocationTimelineItemDto::getTimestamp, Comparator.nullsLast(Comparator.naturalOrder())));
        return timeline;
    }

    @Override
    public List<AllocationTimelineItemDto> getHostelAllocationTimeline(Long allocationId, User actor) {
        HostelAllocation allocation = hostelAllocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("HostelAllocation not found with ID: " + allocationId));

        List<AllocationTimelineItemDto> timeline = new ArrayList<>();

        // Student context
        String studentName = allocation.getStudent() != null && allocation.getStudent().getUser() != null
                ? formatUserName(allocation.getStudent().getUser()) : "Student ID " + (allocation.getStudent() != null ? allocation.getStudent().getId() : "N/A");

        // Bed context
        String bedCode = allocation.getBed() != null ? allocation.getBed().getBedNumber() : "Bed";

        timeline.add(new AllocationTimelineItemDto(
                "ALLOCATED",
                allocation.getStatus().name(),
                "Warden / Administration",
                "WARDEN",
                allocation.getAllocatedAt() != null ? allocation.getAllocatedAt() : Instant.now(),
                "Bed allocated to " + studentName + " (Bed: " + bedCode + ")"
        ));

        if (allocation.getReleasedAt() != null || "CANCELLED".equalsIgnoreCase(allocation.getStatus().name())) {
            timeline.add(new AllocationTimelineItemDto(
                    "RELEASED",
                    "RELEASED",
                    "Warden / Administration",
                    "WARDEN",
                    allocation.getReleasedAt() != null ? allocation.getReleasedAt() : Instant.now(),
                    "Hostel bed released"
            ));
        }

        timeline.sort(Comparator.comparing(AllocationTimelineItemDto::getTimestamp, Comparator.nullsLast(Comparator.naturalOrder())));
        return timeline;
    }

    @Override
    public List<AllocationTimelineItemDto> getApprovalTimeline(Long approvalId, User actor) {
        Approval approval = approvalRepository.findById(approvalId)
                .orElseThrow(() -> new ResourceNotFoundException("Approval not found with ID: " + approvalId));

        List<AllocationTimelineItemDto> timeline = new ArrayList<>();

        // 1. Initial creation
        timeline.add(new AllocationTimelineItemDto(
                "SUBMITTED_FOR_APPROVAL",
                "PENDING_APPROVAL",
                formatUserName(approval.getRequestedBy()),
                extractUserRole(approval.getRequestedBy()),
                approval.getCreatedAt(),
                "Approval submitted for " + approval.getApprovalLevel() + " review"
        ));

        // 2. State transition
        if (approval.getStatus() == ApprovalStatus.APPROVED) {
            timeline.add(new AllocationTimelineItemDto(
                    "APPROVED",
                    "APPROVED",
                    formatUserName(approval.getApprovedBy()),
                    approval.getApprovalLevel() != null ? approval.getApprovalLevel().name() : "APPROVER",
                    approval.getUpdatedAt() != null ? approval.getUpdatedAt() : approval.getCreatedAt(),
                    approval.getComments() != null ? approval.getComments() : "Approved"
            ));
        } else if (approval.getStatus() == ApprovalStatus.REJECTED) {
            timeline.add(new AllocationTimelineItemDto(
                    "REJECTED",
                    "REJECTED",
                    formatUserName(approval.getApprovedBy()),
                    approval.getApprovalLevel() != null ? approval.getApprovalLevel().name() : "APPROVER",
                    approval.getUpdatedAt() != null ? approval.getUpdatedAt() : approval.getCreatedAt(),
                    approval.getComments() != null ? approval.getComments() : "Rejected"
            ));
        } else if (approval.getStatus() == ApprovalStatus.CANCELLED) {
            timeline.add(new AllocationTimelineItemDto(
                    "CANCELLED",
                    "CANCELLED",
                    formatUserName(approval.getApprovedBy()),
                    "SYSTEM",
                    approval.getUpdatedAt() != null ? approval.getUpdatedAt() : approval.getCreatedAt(),
                    approval.getComments() != null ? approval.getComments() : "Approval cancelled"
            ));
        } else {
            timeline.add(new AllocationTimelineItemDto(
                    "UNDER_REVIEW",
                    "PENDING",
                    "Assigned " + approval.getApprovalLevel(),
                    approval.getApprovalLevel() != null ? approval.getApprovalLevel().name() : "APPROVER",
                    Instant.now(),
                    "Pending review by " + approval.getApprovalLevel()
            ));
        }

        // 3. Query audit logs for any additional tracking
        List<AuditLog> auditLogs = auditLogRepository.findByEntityTypeAndEntityId(
                approval.getEntityType(), approval.getEntityId());
        for (AuditLog logEntry : auditLogs) {
            if ("ALLOCATION_CREATED_AFTER_APPROVAL".equalsIgnoreCase(logEntry.getAction())) {
                timeline.add(new AllocationTimelineItemDto(
                        "ALLOCATED",
                        "ALLOCATED",
                        formatUserName(logEntry.getUser()),
                        extractUserRole(logEntry.getUser()),
                        logEntry.getCreatedAt(),
                        "Resource allocated after approval"
                ));
            }
        }

        timeline.sort(Comparator.comparing(AllocationTimelineItemDto::getTimestamp, Comparator.nullsLast(Comparator.naturalOrder())));
        return timeline;
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
}
