package com.ahrao.entity.hostel;

import com.ahrao.entity.BaseAuditableEntity;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.enums.HostelType;
import jakarta.persistence.*;

@Entity
@Table(name = "hostels")
public class Hostel extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 30)
    private HostelType type = HostelType.BOYS;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "capacity", nullable = false)
    private Integer capacity = 200;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE";

    public Hostel() {
    }

    public Institution getInstitution() {
        return institution;
    }

    public void setInstitution(Institution institution) {
        this.institution = institution;
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

    public HostelType getType() {
        return type;
    }

    public void setType(HostelType type) {
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
