package com.ahrao.service.warden;

import com.ahrao.dto.warden.WardenOverviewDto;

public interface WardenOverviewService {
    WardenOverviewDto getWardenOverview(Long hostelId);
}
