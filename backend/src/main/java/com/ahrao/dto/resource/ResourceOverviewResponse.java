package com.ahrao.dto.resource;

import java.util.Map;

public class ResourceOverviewResponse {
    private long totalResources;
    private long availableResources;
    private long maintenanceResources;
    private long inactiveResources;
    private long allocatedResources;
    private long totalClassrooms;
    private long totalLaboratories;
    private long totalEquipment;
    private long totalTimeSlots;
    private long totalCategories;
    private Map<String, Long> resourcesByCategory;
    private Map<String, Long> resourcesByStatus;

    public ResourceOverviewResponse() {
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

    public long getAllocatedResources() {
        return allocatedResources;
    }

    public void setAllocatedResources(long allocatedResources) {
        this.allocatedResources = allocatedResources;
    }

    public long getTotalClassrooms() {
        return totalClassrooms;
    }

    public void setTotalClassrooms(long totalClassrooms) {
        this.totalClassrooms = totalClassrooms;
    }

    public long getTotalLaboratories() {
        return totalLaboratories;
    }

    public void setTotalLaboratories(long totalLaboratories) {
        this.totalLaboratories = totalLaboratories;
    }

    public long getTotalEquipment() {
        return totalEquipment;
    }

    public void setTotalEquipment(long totalEquipment) {
        this.totalEquipment = totalEquipment;
    }

    public long getTotalTimeSlots() {
        return totalTimeSlots;
    }

    public void setTotalTimeSlots(long totalTimeSlots) {
        this.totalTimeSlots = totalTimeSlots;
    }

    public long getTotalCategories() {
        return totalCategories;
    }

    public void setTotalCategories(long totalCategories) {
        this.totalCategories = totalCategories;
    }

    public Map<String, Long> getResourcesByCategory() {
        return resourcesByCategory;
    }

    public void setResourcesByCategory(Map<String, Long> resourcesByCategory) {
        this.resourcesByCategory = resourcesByCategory;
    }

    public Map<String, Long> getResourcesByStatus() {
        return resourcesByStatus;
    }

    public void setResourcesByStatus(Map<String, Long> resourcesByStatus) {
        this.resourcesByStatus = resourcesByStatus;
    }
}
