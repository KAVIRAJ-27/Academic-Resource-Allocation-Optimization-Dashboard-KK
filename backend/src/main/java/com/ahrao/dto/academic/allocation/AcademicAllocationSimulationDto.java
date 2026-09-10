package com.ahrao.dto.academic.allocation;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class AcademicAllocationSimulationDto {

    private Long requestId;
    private String requestTitle;
    private Integer requestedCapacity;
    private Instant requestedStartDatetime;
    private Instant requestedEndDatetime;
    private int candidateCount;
    private int eligibleCandidateCount;
    private AcademicCandidateResourceDto bestCandidate;
    private List<AcademicCandidateResourceDto> candidates = new ArrayList<>();

    public AcademicAllocationSimulationDto() {
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public String getRequestTitle() {
        return requestTitle;
    }

    public void setRequestTitle(String requestTitle) {
        this.requestTitle = requestTitle;
    }

    public Integer getRequestedCapacity() {
        return requestedCapacity;
    }

    public void setRequestedCapacity(Integer requestedCapacity) {
        this.requestedCapacity = requestedCapacity;
    }

    public Instant getRequestedStartDatetime() {
        return requestedStartDatetime;
    }

    public void setRequestedStartDatetime(Instant requestedStartDatetime) {
        this.requestedStartDatetime = requestedStartDatetime;
    }

    public Instant getRequestedEndDatetime() {
        return requestedEndDatetime;
    }

    public void setRequestedEndDatetime(Instant requestedEndDatetime) {
        this.requestedEndDatetime = requestedEndDatetime;
    }

    public int getCandidateCount() {
        return candidateCount;
    }

    public void setCandidateCount(int candidateCount) {
        this.candidateCount = candidateCount;
    }

    public int getEligibleCandidateCount() {
        return eligibleCandidateCount;
    }

    public void setEligibleCandidateCount(int eligibleCandidateCount) {
        this.eligibleCandidateCount = eligibleCandidateCount;
    }

    public AcademicCandidateResourceDto getBestCandidate() {
        return bestCandidate;
    }

    public void setBestCandidate(AcademicCandidateResourceDto bestCandidate) {
        this.bestCandidate = bestCandidate;
    }

    public List<AcademicCandidateResourceDto> getCandidates() {
        return candidates;
    }

    public void setCandidates(List<AcademicCandidateResourceDto> candidates) {
        this.candidates = candidates;
    }
}
