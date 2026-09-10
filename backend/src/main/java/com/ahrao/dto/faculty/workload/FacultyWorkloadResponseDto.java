package com.ahrao.dto.faculty.workload;

import java.util.ArrayList;
import java.util.List;

public class FacultyWorkloadResponseDto {

    private FacultyWorkloadSummaryDto summary;
    private List<FacultyWorkloadBreakdownDto> breakdown = new ArrayList<>();
    private List<FacultyWorkloadHistoryDto> history = new ArrayList<>();

    public FacultyWorkloadResponseDto() {
    }

    public FacultyWorkloadSummaryDto getSummary() {
        return summary;
    }

    public void setSummary(FacultyWorkloadSummaryDto summary) {
        this.summary = summary;
    }

    public List<FacultyWorkloadBreakdownDto> getBreakdown() {
        return breakdown;
    }

    public void setBreakdown(List<FacultyWorkloadBreakdownDto> breakdown) {
        this.breakdown = breakdown != null ? breakdown : new ArrayList<>();
    }

    public List<FacultyWorkloadHistoryDto> getHistory() {
        return history;
    }

    public void setHistory(List<FacultyWorkloadHistoryDto> history) {
        this.history = history != null ? history : new ArrayList<>();
    }
}
