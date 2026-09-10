package com.ahrao.dto.analytics;

import java.util.Map;

public class ConflictAnalyticsDto {

    private long totalConflictsDetected;
    private long criticalConflicts;
    private long highConflicts;
    private long mediumConflicts;
    private long lowConflicts;

    private Map<String, Long> conflictsByType;
    private Map<String, Long> conflictsByDepartment;
    private Map<String, Long> conflictsByResource;

    public ConflictAnalyticsDto() {
    }

    public long getTotalConflictsDetected() {
        return totalConflictsDetected;
    }

    public void setTotalConflictsDetected(long totalConflictsDetected) {
        this.totalConflictsDetected = totalConflictsDetected;
    }

    public long getCriticalConflicts() {
        return criticalConflicts;
    }

    public void setCriticalConflicts(long criticalConflicts) {
        this.criticalConflicts = criticalConflicts;
    }

    public long getHighConflicts() {
        return highConflicts;
    }

    public void setHighConflicts(long highConflicts) {
        this.highConflicts = highConflicts;
    }

    public long getMediumConflicts() {
        return mediumConflicts;
    }

    public void setMediumConflicts(long mediumConflicts) {
        this.mediumConflicts = mediumConflicts;
    }

    public long getLowConflicts() {
        return lowConflicts;
    }

    public void setLowConflicts(long lowConflicts) {
        this.lowConflicts = lowConflicts;
    }

    public Map<String, Long> getConflictsByType() {
        return conflictsByType;
    }

    public void setConflictsByType(Map<String, Long> conflictsByType) {
        this.conflictsByType = conflictsByType;
    }

    public Map<String, Long> getConflictsByDepartment() {
        return conflictsByDepartment;
    }

    public void setConflictsByDepartment(Map<String, Long> conflictsByDepartment) {
        this.conflictsByDepartment = conflictsByDepartment;
    }

    public Map<String, Long> getConflictsByResource() {
        return conflictsByResource;
    }

    public void setConflictsByResource(Map<String, Long> conflictsByResource) {
        this.conflictsByResource = conflictsByResource;
    }
}
