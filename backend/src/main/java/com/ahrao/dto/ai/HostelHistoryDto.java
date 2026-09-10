package com.ahrao.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public class HostelHistoryDto {
    @JsonProperty("hostel_id")
    private Long hostelId;
    @JsonProperty("hostel_name")
    private String hostelName;
    @JsonProperty("total_beds")
    private Integer totalBeds;
    @JsonProperty("occupied_beds")
    private Integer occupiedBeds;
    @JsonProperty("available_beds")
    private Integer availableBeds;
    @JsonProperty("pending_requests")
    private Integer pendingRequests = 0;
    @JsonProperty("complaint_count")
    private Integer complaintCount = 0;

    public HostelHistoryDto() {}

    public Long getHostelId() { return hostelId; }
    public void setHostelId(Long hostelId) { this.hostelId = hostelId; }

    public String getHostelName() { return hostelName; }
    public void setHostelName(String hostelName) { this.hostelName = hostelName; }

    public Integer getTotalBeds() { return totalBeds; }
    public void setTotalBeds(Integer totalBeds) { this.totalBeds = totalBeds; }

    public Integer getOccupiedBeds() { return occupiedBeds; }
    public void setOccupiedBeds(Integer occupiedBeds) { this.occupiedBeds = occupiedBeds; }

    public Integer getAvailableBeds() { return availableBeds; }
    public void setAvailableBeds(Integer availableBeds) { this.availableBeds = availableBeds; }

    public Integer getPendingRequests() { return pendingRequests; }
    public void setPendingRequests(Integer pendingRequests) { this.pendingRequests = pendingRequests; }

    public Integer getComplaintCount() { return complaintCount; }
    public void setComplaintCount(Integer complaintCount) { this.complaintCount = complaintCount; }
}
