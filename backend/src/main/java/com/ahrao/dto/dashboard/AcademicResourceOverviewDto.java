package com.ahrao.dto.dashboard;

public class AcademicResourceOverviewDto {
    private long totalResources;
    private long available;
    private long allocated;
    private long maintenance;
    private long inactive;
    private double utilizationRate;

    public AcademicResourceOverviewDto() {
    }

    public AcademicResourceOverviewDto(long totalResources, long available, long allocated,
                                       long maintenance, long inactive, double utilizationRate) {
        this.totalResources = totalResources;
        this.available = available;
        this.allocated = allocated;
        this.maintenance = maintenance;
        this.inactive = inactive;
        this.utilizationRate = utilizationRate;
    }

    public long getTotalResources() {
        return totalResources;
    }

    public void setTotalResources(long totalResources) {
        this.totalResources = totalResources;
    }

    public long getAvailable() {
        return available;
    }

    public void setAvailable(long available) {
        this.available = available;
    }

    public long getAllocated() {
        return allocated;
    }

    public void setAllocated(long allocated) {
        this.allocated = allocated;
    }

    public long getMaintenance() {
        return maintenance;
    }

    public void setMaintenance(long maintenance) {
        this.maintenance = maintenance;
    }

    public long getInactive() {
        return inactive;
    }

    public void setInactive(long inactive) {
        this.inactive = inactive;
    }

    public double getUtilizationRate() {
        return utilizationRate;
    }

    public void setUtilizationRate(double utilizationRate) {
        this.utilizationRate = utilizationRate;
    }
}
