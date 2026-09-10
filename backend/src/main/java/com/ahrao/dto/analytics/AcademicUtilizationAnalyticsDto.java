package com.ahrao.dto.analytics;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class AcademicUtilizationAnalyticsDto {

    private long totalResources;
    private long availableResources;
    private long allocatedResources;
    private long maintenanceResources;
    private long inactiveResources;
    private double utilizationPercentage;

    private Map<String, Long> resourcesByCategory;
    private Map<String, Double> utilizationByCategory;
    private List<RankedResourceDto> topUtilizedResources = new ArrayList<>();
    private List<RankedResourceDto> lowestUtilizedResources = new ArrayList<>();
    private List<TimeSeriesPointDto> utilizationTrends = new ArrayList<>();

    public AcademicUtilizationAnalyticsDto() {
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

    public long getInactiveResources() {
        return inactiveResources;
    }

    public void setInactiveResources(long inactiveResources) {
        this.inactiveResources = inactiveResources;
    }

    public double getUtilizationPercentage() {
        return utilizationPercentage;
    }

    public void setUtilizationPercentage(double utilizationPercentage) {
        this.utilizationPercentage = utilizationPercentage;
    }

    public Map<String, Long> getResourcesByCategory() {
        return resourcesByCategory;
    }

    public void setResourcesByCategory(Map<String, Long> resourcesByCategory) {
        this.resourcesByCategory = resourcesByCategory;
    }

    public Map<String, Double> getUtilizationByCategory() {
        return utilizationByCategory;
    }

    public void setUtilizationByCategory(Map<String, Double> utilizationByCategory) {
        this.utilizationByCategory = utilizationByCategory;
    }

    public List<RankedResourceDto> getTopUtilizedResources() {
        return topUtilizedResources;
    }

    public void setTopUtilizedResources(List<RankedResourceDto> topUtilizedResources) {
        this.topUtilizedResources = topUtilizedResources;
    }

    public List<RankedResourceDto> getLowestUtilizedResources() {
        return lowestUtilizedResources;
    }

    public void setLowestUtilizedResources(List<RankedResourceDto> lowestUtilizedResources) {
        this.lowestUtilizedResources = lowestUtilizedResources;
    }

    public List<TimeSeriesPointDto> getUtilizationTrends() {
        return utilizationTrends;
    }

    public void setUtilizationTrends(List<TimeSeriesPointDto> utilizationTrends) {
        this.utilizationTrends = utilizationTrends;
    }
}
