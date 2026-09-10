package com.ahrao.service.hod;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.hod.resource.HodResourceAllocationDetailDto;
import com.ahrao.dto.hod.resource.HodResourceAllocationOverviewKpiDto;
import com.ahrao.dto.hod.resource.HodResourceAllocationSummaryDto;
import com.ahrao.entity.enums.AllocationStatus;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface HodResourceAllocationService {

    PagedResponse<HodResourceAllocationSummaryDto> getDepartmentAllocations(
            Long userId,
            Long resourceId,
            Long allocatedToUserId,
            AllocationStatus status,
            LocalDate fromDate,
            LocalDate toDate,
            Pageable pageable
    );

    HodResourceAllocationDetailDto getAllocationDetails(Long userId, Long allocationId);

    HodResourceAllocationOverviewKpiDto getAllocationSummary(Long userId);
}
