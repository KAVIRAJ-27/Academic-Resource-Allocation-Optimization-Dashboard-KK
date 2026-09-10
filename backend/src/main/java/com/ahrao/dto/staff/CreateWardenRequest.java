package com.ahrao.dto.staff;

import jakarta.validation.constraints.*;
import java.util.List;

public class CreateWardenRequest {

    @NotBlank(message = "Employee ID is required")
    @Size(max = 50, message = "Employee ID must not exceed 50 characters")
    private String employeeId;

    @NotBlank(message = "Contact number is required")
    @Size(max = 25, message = "Contact number must not exceed 25 characters")
    private String contactNumber;

    private String status = "ACTIVE";

    private List<Long> hostelIds;

    // Option 1: Link existing user
    private Long userId;

    // Option 2: Provision new user account
    private String username;
    private String email;
    private String password;
    private String firstName;
    private String lastName;

    public CreateWardenRequest() {
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

    public List<Long> getHostelIds() {
        return hostelIds;
    }

    public void setHostelIds(List<Long> hostelIds) {
        this.hostelIds = hostelIds;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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
}
