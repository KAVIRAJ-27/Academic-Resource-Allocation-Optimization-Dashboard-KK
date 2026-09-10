package com.ahrao.dto.faculty.profile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UpdateFacultyProfileRequest {

    @NotBlank(message = "First name is required")
    @Size(min = 1, max = 50, message = "First name must be between 1 and 50 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 1, max = 50, message = "Last name must be between 1 and 50 characters")
    private String lastName;

    @Pattern(regexp = "^$|^[+0-9\\-\\s()]{7,20}$", message = "Phone number must be between 7 and 20 valid characters")
    private String phone;

    @Size(max = 100, message = "Qualification cannot exceed 100 characters")
    private String qualification;

    public UpdateFacultyProfileRequest() {
    }

    public UpdateFacultyProfileRequest(String firstName, String lastName, String phone, String qualification) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.qualification = qualification;
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

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }
}
