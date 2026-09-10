package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.ai.*;
import com.ahrao.service.ai.AiInsightsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'HOD', 'WARDEN', 'FACULTY', 'STUDENT')")
public class AiController {

    private final AiInsightsService aiService;

    public AiController(AiInsightsService aiService) {
        this.aiService = aiService;
    }

    // =========================================================================
    // 1. AI EXECUTIVE OVERVIEW
    // =========================================================================

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<AiOverviewDto>> getOverview(AiFilterParams params) {
        AiOverviewDto dto = aiService.getOverview(params);
        return ResponseEntity.ok(ApiResponse.success("AI overview and predictive insights retrieved", dto));
    }

    // =========================================================================
    // 2. ACADEMIC PREDICTIONS & INSIGHTS
    // =========================================================================

    @GetMapping("/academic/demand")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY')")
    public ResponseEntity<ApiResponse<List<AcademicDemandPredictionDto>>> getAcademicDemand(AiFilterParams params) {
        List<AcademicDemandPredictionDto> list = aiService.getAcademicDemand(params);
        return ResponseEntity.ok(ApiResponse.success("Academic resource demand forecast retrieved", list));
    }

    @GetMapping("/academic/utilization")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY')")
    public ResponseEntity<ApiResponse<List<ResourceUtilizationPredictionDto>>> getAcademicUtilization(AiFilterParams params) {
        List<ResourceUtilizationPredictionDto> list = aiService.getAcademicUtilization(params);
        return ResponseEntity.ok(ApiResponse.success("Resource utilization forecast retrieved", list));
    }

    @GetMapping("/academic/shortage")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY')")
    public ResponseEntity<ApiResponse<List<ResourceShortageDto>>> getAcademicShortages(AiFilterParams params) {
        List<ResourceShortageDto> list = aiService.getAcademicShortages(params);
        return ResponseEntity.ok(ApiResponse.success("Academic resource shortage risks evaluated", list));
    }

    @GetMapping("/academic/bottlenecks")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY')")
    public ResponseEntity<ApiResponse<List<BottleneckDto>>> getBottlenecks(AiFilterParams params) {
        List<BottleneckDto> list = aiService.getBottlenecks(params);
        return ResponseEntity.ok(ApiResponse.success("Institutional resource bottlenecks detected", list));
    }

    @GetMapping("/academic/workload")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY')")
    public ResponseEntity<ApiResponse<List<FacultyWorkloadInsightDto>>> getWorkloadInsights(AiFilterParams params) {
        List<FacultyWorkloadInsightDto> list = aiService.getWorkloadInsights(params);
        return ResponseEntity.ok(ApiResponse.success("Faculty workload distribution insights retrieved", list));
    }

    // =========================================================================
    // 3. HOSTEL PREDICTIONS & OCCUPANCY
    // =========================================================================

    @GetMapping("/hostel/occupancy")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'WARDEN', 'STUDENT')")
    public ResponseEntity<ApiResponse<List<HostelOccupancyPredictionDto>>> getHostelOccupancy(AiFilterParams params) {
        List<HostelOccupancyPredictionDto> list = aiService.getHostelOccupancy(params);
        return ResponseEntity.ok(ApiResponse.success("Hostel residential occupancy forecast retrieved", list));
    }

    @GetMapping("/hostel/demand")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'WARDEN', 'STUDENT')")
    public ResponseEntity<ApiResponse<List<HostelOccupancyPredictionDto>>> getHostelDemand(AiFilterParams params) {
        List<HostelOccupancyPredictionDto> list = aiService.getHostelOccupancy(params);
        return ResponseEntity.ok(ApiResponse.success("Hostel bed demand forecast retrieved", list));
    }

    @GetMapping("/hostel/shortage")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'WARDEN')")
    public ResponseEntity<ApiResponse<List<HostelShortageDto>>> getHostelShortages(AiFilterParams params) {
        List<HostelShortageDto> list = aiService.getHostelShortages(params);
        return ResponseEntity.ok(ApiResponse.success("Hostel bed shortage risk evaluated", list));
    }

    // =========================================================================
    // 4. ANOMALIES & RECOMMENDATIONS
    // =========================================================================

    @GetMapping("/anomalies")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'HOD', 'WARDEN')")
    public ResponseEntity<ApiResponse<List<AnomalyDto>>> getAnomalies(AiFilterParams params) {
        List<AnomalyDto> list = aiService.getAnomalies(params);
        return ResponseEntity.ok(ApiResponse.success("Operational system anomalies detected", list));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<ApiResponse<List<AiRecommendationDto>>> getRecommendations(AiFilterParams params) {
        List<AiRecommendationDto> list = aiService.getRecommendations(params);
        return ResponseEntity.ok(ApiResponse.success("AI decision-support recommendations retrieved", list));
    }

    @PostMapping("/recommendations/generate")
    public ResponseEntity<ApiResponse<List<AiRecommendationDto>>> generateRecommendations(@RequestBody(required = false) AiFilterParams params) {
        List<AiRecommendationDto> list = aiService.getRecommendations(params);
        return ResponseEntity.ok(ApiResponse.success("AI decision-support recommendations generated", list));
    }

    // =========================================================================
    // 5. MODEL GOVERNANCE & TRAINING (ADMIN ONLY)
    // =========================================================================

    @PostMapping("/models/train")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> trainModels(@RequestParam(required = false, defaultValue = "academic-demand") String modelType) {
        Map<String, Object> result = aiService.trainModels(modelType);
        return ResponseEntity.ok(ApiResponse.success("Model training initiated successfully", result));
    }
}
