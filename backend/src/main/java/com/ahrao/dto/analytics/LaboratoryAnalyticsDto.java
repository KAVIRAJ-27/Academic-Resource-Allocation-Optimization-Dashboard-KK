package com.ahrao.dto.analytics;

import java.util.ArrayList;
import java.util.List;

public class LaboratoryAnalyticsDto {

    private long totalLaboratories;
    private long availableLaboratories;
    private long allocatedLaboratories;
    private long maintenanceLaboratories;
    private double laboratoryUtilizationPercentage;
    private List<RankedResourceDto> mostUtilizedLabs = new ArrayList<>();
    private List<RankedResourceDto> leastUtilizedLabs = new ArrayList<>();
    private List<TimeSeriesPointDto> laboratoryUsageTrends = new ArrayList<>();

    public LaboratoryAnalyticsDto() {
    }

    public long getTotalLaboratories() {
        return totalLaboratories;
    }

    public void setTotalLaboratories(long totalLaboratories) {
        this.totalLaboratories = totalLaboratories;
    }

    public long getAvailableLaboratories() {
        return availableLaboratories;
    }

    public void setAvailableLaboratories(long availableLaboratories) {
        this.availableLaboratories = availableLaboratories;
    }

    public long getAllocatedLaboratories() {
        return allocatedLaboratories;
    }

    public void setAllocatedLaboratories(long allocatedLaboratories) {
        this.allocatedLaboratories = allocatedLaboratories;
    }

    public long getMaintenanceLaboratories() {
        return maintenanceLaboratories;
    }

    public void setMaintenanceLaboratories(long maintenanceLaboratories) {
        this.maintenanceLaboratories = maintenanceLaboratories;
    }

    public double getLaboratoryUtilizationPercentage() {
        return laboratoryUtilizationPercentage;
    }

    public void setLaboratoryUtilizationPercentage(double laboratoryUtilizationPercentage) {
        this.laboratoryUtilizationPercentage = laboratoryUtilizationPercentage;
    }

    public List<RankedResourceDto> getMostUtilizedLabs() {
        return mostUtilizedLabs;
    }

    public void setMostUtilizedLabs(List<RankedResourceDto> mostUtilizedLabs) {
        this.mostUtilizedLabs = mostUtilizedLabs;
    }

    public List<RankedResourceDto> getLeastUtilizedLabs() {
        return leastUtilizedLabs;
    }

    public void setLeastUtilizedLabs(List<RankedResourceDto> leastUtilizedLabs) {
        this.leastUtilizedLabs = leastUtilizedLabs;
    }

    public List<TimeSeriesPointDto> getLaboratoryUsageTrends() {
        return laboratoryUsageTrends;
    }

    public void setLaboratoryUsageTrends(List<TimeSeriesPointDto> laboratoryUsageTrends) {
        this.laboratoryUsageTrends = laboratoryUsageTrends;
    }
}
