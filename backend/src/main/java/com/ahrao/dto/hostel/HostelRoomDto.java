package com.ahrao.dto.hostel;

import com.ahrao.entity.enums.RoomType;

public class HostelRoomDto {
    private Long id;
    private Long hostelFloorId;
    private String roomNumber;
    private RoomType roomType;
    private Integer capacity;
    private String status;

    public HostelRoomDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getHostelFloorId() { return hostelFloorId; }
    public void setHostelFloorId(Long hostelFloorId) { this.hostelFloorId = hostelFloorId; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public RoomType getRoomType() { return roomType; }
    public void setRoomType(RoomType roomType) { this.roomType = roomType; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
