package com.ahrao.dto.staff;

import jakarta.validation.constraints.*;
import java.util.List;

public class UpdateWardenRequest {

    @NotBlank(message = "Employee ID is required")
    @Size(max = 50, message = "Employee ID must not exceed 50 characters")
    private String employeeId;

    @NotBlank(message = "Contact number is required")
    @Size(max = 25, message = "Contact number must not exceed 25 characters")
    private String contactNumber;

    private String status;

    private List<Long> hostelIds;

    // Editable linked user details
    @Email(message = "Invalid email format")
    private String email;

    private String firstName;
    private String lastName;

    public UpdateWardenRequest() {
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
}
