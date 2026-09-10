package com.ahrao.service.approval;

import com.ahrao.entity.approval.Approval;
import com.ahrao.entity.enums.ApprovalLevel;
import com.ahrao.entity.user.User;

public interface ApprovalRoutingService {

    /**
     * Determines the appropriate authority level for a given resource request.
     */
    ApprovalLevel determineApprovalLevel(String entityType, Long entityId, User requester);

    /**
     * Validates that the approver possesses appropriate role and organizational scope.
     * Throws ForbiddenException if scope validation fails.
     */
    void validateApproverScope(Approval approval, User approver);

    /**
     * Prevents a requester from approving their own request.
     * Throws ForbiddenException if self-approval is attempted.
     */
    void validateSelfApproval(Approval approval, User approver);

    /**
     * Non-throwing check to verify whether a user is an authorized approver for the approval.
     */
    boolean isAuthorizedApprover(Approval approval, User user);
}
