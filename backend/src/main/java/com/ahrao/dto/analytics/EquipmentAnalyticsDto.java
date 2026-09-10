package com.ahrao.dto.analytics;

import java.util.ArrayList;
import java.util.List;

public class EquipmentAnalyticsDto {

    private long totalEquipmentTypes;
    private long totalQuantity;
    private long allocatedQuantity;
    private long availableQuantity;
    private long maintenanceQuantity;
    private double equipmentUtilizationPercentage;
    private List<RankedResourceDto> equipmentList = new ArrayList<>();

    public EquipmentAnalyticsDto() {
    }

    public long getTotalEquipmentTypes() {
        return totalEquipmentTypes;
    }

    public void setTotalEquipmentTypes(long totalEquipmentTypes) {
        this.totalEquipmentTypes = totalEquipmentTypes;
    }

    public long getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(long totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public long getAllocatedQuantity() {
        return allocatedQuantity;
    }

    public void setAllocatedQuantity(long allocatedQuantity) {
        this.allocatedQuantity = allocatedQuantity;
    }

    public long getAvailableQuantity() {
        return availableQuantity;
    }

    public void setAvailableQuantity(long availableQuantity) {
        this.availableQuantity = availableQuantity;
    }

    public long getMaintenanceQuantity() {
        return maintenanceQuantity;
    }

    public void setMaintenanceQuantity(long maintenanceQuantity) {
        this.maintenanceQuantity = maintenanceQuantity;
    }

    public double getEquipmentUtilizationPercentage() {
        return equipmentUtilizationPercentage;
    }

    public void setEquipmentUtilizationPercentage(double equipmentUtilizationPercentage) {
        this.equipmentUtilizationPercentage = equipmentUtilizationPercentage;
    }

    public List<RankedResourceDto> getEquipmentList() {
        return equipmentList;
    }

    public void setEquipmentList(List<RankedResourceDto> equipmentList) {
        this.equipmentList = equipmentList;
    }
}
