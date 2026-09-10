package com.ahrao.dto.optimization;

import com.ahrao.dto.conflict.ConflictItemDto;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class OptimizationRecommendationDto {
    private int rank;
    private Long candidateId;
    private String candidateName;
    private String candidateCode;
    private double score;
    private boolean valid;
    private Map<String, Double> scoreBreakdown = new HashMap<>();
    private List<ScoreBreakdownDto> factors = new ArrayList<>();
    private List<String> reasons = new ArrayList<>();
    private List<ConflictItemDto> conflicts = new ArrayList<>();
    private Map<String, Object> details = new HashMap<>();

    public OptimizationRecommendationDto() {
        this.valid = true;
    }

    public int getRank() {
        return rank;
    }

    public void setRank(int rank) {
        this.rank = rank;
    }

    public Long getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(Long candidateId) {
        this.candidateId = candidateId;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }

    public String getCandidateCode() {
        return candidateCode;
    }

    public void setCandidateCode(String candidateCode) {
        this.candidateCode = candidateCode;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public Map<String, Double> getScoreBreakdown() {
        return scoreBreakdown;
    }

    public void setScoreBreakdown(Map<String, Double> scoreBreakdown) {
        this.scoreBreakdown = scoreBreakdown;
    }

    public List<ScoreBreakdownDto> getFactors() {
        return factors;
    }

    public void setFactors(List<ScoreBreakdownDto> factors) {
        this.factors = factors;
    }

    public List<String> getReasons() {
        return reasons;
    }

    public void setReasons(List<String> reasons) {
        this.reasons = reasons;
    }

    public List<ConflictItemDto> getConflicts() {
        return conflicts;
    }

    public void setConflicts(List<ConflictItemDto> conflicts) {
        this.conflicts = conflicts;
    }

    public Map<String, Object> getDetails() {
        return details;
    }

    public void setDetails(Map<String, Object> details) {
        this.details = details;
    }
}
