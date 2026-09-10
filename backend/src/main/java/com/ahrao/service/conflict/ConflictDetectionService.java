package com.ahrao.service.conflict;

import com.ahrao.dto.conflict.ConflictCheckRequestDto;
import com.ahrao.dto.conflict.ConflictResultDto;
import com.ahrao.entity.user.User;

/**
 * Reusable Conflict Detection Service serving both Academic and Hostel resource allocations.
 * Validates domain constraints and returns detected conflicts without persisting or mutating state.
 */
public interface ConflictDetectionService {

    /**
     * Evaluates constraints and detects conflicts for an academic resource allocation.
     *
     * @param request the conflict check parameters
     * @param actor   the authenticated user initiating the operation
     * @return structured conflict evaluation result
     */
    ConflictResultDto detectAcademicConflicts(ConflictCheckRequestDto request, User actor);

    default ConflictResultDto detectAcademicConflicts(ConflictCheckRequestDto request) {
        return detectAcademicConflicts(request, null);
    }

    /**
     * Evaluates constraints and detects conflicts for a hostel bed allocation.
     *
     * @param request the conflict check parameters
     * @param actor   the authenticated user initiating the operation
     * @return structured conflict evaluation result
     */
    ConflictResultDto detectHostelConflicts(ConflictCheckRequestDto request, User actor);

    default ConflictResultDto detectHostelConflicts(ConflictCheckRequestDto request) {
        return detectHostelConflicts(request, null);
    }
}
