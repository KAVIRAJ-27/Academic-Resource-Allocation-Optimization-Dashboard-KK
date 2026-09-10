package com.ahrao.dto.warden;

public class WardenOverviewDto {
    private Long totalBeds = 0L;
    private Long occupiedBeds = 0L;
    private Long availableBeds = 0L;
    private Long residentStudents = 0L;
    private Long totalFacilities = 0L;
    private Long activeFacilities = 0L;
    private Long openComplaints = 0L;
    private Long inProgressComplaints = 0L;
    private Long resolvedComplaints = 0L;
    private Long openMaintenance = 0L;
    private Long inProgressMaintenance = 0L;
    private Long completedMaintenance = 0L;

    public WardenOverviewDto() {
    }

    public Long getTotalBeds() {
        return totalBeds;
    }

    public void setTotalBeds(Long totalBeds) {
        this.totalBeds = totalBeds;
    }

    public Long getOccupiedBeds() {
        return occupiedBeds;
    }

    public void setOccupiedBeds(Long occupiedBeds) {
        this.occupiedBeds = occupiedBeds;
    }

    public Long getAvailableBeds() {
        return availableBeds;
    }

    public void setAvailableBeds(Long availableBeds) {
        this.availableBeds = availableBeds;
    }

    public Long getResidentStudents() {
        return residentStudents;
    }

    public void setResidentStudents(Long residentStudents) {
        this.residentStudents = residentStudents;
    }

    public Long getTotalFacilities() {
        return totalFacilities;
    }

    public void setTotalFacilities(Long totalFacilities) {
        this.totalFacilities = totalFacilities;
    }

    public Long getActiveFacilities() {
        return activeFacilities;
    }

    public void setActiveFacilities(Long activeFacilities) {
        this.activeFacilities = activeFacilities;
    }

    public Long getOpenComplaints() {
        return openComplaints;
    }

    public void setOpenComplaints(Long openComplaints) {
        this.openComplaints = openComplaints;
    }

    public Long getInProgressComplaints() {
        return inProgressComplaints;
    }

    public void setInProgressComplaints(Long inProgressComplaints) {
        this.inProgressComplaints = inProgressComplaints;
    }

    public Long getResolvedComplaints() {
        return resolvedComplaints;
    }

    public void setResolvedComplaints(Long resolvedComplaints) {
        this.resolvedComplaints = resolvedComplaints;
    }

    public Long getOpenMaintenance() {
        return openMaintenance;
    }

    public void setOpenMaintenance(Long openMaintenance) {
        this.openMaintenance = openMaintenance;
    }

    public Long getInProgressMaintenance() {
        return inProgressMaintenance;
    }

    public void setInProgressMaintenance(Long inProgressMaintenance) {
        this.inProgressMaintenance = inProgressMaintenance;
    }

    public Long getCompletedMaintenance() {
        return completedMaintenance;
    }

    public void setCompletedMaintenance(Long completedMaintenance) {
        this.completedMaintenance = completedMaintenance;
    }
}
