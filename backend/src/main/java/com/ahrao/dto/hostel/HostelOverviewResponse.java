package com.ahrao.dto.hostel;

public class HostelOverviewResponse {
    private long totalHostels;
    private long totalBlocks;
    private long totalFloors;
    private long totalRooms;
    private long totalBeds;
    private long availableBeds;
    private long occupiedBeds;
    private long maintenanceBeds;
    private long reservedBeds;
    private long inactiveBeds;
    private long totalFacilities;

    public HostelOverviewResponse() {
    }

    public long getTotalHostels() { return totalHostels; }
    public void setTotalHostels(long totalHostels) { this.totalHostels = totalHostels; }

    public long getTotalBlocks() { return totalBlocks; }
    public void setTotalBlocks(long totalBlocks) { this.totalBlocks = totalBlocks; }

    public long getTotalFloors() { return totalFloors; }
    public void setTotalFloors(long totalFloors) { this.totalFloors = totalFloors; }

    public long getTotalRooms() { return totalRooms; }
    public void setTotalRooms(long totalRooms) { this.totalRooms = totalRooms; }

    public long getTotalBeds() { return totalBeds; }
    public void setTotalBeds(long totalBeds) { this.totalBeds = totalBeds; }

    public long getAvailableBeds() { return availableBeds; }
    public void setAvailableBeds(long availableBeds) { this.availableBeds = availableBeds; }

    public long getOccupiedBeds() { return occupiedBeds; }
    public void setOccupiedBeds(long occupiedBeds) { this.occupiedBeds = occupiedBeds; }

    public long getMaintenanceBeds() { return maintenanceBeds; }
    public void setMaintenanceBeds(long maintenanceBeds) { this.maintenanceBeds = maintenanceBeds; }

    public long getReservedBeds() { return reservedBeds; }
    public void setReservedBeds(long reservedBeds) { this.reservedBeds = reservedBeds; }

    public long getInactiveBeds() { return inactiveBeds; }
    public void setInactiveBeds(long inactiveBeds) { this.inactiveBeds = inactiveBeds; }

    public long getTotalFacilities() { return totalFacilities; }
    public void setTotalFacilities(long totalFacilities) { this.totalFacilities = totalFacilities; }
}
