package com.ahrao.service.approval;

import com.ahrao.dto.approval.*;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.entity.user.User;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ApprovalService {

    /**
     * Creates a new pending approval for an academic or hostel resource request.
     */
    ApprovalSummaryDto createApproval(CreateApprovalRequestDto request, User actor);

    /**
     * Retrieves filtered and role-scoped approvals.
     */
    PagedResponse<ApprovalSummaryDto> getApprovals(ApprovalFilterParams params, Pageable pageable, User actor);

    /**
     * Retrieves approvals currently pending action by the authenticated user based on role & scope.
     */
    PagedResponse<ApprovalSummaryDto> getPendingApprovals(Pageable pageable, User actor);

    /**
     * Retrieves full approval details along with real-time live conflict detection status.
     */
    ApprovalDetailDto getApprovalById(Long id, User actor);

    /**
     * Approves the resource request, executes final Phase 30 conflict verification,
     * calls the underlying Phase 28 or 29 allocation engine, updates statuses, and writes audit logs.
     */
    ApprovalDetailDto approve(Long id, ApprovalActionRequestDto actionRequest, User actor, String ipAddress, String userAgent);

    /**
     * Rejects the approval with mandatory remarks, updates underlying request, and writes audit logs.
     */
    ApprovalDetailDto reject(Long id, ApprovalActionRequestDto actionRequest, User actor, String ipAddress, String userAgent);

    /**
     * Retrieves the chronological milestone timeline for the approval.
     */
    List<AllocationTimelineItemDto> getApprovalTimeline(Long id, User actor);
}
