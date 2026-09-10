package com.ahrao.service.warden;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.warden.UpdateFacilityRequest;
import com.ahrao.dto.warden.WardenFacilityDetailDto;
import com.ahrao.dto.warden.WardenFacilitySummaryDto;

public interface WardenResourceService {
    PagedResponse<WardenFacilitySummaryDto> getFacilities(
            Long hostelId,
            String status,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDir);

    WardenFacilityDetailDto getFacilityById(Long id);

    WardenFacilityDetailDto updateFacility(
            Long id,
            UpdateFacilityRequest request,
            String ipAddress,
            String userAgent);
}
