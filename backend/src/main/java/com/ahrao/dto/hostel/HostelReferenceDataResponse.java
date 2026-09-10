package com.ahrao.dto.hostel;

import java.util.ArrayList;
import java.util.List;

public class HostelReferenceDataResponse {
    private List<HostelBrief> hostels = new ArrayList<>();
    private List<BlockBrief> blocks = new ArrayList<>();
    private List<FloorBrief> floors = new ArrayList<>();
    private List<RoomBrief> rooms = new ArrayList<>();
    private List<String> roomTypes = new ArrayList<>();
    private List<String> hostelTypes = new ArrayList<>();
    private List<String> bedStatuses = new ArrayList<>();

    public HostelReferenceDataResponse() {
    }

    public static class HostelBrief {
        private Long id;
        private String code;
        private String name;
        private String type;

        public HostelBrief() {}
        public HostelBrief(Long id, String code, String name, String type) {
            this.id = id;
            this.code = code;
            this.name = name;
            this.type = type;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
    }

    public static class BlockBrief {
        private Long id;
        private Long hostelId;
        private String code;
        private String name;

        public BlockBrief() {}
        public BlockBrief(Long id, Long hostelId, String code, String name) {
            this.id = id;
            this.hostelId = hostelId;
            this.code = code;
            this.name = name;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getHostelId() { return hostelId; }
        public void setHostelId(Long hostelId) { this.hostelId = hostelId; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    public static class FloorBrief {
        private Long id;
        private Long blockId;
        private Integer floorNumber;
        private String name;

        public FloorBrief() {}
        public FloorBrief(Long id, Long blockId, Integer floorNumber, String name) {
            this.id = id;
            this.blockId = blockId;
            this.floorNumber = floorNumber;
            this.name = name;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getBlockId() { return blockId; }
        public void setBlockId(Long blockId) { this.blockId = blockId; }
        public Integer getFloorNumber() { return floorNumber; }
        public void setFloorNumber(Integer floorNumber) { this.floorNumber = floorNumber; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    public static class RoomBrief {
        private Long id;
        private Long floorId;
        private String roomNumber;
        private Integer capacity;

        public RoomBrief() {}
        public RoomBrief(Long id, Long floorId, String roomNumber, Integer capacity) {
            this.id = id;
            this.floorId = floorId;
            this.roomNumber = roomNumber;
            this.capacity = capacity;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getFloorId() { return floorId; }
        public void setFloorId(Long floorId) { this.floorId = floorId; }
        public String getRoomNumber() { return roomNumber; }
        public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
        public Integer getCapacity() { return capacity; }
        public void setCapacity(Integer capacity) { this.capacity = capacity; }
    }

    public List<HostelBrief> getHostels() { return hostels; }
    public void setHostels(List<HostelBrief> hostels) { this.hostels = hostels; }

    public List<BlockBrief> getBlocks() { return blocks; }
    public void setBlocks(List<BlockBrief> blocks) { this.blocks = blocks; }

    public List<FloorBrief> getFloors() { return floors; }
    public void setFloors(List<FloorBrief> floors) { this.floors = floors; }

    public List<RoomBrief> getRooms() { return rooms; }
    public void setRooms(List<RoomBrief> rooms) { this.rooms = rooms; }

    public List<String> getRoomTypes() { return roomTypes; }
    public void setRoomTypes(List<String> roomTypes) { this.roomTypes = roomTypes; }

    public List<String> getHostelTypes() { return hostelTypes; }
    public void setHostelTypes(List<String> hostelTypes) { this.hostelTypes = hostelTypes; }

    public List<String> getBedStatuses() { return bedStatuses; }
    public void setBedStatuses(List<String> bedStatuses) { this.bedStatuses = bedStatuses; }
}
