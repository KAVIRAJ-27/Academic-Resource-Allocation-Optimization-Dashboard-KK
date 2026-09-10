package com.ahrao.entity.hostel;

import com.ahrao.entity.BaseAuditableEntity;
import com.ahrao.entity.user.User;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "wardens")
public class Warden extends BaseAuditableEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "employee_id", nullable = false, unique = true, length = 50)
    private String employeeId;

    @Column(name = "contact_number", nullable = false, length = 25)
    private String contactNumber;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE";

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "warden_hostels",
        joinColumns = @JoinColumn(name = "warden_id"),
        inverseJoinColumns = @JoinColumn(name = "hostel_id")
    )
    private Set<Hostel> assignedHostels = new HashSet<>();

    public Warden() {
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Set<Hostel> getAssignedHostels() {
        return assignedHostels;
    }

    public void setAssignedHostels(Set<Hostel> assignedHostels) {
        this.assignedHostels = assignedHostels;
    }
}
