package com.ahrao.dto.analytics;

import java.util.ArrayList;
import java.util.List;

public class HostelOccupancyAnalyticsDto {

    private long totalHostels;
    private long totalBlocks;
    private long totalRooms;
    private long totalBeds;
    private long occupiedBeds;
    private long availableBeds;
    private long maintenanceBeds;
    private long reservedBeds;
    private long inactiveBeds;

    private double occupancyPercentage;
    private double availabilityPercentage;

    private List<HostelOccupancyItemDto> hostelOccupancies = new ArrayList<>();
    private List<BlockOccupancyItemDto> blockOccupancies = new ArrayList<>();
    private List<TimeSeriesPointDto> occupancyTrends = new ArrayList<>();

    public HostelOccupancyAnalyticsDto() {
    }

    public long getTotalHostels() {
        return totalHostels;
    }

    public void setTotalHostels(long totalHostels) {
        this.totalHostels = totalHostels;
    }

    public long getTotalBlocks() {
        return totalBlocks;
    }

    public void setTotalBlocks(long totalBlocks) {
        this.totalBlocks = totalBlocks;
    }

    public long getTotalRooms() {
        return totalRooms;
    }

    public void setTotalRooms(long totalRooms) {
        this.totalRooms = totalRooms;
    }

    public long getTotalBeds() {
        return totalBeds;
    }

    public void setTotalBeds(long totalBeds) {
        this.totalBeds = totalBeds;
    }

    public long getOccupiedBeds() {
        return occupiedBeds;
    }

    public void setOccupiedBeds(long occupiedBeds) {
        this.occupiedBeds = occupiedBeds;
    }

    public long getAvailableBeds() {
        return availableBeds;
    }

    public void setAvailableBeds(long availableBeds) {
        this.availableBeds = availableBeds;
    }

    public long getMaintenanceBeds() {
        return maintenanceBeds;
    }

    public void setMaintenanceBeds(long maintenanceBeds) {
        this.maintenanceBeds = maintenanceBeds;
    }

    public long getReservedBeds() {
        return reservedBeds;
    }

    public void setReservedBeds(long reservedBeds) {
        this.reservedBeds = reservedBeds;
    }

    public long getInactiveBeds() {
        return inactiveBeds;
    }

    public void setInactiveBeds(long inactiveBeds) {
        this.inactiveBeds = inactiveBeds;
    }

    public double getOccupancyPercentage() {
        return occupancyPercentage;
    }

    public void setOccupancyPercentage(double occupancyPercentage) {
        this.occupancyPercentage = occupancyPercentage;
    }

    public double getAvailabilityPercentage() {
        return availabilityPercentage;
    }

    public void setAvailabilityPercentage(double availabilityPercentage) {
        this.availabilityPercentage = availabilityPercentage;
    }

    public List<HostelOccupancyItemDto> getHostelOccupancies() {
        return hostelOccupancies;
    }

    public void setHostelOccupancies(List<HostelOccupancyItemDto> hostelOccupancies) {
        this.hostelOccupancies = hostelOccupancies;
    }

    public List<BlockOccupancyItemDto> getBlockOccupancies() {
        return blockOccupancies;
    }

    public void setBlockOccupancies(List<BlockOccupancyItemDto> blockOccupancies) {
        this.blockOccupancies = blockOccupancies;
    }

    public List<TimeSeriesPointDto> getOccupancyTrends() {
        return occupancyTrends;
    }

    public void setOccupancyTrends(List<TimeSeriesPointDto> occupancyTrends) {
        this.occupancyTrends = occupancyTrends;
    }

    public static class HostelOccupancyItemDto {
        private Long hostelId;
        private String hostelName;
        private String hostelType;
        private long totalRooms;
        private long totalBeds;
        private long occupiedBeds;
        private long availableBeds;
        private double occupancyPercentage;

        public HostelOccupancyItemDto() {
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

        public String getHostelType() {
            return hostelType;
        }

        public void setHostelType(String hostelType) {
            this.hostelType = hostelType;
        }

        public long getTotalRooms() {
            return totalRooms;
        }

        public void setTotalRooms(long totalRooms) {
            this.totalRooms = totalRooms;
        }

        public long getTotalBeds() {
            return totalBeds;
        }

        public void setTotalBeds(long totalBeds) {
            this.totalBeds = totalBeds;
        }

        public long getOccupiedBeds() {
            return occupiedBeds;
        }

        public void setOccupiedBeds(long occupiedBeds) {
            this.occupiedBeds = occupiedBeds;
        }

        public long getAvailableBeds() {
            return availableBeds;
        }

        public void setAvailableBeds(long availableBeds) {
            this.availableBeds = availableBeds;
        }

        public double getOccupancyPercentage() {
            return occupancyPercentage;
        }

        public void setOccupancyPercentage(double occupancyPercentage) {
            this.occupancyPercentage = occupancyPercentage;
        }
    }

    public static class BlockOccupancyItemDto {
        private Long blockId;
        private String blockName;
        private String hostelName;
        private long totalRooms;
        private long totalBeds;
        private long occupiedBeds;
        private long availableBeds;
        private double occupancyPercentage;

        public BlockOccupancyItemDto() {
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

        public String getHostelName() {
            return hostelName;
        }

        public void setHostelName(String hostelName) {
            this.hostelName = hostelName;
        }

        public long getTotalRooms() {
            return totalRooms;
        }

        public void setTotalRooms(long totalRooms) {
            this.totalRooms = totalRooms;
        }

        public long getTotalBeds() {
            return totalBeds;
        }

        public void setTotalBeds(long totalBeds) {
            this.totalBeds = totalBeds;
        }

        public long getOccupiedBeds() {
            return occupiedBeds;
        }

        public void setOccupiedBeds(long occupiedBeds) {
            this.occupiedBeds = occupiedBeds;
        }

        public long getAvailableBeds() {
            return availableBeds;
        }

        public void setAvailableBeds(long availableBeds) {
            this.availableBeds = availableBeds;
        }

        public double getOccupancyPercentage() {
            return occupancyPercentage;
        }

        public void setOccupancyPercentage(double occupancyPercentage) {
            this.occupancyPercentage = occupancyPercentage;
        }
    }
}
