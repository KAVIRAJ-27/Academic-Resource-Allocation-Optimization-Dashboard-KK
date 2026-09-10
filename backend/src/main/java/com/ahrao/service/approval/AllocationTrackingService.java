package com.ahrao.service.approval;

import com.ahrao.dto.approval.AllocationTimelineItemDto;
import com.ahrao.entity.user.User;

import java.util.List;

public interface AllocationTrackingService {

    /**
     * Constructs chronological lifecycle milestones for an academic resource allocation.
     */
    List<AllocationTimelineItemDto> getAcademicAllocationTimeline(Long allocationId, User actor);

    /**
     * Constructs chronological lifecycle milestones for a hostel bed allocation.
     */
    List<AllocationTimelineItemDto> getHostelAllocationTimeline(Long allocationId, User actor);

    /**
     * Constructs chronological lifecycle milestones for an approval record.
     */
    List<AllocationTimelineItemDto> getApprovalTimeline(Long approvalId, User actor);
}
