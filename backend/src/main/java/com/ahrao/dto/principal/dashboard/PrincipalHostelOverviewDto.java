package com.ahrao.dto.principal.dashboard;

public class PrincipalHostelOverviewDto {
    private long totalHostels;
    private long totalRooms;
    private long totalBeds;
    private long occupiedBeds;
    private long availableBeds;
    private long maintenanceBeds;
    private long reservedBeds;
    private long inactiveBeds;
    private Double occupancyRate;
    private String occupancyFormula;

    public PrincipalHostelOverviewDto() {
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

    public Double getOccupancyRate() {
        return occupancyRate;
    }

    public void setOccupancyRate(Double occupancyRate) {
        this.occupancyRate = occupancyRate;
    }

    public String getOccupancyFormula() {
        return occupancyFormula;
    }

    public void setOccupancyFormula(String occupancyFormula) {
        this.occupancyFormula = occupancyFormula;
    }
}
