package com.ahrao.dto.hostel;

import com.ahrao.entity.enums.HostelBedStatus;

public class HostelBedDto {
    private Long id;
    private Long hostelRoomId;
    private String roomNumber;
    private String bedNumber;
    private HostelBedStatus status;

    public HostelBedDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getHostelRoomId() { return hostelRoomId; }
    public void setHostelRoomId(Long hostelRoomId) { this.hostelRoomId = hostelRoomId; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public String getBedNumber() { return bedNumber; }
    public void setBedNumber(String bedNumber) { this.bedNumber = bedNumber; }

    public HostelBedStatus getStatus() { return status; }
    public void setStatus(HostelBedStatus status) { this.status = status; }
}
