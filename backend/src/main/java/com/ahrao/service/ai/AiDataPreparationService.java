package com.ahrao.service.ai;

import com.ahrao.dto.ai.AiFilterParams;
import com.ahrao.dto.ai.AiPredictPayloadDto;

import java.util.List;

public interface AiDataPreparationService {
    AiPredictPayloadDto preparePredictPayload(AiFilterParams params, Long effectiveDepartmentId, List<Long> effectiveHostelIds);
}
