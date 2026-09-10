package com.ahrao.service.academic.allocation;

import com.ahrao.dto.academic.allocation.AcademicAllocationPreviewDto;
import com.ahrao.dto.academic.allocation.AcademicResourceCandidateDto;
import com.ahrao.entity.academic.TimeSlot;
import com.ahrao.entity.request.AcademicResourceRequest;
import com.ahrao.entity.resource.Resource;

public interface AcademicResourceCandidateService {

    /**
     * Previews all candidate resources for an academic request, identifying eligible vs conflicting resources,
     * and computing the deterministic best-fit candidate.
     */
    AcademicAllocationPreviewDto previewCandidates(AcademicResourceRequest request, Long specificResourceId, TimeSlot timeSlot);

    /**
     * Executes deterministic candidate selection:
     * 1. Filters resources by category, status, and zero conflict.
     * 2. Ranks by least wasted capacity (capacity - requestedCapacity) ASC, then resourceId ASC.
     * 3. Returns the top candidate, or throws ConflictException if none available.
     */
    Resource findBestCandidate(AcademicResourceRequest request, TimeSlot timeSlot);
}
