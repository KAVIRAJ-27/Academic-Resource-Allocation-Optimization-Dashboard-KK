package com.ahrao.service.hostel;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.hostel.allocation.*;
import com.ahrao.entity.user.User;
import org.springframework.data.domain.Pageable;

public interface HostelResourceAllocationService {

    HostelAllocationPreviewDto previewAllocation(HostelAllocationPreviewRequestDto request, User actor);

    HostelAllocationResponseDto autoAllocate(AutoHostelAllocationRequestDto request, User actor, String ipAddress, String userAgent);

    HostelAllocationResponseDto allocate(HostelAllocationRequestDto request, User actor, String ipAddress, String userAgent);

    HostelAllocationResponseDto releaseAllocation(Long id, User actor, String ipAddress, String userAgent);

    PagedResponse<HostelAllocationResponseDto> getAllocations(HostelAllocationFilterParams params, Pageable pageable, User actor);

    HostelAllocationResponseDto getAllocationById(Long id, User actor);
}
