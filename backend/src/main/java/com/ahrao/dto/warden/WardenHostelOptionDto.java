package com.ahrao.dto.warden;

public class WardenHostelOptionDto {
    private Long id;
    private String name;
    private String code;
    private String type;
    private String address;
    private Integer capacity;
    private Long totalRooms;
    private Long totalBeds;
    private Long occupiedBeds;
    private Long availableBeds;
    private String status;

    public WardenHostelOptionDto() {
    }

    public WardenHostelOptionDto(Long id, String name, String code, String type, String address, Integer capacity, String status) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.type = type;
        this.address = address;
        this.capacity = capacity;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public Long getTotalRooms() {
        return totalRooms;
    }

    public void setTotalRooms(Long totalRooms) {
        this.totalRooms = totalRooms;
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
