package com.ahrao.dto.hostel;

import com.ahrao.entity.enums.HostelType;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class HostelDetailsResponse {
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
    private long reservedBeds;

    private List<HostelWardenBriefResponse> assignedWardens = new ArrayList<>();
    private List<HostelBlockSummaryResponse> blocks = new ArrayList<>();
    private List<HostelFacilitySummaryResponse> facilities = new ArrayList<>();

    private Instant createdAt;
    private Instant updatedAt;

    public HostelDetailsResponse() {
    }

    public static class HostelWardenBriefResponse {
        private Long wardenId;
        private Long userId;
        private String employeeId;
        private String name;
        private String email;
        private String contactNumber;

        public HostelWardenBriefResponse() {}

        public HostelWardenBriefResponse(Long wardenId, Long userId, String employeeId, String name, String email, String contactNumber) {
            this.wardenId = wardenId;
            this.userId = userId;
            this.employeeId = employeeId;
            this.name = name;
            this.email = email;
            this.contactNumber = contactNumber;
        }

        public Long getWardenId() { return wardenId; }
        public void setWardenId(Long wardenId) { this.wardenId = wardenId; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getEmployeeId() { return employeeId; }
        public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getContactNumber() { return contactNumber; }
        public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
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

    public long getReservedBeds() { return reservedBeds; }
    public void setReservedBeds(long reservedBeds) { this.reservedBeds = reservedBeds; }

    public List<HostelWardenBriefResponse> getAssignedWardens() { return assignedWardens; }
    public void setAssignedWardens(List<HostelWardenBriefResponse> assignedWardens) { this.assignedWardens = assignedWardens; }

    public List<HostelBlockSummaryResponse> getBlocks() { return blocks; }
    public void setBlocks(List<HostelBlockSummaryResponse> blocks) { this.blocks = blocks; }

    public List<HostelFacilitySummaryResponse> getFacilities() { return facilities; }
    public void setFacilities(List<HostelFacilitySummaryResponse> facilities) { this.facilities = facilities; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
