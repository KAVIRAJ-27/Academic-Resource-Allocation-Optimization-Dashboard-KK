package com.ahrao.service.academic.allocation;

import com.ahrao.entity.academic.TimeSlot;
import com.ahrao.entity.request.AcademicResourceRequest;
import com.ahrao.entity.resource.Resource;
import com.ahrao.entity.user.User;
import java.util.List;

public interface AcademicAllocationValidator {

    /**
     * Validates that the request exists, is eligible for allocation, and has not already been fulfilled.
     */
    void validateRequestEligibility(AcademicResourceRequest request);

    /**
     * Validates that the user has authorization and scope (institution/department) to allocate this request/resource.
     */
    void validateUserScope(User currentUser, AcademicResourceRequest request, Resource resource);

    /**
     * Validates all conflict constraints for a candidate resource.
     * Returns a list of conflict explanation strings (empty if eligible).
     */
    List<String> checkResourceConflicts(AcademicResourceRequest request, Resource resource, TimeSlot timeSlot);

    /**
     * Throws ConflictException or BadRequestException if the candidate resource violates any allocation rules.
     */
    void assertResourceEligible(AcademicResourceRequest request, Resource resource, TimeSlot timeSlot);
}
