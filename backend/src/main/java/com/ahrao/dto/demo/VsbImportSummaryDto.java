package com.ahrao.dto.demo;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class VsbImportSummaryDto {

    private String status = "SUCCESS";
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private long durationMs;
    private String institutionName = "VSB Engineering College";
    private String institutionCode = "VSB";

    private Map<String, Integer> importedCounts = new HashMap<>();
    private List<String> validationErrors = new ArrayList<>();
    private List<String> businessRuleNotes = new ArrayList<>();

    public VsbImportSummaryDto() {
        this.startedAt = LocalDateTime.now();
    }

    public void incrementCount(String entityKey, int count) {
        importedCounts.put(entityKey, importedCounts.getOrDefault(entityKey, 0) + count);
    }

    public void recordError(String csvFile, int rowNumber, String field, String value, String reason) {
        validationErrors.add(String.format("[%s:row %d] field '%s'='%s' -> %s", csvFile, rowNumber, field, value, reason));
    }

    public void addBusinessNote(String note) {
        businessRuleNotes.add(note);
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public long getDurationMs() {
        return durationMs;
    }

    public void setDurationMs(long durationMs) {
        this.durationMs = durationMs;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public String getInstitutionCode() {
        return institutionCode;
    }

    public void setInstitutionCode(String institutionCode) {
        this.institutionCode = institutionCode;
    }

    public Map<String, Integer> getImportedCounts() {
        return importedCounts;
    }

    public void setImportedCounts(Map<String, Integer> importedCounts) {
        this.importedCounts = importedCounts;
    }

    public List<String> getValidationErrors() {
        return validationErrors;
    }

    public void setValidationErrors(List<String> validationErrors) {
        this.validationErrors = validationErrors;
    }

    public List<String> getBusinessRuleNotes() {
        return businessRuleNotes;
    }

    public void setBusinessRuleNotes(List<String> businessRuleNotes) {
        this.businessRuleNotes = businessRuleNotes;
    }
}
