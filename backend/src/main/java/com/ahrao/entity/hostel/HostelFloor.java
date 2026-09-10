package com.ahrao.entity.hostel;

import jakarta.persistence.*;

@Entity
@Table(
    name = "hostel_floors",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_floors_block_num", columnNames = {"hostel_block_id", "floor_number"})
    }
)
public class HostelFloor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hostel_block_id", nullable = false)
    private HostelBlock block;

    @Column(name = "floor_number", nullable = false)
    private Integer floorNumber;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE";

    public HostelFloor() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public HostelBlock getBlock() {
        return block;
    }

    public void setBlock(HostelBlock block) {
        this.block = block;
    }

    public Integer getFloorNumber() {
        return floorNumber;
    }

    public void setFloorNumber(Integer floorNumber) {
        this.floorNumber = floorNumber;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
