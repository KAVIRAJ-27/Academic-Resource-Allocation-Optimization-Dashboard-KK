package com.ahrao.dto.hostel.allocation;

import java.util.ArrayList;
import java.util.List;

public class HostelAllocationPreviewDto {

    private boolean eligible;
    private HostelCandidateDto recommendedBed;
    private int candidateCount;
    private List<HostelCandidateDto> eligibleCandidates = new ArrayList<>();
    private List<HostelCandidateDto> unavailableCandidates = new ArrayList<>();
    private List<HostelAllocationConflictDto> conflicts = new ArrayList<>();
    private com.ahrao.dto.conflict.ConflictResultDto conflictResult;
    private String reason;


    public HostelAllocationPreviewDto() {
    }

    public boolean isEligible() {
        return eligible;
    }

    public void setEligible(boolean eligible) {
        this.eligible = eligible;
    }

    public HostelCandidateDto getRecommendedBed() {
        return recommendedBed;
    }

    public void setRecommendedBed(HostelCandidateDto recommendedBed) {
        this.recommendedBed = recommendedBed;
    }

    public int getCandidateCount() {
        return candidateCount;
    }

    public void setCandidateCount(int candidateCount) {
        this.candidateCount = candidateCount;
    }

    public List<HostelCandidateDto> getEligibleCandidates() {
        return eligibleCandidates;
    }

    public void setEligibleCandidates(List<HostelCandidateDto> eligibleCandidates) {
        this.eligibleCandidates = eligibleCandidates;
    }

    public List<HostelCandidateDto> getUnavailableCandidates() {
        return unavailableCandidates;
    }

    public void setUnavailableCandidates(List<HostelCandidateDto> unavailableCandidates) {
        this.unavailableCandidates = unavailableCandidates;
    }

    public List<HostelAllocationConflictDto> getConflicts() {
        return conflicts;
    }

    public void setConflicts(List<HostelAllocationConflictDto> conflicts) {
        this.conflicts = conflicts;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public com.ahrao.dto.conflict.ConflictResultDto getConflictResult() {
        return conflictResult;
    }

    public void setConflictResult(com.ahrao.dto.conflict.ConflictResultDto conflictResult) {
        this.conflictResult = conflictResult;
    }
}

