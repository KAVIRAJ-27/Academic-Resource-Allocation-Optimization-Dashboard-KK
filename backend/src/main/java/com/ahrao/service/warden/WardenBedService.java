package com.ahrao.service.warden;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.warden.WardenBedDetailDto;
import com.ahrao.dto.warden.WardenBedSummaryDto;
import com.ahrao.entity.enums.HostelBedStatus;
import org.springframework.data.domain.Pageable;

public interface WardenBedService {
    PagedResponse<WardenBedSummaryDto> getBeds(
            Long hostelId,
            Long blockId,
            Integer floorNumber,
            Long roomId,
            HostelBedStatus status,
            String search,
            Pageable pageable);

    WardenBedDetailDto getBedById(Long bedId);
}
