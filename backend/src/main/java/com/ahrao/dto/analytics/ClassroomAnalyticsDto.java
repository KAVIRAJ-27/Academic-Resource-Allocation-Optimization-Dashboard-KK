package com.ahrao.dto.analytics;

import java.util.ArrayList;
import java.util.List;

public class ClassroomAnalyticsDto {

    private long totalClassrooms;
    private long availableClassrooms;
    private long allocatedClassrooms;
    private long maintenanceClassrooms;
    private double classroomUtilizationPercentage;
    private double averageCapacityUtilization;
    private List<RankedResourceDto> highestUtilizedClassrooms = new ArrayList<>();
    private List<RankedResourceDto> lowestUtilizedClassrooms = new ArrayList<>();
    private List<TimeSeriesPointDto> classroomUsageTrends = new ArrayList<>();

    public ClassroomAnalyticsDto() {
    }

    public long getTotalClassrooms() {
        return totalClassrooms;
    }

    public void setTotalClassrooms(long totalClassrooms) {
        this.totalClassrooms = totalClassrooms;
    }

    public long getAvailableClassrooms() {
        return availableClassrooms;
    }

    public void setAvailableClassrooms(long availableClassrooms) {
        this.availableClassrooms = availableClassrooms;
    }

    public long getAllocatedClassrooms() {
        return allocatedClassrooms;
    }

    public void setAllocatedClassrooms(long allocatedClassrooms) {
        this.allocatedClassrooms = allocatedClassrooms;
    }

    public long getMaintenanceClassrooms() {
        return maintenanceClassrooms;
    }

    public void setMaintenanceClassrooms(long maintenanceClassrooms) {
        this.maintenanceClassrooms = maintenanceClassrooms;
    }

    public double getClassroomUtilizationPercentage() {
        return classroomUtilizationPercentage;
    }

    public void setClassroomUtilizationPercentage(double classroomUtilizationPercentage) {
        this.classroomUtilizationPercentage = classroomUtilizationPercentage;
    }

    public double getAverageCapacityUtilization() {
        return averageCapacityUtilization;
    }

    public void setAverageCapacityUtilization(double averageCapacityUtilization) {
        this.averageCapacityUtilization = averageCapacityUtilization;
    }

    public List<RankedResourceDto> getHighestUtilizedClassrooms() {
        return highestUtilizedClassrooms;
    }

    public void setHighestUtilizedClassrooms(List<RankedResourceDto> highestUtilizedClassrooms) {
        this.highestUtilizedClassrooms = highestUtilizedClassrooms;
    }

    public List<RankedResourceDto> getLowestUtilizedClassrooms() {
        return lowestUtilizedClassrooms;
    }

    public void setLowestUtilizedClassrooms(List<RankedResourceDto> lowestUtilizedClassrooms) {
        this.lowestUtilizedClassrooms = lowestUtilizedClassrooms;
    }

    public List<TimeSeriesPointDto> getClassroomUsageTrends() {
        return classroomUsageTrends;
    }

    public void setClassroomUsageTrends(List<TimeSeriesPointDto> classroomUsageTrends) {
        this.classroomUsageTrends = classroomUsageTrends;
    }
}
