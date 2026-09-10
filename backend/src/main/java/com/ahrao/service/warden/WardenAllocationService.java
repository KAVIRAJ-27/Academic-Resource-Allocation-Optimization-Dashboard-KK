package com.ahrao.service.warden;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.warden.CreateHostelAllocationRequest;
import com.ahrao.dto.warden.WardenAllocationDetailDto;
import com.ahrao.dto.warden.WardenAllocationSummaryDto;
import com.ahrao.entity.enums.AllocationStatus;
import org.springframework.data.domain.Pageable;

public interface WardenAllocationService {
    PagedResponse<WardenAllocationSummaryDto> getAllocations(
            Long hostelId,
            Long blockId,
            Integer floorNumber,
            Long roomId,
            AllocationStatus status,
            String search,
            Pageable pageable);

    WardenAllocationDetailDto getAllocationById(Long allocationId);

    WardenAllocationSummaryDto createAllocation(
            CreateHostelAllocationRequest request,
            String ipAddress,
            String userAgent);

    WardenAllocationSummaryDto releaseAllocation(
            Long allocationId,
            String ipAddress,
            String userAgent);
}
