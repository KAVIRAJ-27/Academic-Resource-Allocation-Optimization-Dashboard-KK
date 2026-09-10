package com.ahrao.dto.hod;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public class HodUpdateStudentRequest {

    @Size(max = 50, message = "Roll number must not exceed 50 characters")
    private String rollNumber;

    private Long sectionId;

    @Min(value = 1, message = "Current semester must be at least 1")
    @Max(value = 12, message = "Current semester must not exceed 12")
    private Integer currentSemester;

    public HodUpdateStudentRequest() {
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public Long getSectionId() {
        return sectionId;
    }

    public void setSectionId(Long sectionId) {
        this.sectionId = sectionId;
    }

    public Integer getCurrentSemester() {
        return currentSemester;
    }

    public void setCurrentSemester(Integer currentSemester) {
        this.currentSemester = currentSemester;
    }
}
