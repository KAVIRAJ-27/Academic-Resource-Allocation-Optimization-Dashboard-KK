package com.ahrao.service.ai;

import com.ahrao.dto.ai.*;
import com.ahrao.entity.academic.Department;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.hod.HodDepartmentResolver;
import com.ahrao.service.warden.WardenScopeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional(readOnly = true)
public class AiInsightsServiceImpl implements AiInsightsService {

    private static final Logger log = LoggerFactory.getLogger(AiInsightsServiceImpl.class);

    private final AiClientService aiClient;
    private final AiDataPreparationService dataPrepService;
    private final HodDepartmentResolver hodDepartmentResolver;
    private final WardenScopeService wardenScopeService;

    public AiInsightsServiceImpl(
            AiClientService aiClient,
            AiDataPreparationService dataPrepService,
            HodDepartmentResolver hodDepartmentResolver,
            WardenScopeService wardenScopeService) {
        this.aiClient = aiClient;
        this.dataPrepService = dataPrepService;
        this.hodDepartmentResolver = hodDepartmentResolver;
        this.wardenScopeService = wardenScopeService;
    }

    // =========================================================================
    // Scope Enforcement Helpers
    // =========================================================================

    private Long resolveEffectiveDepartmentId(AiFilterParams params) {
        boolean isAdminOrPrincipal = SecurityUtils.hasAnyRole("ADMIN", "PRINCIPAL");
        if (SecurityUtils.hasRole("HOD") && !isAdminOrPrincipal) {
            Long userId = SecurityUtils.getCurrentUserId()
                    .orElseThrow(() -> new ForbiddenException("Authentication required"));
            Department dept = hodDepartmentResolver.resolveHodDepartment(userId);
            if (params != null && params.getDepartmentId() != null && !dept.getId().equals(params.getDepartmentId())) {
                throw new ForbiddenException("HOD is not authorized to access AI insights for department ID: " + params.getDepartmentId());
            }
            return dept.getId();
        }
        return params != null ? params.getDepartmentId() : null;
    }

    private List<Long> resolveEffectiveHostelIds(AiFilterParams params) {
        boolean isAdminOrPrincipal = SecurityUtils.hasAnyRole("ADMIN", "PRINCIPAL");
        if (SecurityUtils.hasRole("WARDEN") && !isAdminOrPrincipal) {
            Set<Long> authorized = wardenScopeService.getAuthorizedHostelIds();
            if (params != null && params.getHostelId() != null) {
                if (!authorized.contains(params.getHostelId())) {
                    throw new ForbiddenException("Warden is not authorized to access AI insights for hostel ID: " + params.getHostelId());
                }
                return List.of(params.getHostelId());
            }
            return new ArrayList<>(authorized);
        }
        if (params != null && params.getHostelId() != null) {
            return List.of(params.getHostelId());
        }
        return Collections.emptyList();
    }

    private AiPredictPayloadDto preparePayload(AiFilterParams params) {
        Long deptId = resolveEffectiveDepartmentId(params);
        List<Long> hostelIds = resolveEffectiveHostelIds(params);
        return dataPrepService.preparePredictPayload(params, deptId, hostelIds);
    }

    // =========================================================================
    // Endpoints Implementations with Fail-Safe Fallbacks
    // =========================================================================

    @Override
    public AiOverviewDto getOverview(AiFilterParams params) {
        AiPredictPayloadDto payload = preparePayload(params);
        AiOverviewDto result = aiClient.post("/predict/overview", payload, AiOverviewDto.class);

        if (result == null) {
            log.warn("AI Service unavailable or failed for /predict/overview. Returning fallback state.");
            AiOverviewDto fallback = new AiOverviewDto();
            fallback.setStatus("AI_SERVICE_UNAVAILABLE");
            fallback.setMessage("AI insights are temporarily unavailable. All operational allocation and approval systems remain fully functional.");
            return fallback;
        }

        if (result.getActivePredictionsCount() == 0 && payload.getAllocations().size() < 5) {
            result.setStatus("INSUFFICIENT_DATA");
            result.setMessage("Insufficient historical data for reliable prediction. More allocation records are required.");
        }

        return result;
    }

    @Override
    public List<AcademicDemandPredictionDto> getAcademicDemand(AiFilterParams params) {
        AiPredictPayloadDto payload = preparePayload(params);
        return aiClient.postForList("/predict/academic/demand", payload, AcademicDemandPredictionDto.class);
    }

    @Override
    public List<ResourceUtilizationPredictionDto> getAcademicUtilization(AiFilterParams params) {
        AiPredictPayloadDto payload = preparePayload(params);
        return aiClient.postForList("/predict/academic/utilization", payload, ResourceUtilizationPredictionDto.class);
    }

    @Override
    public List<ResourceShortageDto> getAcademicShortages(AiFilterParams params) {
        AiPredictPayloadDto payload = preparePayload(params);
        return aiClient.postForList("/predict/academic/shortage", payload, ResourceShortageDto.class);
    }

    @Override
    public List<BottleneckDto> getBottlenecks(AiFilterParams params) {
        AiPredictPayloadDto payload = preparePayload(params);
        return aiClient.postForList("/predict/academic/bottlenecks", payload, BottleneckDto.class);
    }

    @Override
    public List<FacultyWorkloadInsightDto> getWorkloadInsights(AiFilterParams params) {
        AiPredictPayloadDto payload = preparePayload(params);
        return aiClient.postForList("/predict/academic/workload", payload, FacultyWorkloadInsightDto.class);
    }

    @Override
    public List<HostelOccupancyPredictionDto> getHostelOccupancy(AiFilterParams params) {
        AiPredictPayloadDto payload = preparePayload(params);
        return aiClient.postForList("/predict/hostel/occupancy", payload, HostelOccupancyPredictionDto.class);
    }

    @Override
    public List<HostelShortageDto> getHostelShortages(AiFilterParams params) {
        AiPredictPayloadDto payload = preparePayload(params);
        return aiClient.postForList("/predict/hostel/shortage", payload, HostelShortageDto.class);
    }

    @Override
    public List<AnomalyDto> getAnomalies(AiFilterParams params) {
        AiPredictPayloadDto payload = preparePayload(params);
        return aiClient.postForList("/predict/anomalies", payload, AnomalyDto.class);
    }

    @Override
    public List<AiRecommendationDto> getRecommendations(AiFilterParams params) {
        AiPredictPayloadDto payload = preparePayload(params);
        return aiClient.postForList("/recommendations/generate", payload, AiRecommendationDto.class);
    }

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Object> trainModels(String modelType) {
        if (!SecurityUtils.hasRole("ADMIN")) {
            throw new ForbiddenException("Only institutional administrators can trigger model training");
        }

        Map<String, Object> request = Map.of(
                "model_type", modelType != null ? modelType : "academic-demand",
                "training_data", Map.of()
        );
        Map<String, Object> response = aiClient.post("/models/train", request, Map.class);
        return response != null ? response : Map.of("status", "ERROR", "message", "Model training service unreachable");
    }
}
