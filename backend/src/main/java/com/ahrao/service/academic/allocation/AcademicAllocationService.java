package com.ahrao.service.academic.allocation;

import com.ahrao.dto.academic.allocation.*;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.entity.user.User;
import org.springframework.data.domain.Pageable;

public interface AcademicAllocationService {

    /**
     * Manually allocates a specified academic resource to an approved/pending request.
     * Uses pessimistic locking to prevent concurrency collisions.
     */
    AcademicAllocationDetailDto allocateResource(CreateAcademicAllocationRequest request, User currentUser);

    /**
     * Automatically selects the deterministic best candidate resource and allocates it.
     * Uses pessimistic locking to guarantee zero race conditions.
     */
    AcademicAllocationDetailDto autoAllocateResource(AutoAcademicAllocationRequest request, User currentUser);

    /**
     * Read-only preview of candidate resources, conflict analysis, and recommended match.
     */
    AcademicAllocationPreviewDto previewAllocation(PreviewAcademicAllocationRequest request, User currentUser);

    /**
     * Paged directory of academic resource allocations with scoping and filtering.
     */
    PagedResponse<AcademicAllocationSummaryDto> getAllocations(
            AcademicAllocationFilterParams filters,
            Pageable pageable,
            User currentUser
    );

    /**
     * Retrieves full allocation details.
     */
    AcademicAllocationDetailDto getAllocationById(Long id, User currentUser);

    /**
     * Safely cancels an active academic resource allocation without deleting historical records.
     */
    AcademicAllocationDetailDto cancelAllocation(Long id, String remarks, User currentUser);
}
