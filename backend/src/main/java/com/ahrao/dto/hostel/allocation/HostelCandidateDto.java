package com.ahrao.dto.hostel.allocation;

import java.util.ArrayList;
import java.util.List;

public class HostelCandidateDto {

    private Long bedId;
    private String bedNumber;
    private Long roomId;
    private String roomNumber;
    private String roomType;
    private Integer capacity;
    private Long activeAllocations;
    private Long floorId;
    private Integer floorNumber;
    private Long blockId;
    private String blockName;
    private Long hostelId;
    private String hostelName;
    private boolean available;
    private List<String> conflicts = new ArrayList<>();

    public HostelCandidateDto() {
    }

    public HostelCandidateDto(Long bedId, String bedNumber, Long roomId, String roomNumber, String roomType,
                              Integer capacity, Long activeAllocations, Long floorId, Integer floorNumber,
                              Long blockId, String blockName, Long hostelId, String hostelName, boolean available) {
        this.bedId = bedId;
        this.bedNumber = bedNumber;
        this.roomId = roomId;
        this.roomNumber = roomNumber;
        this.roomType = roomType;
        this.capacity = capacity;
        this.activeAllocations = activeAllocations;
        this.floorId = floorId;
        this.floorNumber = floorNumber;
        this.blockId = blockId;
        this.blockName = blockName;
        this.hostelId = hostelId;
        this.hostelName = hostelName;
        this.available = available;
    }

    public Long getBedId() {
        return bedId;
    }

    public void setBedId(Long bedId) {
        this.bedId = bedId;
    }

    public String getBedNumber() {
        return bedNumber;
    }

    public void setBedNumber(String bedNumber) {
        this.bedNumber = bedNumber;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getRoomType() {
        return roomType;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public Long getActiveAllocations() {
        return activeAllocations;
    }

    public void setActiveAllocations(Long activeAllocations) {
        this.activeAllocations = activeAllocations;
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

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public List<String> getConflicts() {
        return conflicts;
    }

    public void setConflicts(List<String> conflicts) {
        this.conflicts = conflicts;
    }

    public void addConflict(String conflict) {
        if (this.conflicts == null) {
            this.conflicts = new ArrayList<>();
        }
        this.conflicts.add(conflict);
    }
}
