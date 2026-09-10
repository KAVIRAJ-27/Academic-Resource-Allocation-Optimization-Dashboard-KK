package com.ahrao.config.optimization;

import org.springframework.stereotype.Component;

@Component
public class HostelOptimizationWeights {

    public static final double DEFAULT_HOSTEL_PREFERENCE = 30.0;
    public static final double DEFAULT_OCCUPANCY_BALANCE = 25.0;
    public static final double DEFAULT_ROOM_SUITABILITY = 20.0;
    public static final double DEFAULT_BED_AVAILABILITY = 15.0;
    public static final double DEFAULT_CAPACITY_EFFICIENCY = 10.0;

    private double hostelPreferenceWeight = DEFAULT_HOSTEL_PREFERENCE;
    private double occupancyBalanceWeight = DEFAULT_OCCUPANCY_BALANCE;
    private double roomSuitabilityWeight = DEFAULT_ROOM_SUITABILITY;
    private double bedAvailabilityWeight = DEFAULT_BED_AVAILABILITY;
    private double capacityEfficiencyWeight = DEFAULT_CAPACITY_EFFICIENCY;

    public HostelOptimizationWeights() {
    }

    public HostelOptimizationWeights(double hostelPreferenceWeight,
                                   double occupancyBalanceWeight,
                                   double roomSuitabilityWeight,
                                   double bedAvailabilityWeight,
                                   double capacityEfficiencyWeight) {
        this.hostelPreferenceWeight = hostelPreferenceWeight;
        this.occupancyBalanceWeight = occupancyBalanceWeight;
        this.roomSuitabilityWeight = roomSuitabilityWeight;
        this.bedAvailabilityWeight = bedAvailabilityWeight;
        this.capacityEfficiencyWeight = capacityEfficiencyWeight;
    }

    public double getHostelPreferenceWeight() {
        return hostelPreferenceWeight;
    }

    public void setHostelPreferenceWeight(double hostelPreferenceWeight) {
        this.hostelPreferenceWeight = hostelPreferenceWeight;
    }

    public double getOccupancyBalanceWeight() {
        return occupancyBalanceWeight;
    }

    public void setOccupancyBalanceWeight(double occupancyBalanceWeight) {
        this.occupancyBalanceWeight = occupancyBalanceWeight;
    }

    public double getRoomSuitabilityWeight() {
        return roomSuitabilityWeight;
    }

    public void setRoomSuitabilityWeight(double roomSuitabilityWeight) {
        this.roomSuitabilityWeight = roomSuitabilityWeight;
    }

    public double getBedAvailabilityWeight() {
        return bedAvailabilityWeight;
    }

    public void setBedAvailabilityWeight(double bedAvailabilityWeight) {
        this.bedAvailabilityWeight = bedAvailabilityWeight;
    }

    public double getCapacityEfficiencyWeight() {
        return capacityEfficiencyWeight;
    }

    public void setCapacityEfficiencyWeight(double capacityEfficiencyWeight) {
        this.capacityEfficiencyWeight = capacityEfficiencyWeight;
    }

    public double getTotalWeight() {
        return hostelPreferenceWeight + occupancyBalanceWeight + roomSuitabilityWeight + bedAvailabilityWeight + capacityEfficiencyWeight;
    }
}
