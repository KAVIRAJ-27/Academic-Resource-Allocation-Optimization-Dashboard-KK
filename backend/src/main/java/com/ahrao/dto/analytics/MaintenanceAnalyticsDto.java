package com.ahrao.dto.analytics;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class MaintenanceAnalyticsDto {

    private long totalMaintenanceRequests;
    private long openMaintenance;
    private long assignedMaintenance;
    private long inProgressMaintenance;
    private long completedMaintenance;
    private long cancelledMaintenance;

    private double completionRate;
    private long pendingMaintenance;

    private Map<String, Long> maintenanceByStatus;
    private Map<String, Long> maintenanceByPriority;
    private Map<String, Long> maintenanceByHostel;
    private Map<String, Long> maintenanceByResource;
    private List<TimeSeriesPointDto> maintenanceOverTime = new ArrayList<>();

    public MaintenanceAnalyticsDto() {
    }

    public long getTotalMaintenanceRequests() {
        return totalMaintenanceRequests;
    }

    public void setTotalMaintenanceRequests(long totalMaintenanceRequests) {
        this.totalMaintenanceRequests = totalMaintenanceRequests;
    }

    public long getOpenMaintenance() {
        return openMaintenance;
    }

    public void setOpenMaintenance(long openMaintenance) {
        this.openMaintenance = openMaintenance;
    }

    public long getAssignedMaintenance() {
        return assignedMaintenance;
    }

    public void setAssignedMaintenance(long assignedMaintenance) {
        this.assignedMaintenance = assignedMaintenance;
    }

    public long getInProgressMaintenance() {
        return inProgressMaintenance;
    }

    public void setInProgressMaintenance(long inProgressMaintenance) {
        this.inProgressMaintenance = inProgressMaintenance;
    }

    public long getCompletedMaintenance() {
        return completedMaintenance;
    }

    public void setCompletedMaintenance(long completedMaintenance) {
        this.completedMaintenance = completedMaintenance;
    }

    public long getCancelledMaintenance() {
        return cancelledMaintenance;
    }

    public void setCancelledMaintenance(long cancelledMaintenance) {
        this.cancelledMaintenance = cancelledMaintenance;
    }

    public double getCompletionRate() {
        return completionRate;
    }

    public void setCompletionRate(double completionRate) {
        this.completionRate = completionRate;
    }

    public long getPendingMaintenance() {
        return pendingMaintenance;
    }

    public void setPendingMaintenance(long pendingMaintenance) {
        this.pendingMaintenance = pendingMaintenance;
    }

    public Map<String, Long> getMaintenanceByStatus() {
        return maintenanceByStatus;
    }

    public void setMaintenanceByStatus(Map<String, Long> maintenanceByStatus) {
        this.maintenanceByStatus = maintenanceByStatus;
    }

    public Map<String, Long> getMaintenanceByPriority() {
        return maintenanceByPriority;
    }

    public void setMaintenanceByPriority(Map<String, Long> maintenanceByPriority) {
        this.maintenanceByPriority = maintenanceByPriority;
    }

    public Map<String, Long> getMaintenanceByHostel() {
        return maintenanceByHostel;
    }

    public void setMaintenanceByHostel(Map<String, Long> maintenanceByHostel) {
        this.maintenanceByHostel = maintenanceByHostel;
    }

    public Map<String, Long> getMaintenanceByResource() {
        return maintenanceByResource;
    }

    public void setMaintenanceByResource(Map<String, Long> maintenanceByResource) {
        this.maintenanceByResource = maintenanceByResource;
    }

    public List<TimeSeriesPointDto> getMaintenanceOverTime() {
        return maintenanceOverTime;
    }

    public void setMaintenanceOverTime(List<TimeSeriesPointDto> maintenanceOverTime) {
        this.maintenanceOverTime = maintenanceOverTime;
    }
}
