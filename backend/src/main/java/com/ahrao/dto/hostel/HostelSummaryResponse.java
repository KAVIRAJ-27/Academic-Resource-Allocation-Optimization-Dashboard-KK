package com.ahrao.dto.hostel;

import com.ahrao.entity.enums.HostelType;
import java.time.Instant;

public class HostelSummaryResponse {
    private Long id;
    private Long institutionId;
    private String institutionName;
    private String name;
    private String code;
    private HostelType type;
    private String address;
    private Integer capacity;
    private String status;
    private long totalBlocks;
    private long totalFloors;
    private long totalRooms;
    private long totalBeds;
    private long availableBeds;
    private long occupiedBeds;
    private long maintenanceBeds;
    private Instant createdAt;

    public HostelSummaryResponse() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long institutionId) { this.institutionId = institutionId; }

    public String getInstitutionName() { return institutionName; }
    public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public HostelType getType() { return type; }
    public void setType(HostelType type) { this.type = type; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

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

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
