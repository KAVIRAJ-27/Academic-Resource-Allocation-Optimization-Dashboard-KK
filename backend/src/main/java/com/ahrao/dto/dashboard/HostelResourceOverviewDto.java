package com.ahrao.dto.dashboard;

public class HostelResourceOverviewDto {
    private long totalHostels;
    private long totalRooms;
    private long totalBeds;
    private long usableBeds;
    private long occupiedBeds;
    private long availableBeds;
    private long maintenanceBeds;
    private long reservedBeds;
    private long inactiveBeds;
    private double occupancyRate;

    public HostelResourceOverviewDto() {
    }

    public HostelResourceOverviewDto(long totalHostels, long totalRooms, long totalBeds, long usableBeds,
                                     long occupiedBeds, long availableBeds, long maintenanceBeds,
                                     long reservedBeds, long inactiveBeds, double occupancyRate) {
        this.totalHostels = totalHostels;
        this.totalRooms = totalRooms;
        this.totalBeds = totalBeds;
        this.usableBeds = usableBeds;
        this.occupiedBeds = occupiedBeds;
        this.availableBeds = availableBeds;
        this.maintenanceBeds = maintenanceBeds;
        this.reservedBeds = reservedBeds;
        this.inactiveBeds = inactiveBeds;
        this.occupancyRate = occupancyRate;
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

    public long getUsableBeds() {
        return usableBeds;
    }

    public void setUsableBeds(long usableBeds) {
        this.usableBeds = usableBeds;
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

    public long getMaintenanceBeds() {
        return maintenanceBeds;
    }

    public void setMaintenanceBeds(long maintenanceBeds) {
        this.maintenanceBeds = maintenanceBeds;
    }

    public long getReservedBeds() {
        return reservedBeds;
    }

    public void setReservedBeds(long reservedBeds) {
        this.reservedBeds = reservedBeds;
    }

    public long getInactiveBeds() {
        return inactiveBeds;
    }

    public void setInactiveBeds(long inactiveBeds) {
        this.inactiveBeds = inactiveBeds;
    }

    public double getOccupancyRate() {
        return occupancyRate;
    }

    public void setOccupancyRate(double occupancyRate) {
        this.occupancyRate = occupancyRate;
    }
}
