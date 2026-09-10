package com.ahrao.dto.analytics;

public class AnalyticsOverviewDto {

    // Academic KPIs
    private long totalResources;
    private long availableResources;
    private long allocatedResources;
    private long maintenanceResources;
    private double overallResourceUtilization;
    private long totalAllocations;
    private long activeAllocations;
    private long totalRequests;
    private long pendingRequests;
    private double requestApprovalRate;

    // Hostel KPIs
    private long totalHostels;
    private long totalRooms;
    private long totalBeds;
    private long occupiedBeds;
    private long availableBeds;
    private double hostelOccupancyPercentage;
    private long pendingHostelRequests;
    private long openComplaints;
    private long pendingMaintenance;

    // Governance KPIs
    private long totalConflictsDetected;
    private double averageFacultyWorkloadHours;

    public AnalyticsOverviewDto() {
    }

    public long getTotalResources() {
        return totalResources;
    }

    public void setTotalResources(long totalResources) {
        this.totalResources = totalResources;
    }

    public long getAvailableResources() {
        return availableResources;
    }

    public void setAvailableResources(long availableResources) {
        this.availableResources = availableResources;
    }

    public long getAllocatedResources() {
        return allocatedResources;
    }

    public void setAllocatedResources(long allocatedResources) {
        this.allocatedResources = allocatedResources;
    }

    public long getMaintenanceResources() {
        return maintenanceResources;
    }

    public void setMaintenanceResources(long maintenanceResources) {
        this.maintenanceResources = maintenanceResources;
    }

    public double getOverallResourceUtilization() {
        return overallResourceUtilization;
    }

    public void setOverallResourceUtilization(double overallResourceUtilization) {
        this.overallResourceUtilization = overallResourceUtilization;
    }

    public long getTotalAllocations() {
        return totalAllocations;
    }

    public void setTotalAllocations(long totalAllocations) {
        this.totalAllocations = totalAllocations;
    }

    public long getActiveAllocations() {
        return activeAllocations;
    }

    public void setActiveAllocations(long activeAllocations) {
        this.activeAllocations = activeAllocations;
    }

    public long getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(long totalRequests) {
        this.totalRequests = totalRequests;
    }

    public long getPendingRequests() {
        return pendingRequests;
    }

    public void setPendingRequests(long pendingRequests) {
        this.pendingRequests = pendingRequests;
    }

    public double getRequestApprovalRate() {
        return requestApprovalRate;
    }

    public void setRequestApprovalRate(double requestApprovalRate) {
        this.requestApprovalRate = requestApprovalRate;
    }

    public long getTotalHostels() {
        return totalHostels;
    }

    public void setTotalHostels(long totalHostels) {
        this.totalHostels = totalHostels;
    }

    public long getTotalRooms() {
        return totalRooms;
    }

    public void setTotalRooms(long totalRooms) {
        this.totalRooms = totalRooms;
    }

    public long getTotalBeds() {
        return totalBeds;
    }

    public void setTotalBeds(long totalBeds) {
        this.totalBeds = totalBeds;
    }

    public long getOccupiedBeds() {
        return occupiedBeds;
    }

    public void setOccupiedBeds(long occupiedBeds) {
        this.occupiedBeds = occupiedBeds;
    }

    public long getAvailableBeds() {
        return availableBeds;
    }

    public void setAvailableBeds(long availableBeds) {
        this.availableBeds = availableBeds;
    }

    public double getHostelOccupancyPercentage() {
        return hostelOccupancyPercentage;
    }

    public void setHostelOccupancyPercentage(double hostelOccupancyPercentage) {
        this.hostelOccupancyPercentage = hostelOccupancyPercentage;
    }

    public long getPendingHostelRequests() {
        return pendingHostelRequests;
    }

    public void setPendingHostelRequests(long pendingHostelRequests) {
        this.pendingHostelRequests = pendingHostelRequests;
    }

    public long getOpenComplaints() {
        return openComplaints;
    }

    public void setOpenComplaints(long openComplaints) {
        this.openComplaints = openComplaints;
    }

    public long getPendingMaintenance() {
        return pendingMaintenance;
    }

    public void setPendingMaintenance(long pendingMaintenance) {
        this.pendingMaintenance = pendingMaintenance;
    }

    public long getTotalConflictsDetected() {
        return totalConflictsDetected;
    }

    public void setTotalConflictsDetected(long totalConflictsDetected) {
        this.totalConflictsDetected = totalConflictsDetected;
    }

    public double getAverageFacultyWorkloadHours() {
        return averageFacultyWorkloadHours;
    }

    public void setAverageFacultyWorkloadHours(double averageFacultyWorkloadHours) {
        this.averageFacultyWorkloadHours = averageFacultyWorkloadHours;
    }
}
