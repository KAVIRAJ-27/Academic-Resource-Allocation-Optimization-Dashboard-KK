package com.ahrao.entity.hostel;

import com.ahrao.entity.BaseAuditableEntity;
import com.ahrao.entity.enums.HostelBedStatus;
import jakarta.persistence.*;

@Entity
@Table(
    name = "hostel_beds",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_beds_room_num", columnNames = {"hostel_room_id", "bed_number"})
    }
)
public class HostelBed extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hostel_room_id", nullable = false)
    private HostelRoom room;

    @Column(name = "bed_number", nullable = false, length = 20)
    private String bedNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private HostelBedStatus status = HostelBedStatus.AVAILABLE;

    public HostelBed() {
    }

    public HostelRoom getRoom() {
        return room;
    }

    public void setRoom(HostelRoom room) {
        this.room = room;
    }

    public String getBedNumber() {
        return bedNumber;
    }

    public void setBedNumber(String bedNumber) {
        this.bedNumber = bedNumber;
    }

    public HostelBedStatus getStatus() {
        return status;
    }

    public void setStatus(HostelBedStatus status) {
        this.status = status;
    }
}
