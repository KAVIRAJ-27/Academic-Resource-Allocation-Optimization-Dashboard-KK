package com.ahrao.dto.analytics;

import java.util.ArrayList;
import java.util.List;

public class RoomUtilizationDto {

    private long totalRooms;
    private long fullyOccupiedRooms;
    private long partiallyOccupiedRooms;
    private long emptyRooms;
    private long maintenanceRooms;
    private List<RoomOccupancyDetailDto> roomList = new ArrayList<>();

    public RoomUtilizationDto() {
    }

    public long getTotalRooms() {
        return totalRooms;
    }

    public void setTotalRooms(long totalRooms) {
        this.totalRooms = totalRooms;
    }

    public long getFullyOccupiedRooms() {
        return fullyOccupiedRooms;
    }

    public void setFullyOccupiedRooms(long fullyOccupiedRooms) {
        this.fullyOccupiedRooms = fullyOccupiedRooms;
    }

    public long getPartiallyOccupiedRooms() {
        return partiallyOccupiedRooms;
    }

    public void setPartiallyOccupiedRooms(long partiallyOccupiedRooms) {
        this.partiallyOccupiedRooms = partiallyOccupiedRooms;
    }

    public long getEmptyRooms() {
        return emptyRooms;
    }

    public void setEmptyRooms(long emptyRooms) {
        this.emptyRooms = emptyRooms;
    }

    public long getMaintenanceRooms() {
        return maintenanceRooms;
    }

    public void setMaintenanceRooms(long maintenanceRooms) {
        this.maintenanceRooms = maintenanceRooms;
    }

    public List<RoomOccupancyDetailDto> getRoomList() {
        return roomList;
    }

    public void setRoomList(List<RoomOccupancyDetailDto> roomList) {
        this.roomList = roomList;
    }

    public static class RoomOccupancyDetailDto {
        private Long roomId;
        private String roomNumber;
        private String roomType;
        private String hostelName;
        private String blockName;
        private Integer floorNumber;
        private int capacity;
        private int occupiedBeds;
        private int availableBeds;
        private double utilizationPercentage;
        private String status;

        public RoomOccupancyDetailDto() {
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

        public String getHostelName() {
            return hostelName;
        }

        public void setHostelName(String hostelName) {
            this.hostelName = hostelName;
        }

        public String getBlockName() {
            return blockName;
        }

        public void setBlockName(String blockName) {
            this.blockName = blockName;
        }

        public Integer getFloorNumber() {
            return floorNumber;
        }

        public void setFloorNumber(Integer floorNumber) {
            this.floorNumber = floorNumber;
        }

        public int getCapacity() {
            return capacity;
        }

        public void setCapacity(int capacity) {
            this.capacity = capacity;
        }

        public int getOccupiedBeds() {
            return occupiedBeds;
        }

        public void setOccupiedBeds(int occupiedBeds) {
            this.occupiedBeds = occupiedBeds;
        }

        public int getAvailableBeds() {
            return availableBeds;
        }

        public void setAvailableBeds(int availableBeds) {
            this.availableBeds = availableBeds;
        }

        public double getUtilizationPercentage() {
            return utilizationPercentage;
        }

        public void setUtilizationPercentage(double utilizationPercentage) {
            this.utilizationPercentage = utilizationPercentage;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}
