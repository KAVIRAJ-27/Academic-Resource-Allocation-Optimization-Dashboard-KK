package com.ahrao.service.resource;

import com.ahrao.dto.resource.ResourceOverviewResponse;
import com.ahrao.dto.resource.ResourceReferenceDataResponse;

public interface ResourceOverviewService {
    ResourceOverviewResponse getOverview();
    ResourceReferenceDataResponse getReferenceData();
}
