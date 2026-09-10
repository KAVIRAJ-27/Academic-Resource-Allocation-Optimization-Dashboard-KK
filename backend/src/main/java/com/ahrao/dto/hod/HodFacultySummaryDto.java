package com.ahrao.dto.hod;

import java.math.BigDecimal;
import java.time.LocalDate;

public class HodFacultySummaryDto {

    private Long id;
    private Long userId;
    private String employeeId;
    private String fullName;
    private String email;
    private String phone;
    private String designation;
    private String qualification;
    private String specialization;
    private LocalDate joiningDate;
    private String status;
    private int assignedSubjectsCount;
    private BigDecimal totalWorkloadHours;
    private String workloadStatus;

    public HodFacultySummaryDto() {
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

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public LocalDate getJoiningDate() {
        return joiningDate;
    }

    public void setJoiningDate(LocalDate joiningDate) {
        this.joiningDate = joiningDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getAssignedSubjectsCount() {
        return assignedSubjectsCount;
    }

    public void setAssignedSubjectsCount(int assignedSubjectsCount) {
        this.assignedSubjectsCount = assignedSubjectsCount;
    }

    public BigDecimal getTotalWorkloadHours() {
        return totalWorkloadHours;
    }

    public void setTotalWorkloadHours(BigDecimal totalWorkloadHours) {
        this.totalWorkloadHours = totalWorkloadHours;
    }

    public String getWorkloadStatus() {
        return workloadStatus;
    }

    public void setWorkloadStatus(String workloadStatus) {
        this.workloadStatus = workloadStatus;
    }
}
