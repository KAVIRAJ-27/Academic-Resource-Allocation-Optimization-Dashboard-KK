package com.ahrao.dto.student;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class StudentProfileUpdateRequest {

    @Size(min = 1, max = 50, message = "First name must be between 1 and 50 characters")
    private String firstName;

    @Size(min = 1, max = 50, message = "Last name must be between 1 and 50 characters")
    private String lastName;

    @Pattern(regexp = "^[+]?[0-9\\s()-]{7,20}$", message = "Phone number must be between 7 and 20 valid characters")
    private String phone;

    public StudentProfileUpdateRequest() {
    }

    public StudentProfileUpdateRequest(String firstName, String lastName, String phone) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
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

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
