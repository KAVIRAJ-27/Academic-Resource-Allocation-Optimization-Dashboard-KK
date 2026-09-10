package com.ahrao.service.principal;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.principal.allocation.PrincipalAllocationDetailDto;
import com.ahrao.dto.principal.allocation.PrincipalAllocationSummaryDto;
import com.ahrao.entity.enums.AllocationStatus;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface PrincipalAllocationService {

    PagedResponse<PrincipalAllocationSummaryDto> getInstitutionAllocations(
            Long userId,
            Long departmentId,
            Long resourceId,
            Long facultyId,
            Long subjectId,
            Long sectionId,
            AllocationStatus status,
            LocalDate date,
            Pageable pageable
    );

    PrincipalAllocationDetailDto getAllocationById(Long userId, Long allocationId);
}
