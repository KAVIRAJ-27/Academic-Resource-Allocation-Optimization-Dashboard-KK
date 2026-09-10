package com.ahrao.entity.resource;

import jakarta.persistence.*;

@Entity
@Table(name = "classrooms")
public class Classroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", nullable = false, unique = true)
    private Resource resource;

    @Column(name = "building", nullable = false, length = 100)
    private String building;

    @Column(name = "floor", nullable = false, length = 20)
    private String floor;

    @Column(name = "room_number", nullable = false, length = 50)
    private String roomNumber;

    @Column(name = "capacity", nullable = false)
    private Integer capacity = 60;

    @Column(name = "room_type", nullable = false, length = 50)
    private String roomType = "LECTURE_HALL";

    @Column(name = "has_projector", nullable = false)
    private Boolean hasProjector = true;

    @Column(name = "has_ac", nullable = false)
    private Boolean hasAc = false;

    @Column(name = "has_smart_board", nullable = false)
    private Boolean hasSmartBoard = false;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "AVAILABLE";

    public Classroom() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Resource getResource() {
        return resource;
    }

    public void setResource(Resource resource) {
        this.resource = resource;
    }

    public String getBuilding() {
        return building;
    }

    public void setBuilding(String building) {
        this.building = building;
    }

    public String getFloor() {
        return floor;
    }

    public void setFloor(String floor) {
        this.floor = floor;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getRoomType() {
        return roomType;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public Boolean getHasProjector() {
        return hasProjector;
    }

    public void setHasProjector(Boolean hasProjector) {
        this.hasProjector = hasProjector;
    }

    public Boolean getHasAc() {
        return hasAc;
    }

    public void setHasAc(Boolean hasAc) {
        this.hasAc = hasAc;
    }

    public Boolean getHasSmartBoard() {
        return hasSmartBoard;
    }

    public void setHasSmartBoard(Boolean hasSmartBoard) {
        this.hasSmartBoard = hasSmartBoard;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
