package com.ahrao.entity.hostel;

import com.ahrao.entity.enums.RoomType;
import jakarta.persistence.*;

@Entity
@Table(
    name = "hostel_rooms",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_rooms_floor_num", columnNames = {"hostel_floor_id", "room_number"})
    }
)
public class HostelRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hostel_floor_id", nullable = false)
    private HostelFloor floor;

    @Column(name = "room_number", nullable = false, length = 50)
    private String roomNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "room_type", nullable = false, length = 50)
    private RoomType roomType = RoomType.DOUBLE;

    @Column(name = "capacity", nullable = false)
    private Integer capacity = 2;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "AVAILABLE";

    public HostelRoom() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public HostelFloor getFloor() {
        return floor;
    }

    public void setFloor(HostelFloor floor) {
        this.floor = floor;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
