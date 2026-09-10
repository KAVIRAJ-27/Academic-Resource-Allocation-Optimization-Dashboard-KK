package com.ahrao.dto.staff;

import com.ahrao.entity.enums.UserStatus;

import java.time.Instant;
import java.util.List;

public class WardenDetailsResponse {

    private Long id;
    private String employeeId;
    private String contactNumber;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;

    // User account details
    private Long userId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private UserStatus userStatus;
    private List<String> roles;
    private Instant userLastLoginAt;

    // Assigned hostels
    private List<HostelDetail> assignedHostels;

    public WardenDetailsResponse() {
    }

    public static class HostelDetail {
        private Long id;
        private String name;
        private String code;
        private String type;
        private String address;
        private Integer capacity;

        public HostelDetail() {
        }

        public HostelDetail(Long id, String name, String code, String type, String address, Integer capacity) {
            this.id = id;
            this.name = name;
            this.code = code;
            this.type = type;
            this.address = address;
            this.capacity = capacity;
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
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public UserStatus getUserStatus() {
        return userStatus;
    }

    public void setUserStatus(UserStatus userStatus) {
        this.userStatus = userStatus;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public Instant getUserLastLoginAt() {
        return userLastLoginAt;
    }

    public void setUserLastLoginAt(Instant userLastLoginAt) {
        this.userLastLoginAt = userLastLoginAt;
    }

    public List<HostelDetail> getAssignedHostels() {
        return assignedHostels;
    }

    public void setAssignedHostels(List<HostelDetail> assignedHostels) {
        this.assignedHostels = assignedHostels;
    }
}
