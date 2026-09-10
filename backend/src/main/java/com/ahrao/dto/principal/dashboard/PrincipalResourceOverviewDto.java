package com.ahrao.dto.principal.dashboard;

public class PrincipalResourceOverviewDto {
    private long totalResources;
    private long availableResources;
    private long allocatedResources;
    private long maintenanceResources;
    private long inactiveResources;

    public PrincipalResourceOverviewDto() {
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
}
