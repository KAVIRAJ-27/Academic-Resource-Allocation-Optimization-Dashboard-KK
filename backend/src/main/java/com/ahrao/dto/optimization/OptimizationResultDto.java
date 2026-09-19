package com.ahrao.dto.optimization;

import java.util.ArrayList;
import java.util.List;

public class OptimizationResultDto {
    private boolean success;
    private Long requestId;
    private int totalCandidatesEvaluated;
    private int validCandidates;
    private String message;
    private List<OptimizationRecommendationDto> recommendations = new ArrayList<>();

    public OptimizationResultDto() {
    }

    public static OptimizationResultDto failure(Long requestId, int evaluated, String message) {
        OptimizationResultDto result = new OptimizationResultDto();
        result.setSuccess(false);
        result.setRequestId(requestId);
        result.setTotalCandidatesEvaluated(evaluated);
        result.setValidCandidates(0);
        result.setMessage(message != null ? message : "No valid allocation candidate was found.");
        result.setRecommendations(new ArrayList<>());
        return result;
    }

    public static OptimizationResultDto success(Long requestId, int evaluated, List<OptimizationRecommendationDto> recommendations, String message) {
        OptimizationResultDto result = new OptimizationResultDto();
        result.setSuccess(true);
        result.setRequestId(requestId);
        result.setTotalCandidatesEvaluated(evaluated);
        List<OptimizationRecommendationDto> safeRecommendations = recommendations != null ? recommendations : new ArrayList<>();
        result.setValidCandidates(safeRecommendations.size());
        result.setRecommendations(safeRecommendations);
        result.setMessage(message != null ? message : safeRecommendations.size() + " suitable allocation candidates found.");
        return result;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public int getTotalCandidatesEvaluated() {
        return totalCandidatesEvaluated;
    }

    public void setTotalCandidatesEvaluated(int totalCandidatesEvaluated) {
        this.totalCandidatesEvaluated = totalCandidatesEvaluated;
    }

    public int getValidCandidates() {
        return validCandidates;
    }

    public void setValidCandidates(int validCandidates) {
        this.validCandidates = validCandidates;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<OptimizationRecommendationDto> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<OptimizationRecommendationDto> recommendations) {
        this.recommendations = recommendations;
    }
}
