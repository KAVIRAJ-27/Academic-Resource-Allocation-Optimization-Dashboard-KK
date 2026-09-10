package com.ahrao.dto.hostel;

public class HostelBlockSummaryResponse {
    private Long id;
    private Long hostelId;
    private String hostelName;
    private String hostelCode;
    private String name;
    private String code;
    private Integer numberOfFloors;
    private String status;
    private long totalFloors;
    private long totalRooms;
    private long totalBeds;
    private long availableBeds;
    private long occupiedBeds;

    public HostelBlockSummaryResponse() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getHostelId() { return hostelId; }
    public void setHostelId(Long hostelId) { this.hostelId = hostelId; }

    public String getHostelName() { return hostelName; }
    public void setHostelName(String hostelName) { this.hostelName = hostelName; }

    public String getHostelCode() { return hostelCode; }
    public void setHostelCode(String hostelCode) { this.hostelCode = hostelCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public Integer getNumberOfFloors() { return numberOfFloors; }
    public void setNumberOfFloors(Integer numberOfFloors) { this.numberOfFloors = numberOfFloors; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

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
}
