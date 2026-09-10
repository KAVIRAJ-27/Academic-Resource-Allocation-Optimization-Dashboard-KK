package com.ahrao.dto.staff;

import com.ahrao.entity.enums.UserStatus;

import java.time.Instant;
import java.util.List;

public class WardenSummaryResponse {

    private Long id;
    private Long userId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String employeeId;
    private String contactNumber;
    private String status;
    private UserStatus userStatus;

    private List<HostelOption> assignedHostels;

    private Instant createdAt;
    private Instant updatedAt;

    public WardenSummaryResponse() {
    }

    public WardenSummaryResponse(
            Long id,
            Long userId,
            String username,
            String email,
            String firstName,
            String lastName,
            String employeeId,
            String contactNumber,
            String status,
            UserStatus userStatus,
            List<HostelOption> assignedHostels,
            Instant createdAt,
            Instant updatedAt) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.employeeId = employeeId;
        this.contactNumber = contactNumber;
        this.status = status;
        this.userStatus = userStatus;
        this.assignedHostels = assignedHostels;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static class HostelOption {
        private Long id;
        private String name;
        private String code;
        private String type;

        public HostelOption() {
        }

        public HostelOption(Long id, String name, String code, String type) {
            this.id = id;
            this.name = name;
            this.code = code;
            this.type = type;
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
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public UserStatus getUserStatus() {
        return userStatus;
    }

    public void setUserStatus(UserStatus userStatus) {
        this.userStatus = userStatus;
    }

    public List<HostelOption> getAssignedHostels() {
        return assignedHostels;
    }

    public void setAssignedHostels(List<HostelOption> assignedHostels) {
        this.assignedHostels = assignedHostels;
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
}
