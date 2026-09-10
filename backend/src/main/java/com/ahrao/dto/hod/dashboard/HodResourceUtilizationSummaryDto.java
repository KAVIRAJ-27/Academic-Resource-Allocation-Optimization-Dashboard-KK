package com.ahrao.dto.hod.dashboard;

public class HodResourceUtilizationSummaryDto {

    private long totalResources;
    private long availableCount;
    private long allocatedCount;
    private long maintenanceCount;
    private long inactiveCount;
    private double utilizationRate;

    public HodResourceUtilizationSummaryDto() {
    }

    public HodResourceUtilizationSummaryDto(long totalResources, long availableCount, long allocatedCount, long maintenanceCount, long inactiveCount) {
        this.totalResources = totalResources;
        this.availableCount = availableCount;
        this.allocatedCount = allocatedCount;
        this.maintenanceCount = maintenanceCount;
        this.inactiveCount = inactiveCount;
        if (totalResources > 0) {
            this.utilizationRate = Math.round(((double) allocatedCount / (double) totalResources) * 1000.0) / 10.0;
        } else {
            this.utilizationRate = 0.0;
        }
    }

    public long getTotalResources() {
        return totalResources;
    }

    public void setTotalResources(long totalResources) {
        this.totalResources = totalResources;
    }

    public long getAvailableCount() {
        return availableCount;
    }

    public void setAvailableCount(long availableCount) {
        this.availableCount = availableCount;
    }

    public long getAllocatedCount() {
        return allocatedCount;
    }

    public void setAllocatedCount(long allocatedCount) {
        this.allocatedCount = allocatedCount;
    }

    public long getMaintenanceCount() {
        return maintenanceCount;
    }

    public void setMaintenanceCount(long maintenanceCount) {
        this.maintenanceCount = maintenanceCount;
    }

    public long getInactiveCount() {
        return inactiveCount;
    }

    public void setInactiveCount(long inactiveCount) {
        this.inactiveCount = inactiveCount;
    }

    public double getUtilizationRate() {
        return utilizationRate;
    }

    public void setUtilizationRate(double utilizationRate) {
        this.utilizationRate = utilizationRate;
    }
}
