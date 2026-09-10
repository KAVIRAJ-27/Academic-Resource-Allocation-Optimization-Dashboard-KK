package com.ahrao.dto.warden;

import com.ahrao.entity.enums.RoomType;

public class WardenRoomSummaryDto {
    private Long id;
    private String roomNumber;
    private Long floorId;
    private Integer floorNumber;
    private String floorName;
    private Long blockId;
    private String blockName;
    private String blockCode;
    private Long hostelId;
    private String hostelName;
    private RoomType roomType;
    private Integer capacity;
    private Long totalBeds;
    private Long occupiedBeds;
    private Long availableBeds;
    private String status;

    public WardenRoomSummaryDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public Long getFloorId() {
        return floorId;
    }

    public void setFloorId(Long floorId) {
        this.floorId = floorId;
    }

    public Integer getFloorNumber() {
        return floorNumber;
    }

    public void setFloorNumber(Integer floorNumber) {
        this.floorNumber = floorNumber;
    }

    public String getFloorName() {
        return floorName;
    }

    public void setFloorName(String floorName) {
        this.floorName = floorName;
    }

    public Long getBlockId() {
        return blockId;
    }

    public void setBlockId(Long blockId) {
        this.blockId = blockId;
    }

    public String getBlockName() {
        return blockName;
    }

    public void setBlockName(String blockName) {
        this.blockName = blockName;
    }

    public String getBlockCode() {
        return blockCode;
    }

    public void setBlockCode(String blockCode) {
        this.blockCode = blockCode;
    }

    public Long getHostelId() {
        return hostelId;
    }

    public void setHostelId(Long hostelId) {
        this.hostelId = hostelId;
    }

    public String getHostelName() {
        return hostelName;
    }

    public void setHostelName(String hostelName) {
        this.hostelName = hostelName;
    }

    public RoomType getRoomType() {
        return roomType;
    }

    public void setRoomType(RoomType roomType) {
        this.roomType = roomType;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
